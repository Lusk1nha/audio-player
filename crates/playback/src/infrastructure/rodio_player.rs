use rodio::{Decoder, DeviceSinkBuilder, MixerDeviceSink, Player, Source};
use std::fs::File;
use std::sync::{mpsc, Arc, Mutex};
use std::thread;

use crate::domain::errors::PlaybackError;
use crate::domain::traits::AudioPlayer;

// -----------------------------------------------------------------------------
// 1. O Estado da Engine (Isolado e sem Locks)
// -----------------------------------------------------------------------------

struct EngineState {
    _mixer: MixerDeviceSink,
    player: Player,
    current_path: String,
    current_volume: f32,
}

impl EngineState {
    /// Toda a lógica de criar player, setar volume, ler arquivo e pular tempo centralizada aqui.
    fn load_internal(&mut self, path: String, position_seconds: u64) -> Result<(), PlaybackError> {
        self.player = Player::connect_new(self._mixer.mixer());
        self.player.set_volume(self.current_volume);
        self.current_path = path.clone();

        let file = File::open(&path).map_err(|_| PlaybackError::FileNotFound)?;
        let mut source = Decoder::try_from(file).map_err(|_| PlaybackError::UnsupportedFormat)?;

        // Nível 3: Tratamento correto de erro no seek
        if position_seconds > 0 {
            let duration = std::time::Duration::from_secs(position_seconds);
            source
                .try_seek(duration)
                .map_err(|e| PlaybackError::SeekFailed(e.to_string()))?;
        }

        self.player.append(source);
        self.player.pause(); // Deixa pausado por padrão
        Ok(())
    }

    fn play(&mut self, path: String) -> Result<(), PlaybackError> {
        self.load_internal(path, 0)?;
        self.player.play();
        Ok(())
    }

    fn seek(&mut self, position_seconds: u64) -> Result<(), PlaybackError> {
        if self.current_path.is_empty() {
            return Ok(());
        }
        let path = self.current_path.clone();
        self.load_internal(path, position_seconds)?;
        self.player.play();
        Ok(())
    }
}

// -----------------------------------------------------------------------------
// 2. Comandos (O Canal de Comunicação)
// -----------------------------------------------------------------------------

/// Canal de retorno para devolver o `Result` para quem chamou na Thread Principal
type Responder = mpsc::Sender<Result<(), PlaybackError>>;

enum AudioCommand {
    Play {
        path: String,
        reply: Responder,
    },
    Pause {
        reply: Responder,
    },
    Resume {
        reply: Responder,
    },
    Stop {
        reply: Responder,
    },
    Seek {
        position_seconds: u64,
        reply: Responder,
    },
    SetVolume {
        volume: f32,
        reply: Responder,
    },
    LoadTrack {
        path: String,
        position_seconds: u64,
        reply: Responder,
    },
}

// -----------------------------------------------------------------------------
// 3. A Fachada Pública do Player (Actor Pattern)
// -----------------------------------------------------------------------------

#[derive(Clone)]
pub struct RodioAudioPlayer {
    // Apenas guardamos o transmissor do canal. O Mutex aqui é só para inicialização preguiçosa.
    command_tx: Arc<Mutex<Option<mpsc::Sender<AudioCommand>>>>,
}

impl RodioAudioPlayer {
    pub fn new() -> Self {
        Self {
            command_tx: Arc::new(Mutex::new(None)),
        }
    }

    /// Garante que a Thread de Áudio está rodando e devolve o transmissor
    fn ensure_initialized(&self) -> Result<mpsc::Sender<AudioCommand>, PlaybackError> {
        let mut guard = self
            .command_tx
            .lock()
            .map_err(|_| PlaybackError::EngineLockFailed)?;

        if let Some(tx) = &*guard {
            return Ok(tx.clone());
        }

        let (tx, rx) = mpsc::channel();

        // Spawna a Thread dedicada para o áudio
        thread::spawn(move || run_audio_loop(rx));

        *guard = Some(tx.clone());
        Ok(tx)
    }

    /// Método auxiliar para enviar um comando, esperar a resposta da Thread de Áudio e devolver o Result
    fn send_command<F>(&self, cmd_builder: F) -> Result<(), PlaybackError>
    where
        F: FnOnce(Responder) -> AudioCommand,
    {
        let tx = self.ensure_initialized()?;
        let (reply_tx, reply_rx) = mpsc::channel();

        let cmd = cmd_builder(reply_tx);

        tx.send(cmd)
            .map_err(|_| PlaybackError::EngineCommunicationFailed)?;
        reply_rx
            .recv()
            .unwrap_or(Err(PlaybackError::EngineCommunicationFailed))
    }
}

// Implementando o contrato de forma limpa e sem concorrência bloqueante (DRY)
impl AudioPlayer for RodioAudioPlayer {
    fn play(&self, path: &str) -> Result<(), PlaybackError> {
        self.send_command(|reply| AudioCommand::Play {
            path: path.to_string(),
            reply,
        })
    }

    fn pause(&self) -> Result<(), PlaybackError> {
        self.send_command(|reply| AudioCommand::Pause { reply })
    }

    fn resume(&self) -> Result<(), PlaybackError> {
        self.send_command(|reply| AudioCommand::Resume { reply })
    }

    fn stop(&self) -> Result<(), PlaybackError> {
        self.send_command(|reply| AudioCommand::Stop { reply })
    }

    fn seek(&self, position_seconds: u64) -> Result<(), PlaybackError> {
        self.send_command(|reply| AudioCommand::Seek {
            position_seconds,
            reply,
        })
    }

    fn set_volume(&self, volume: f32) -> Result<(), PlaybackError> {
        self.send_command(|reply| AudioCommand::SetVolume { volume, reply })
    }

    fn load_track(&self, path: &str, position_seconds: u64) -> Result<(), PlaybackError> {
        self.send_command(|reply| AudioCommand::LoadTrack {
            path: path.to_string(),
            position_seconds,
            reply,
        })
    }
}

// -----------------------------------------------------------------------------
// 4. O Loop Infinito da Thread de Áudio
// -----------------------------------------------------------------------------

fn run_audio_loop(rx: mpsc::Receiver<AudioCommand>) {
    // Inicializa a placa de som fisicamente na Thread background
    let mixer = match DeviceSinkBuilder::open_default_sink() {
        Ok(m) => m,
        Err(_) => return, // Se a placa falhar, a thread morre. Comandos futuros falharão via EngineCommunicationFailed.
    };

    let mut engine = EngineState {
        player: Player::connect_new(mixer.mixer()),
        _mixer: mixer,
        current_path: String::new(),
        current_volume: 1.0,
    };

    // Escuta infinitamente os comandos do canal
    for cmd in rx {
        match cmd {
            AudioCommand::Play { path, reply } => {
                let _ = reply.send(engine.play(path));
            }
            AudioCommand::Pause { reply } => {
                engine.player.pause();
                let _ = reply.send(Ok(()));
            }
            AudioCommand::Resume { reply } => {
                engine.player.play();
                let _ = reply.send(Ok(()));
            }
            AudioCommand::Stop { reply } => {
                engine.player.stop();
                let _ = reply.send(Ok(()));
            }
            AudioCommand::Seek {
                position_seconds,
                reply,
            } => {
                let _ = reply.send(engine.seek(position_seconds));
            }
            AudioCommand::SetVolume { volume, reply } => {
                let safe_volume = volume.clamp(0.0, 1.0);
                engine.current_volume = safe_volume;
                engine.player.set_volume(safe_volume);
                let _ = reply.send(Ok(()));
            }
            AudioCommand::LoadTrack {
                path,
                position_seconds,
                reply,
            } => {
                let _ = reply.send(engine.load_internal(path, position_seconds));
            }
        }
    }
}

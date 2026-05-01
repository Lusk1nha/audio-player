use rodio::{Decoder, DeviceSinkBuilder, MixerDeviceSink, Player};
use std::fs::File;
use std::sync::{Arc, Mutex};

use crate::domain::errors::PlaybackError;
use crate::domain::traits::AudioPlayer;

// O Rodio exige que a conexão física com a placa de som (Mixer) fique viva na memória.
// Se essa struct for destruída (dropped), a música para instantaneamente.
struct EngineState {
    _mixer: MixerDeviceSink,
    player: Player,
}

#[derive(Clone)]
pub struct RodioAudioPlayer {
    state: Arc<Mutex<Option<EngineState>>>,
}

impl RodioAudioPlayer {
    pub fn new() -> Self {
        Self {
            state: Arc::new(Mutex::new(None)),
        }
    }

    /// Inicialização Preguiçosa: Só acorda a placa de som quando o usuário der o 1º Play
    fn ensure_initialized(&self) -> Result<(), PlaybackError> {
        let mut state = self
            .state
            .lock()
            .map_err(|_| PlaybackError::EngineLockFailed)?;

        if state.is_none() {
            // Nova API do Rodio 0.22
            let mixer = DeviceSinkBuilder::open_default_sink()
                .map_err(|e| PlaybackError::DeviceError(e.to_string()))?;

            let player = Player::connect_new(mixer.mixer());

            *state = Some(EngineState {
                _mixer: mixer,
                player,
            });
        }
        Ok(())
    }
}

// Implementando o nosso contrato limpo
impl AudioPlayer for RodioAudioPlayer {
    fn play(&self, path: &str) -> Result<(), PlaybackError> {
        self.ensure_initialized()?;
        let state_guard = self
            .state
            .lock()
            .map_err(|_| PlaybackError::EngineLockFailed)?;

        if let Some(engine) = state_guard.as_ref() {
            engine.player.stop(); // Limpa se houver algo tocando

            let file = File::open(path).map_err(|_| PlaybackError::FileNotFound)?;

            // Nova API do Rodio: Tenta descobrir se é mp3/wav/flac automaticamente
            let source = Decoder::try_from(file).map_err(|_| PlaybackError::UnsupportedFormat)?;

            engine.player.append(source);
            engine.player.play();
        }
        Ok(())
    }

    fn pause(&self) -> Result<(), PlaybackError> {
        let state_guard = self
            .state
            .lock()
            .map_err(|_| PlaybackError::EngineLockFailed)?;
        if let Some(engine) = state_guard.as_ref() {
            engine.player.pause();
        }
        Ok(())
    }

    fn resume(&self) -> Result<(), PlaybackError> {
        let state_guard = self
            .state
            .lock()
            .map_err(|_| PlaybackError::EngineLockFailed)?;
        if let Some(engine) = state_guard.as_ref() {
            engine.player.play();
        }
        Ok(())
    }

    fn stop(&self) -> Result<(), PlaybackError> {
        let state_guard = self
            .state
            .lock()
            .map_err(|_| PlaybackError::EngineLockFailed)?;
        if let Some(engine) = state_guard.as_ref() {
            engine.player.stop();
        }
        Ok(())
    }

    fn seek(&self, position_seconds: u64) -> Result<(), PlaybackError> {
        let state_guard = self
            .state
            .lock()
            .map_err(|_| PlaybackError::EngineLockFailed)?;

        if let Some(engine) = state_guard.as_ref() {
            let duration = std::time::Duration::from_secs(position_seconds);

            engine.player.pause();

            if engine.player.try_seek(duration).is_ok() {
                engine.player.play();
            } else {
                engine.player.play();
            }
        }
        Ok(())
    }

    fn set_volume(&self, volume: f32) -> Result<(), PlaybackError> {
        let state_guard = self
            .state
            .lock()
            .map_err(|_| PlaybackError::EngineLockFailed)?;
        if let Some(engine) = state_guard.as_ref() {
            let safe_volume = volume.clamp(0.0, 1.0); // Protege contra volume estourado
            engine.player.set_volume(safe_volume);
        }
        Ok(())
    }
}

use super::errors::PlaybackError;

// A Porta (Port) que a aplicação usa para conversar com o áudio.
pub trait AudioPlayer: Send + Sync {
    fn play(&self, path: &str) -> Result<(), PlaybackError>;
    fn pause(&self) -> Result<(), PlaybackError>;
    fn resume(&self) -> Result<(), PlaybackError>;
    fn stop(&self) -> Result<(), PlaybackError>;
    fn seek(&self, position_seconds: u64) -> Result<(), PlaybackError>;
    fn set_volume(&self, volume: f32) -> Result<(), PlaybackError>;
}

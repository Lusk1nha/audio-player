import { AudioCommands } from "@audio-player/bridge"

export const PlaybackAdapter = {
  playTrack: async (path: string): Promise<void> => {
    try {
      await AudioCommands.playAudio(path)
    } catch (error) {
      console.error("[PlaybackAdapter] Falha ao tocar áudio:", error)
      throw error
    }
  },

  pauseTrack: async (): Promise<void> => {
    try {
      await AudioCommands.pauseAudio()
    } catch (error) {
      console.error("[PlaybackAdapter] Falha ao pausar áudio:", error)
      throw error
    }
  },

  resumeTrack: async (): Promise<void> => {
    try {
      await AudioCommands.resumeAudio()
    } catch (error) {
      console.error("[PlaybackAdapter] Falha ao retomar áudio:", error)
      throw error
    }
  },

  stopTrack: async (): Promise<void> => {
    try {
      await AudioCommands.stopAudio()
    } catch (error) {
      console.error("[PlaybackAdapter] Falha ao parar áudio:", error)
      throw error
    }
  },

  setVolume: async (volume: number): Promise<void> => {
    try {
      // Regra de segurança no Frontend: Garante que o volume sempre
      // chegue no Rust entre 0.0 e 1.0
      const safeVolume = Math.max(0, Math.min(1, volume))
      await AudioCommands.setVolume(safeVolume)
    } catch (error) {
      console.error("[PlaybackAdapter] Falha ao alterar volume:", error)
      throw error
    }
  },

  seekTo: async (positionSeconds: number): Promise<void> => {
    try {
      await AudioCommands.seekAudio(positionSeconds)
    } catch (error) {
      console.error("Falha ao pular tempo da música:", error)
    }
  },
}

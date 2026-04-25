import { AudioCommands } from "@audio-player/bridge"

export const PlaybackAdapter = {
  playTrack: async (trackId: string): Promise<void> => {
    try {
      await AudioCommands.playAudio(trackId)
    } catch (error) {
      console.error("Falha ao tocar áudio:", error)
      throw error
    }
  },
}

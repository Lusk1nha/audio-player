import { create } from "zustand"
import { PlaybackAdapter } from "../infrastructure/PlaybackAdapter"

interface PlayerState {
  currentTrackId: string | null
  isPlaying: boolean

  play: (trackId: string) => Promise<void>
  pause: () => void
}

export const usePlayerStore = create<PlayerState>((set) => ({
  currentTrackId: null,
  isPlaying: false,

  play: async (trackId: string) => {
    await PlaybackAdapter.playTrack(trackId)
    set({ currentTrackId: trackId, isPlaying: true })
  },

  pause: () => set({ isPlaying: false }),
}))

import { create } from "zustand"
import { persist, createJSONStorage } from "zustand/middleware"
import { PlaybackAdapter } from "../infrastructure/PlaybackAdapter"
import type { MediaAsset } from "@/modules/library/domain/MediaAsset"

import { toast } from "sonner"

interface PlayerState {
  currentTrack: MediaAsset | null
  isPlaying: boolean
  volume: number
  queue: MediaAsset[]
  history: MediaAsset[]
  currentTime: number

  // Ações de Estado
  init: () => Promise<void>

  // Ações Principais
  play: (track: MediaAsset, isFromHistory?: boolean) => Promise<void>
  pause: () => Promise<void>
  resume: () => Promise<void>
  togglePlay: () => Promise<void>
  stop: () => Promise<void>
  seekTo: (seconds: number) => Promise<void>
  setVolume: (volume: number) => Promise<void>
  setCurrentTime: (time: number) => void

  // Ações da Fila
  addToQueue: (track: MediaAsset) => void
  removeFromQueue: (index: number) => void
  clearQueue: () => void
  setQueue: (newQueue: MediaAsset[]) => void
  reorderQueue: (startIndex: number, endIndex: number) => void

  // Ações de Navegação
  playPrevious: () => Promise<void>
  playNext: () => Promise<void>
}

export const usePlayerStore = create<PlayerState>()(
  persist(
    (set, get) => ({
      currentTrack: null,
      isPlaying: false,
      volume: 0.7,
      queue: [],
      history: [],
      currentTime: 0,

      init: async () => {
        try {
          const { volume, currentTrack, currentTime } = get()
          await PlaybackAdapter.setVolume(volume)

          if (currentTrack) {
            await PlaybackAdapter.loadTrack(currentTrack.path, currentTime)
          }
        } catch (error) {
          console.error("Erro ao inicializar o player:", error)
        }
      },

      play: async (track: MediaAsset, isFromHistory: boolean = false) => {
        try {
          const { currentTrack, history, volume } = get()

          if (currentTrack && currentTrack.id !== track.id && !isFromHistory) {
            set({ history: [...history, currentTrack] })
          }

          await PlaybackAdapter.playTrack(track.path)
          await PlaybackAdapter.setVolume(volume)

          set({ currentTrack: track, isPlaying: true, currentTime: 0 })
        } catch (error) {
          console.error("Erro ao tocar a faixa:", error)
          toast.error("Falha na reprodução", {
            description: "Não foi possível ler o arquivo de áudio.",
          })
        }
      },

      pause: async () => {
        try {
          await PlaybackAdapter.pauseTrack()
          set({ isPlaying: false })
        } catch (error) {
          console.error("Erro ao pausar:", error)
        }
      },

      resume: async () => {
        try {
          await PlaybackAdapter.resumeTrack()
          set({ isPlaying: true })
        } catch (error) {
          console.error("Erro ao retomar:", error)
        }
      },

      togglePlay: async () => {
        const { isPlaying, currentTrack, pause, resume } = get()
        if (!currentTrack) return

        if (isPlaying) {
          await pause()
        } else {
          await resume()
        }
      },

      stop: async () => {
        try {
          await PlaybackAdapter.stopTrack()
          set({ isPlaying: false, currentTrack: null })
        } catch (error) {
          console.error("Erro ao parar:", error)
        }
      },

      seekTo: async (seconds: number) => {
        try {
          await PlaybackAdapter.seekTo(seconds)
          set({ isPlaying: true, currentTime: seconds })
        } catch (error) {
          console.error("Erro ao pular tempo:", error)
        }
      },

      setVolume: async (newVolume: number) => {
        try {
          const safeVolume = Math.max(0, Math.min(1, newVolume))
          await PlaybackAdapter.setVolume(safeVolume)
          set({ volume: safeVolume })
        } catch (error) {
          console.error("Erro ao alterar volume:", error)
        }
      },

      setCurrentTime: (time: number) => {
        set({ currentTime: time })
      },

      addToQueue: (track: MediaAsset) => {
        if (!get().currentTrack) {
          get().play(track)
        } else {
          set((state) => ({ queue: [...state.queue, track] }))
          toast.success("Adicionado à fila", {
            description: track.metadata.title,
          })
        }
      },

      removeFromQueue: (index: number) => {
        set((state) => ({
          queue: state.queue.filter((_, i) => i !== index),
        }))
      },

      clearQueue: () => {
        set({ queue: [] })
        toast.success("Fila limpa")
      },

      setQueue: (newQueue: MediaAsset[]) => {
        set({ queue: newQueue })
      },

      reorderQueue: (startIndex: number, endIndex: number) => {
        set((state) => {
          const newQueue = Array.from(state.queue)
          const [movedTrack] = newQueue.splice(startIndex, 1)
          newQueue.splice(endIndex, 0, movedTrack)
          return { queue: newQueue }
        })
      },

      playPrevious: async () => {
        const { currentTime, history, currentTrack, queue, play, seekTo } =
          get()

        if (currentTime > 3 || history.length === 0) {
          await seekTo(0)
          return
        }

        const previousTrack = history[history.length - 1]

        if (currentTrack) {
          set({
            history: history.slice(0, -1),
            queue: [currentTrack, ...queue],
          })
        } else {
          set({ history: history.slice(0, -1) })
        }

        await play(previousTrack, true)
      },

      playNext: async () => {
        const { queue, play, stop } = get()

        if (queue.length > 0) {
          const nextTrack = queue[0]

          set((state) => ({ queue: state.queue.slice(1) }))

          await play(nextTrack)
        } else {
          await stop()
        }
      },
    }),
    {
      name: "audio-manager-storage",
      storage: createJSONStorage(() => localStorage),

      partialize: (state) => ({
        volume: state.volume,
        currentTrack: state.currentTrack,
        queue: state.queue,
        history: state.history,
        currentTime: state.currentTime,
      }),
    }
  )
)

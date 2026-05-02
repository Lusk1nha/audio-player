import { create } from "zustand"
import { persist, createJSONStorage } from "zustand/middleware"
import { PlaybackAdapter } from "../infrastructure/PlaybackAdapter"
import type { MediaAsset } from "@/modules/library/domain/MediaAsset"
import { toast } from "sonner"

interface PlayerState {
  currentTrack: MediaAsset | null
  isPlaying: boolean
  volume: number // Volume global entre 0.0 e 1.0
  queue: MediaAsset[] // Preparando o terreno para a Fila!
  currentTime: number

  // Ações
  init: () => Promise<void> // Sincroniza o volume salvo com o Rust ao abrir o app
  play: (track: MediaAsset) => Promise<void>
  pause: () => Promise<void>
  resume: () => Promise<void>
  togglePlay: () => Promise<void>
  stop: () => Promise<void>
  seekTo: (seconds: number) => Promise<void>
  setVolume: (volume: number) => Promise<void>
  setCurrentTime: (time: number) => void // Atualiza o relógio

  // Ações da Fila (Futuro)
  addToQueue: (track: MediaAsset) => void
  playNext: () => Promise<void>
}

export const usePlayerStore = create<PlayerState>()(
  persist(
    (set, get) => ({
      currentTrack: null,
      isPlaying: false,
      volume: 0.7,
      queue: [],
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

      play: async (track: MediaAsset) => {
        try {
          await PlaybackAdapter.playTrack(track.path)
          await PlaybackAdapter.setVolume(get().volume)

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
        set((state) => ({ queue: [...state.queue, track] }))
      },

      playNext: async () => {
        const { queue, play } = get()

        if (queue.length > 0) {
          const nextTrack = queue[0]

          set((state) => ({ queue: state.queue.slice(1) }))
          await play(nextTrack)
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
        currentTime: state.currentTime,
      }),
    }
  )
)

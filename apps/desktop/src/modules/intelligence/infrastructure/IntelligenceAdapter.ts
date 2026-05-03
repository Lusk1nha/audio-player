import { IntelligenceCommands } from "@audio-player/bridge"

export type TranscriptionSegment = {
  startTime: number
  endTime: number
  text: string
}

export const IntelligenceAdapter = {
  checkEngineStatus: async (): Promise<boolean> => {
    try {
      return await IntelligenceCommands.checkEngineStatus()
    } catch (error) {
      console.error(
        "[IntelligenceAdapter] Falha ao verificar status do motor de IA:",
        error
      )
      throw error
    }
  },

  downloadEngine: async (): Promise<void> => {
    try {
      await IntelligenceCommands.downloadEngine()
    } catch (error) {
      console.error("[IntelligenceAdapter] Falha ao baixar motor de IA:", error)
      throw error
    }
  },

  transcribeAudio: async (path: string): Promise<TranscriptionSegment[]> => {
    try {
      return await IntelligenceCommands.transcribe(path)
    } catch (error) {
      console.error("[IntelligenceAdapter] Falha ao transcrever áudio:", error)
      throw error
    }
  },

  onDownloadProgress: async (callback: (percentage: number) => void) => {
    try {
      return await IntelligenceCommands.onDownloadProgress(callback)
    } catch (error) {
      console.error(
        "[IntelligenceAdapter] Falha ao registrar listener de progresso:",
        error
      )
      throw error
    }
  },
}

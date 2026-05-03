import { useState, useCallback, useEffect } from "react"
import { IntelligenceAdapter } from "../infrastructure/IntelligenceAdapter"

export function useIntelligenceCases() {
  const [isEngineInstalled, setIsEngineInstalled] = useState(false)
  const [isChecking, setIsChecking] = useState(true)

  const [isDownloading, setIsDownloading] = useState(false)
  const [downloadProgress, setDownloadProgress] = useState(0)

  const checkEngine = useCallback(async () => {
    setIsChecking(true)
    try {
      const status = await IntelligenceAdapter.checkEngineStatus()
      setIsEngineInstalled(status)
    } catch (error) {
      console.error(error)
      setIsEngineInstalled(false)
    } finally {
      setIsChecking(false)
    }
  }, [])

  // Checa automaticamente ao montar o hook
  useEffect(() => {
    checkEngine()
  }, [checkEngine])

  const startDownload = async () => {
    setIsDownloading(true)
    setDownloadProgress(0)

    // Inscreve no evento do Tauri via Adapter
    const unlisten = await IntelligenceAdapter.onDownloadProgress(
      (percentage) => {
        setDownloadProgress(percentage)
      }
    )

    try {
      await IntelligenceAdapter.downloadEngine()
      setIsEngineInstalled(true)
    } catch (error) {
      console.error("Falha ao efetuar o download da IA.", error)
    } finally {
      setIsDownloading(false)
      unlisten() // Remove o listener da memória quando acabar!
    }
  }

  const transcribe = async (path: string) => {
    if (!isEngineInstalled) throw new Error("Motor de IA não instalado")
    return await IntelligenceAdapter.transcribeAudio(path)
  }

  return {
    isEngineInstalled,
    isChecking,
    isDownloading,
    downloadProgress,
    startDownload,
    transcribe,
    checkEngine,
  }
}

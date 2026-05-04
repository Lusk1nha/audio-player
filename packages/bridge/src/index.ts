import { invoke } from "@tauri-apps/api/core"
import { open } from "@tauri-apps/plugin-dialog"
import { listen } from "@tauri-apps/api/event"

// --- Domínio de Reprodução (Playback) ---
export const PlaybackCommands = {
  play: async (path: string): Promise<string> =>
    invoke("cmd_play_audio", { path }),
  pause: async (): Promise<void> => invoke("cmd_pause_audio"),
  resume: async (): Promise<void> => invoke("cmd_resume_audio"),
  stop: async (): Promise<void> => invoke("cmd_stop_audio"),
  setVolume: async (volume: number): Promise<void> =>
    invoke("cmd_set_volume", { volume }),
  seek: async (positionSeconds: number): Promise<void> =>
    invoke("cmd_seek_audio", { positionSeconds }),
  load: async (path: string, positionSeconds: number): Promise<void> =>
    invoke("cmd_load_audio", { path, positionSeconds }),
}

// --- Domínio da Biblioteca de Mídia (Library) ---
export const LibraryCommands = {
  getAllAssets: async (): Promise<string> => invoke("cmd_get_all_assets"),
  scan: async (path: string): Promise<string> =>
    invoke("cmd_scan_library", { path }),

  /**
   * Abre o diálogo nativo para selecionar uma pasta
   */
  selectFolder: async (): Promise<string | null> => {
    const selectedPath = await open({
      directory: true,
      multiple: false,
      title: "Selecione a pasta de músicas",
    })
    return selectedPath as string | null
  },

  searchAssets: async (
    query: string,
    sortBy: string,
    sortOrder: string
  ): Promise<string> => {
    return invoke("cmd_search_assets", { query, sortBy, sortOrder })
  },
}

// --- Domínio de IA e Transcrição (Intelligence) ---
export const IntelligenceCommands = {
  /**
   * Verifica se o arquivo .bin do Whisper existe localmente
   */
  checkEngineStatus: async (): Promise<boolean> =>
    invoke("cmd_check_ai_engine"),

  /**
   * Inicia o download do modelo.
   * Dica: Use o listener abaixo para monitorar o progresso.
   */
  downloadEngine: async (): Promise<void> => invoke("cmd_download_ai_engine"),

  /**
   * Solicita a transcrição de um arquivo de áudio
   */
  transcribe: async (
    path: string
  ): Promise<{ startTime: number; endTime: number; text: string }[]> =>
    invoke("cmd_transcribe_audio", { path }),

  /**
   * Escuta o evento de progresso de download enviado pelo Rust
   */
  onDownloadProgress: (callback: (percentage: number) => void) => {
    return listen<number>("ai-download-progress", (event) => {
      callback(event.payload)
    })
  },
}

// --- Domínio de Configurações (Settings) ---
export const SettingsCommands = {
  getSettings: async (): Promise<any> => invoke("cmd_get_settings"),
  updateSettings: async (settings: any): Promise<void> =>
    invoke("cmd_update_settings", { settings }),
}

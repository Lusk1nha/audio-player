import { invoke } from "@tauri-apps/api/core"
import { open } from "@tauri-apps/plugin-dialog"

export const AudioCommands = {
  playAudio: async (assetId: string): Promise<string> => {
    return await invoke("cmd_play_audio", { assetId })
  },

  scanLibrary: async (path: string): Promise<string> => {
    return await invoke("cmd_scan_library", { path })
  },

  // Abre a janela nativa do OS
  selectFolder: async (): Promise<string | null> => {
    const selectedPath = await open({
      directory: true,
      multiple: false,
      title: "Selecione a pasta de músicas",
    })

    return selectedPath as string | null
  },
}

import { invoke } from "@tauri-apps/api/core"
import { open } from "@tauri-apps/plugin-dialog"

export const AudioCommands = {
  playAudio: async (path: string): Promise<string> => {
    return await invoke("cmd_play_audio", { path })
  },

  pauseAudio: async (): Promise<void> => {
    return await invoke("cmd_pause_audio")
  },

  resumeAudio: async (): Promise<void> => {
    return await invoke("cmd_resume_audio")
  },

  stopAudio: async (): Promise<void> => {
    return await invoke("cmd_stop_audio")
  },

  setVolume: async (volume: number): Promise<void> => {
    return await invoke("cmd_set_volume", { volume })
  },

  seekAudio: async (positionSeconds: number): Promise<void> => {
    return await invoke("cmd_seek_audio", { positionSeconds })
  },

  // --- Comandos da Biblioteca ---
  getAllAssets: async (): Promise<string> => {
    return await invoke("cmd_get_all_assets")
  },

  scanLibrary: async (path: string): Promise<string> => {
    return await invoke("cmd_scan_library", { path })
  },

  selectFolder: async (): Promise<string | null> => {
    const selectedPath = await open({
      directory: true,
      multiple: false,
      title: "Selecione a pasta de músicas",
    })

    return selectedPath as string | null
  },
}

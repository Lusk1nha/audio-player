import { invoke } from "@tauri-apps/api/core"

export const AudioCommands = {
  playAudio: async (assetId: string): Promise<string> => {
    return await invoke("cmd_play_audio", { assetId })
  },

  scanLibrary: async (path: string): Promise<string> => {
    return await invoke("cmd_scan_library", { path })
  },

  greet: async (name: string): Promise<string> => {
    return await invoke("cmd_greet", { name })
  },
}

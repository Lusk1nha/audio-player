import { invoke } from "@tauri-apps/api/core"
import {
  SystemSettings,
  SystemSettingsSchema,
  DEFAULT_SETTINGS,
} from "../domain/SystemSettings"

export const SettingsAdapter = {
  getSettings: async (): Promise<SystemSettings> => {
    try {
      const rawData = await invoke<string>("cmd_get_settings")
      const parsedJson = JSON.parse(rawData)

      return SystemSettingsSchema.parse(parsedJson)
    } catch (error) {
      console.warn(
        "[SettingsAdapter] Falha ao carregar configurações, usando padrão.",
        error
      )
      return DEFAULT_SETTINGS
    }
  },

  updateSettings: async (settings: SystemSettings): Promise<void> => {
    try {
      const validSettings = SystemSettingsSchema.parse(settings)

      await invoke("cmd_update_settings", {
        payload: validSettings, // O Tauri converte automaticamente para o DTO do Rust
      })
    } catch (error) {
      console.error("[SettingsAdapter] Falha ao salvar configurações:", error)
      throw error
    }
  },
}

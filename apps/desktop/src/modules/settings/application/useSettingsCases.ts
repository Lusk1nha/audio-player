import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { SettingsAdapter } from "../infrastructure/SettingsAdapter"
import type { SystemSettings } from "../domain/SystemSettings"
import { toast } from "sonner"
import { useTheme } from "@/core/providers/theme-provider"

export const SETTINGS_KEYS = {
  all: ["settings"] as const,
}

export function useSettingsCases() {
  const queryClient = useQueryClient()
  const { setTheme } = useTheme()

  const { data: settings, isLoading: isFetchingSettings } =
    useQuery<SystemSettings>({
      queryKey: SETTINGS_KEYS.all,
      queryFn: SettingsAdapter.getSettings,
    })

  const { mutateAsync: updateSettings, isPending: isSaving } = useMutation({
    mutationFn: (newSettings: SystemSettings) =>
      SettingsAdapter.updateSettings(newSettings),
    onSuccess: (_savedSettings, variables) => {
      queryClient.setQueryData(SETTINGS_KEYS.all, variables)
      setTheme(variables.theme)

      toast.success("Configurações salvas no config.toml")
    },
  })

  return {
    settings,
    isFetchingSettings,
    updateSettings,
    isSaving,
  }
}

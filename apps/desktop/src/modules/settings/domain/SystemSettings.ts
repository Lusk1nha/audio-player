import { z } from "zod"

export const SystemSettingsSchema = z.object({
  theme: z.enum(["light", "dark", "system"]),
  hardwareAcceleration: z.boolean(),
  crossfadeDurationSec: z.number().min(0).max(10),
  defaultLibraryPath: z.string().optional(),
})

export type SystemSettings = z.infer<typeof SystemSettingsSchema>

export const DEFAULT_SETTINGS: SystemSettings = {
  theme: "system",
  hardwareAcceleration: true,
  crossfadeDurationSec: 0,
}

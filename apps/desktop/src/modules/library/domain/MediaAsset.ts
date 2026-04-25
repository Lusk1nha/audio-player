import { z } from "zod"

export const AudioMetadataSchema = z.object({
  durationSeconds: z.number().nonnegative(),
  format: z.string(),
  title: z.string().optional(),
  artist: z.string().optional(),
})

export const MediaAssetSchema = z.object({
  id: z.string().uuid(),
  path: z.string(),
  category: z.enum(["Music", "Podcast", "VoiceMessage", "Uncategorized"]),
  metadata: AudioMetadataSchema,
})

export type AudioMetadata = z.infer<typeof AudioMetadataSchema>
export type MediaAsset = z.infer<typeof MediaAssetSchema>

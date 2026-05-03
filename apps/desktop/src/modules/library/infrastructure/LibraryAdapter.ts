import { z } from "zod"

import { LibraryCommands } from "@audio-player/bridge"
import { MediaAssetSchema, type MediaAsset } from "../domain/MediaAsset"

const ScanResultSchema = z.object({
  scannedFiles: z.number(),
  newAssets: z.array(MediaAssetSchema),
})

export type ScanResult = z.infer<typeof ScanResultSchema>

export const LibraryAdapter = {
  scanDirectory: async (path: string): Promise<ScanResult> => {
    try {
      const rawResponse = await LibraryCommands.scan(path)
      return ScanResultSchema.parse(rawResponse)
    } catch (error) {
      console.error("[LibraryAdapter] Falha de contrato ou IPC:", error)
      throw new Error("Falha ao processar a varredura da biblioteca.")
    }
  },

  selectFolder: async (): Promise<string | null> => {
    return LibraryCommands.selectFolder()
  },

  getAllAssets: async (): Promise<MediaAsset[]> => {
    try {
      const rawResponse = await LibraryCommands.getAllAssets()

      const parsedAssets = z.array(MediaAssetSchema).parse(rawResponse)

      return parsedAssets
    } catch (error) {
      console.error("[LibraryAdapter] Falha ao buscar assets do banco:", error)
      return []
    }
  },
}

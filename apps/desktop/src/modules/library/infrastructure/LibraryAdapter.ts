import { z } from "zod"

import { AudioCommands } from "@audio-player/bridge"
import { MediaAssetSchema, type MediaAsset } from "../domain/MediaAsset"

const ScanResultSchema = z.object({
  scannedFiles: z.number(),
  newAssets: z.array(MediaAssetSchema),
})

export type ScanResult = z.infer<typeof ScanResultSchema>

export const LibraryAdapter = {
  /**
   * Dispara a varredura e obriga o retorno a respeitar o contrato (ScanResultSchema)
   */
  scanDirectory: async (path: string): Promise<ScanResult> => {
    try {
      const rawResponse = await AudioCommands.scanLibrary(path)
      return ScanResultSchema.parse(JSON.parse(rawResponse))
    } catch (error) {
      console.error("[LibraryAdapter] Falha de contrato ou IPC:", error)
      throw new Error("Falha ao processar a varredura da biblioteca.")
    }
  },

  /**
   * Busca todas as músicas já salvas no SurrealDB (simulação para o futuro)
   */
  getAllAssets: async (): Promise<MediaAsset[]> => {
    return []
  },
}

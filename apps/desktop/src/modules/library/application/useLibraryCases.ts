import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { LibraryAdapter } from "../infrastructure/LibraryAdapter"
import type { MediaAsset } from "../domain/MediaAsset"

export const LIBRARY_KEYS = {
  allAssets: ["library", "assets"] as const,
}

export function useLibraryCases() {
  const queryClient = useQueryClient()

  const {
    data: assets = [],
    isLoading: isFetchingAssets,
    error: fetchError,
  } = useQuery<MediaAsset[]>({
    queryKey: LIBRARY_KEYS.allAssets,
    queryFn: LibraryAdapter.getAllAssets,
  })

  // Caso de Uso 2: Escanear um novo diretório
  const { mutateAsync: scanFolder, isPending: isScanning } = useMutation({
    mutationFn: (path: string) => LibraryAdapter.scanDirectory(path),
    onSuccess: (result) => {
      console.log(
        `Scan concluído: ${result.scannedFiles} arquivos encontrados.`
      )

      // Invalida o cache para forçar a UI a buscar a lista atualizada do Rust
      queryClient.invalidateQueries({ queryKey: LIBRARY_KEYS.allAssets })
    },
  })

  return {
    assets,
    isFetchingAssets,
    fetchError,
    scanFolder,
    isScanning,
  }
}

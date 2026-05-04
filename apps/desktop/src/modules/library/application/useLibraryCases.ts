import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { LibraryAdapter } from "../infrastructure/LibraryAdapter"
import type { MediaAsset, SortOption, SortOrder } from "../domain/MediaAsset"

// Ampliamos as chaves para incluir os parâmetros de busca
export const LIBRARY_KEYS = {
  search: (query: string, sortBy: string, sortOrder: string) =>
    ["library", "assets", query, sortBy, sortOrder] as const,
}

export function useLibraryCases(
  searchQuery: string = "",
  sortBy: SortOption = "name",
  sortOrder: SortOrder = "asc"
) {
  const queryClient = useQueryClient()

  const {
    data: assets = [],
    isLoading: isFetchingAssets,
    error: fetchError,
  } = useQuery<MediaAsset[]>({
    queryKey: LIBRARY_KEYS.search(searchQuery, sortBy, sortOrder),
    queryFn: () => LibraryAdapter.searchAssets(searchQuery, sortBy, sortOrder),

    staleTime: 1000 * 60 * 5, // Cache de 5 minutos
  })

  const { mutateAsync: scanFolder, isPending: isScanning } = useMutation({
    mutationFn: (path: string) => LibraryAdapter.scanDirectory(path),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["library", "assets"] })
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

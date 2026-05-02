import { useState, useMemo, useCallback } from "react"
import { toast } from "sonner"
import { motion, AnimatePresence } from "motion/react"
import { WarningOctagonIcon } from "@phosphor-icons/react"

import { usePlayerStore } from "@/modules/playback/application/usePlayerStore"
import { useLibraryCases } from "../application/useLibraryCases"
import { AudioCommands } from "@audio-player/bridge"
import type { MediaAsset } from "@/modules/library/domain/MediaAsset"

import { LibraryHeader } from "./components/LibraryHeader"
import { LibraryLoading, LibraryEmpty } from "./components/LibraryStates"
import {
  LibraryToolbar,
  SortOption,
  ViewMode,
} from "./components/LibraryToolbar"
import { VirtualizedAssetList } from "./components/VirtualizedAssetList"

export function LibraryView() {
  const { assets, isFetchingAssets, isScanning, scanFolder } = useLibraryCases()
  const { play, currentTrack, isPlaying, addToQueue } = usePlayerStore()

  // --- ESTADOS ---
  const [viewMode, setViewMode] = useState<ViewMode>("grid")
  const [sortBy, setSortBy] = useState<SortOption>("name")
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc")
  const [searchQuery, setSearchQuery] = useState("")

  // --- FILTRAGEM E ORDENAÇÃO ---
  const processedAssets = useMemo(() => {
    if (!assets) return []

    // 1. Filtro
    const lowerQuery = searchQuery.toLowerCase()

    const filtered = assets.filter((asset) => {
      if (!searchQuery) return true
      const title = (asset.metadata.title || "").toLowerCase()
      const artist = (asset.metadata.artist || "").toLowerCase()
      const path = asset.path.toLowerCase()
      return (
        title.includes(lowerQuery) ||
        artist.includes(lowerQuery) ||
        path.includes(lowerQuery)
      )
    })

    // 2. Ordenação
    return filtered.sort((a, b) => {
      let valA =
        sortBy === "name"
          ? a.metadata.title || a.path
          : sortBy === "artist"
            ? a.metadata.artist || "zzzz"
            : a.id

      let valB =
        sortBy === "name"
          ? b.metadata.title || b.path
          : sortBy === "artist"
            ? b.metadata.artist || "zzzz"
            : b.id

      const comparison = valA.localeCompare(valB)
      return sortOrder === "asc" ? comparison : -comparison
    })
  }, [assets, searchQuery, sortBy, sortOrder])

  // --- AÇÕES SEGURAS (useCallback é vital aqui para o React.memo dos cards funcionar) ---
  const handlePlayAsset = useCallback(
    (asset: MediaAsset) => play(asset),
    [play]
  )
  const handleAddToQueue = useCallback(
    (asset: MediaAsset) => {
      addToQueue(asset)
    },
    [addToQueue]
  )

  const handleSelectAndScan = async () => {
    try {
      const selectedPath = await AudioCommands.selectFolder()
      if (selectedPath) {
        toast.info("Lendo arquivos da pasta...")
        await scanFolder(selectedPath)
        toast.success("Biblioteca atualizada com sucesso!")
      }
    } catch (error) {
      console.error(error)
      toast.error("Erro ao selecionar a pasta ou processar o áudio.")
    }
  }

  const hasSearchButNoResults =
    searchQuery.length > 0 && processedAssets.length === 0

  return (
    <div className="relative mx-auto w-full max-w-7xl animate-in p-4 font-mono duration-500 fade-in md:p-8">
      <LibraryHeader
        isScanning={isScanning}
        assetCount={assets.length}
        onScanClick={handleSelectAndScan}
      />

      <main>
        {/* TOOLBAR */}
        {!isFetchingAssets && assets.length > 0 && (
          <LibraryToolbar
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            sortBy={sortBy}
            onSortByChange={setSortBy}
            sortOrder={sortOrder}
            onSortOrderChange={setSortOrder}
            viewMode={viewMode}
            onViewModeChange={setViewMode}
          />
        )}

        {/* FEEDBACK VISUAL (LOADING / VAZIO / SEM RESULTADOS) */}
        <AnimatePresence mode="wait">
          {isFetchingAssets && (
            <motion.div key="loading" exit={{ opacity: 0 }}>
              <LibraryLoading />
            </motion.div>
          )}

          {!isFetchingAssets && assets.length === 0 && (
            <motion.div key="empty" exit={{ opacity: 0 }}>
              <LibraryEmpty />
            </motion.div>
          )}

          {!isFetchingAssets && hasSearchButNoResults && (
            <motion.div
              key="no-results"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center justify-center rounded-md border border-dashed border-border bg-card/30 px-6 py-16 text-center shadow-sm"
            >
              <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-lg border border-border bg-muted/50">
                <WarningOctagonIcon
                  size={28}
                  className="text-muted-foreground"
                  weight="duotone"
                />
              </div>
              <h3 className="mb-2 text-lg font-semibold text-foreground">
                Nenhuma faixa encontrada
              </h3>
              <p className="text-sm text-muted-foreground">
                Sua busca por{" "}
                <span className="font-bold text-primary">"{searchQuery}"</span>{" "}
                não retornou resultados.
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* LISTA VIRTUALIZADA */}
        {!isFetchingAssets && processedAssets.length > 0 && (
          <VirtualizedAssetList
            assets={processedAssets}
            viewMode={viewMode}
            currentTrackId={currentTrack?.id}
            isPlaying={isPlaying}
            onPlay={handlePlayAsset}
            onAddToQueue={handleAddToQueue}
          />
        )}
      </main>
    </div>
  )
}

import { useState, useCallback } from "react"
import { toast } from "sonner"
import { motion, AnimatePresence } from "motion/react"
import { WarningOctagonIcon } from "@phosphor-icons/react"

import { usePlayerStore } from "@/modules/playback/application/usePlayerStore"
import { useLibraryCases } from "../application/useLibraryCases"

import type {
  MediaAsset,
  SortOption,
  SortOrder,
} from "@/modules/library/domain/MediaAsset"

import { LibraryHeader } from "./components/LibraryHeader"
import { LibraryLoading, LibraryEmpty } from "./components/LibraryStates"
import { LibraryToolbar, ViewMode } from "./components/LibraryToolbar"
import { VirtualizedAssetList } from "./components/VirtualizedAssetList"
import { LibraryAdapter } from "../infrastructure/LibraryAdapter"
import { useDebounce } from "@/shared/hooks/useDebounce"

export function LibraryView() {
  const { play, currentTrack, isPlaying, addToQueue } = usePlayerStore()

  // --- ESTADOS ---
  const [viewMode, setViewMode] = useState<ViewMode>("grid")
  const [sortBy, setSortBy] = useState<SortOption>("name")
  const [sortOrder, setSortOrder] = useState<SortOrder>("asc")

  const [searchQuery, setSearchQuery] = useState("")
  const debouncedSearch = useDebounce(searchQuery, 300)

  // --- BUSCA DIRETO DO RUST ---
  const { assets, isFetchingAssets, isScanning, scanFolder } = useLibraryCases(
    debouncedSearch,
    sortBy,
    sortOrder
  )

  // --- AÇÕES SEGURAS ---
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
      const selectedPath = await LibraryAdapter.selectFolder()
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

  // --- DERIVAÇÕES DE ESTADO ---
  const isCompletelyEmpty = assets.length === 0 && searchQuery.length === 0
  const hasSearchButNoResults = assets.length === 0 && searchQuery.length > 0

  return (
    <div className="relative mx-auto w-full max-w-7xl animate-in p-4 font-mono duration-500 fade-in md:p-8">
      <LibraryHeader
        isScanning={isScanning}
        assetCount={assets.length}
        onScanClick={handleSelectAndScan}
      />

      <main>
        {/* TOOLBAR */}
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

        {/* FEEDBACK VISUAL (LOADING / VAZIO / SEM RESULTADOS) */}
        <AnimatePresence mode="wait">
          {isFetchingAssets && searchQuery.length === 0 && (
            <motion.div key="loading" exit={{ opacity: 0 }}>
              <LibraryLoading />
            </motion.div>
          )}

          {!isFetchingAssets && isCompletelyEmpty && (
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
        {!isFetchingAssets && assets.length > 0 && (
          <VirtualizedAssetList
            assets={assets}
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

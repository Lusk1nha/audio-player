import { useState, useEffect, useMemo, useRef } from "react"
import { useVirtualizer } from "@tanstack/react-virtual"
import { cn } from "@audio-player/ui/lib/utils"
import type { MediaAsset } from "../../domain/MediaAsset"
import { AssetCard } from "./AssetCard"
import type { ViewMode } from "./LibraryToolbar"

interface VirtualizedAssetListProps {
  assets: MediaAsset[]
  viewMode: ViewMode
  currentTrackId?: string
  isPlaying: boolean
  onPlay: (asset: MediaAsset) => void
  onAddToQueue: (asset: MediaAsset) => void
}

export function VirtualizedAssetList({
  assets,
  viewMode,
  currentTrackId,
  isPlaying,
  onPlay,
  onAddToQueue,
}: VirtualizedAssetListProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [columns, setColumns] = useState(4)

  // --- RESPONSIVIDADE (GRID) ---
  useEffect(() => {
    const updateColumns = () => {
      const width = window.innerWidth
      if (width < 768) setColumns(1)
      else if (width < 1024) setColumns(2)
      else if (width < 1280) setColumns(3)
      else setColumns(4)
    }
    updateColumns()
    window.addEventListener("resize", updateColumns)
    return () => window.removeEventListener("resize", updateColumns)
  }, [])

  // --- AGRUPAMENTO (CHUNKING) ---
  const rows = useMemo(() => {
    const chunked: MediaAsset[][] = []
    const cols = viewMode === "list" ? 1 : columns
    for (let i = 0; i < assets.length; i += cols) {
      chunked.push(assets.slice(i, i + cols))
    }
    return chunked
  }, [assets, viewMode, columns])

  // --- VIRTUALIZADOR ---
  const virtualizer = useVirtualizer({
    count: rows.length,
    // Detecta o scroll no <main> pai do LibraryView automaticamente
    getScrollElement: () =>
      containerRef.current?.closest("main") || containerRef.current,
    estimateSize: () => (viewMode === "grid" ? 156 : 72),
    overscan: 5,
  })

  const gridClass =
    viewMode === "list"
      ? "grid-cols-1"
      : columns === 1
        ? "grid-cols-1"
        : columns === 2
          ? "grid-cols-2"
          : columns === 3
            ? "grid-cols-3"
            : "grid-cols-4"

  if (assets.length === 0) return null

  return (
    <div
      ref={containerRef}
      style={{
        height: `${virtualizer.getTotalSize()}px`,
        width: "100%",
        position: "relative",
      }}
    >
      {virtualizer.getVirtualItems().map((virtualRow) => {
        const rowAssets = rows[virtualRow.index]

        return (
          <div
            key={virtualRow.index}
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              width: "100%",
              transform: `translateY(${virtualRow.start}px)`,
            }}
          >
            <div className={cn("grid gap-4 pr-1", gridClass)}>
              {rowAssets.map((asset, indexInRow) => {
                const globalIndex =
                  virtualRow.index * (viewMode === "list" ? 1 : columns) +
                  indexInRow

                return (
                  <AssetCard
                    key={asset.id}
                    index={globalIndex}
                    asset={asset}
                    isActive={currentTrackId === asset.id}
                    isPlaying={isPlaying}
                    layout={viewMode}
                    onPlay={onPlay}
                    onAddToQueue={onAddToQueue}
                  />
                )
              })}
            </div>
          </div>
        )
      })}
    </div>
  )
}

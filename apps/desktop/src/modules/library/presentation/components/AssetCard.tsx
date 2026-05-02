import { memo } from "react"
import {
  WaveformIcon,
  ListPlusIcon,
  FileAudioIcon,
} from "@phosphor-icons/react"
import { motion, Variants } from "motion/react"
import { cn } from "@audio-player/ui/lib/utils"
import type { MediaAsset } from "../../domain/MediaAsset"

interface AssetCardProps {
  index: number
  asset: MediaAsset
  isActive: boolean
  isPlaying: boolean
  layout?: "grid" | "list"
  onPlay: (asset: MediaAsset) => void
  onAddToQueue: (asset: MediaAsset) => void
}

export const assetCardVariants: Variants = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.2 } },
}

export const AssetCard = memo(
  function AssetCard({
    index,
    asset,
    isActive,
    isPlaying,
    layout = "grid",
    onPlay,
    onAddToQueue,
  }: AssetCardProps) {
    const isGrid = layout === "grid"

    return (
      <motion.article
        variants={assetCardVariants}
        whileHover={{ scale: isGrid ? 1.01 : 1.002 }}
        whileTap={{ scale: 0.99 }}
        onClick={() => onPlay(asset)}
        className={cn(
          "group relative cursor-pointer overflow-hidden rounded-md border font-mono shadow-sm transition-all duration-200",
          isGrid
            ? "flex flex-col justify-between p-4"
            : "flex items-center gap-4 p-2 pl-3", // Modo List
          isActive
            ? "border-primary bg-primary/5 shadow-[0_0_15px_rgba(var(--color-primary),0.1)] ring-1 ring-primary/50"
            : "border-border bg-card hover:border-primary/40 hover:bg-muted/30 hover:shadow-md"
        )}
      >
        <div
          className={cn(
            "flex w-full flex-1",
            isGrid ? "flex-col" : "items-center gap-4"
          )}
        >
          {/* BLOCO 1: ÍCONE E TEXTOS PRINCIPAIS */}
          <div
            className={cn(
              "flex items-start gap-3 overflow-hidden",
              isGrid ? "mb-3 justify-between" : "min-w-0 flex-1 items-center" // min-w-0 é CRÍTICO para o truncate funcionar no flex
            )}
          >
            <div className="flex min-w-0 flex-1 items-center gap-2 overflow-hidden">
              <span
                className={cn(
                  "w-8 shrink-0 text-right text-[10px]",
                  isActive ? "text-primary" : "text-muted-foreground/50"
                )}
              >
                {String(index + 1).padStart(2, "0")}
              </span>

              <FileAudioIcon
                size={16}
                weight="duotone"
                className={cn(
                  "shrink-0",
                  isActive ? "text-primary" : "text-muted-foreground"
                )}
              />

              <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
                <h3
                  className={cn(
                    "truncate text-sm font-semibold transition-colors",
                    isActive
                      ? "text-primary"
                      : "text-foreground group-hover:text-primary"
                  )}
                  title={
                    asset.metadata.title || asset.path.split(/[/\\]/).pop()
                  }
                >
                  {asset.metadata.title || asset.path.split(/[/\\]/).pop()}
                </h3>

                {/* No modo lista, o artista aparece abaixo do título */}
                {!isGrid && (
                  <p
                    className="truncate text-[10px] text-muted-foreground/60"
                    title={asset.metadata.artist || "Desconhecido"}
                  >
                    {asset.metadata.artist || "Artista Desconhecido"}
                  </p>
                )}
              </div>
            </div>

            {/* Ações no modo GRID (Ficam no topo direito) */}
            {isGrid && (
              <div className="flex shrink-0 items-center gap-2 overflow-hidden">
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    onAddToQueue(asset)
                  }}
                  className="flex translate-x-4 items-center justify-center rounded bg-primary/10 p-1 text-primary opacity-0 transition-all duration-200 group-hover:translate-x-0 group-hover:opacity-100 hover:bg-primary hover:text-primary-foreground"
                  title="Adicionar à fila"
                >
                  <ListPlusIcon size={14} weight="bold" />
                </button>
                <span
                  className={cn(
                    "rounded border px-1.5 py-0.5 text-[10px] font-bold tracking-wider uppercase",
                    isActive
                      ? "border-primary/30 bg-primary/20 text-primary"
                      : "border-border bg-secondary text-secondary-foreground"
                  )}
                >
                  {asset.category}
                </span>
              </div>
            )}
          </div>

          {/* PATH (Caminho) */}
          {isGrid ? (
            <p
              className="truncate pl-6 text-[10px] text-muted-foreground/60"
              title={asset.path}
            >
              {asset.path}
            </p>
          ) : (
            // No modo lista, reservamos um espaço fixo/flexível para o caminho não esmagar o resto
            <div className="hidden min-w-0 flex-1 shrink-0 items-center md:flex">
              <p
                className="truncate text-[10px] text-muted-foreground/40"
                title={asset.path}
              >
                {asset.path}
              </p>
            </div>
          )}

          {/* BLOCO 2: METADADOS E AÇÕES (Tempo, Formato, etc) */}
          <div
            className={cn(
              "flex shrink-0 items-center text-xs text-muted-foreground",
              isGrid
                ? "mt-4 justify-between border-t border-border/50 pt-3"
                : "min-w-[200px] justify-end gap-4" // Garante largura mínima para os metadados não quebrarem
            )}
          >
            <span className="w-12 text-right font-medium">
              {asset.metadata.durationSeconds
                ? `${Math.floor(asset.metadata.durationSeconds / 60)}:${String(Math.floor(asset.metadata.durationSeconds % 60)).padStart(2, "0")}`
                : "--:--"}
            </span>
            <span className="w-10 text-right text-[10px] font-bold tracking-wider text-muted-foreground/50 uppercase">
              {asset.metadata.format || "UNK"}
            </span>

            {/* Ações e Labels no modo LISTA */}
            {!isGrid && (
              <div className="flex w-[120px] items-center justify-end gap-3 border-l border-border/50 pl-4">
                <span
                  className={cn(
                    "w-16 truncate rounded border px-1.5 py-0.5 text-center text-[10px] font-bold uppercase",
                    isActive
                      ? "border-primary/30 bg-primary/20 text-primary"
                      : "border-border bg-secondary text-secondary-foreground"
                  )}
                  title={asset.category}
                >
                  {asset.category}
                </span>
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    onAddToQueue(asset)
                  }}
                  title="Adicionar à fila"
                  className="flex shrink-0 items-center justify-center rounded p-1 text-muted-foreground transition-colors hover:bg-primary/20 hover:text-primary"
                >
                  <ListPlusIcon size={16} weight="bold" />
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Indicador Visual (Barra Ativa) */}
        {isActive && isPlaying && (
          <div
            className={cn(
              "absolute flex justify-center",
              isGrid
                ? "right-0 -bottom-px left-0"
                : "top-0 bottom-0 left-0 w-[2px]"
            )}
          >
            <div
              className={cn(
                "flex items-center justify-center overflow-hidden bg-primary shadow-[0_0_8px_var(--theme-primary)]",
                isGrid
                  ? "h-[2px] w-1/3 rounded-t-full"
                  : "h-full w-[2px] rounded-r-full"
              )}
            >
              {isGrid && (
                <WaveformIcon
                  size={12}
                  className="animate-pulse text-background"
                  weight="bold"
                />
              )}
            </div>
          </div>
        )}
      </motion.article>
    )
  },
  (prevProps, nextProps) => {
    return (
      prevProps.isActive === nextProps.isActive &&
      prevProps.isPlaying === nextProps.isPlaying &&
      prevProps.layout === nextProps.layout &&
      prevProps.asset.id === nextProps.asset.id
    )
  }
)

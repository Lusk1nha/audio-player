import { WaveformIcon } from "@phosphor-icons/react"
import { motion } from "motion/react"
import { cn } from "@audio-player/ui/lib/utils"
import { MediaAsset } from "../../domain/MediaAsset"

// Adicione/importe o tipo correto do seu domínio
interface AssetCardProps {
  asset: MediaAsset
  isActive: boolean
  isPlaying: boolean
  onClick: () => void
}

// Variantes para a animação de entrada em cascata (stagger)
export const assetCardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.3 } },
}

export function AssetCard({
  asset,
  isActive,
  isPlaying,
  onClick,
}: AssetCardProps) {
  console.log(asset)

  return (
    <motion.article
      variants={assetCardVariants}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className={cn(
        "group relative flex cursor-pointer flex-col justify-between rounded-md border p-4 font-mono shadow-sm transition-colors",
        isActive
          ? "border-primary bg-primary/5 ring-1 ring-primary/50"
          : "border-border bg-card hover:border-primary/40 hover:bg-muted/20"
      )}
    >
      <div>
        <div className="mb-3 flex items-start justify-between gap-2">
          <h3
            className={cn(
              "truncate text-sm font-semibold",
              isActive ? "text-primary" : "text-card-foreground"
            )}
            title={
              asset.metadata.title ||
              asset.path.split(/[/\\]/).pop() ||
              "untitled_audio"
            }
          >
            {asset.metadata.title ||
              asset.path.split(/[/\\]/).pop() ||
              "untitled_audio"}
          </h3>
          <span
            className={cn(
              "shrink-0 rounded border px-1.5 py-0.5 text-[10px] font-bold tracking-wider uppercase",
              isActive
                ? "border-primary/30 bg-primary/20 text-primary"
                : "border-border bg-secondary text-secondary-foreground"
            )}
          >
            {asset.category}
          </span>
        </div>
        <p
          className="truncate text-xs text-muted-foreground/70"
          title={asset.path}
        >
          {asset.path}
        </p>
      </div>

      <div className="mt-4 flex items-center justify-between border-t border-border/50 pt-3 text-xs text-muted-foreground">
        <span>
          {asset.metadata.durationSeconds
            ? `${Math.floor(asset.metadata.durationSeconds / 60)}:${String(Math.floor(asset.metadata.durationSeconds % 60)).padStart(2, "0")}`
            : "--:--"}
        </span>
        <span className="text-[10px] font-bold tracking-wider uppercase">
          EXT:{asset.metadata.format || "UNK"}
        </span>
      </div>

      {isActive && isPlaying && (
        <div className="absolute right-0 -bottom-px left-0 flex justify-center">
          <div className="flex h-[2px] w-1/2 items-center justify-center overflow-hidden rounded-t-full bg-primary shadow-[0_0_8px_var(--theme-primary)]">
            <WaveformIcon
              size={12}
              className="animate-pulse text-background"
              weight="bold"
            />
          </div>
        </div>
      )}
    </motion.article>
  )
}

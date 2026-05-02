import { WaveformIcon } from "@phosphor-icons/react"
import type { MediaAsset } from "@/modules/library/domain/MediaAsset"

interface QueueActiveProcessProps {
  currentTrack: MediaAsset
}

export function QueueActiveProcess({ currentTrack }: QueueActiveProcessProps) {
  return (
    <div className="mb-6 flex flex-col gap-2">
      <span className="px-2 text-[10px] font-bold tracking-widest text-primary uppercase">
        // Processo_Ativo
      </span>
      <div className="flex items-center gap-3 rounded-md border border-primary/30 bg-primary/10 p-3 shadow-[0_0_10px_rgba(var(--color-primary),0.1)]">
        <WaveformIcon
          size={20}
          className="shrink-0 animate-pulse text-primary"
          weight="bold"
        />
        <div className="flex flex-col overflow-hidden">
          <span
            className="truncate text-sm font-semibold text-foreground"
            title={currentTrack.metadata.title || "Sem título"}
          >
            {currentTrack.metadata.title ||
              currentTrack.path.split(/[/\\]/).pop()}
          </span>
          <span className="truncate text-[10px] tracking-wider text-muted-foreground uppercase">
            {currentTrack.metadata.artist || "UNKNOWN_AUTHOR"}
          </span>
        </div>
      </div>
    </div>
  )
}

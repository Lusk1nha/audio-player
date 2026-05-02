import { usePlayerStore } from "@/modules/playback/application/usePlayerStore"
import { ListPlusIcon, BroomIcon } from "@phosphor-icons/react"
import { QueueEmptyState } from "../components/QueueEmptyState"
import { QueueActiveProcess } from "../components/QueueActiveProcess"
import { QueueTrackList } from "../components/QueueTrackList"
import { type MediaAsset } from "@/modules/library/domain/MediaAsset"

export function QueuePanel() {
  const { queue, currentTrack, removeFromQueue, clearQueue, play } =
    usePlayerStore()

  if (queue.length === 0 && !currentTrack) {
    return <QueueEmptyState />
  }

  const handlePlayFromQueue = (track: MediaAsset, index: number) => {
    removeFromQueue(index)
    play(track)
  }

  return (
    <div className="relative z-10 flex h-full w-80 flex-col border-l border-border bg-sidebar font-mono shadow-xl">
      {/* --- CABEÇALHO --- */}
      <div className="flex h-14 shrink-0 items-center justify-between border-b border-border/50 bg-muted/5 px-4">
        <div>
          <h2 className="flex items-center gap-2 text-[11px] font-bold tracking-widest text-primary uppercase">
            <ListPlusIcon size={16} /> Buffer_Queue
          </h2>
          <span className="mt-0.5 block text-[10px] text-muted-foreground">
            {queue.length} {queue.length === 1 ? "faixa" : "faixas"} pendentes
          </span>
        </div>

        {/* Botão de Limpar */}
        {queue.length > 0 && (
          <button
            onClick={() => clearQueue()}
            className="flex items-center justify-center rounded-md border border-transparent p-1.5 text-muted-foreground transition-all duration-200 hover:border-destructive/30 hover:bg-destructive/10 hover:text-destructive"
            title="Limpar Buffer (Flush)"
          >
            <BroomIcon size={18} weight="duotone" />
          </button>
        )}
      </div>

      {/* --- ÁREA DE ROLAGEM PRINCIPAL --- */}
      <div className="flex-1 overflow-y-auto p-3">
        {currentTrack && <QueueActiveProcess currentTrack={currentTrack} />}

        <QueueTrackList
          queue={queue}
          onPlayTrack={handlePlayFromQueue}
          onRemoveTrack={removeFromQueue}
        />
      </div>
    </div>
  )
}

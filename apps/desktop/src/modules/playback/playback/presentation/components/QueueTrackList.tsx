import { AnimatePresence, Reorder } from "motion/react"
import { PlayCircleIcon, TrashIcon, ListIcon } from "@phosphor-icons/react"
import type { MediaAsset } from "@/modules/library/domain/MediaAsset"
import { usePlayerStore } from "@/modules/playback/application/usePlayerStore"

interface QueueTrackListProps {
  queue: MediaAsset[]
  onPlayTrack: (track: MediaAsset, index: number) => void
  onRemoveTrack: (index: number) => void
}

export function QueueTrackList({
  queue,
  onPlayTrack,
  onRemoveTrack,
}: QueueTrackListProps) {
  // Pegamos a ação de atualizar a fila inteira do Store
  const setQueue = usePlayerStore((state) => state.setQueue)

  if (queue.length === 0) return null

  return (
    <div className="flex flex-col gap-1 pb-4">
      <span className="mb-1 px-2 text-[10px] font-bold tracking-widest text-muted-foreground uppercase">
        // Na_Fila
      </span>

      <Reorder.Group
        axis="y"
        values={queue}
        onReorder={setQueue}
        className="flex flex-col gap-1"
      >
        <AnimatePresence initial={false}>
          {queue.map((track, index) => (
            <Reorder.Item
              key={`${track.id}`}
              value={track}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
              className="group relative flex cursor-grab items-center justify-between rounded-md border border-transparent p-2 transition-colors hover:border-border/50 hover:bg-muted/10 active:cursor-grabbing active:bg-muted/20 active:shadow-lg"
            >
              {/* Info da Música */}
              <div className="flex flex-1 items-center gap-3 overflow-hidden select-none">
                {/* Ícone de "Handle" (Opcional, indica que é arrastável) */}
                <div className="text-muted-foreground/20 transition-colors group-hover:text-primary/40">
                  <ListIcon size={14} weight="bold" />
                </div>

                <span className="w-4 shrink-0 text-right text-[10px] font-medium text-muted-foreground/40">
                  {String(index + 1).padStart(2, "0")}
                </span>

                <div className="flex flex-col overflow-hidden">
                  <span className="truncate text-xs font-medium text-sidebar-foreground">
                    {track.metadata.title || track.path.split(/[/\\]/).pop()}
                  </span>
                  {track.metadata.format && (
                    <span className="text-[9px] font-bold tracking-widest text-muted-foreground/70 uppercase">
                      EXT:{track.metadata.format}
                    </span>
                  )}
                </div>
              </div>

              {/* Ações (Escondidas durante o arraste via CSS ou mantidas conforme sua escolha) */}
              <div className="absolute right-2 flex shrink-0 items-center gap-1 rounded-md bg-sidebar/80 p-0.5 opacity-0 backdrop-blur-sm transition-opacity group-hover:opacity-100 group-active:hidden">
                <button
                  onClick={() => onPlayTrack(track, index)}
                  className="rounded p-1.5 text-muted-foreground transition-colors hover:bg-primary/20 hover:text-primary"
                  title="Forçar Execução"
                >
                  <PlayCircleIcon size={16} weight="fill" />
                </button>
                <button
                  onClick={() => onRemoveTrack(index)}
                  className="rounded p-1.5 text-muted-foreground transition-colors hover:bg-destructive/20 hover:text-destructive"
                  title="Remover do Buffer"
                >
                  <TrashIcon size={16} weight="duotone" />
                </button>
              </div>
            </Reorder.Item>
          ))}
        </AnimatePresence>
      </Reorder.Group>
    </div>
  )
}

import { ListDashesIcon, ListPlusIcon } from "@phosphor-icons/react"

export function QueueEmptyState() {
  return (
    <div className="relative z-10 flex h-full w-80 flex-col border-l border-border bg-sidebar font-mono shadow-xl">
      <div className="flex h-14 shrink-0 items-center border-b border-border/50 bg-muted/5 px-4">
        <h2 className="flex items-center gap-2 text-[11px] font-bold tracking-widest text-muted-foreground uppercase">
          <ListPlusIcon size={16} /> Buffer_Queue
        </h2>
      </div>
      <div className="flex flex-1 flex-col items-center justify-center p-6 text-center text-muted-foreground/50">
        <ListDashesIcon
          size={32}
          weight="duotone"
          className="mb-3 opacity-50"
        />
        <span className="text-sm font-medium">Buffer Vazio</span>
        <span className="mt-1 text-[10px] tracking-widest uppercase opacity-70">
          Nenhum processo na fila
        </span>
      </div>
    </div>
  )
}

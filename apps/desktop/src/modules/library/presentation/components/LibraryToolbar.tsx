import {
  GridFourIcon,
  ListDashesIcon,
  SortAscendingIcon,
  SortDescendingIcon,
  FunnelIcon,
  MagnifyingGlassIcon,
  XCircleIcon,
} from "@phosphor-icons/react"
import { cn } from "@audio-player/ui/lib/utils"
import type { SortOption, SortOrder } from "../../domain/MediaAsset"

export type ViewMode = "grid" | "list"

interface LibraryToolbarProps {
  searchQuery: string
  onSearchChange: (val: string) => void
  sortBy: SortOption
  onSortByChange: (val: SortOption) => void
  sortOrder: SortOrder
  onSortOrderChange: (val: SortOrder) => void
  viewMode: ViewMode
  onViewModeChange: (val: ViewMode) => void
}

export function LibraryToolbar({
  searchQuery,
  onSearchChange,
  sortBy,
  onSortByChange,
  sortOrder,
  onSortOrderChange,
  viewMode,
  onViewModeChange,
}: LibraryToolbarProps) {
  return (
    <div className="mb-6 flex flex-col justify-between gap-4 rounded-md border border-border/50 bg-muted/10 px-4 py-3 xl:flex-row xl:items-center">
      {/* SEARCH BAR */}
      <div className="relative max-w-md flex-1">
        <MagnifyingGlassIcon
          size={16}
          className="absolute top-1/2 left-3 -translate-y-1/2 text-muted-foreground"
        />
        <input
          type="text"
          placeholder="Buscar por título, artista ou arquivo..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="h-9 w-full rounded-md border border-border/50 bg-card pr-8 pl-9 text-xs text-foreground transition-all placeholder:text-muted-foreground/50 focus:border-primary/50 focus:ring-1 focus:ring-primary/50 focus:outline-none"
        />
        {searchQuery && (
          <button
            onClick={() => onSearchChange("")}
            className="absolute top-1/2 right-2 -translate-y-1/2 text-muted-foreground transition-colors hover:text-foreground"
          >
            <XCircleIcon size={16} weight="fill" />
          </button>
        )}
      </div>

      {/* CONTROLES DE ORDENAÇÃO E VISUALIZAÇÃO */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2">
          <FunnelIcon
            size={16}
            className="hidden text-muted-foreground sm:block"
          />
          <div className="flex items-center gap-1 rounded border border-border/50 bg-card p-1 shadow-sm">
            {(["name", "artist", "duration", "recent"] as SortOption[]).map(
              (opt) => (
                <button
                key={opt}
                onClick={() => onSortByChange(opt)}
                className={cn(
                  "rounded px-3 py-1 text-[10px] font-bold tracking-wider uppercase transition-colors",
                  sortBy === opt
                    ? "bg-primary/20 text-primary"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                {opt === "name"
                  ? "Nome"
                  : opt === "artist"
                    ? "Artista"
                    : opt === "duration"
                      ? "Duração"
                      : "Recentes"}
              </button>
            ))}
          </div>
          <button
            onClick={() =>
              onSortOrderChange(sortOrder === "asc" ? "desc" : "asc")
            }
            className="flex items-center justify-center rounded border border-border/50 bg-card p-1.5 text-muted-foreground transition-colors hover:text-primary"
            title="Inverter Ordem"
          >
            {sortOrder === "asc" ? (
              <SortAscendingIcon size={16} />
            ) : (
              <SortDescendingIcon size={16} />
            )}
          </button>
        </div>

        {/* Separador */}
        <div className="hidden h-6 w-px bg-border/50 sm:block"></div>

        <div className="flex items-center gap-1 rounded border border-border/50 bg-card p-1 shadow-sm">
          <button
            onClick={() => onViewModeChange("grid")}
            className={cn(
              "rounded p-1.5 transition-colors",
              viewMode === "grid"
                ? "bg-primary/20 text-primary"
                : "text-muted-foreground hover:text-foreground"
            )}
            title="Visualização em Grade"
          >
            <GridFourIcon
              size={16}
              weight={viewMode === "grid" ? "fill" : "regular"}
            />
          </button>
          <button
            onClick={() => onViewModeChange("list")}
            className={cn(
              "rounded p-1.5 transition-colors",
              viewMode === "list"
                ? "bg-primary/20 text-primary"
                : "text-muted-foreground hover:text-foreground"
            )}
            title="Visualização em Lista"
          >
            <ListDashesIcon
              size={16}
              weight={viewMode === "list" ? "fill" : "regular"}
            />
          </button>
        </div>
      </div>
    </div>
  )
}

import {
  FolderPlusIcon,
  SpinnerGapIcon,
  TerminalWindowIcon,
  HardDrivesIcon,
} from "@phosphor-icons/react"
import { motion } from "motion/react"
import { cn } from "@audio-player/ui/lib/utils"

interface LibraryHeaderProps {
  isScanning: boolean
  assetCount: number
  onScanClick: () => void
}

export function LibraryHeader({
  isScanning,
  assetCount,
  onScanClick,
}: LibraryHeaderProps) {
  return (
    <div className="mb-8">
      <header className="flex flex-col gap-6 border-b border-border/50 pb-6 sm:flex-row sm:items-end sm:justify-between">
        <div className="font-mono">
          <div className="mb-2 flex items-center gap-2 text-primary">
            <TerminalWindowIcon size={20} weight="duotone" />
            <span className="text-xs font-semibold tracking-wider uppercase">
              ~/audio_manager/explorer
            </span>
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            Biblioteca Local
          </h1>
          <p className="mt-2 hidden text-sm text-muted-foreground sm:block">
            Indexe e gerencie seus assets de áudio do sistema de arquivos.
          </p>
        </div>

        <motion.button
          whileTap={isScanning ? {} : { scale: 0.95 }}
          onClick={onScanClick}
          disabled={isScanning}
          className={cn(
            "inline-flex h-10 w-full items-center justify-center gap-x-2 rounded-md px-6 py-2 font-mono text-sm font-medium shadow-sm transition-all focus-visible:ring-1 focus-visible:ring-ring focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50 sm:w-auto",
            isScanning
              ? "border border-border bg-muted text-muted-foreground"
              : "bg-primary text-primary-foreground hover:bg-primary/90 hover:shadow-[0_0_15px_rgba(var(--color-primary),0.3)]"
          )}
        >
          {isScanning ? (
            <>
              <SpinnerGapIcon
                className="mr-2 -ml-1 h-4 w-4 animate-spin text-current"
                weight="bold"
              />
              Indexando_Buffer...
            </>
          ) : (
            <>
              <FolderPlusIcon weight="bold" size={18} />
              Adicionar Diretório
            </>
          )}
        </motion.button>
      </header>

      {/* Status Bar */}
      <div className="mt-4 flex items-center justify-between font-mono text-sm">
        <div className="flex items-center gap-2 text-foreground">
          <HardDrivesIcon size={18} weight="duotone" className="text-primary" />
          <h2 className="font-semibold tracking-tight">Assets Indexados</h2>
        </div>
        <div className="flex items-center gap-2">
          <span className="relative flex h-2 w-2">
            {isScanning ? (
              <>
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-accent opacity-75"></span>
                <span className="relative inline-flex h-2 w-2 rounded-full bg-accent"></span>
              </>
            ) : (
              <span className="relative inline-flex h-2 w-2 rounded-full bg-primary"></span>
            )}
          </span>
          <span className="inline-flex items-center rounded border border-border/50 bg-muted/20 px-2 py-1 text-xs font-semibold text-muted-foreground">
            {assetCount} {assetCount === 1 ? "arquivo" : "arquivos"} encontrados
          </span>
        </div>
      </div>
    </div>
  )
}

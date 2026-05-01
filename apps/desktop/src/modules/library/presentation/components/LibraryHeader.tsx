import {
  FolderPlusIcon,
  SpinnerGapIcon,
  TerminalWindowIcon,
  HardDrivesIcon,
} from "@phosphor-icons/react"
import { motion } from "motion/react"

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
    <>
      <header className="mb-8 flex flex-col gap-4 border-b border-border/50 pb-6 sm:flex-row sm:items-end sm:justify-between">
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
          <p className="mt-2 text-sm text-muted-foreground">
            Indexe e gerencie seus assets de áudio do sistema de arquivos.
          </p>
        </div>

        <motion.button
          whileTap={isScanning ? {} : { scale: 0.95 }}
          onClick={onScanClick}
          disabled={isScanning}
          className="inline-flex h-10 w-full items-center justify-center gap-x-2 rounded-md bg-primary px-6 py-2 font-mono text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90 focus-visible:ring-1 focus-visible:ring-ring focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50 sm:w-auto"
        >
          {isScanning ? (
            <>
              <SpinnerGapIcon
                className="mr-2 -ml-1 h-4 w-4 animate-spin text-current"
                weight="bold"
                size={20}
              />
              Indexando...
            </>
          ) : (
            <>
              <FolderPlusIcon weight="bold" size={20} />
              Adicionar Diretório
            </>
          )}
        </motion.button>
      </header>

      {/* Status Bar */}
      <div className="mb-4 flex items-center justify-between font-mono text-sm">
        <div className="flex items-center gap-2 text-foreground">
          <HardDrivesIcon size={18} weight="duotone" className="text-primary" />
          <h2 className="font-semibold tracking-tight">Assets Indexados</h2>
        </div>
        <span className="inline-flex items-center rounded border border-border/50 bg-muted/50 px-2 py-1 text-xs font-semibold text-muted-foreground">
          {assetCount} {assetCount === 1 ? "arquivo" : "arquivos"} encontrados
        </span>
      </div>
    </>
  )
}

import {
  WaveformIcon,
  TerminalWindowIcon,
  ActivityIcon,
} from "@phosphor-icons/react"
import { motion, AnimatePresence } from "motion/react"
import { usePlayerStore } from "@/modules/playback/application/usePlayerStore"
import { cn } from "@audio-player/ui/lib/utils"

export function TrackInfo() {
  const { currentTrack, isPlaying } = usePlayerStore()

  // Função auxiliar para limpar o nome do arquivo se o título estiver vazio
  const getDisplayName = () => {
    if (!currentTrack) return ""
    if (currentTrack.metadata.title) return currentTrack.metadata.title

    const fileName = currentTrack.path.split(/[/\\]/).pop() || "unknown_stream"
    return fileName.replace(/\.[^/.]+$/, "") // Remove a extensão (.mp3, .wav, etc)
  }

  return (
    <div className="flex w-full min-w-[200px] items-center gap-4 font-mono sm:w-1/3">
      {currentTrack ? (
        <>
          {/* Ícone com Estado de Processamento */}
          <motion.div
            layoutId="track-icon"
            className={cn(
              "relative flex h-10 w-10 shrink-0 items-center justify-center border transition-colors duration-500",
              isPlaying
                ? "border-primary/40 bg-primary/10 text-primary shadow-[0_0_15px_rgba(var(--color-primary),0.1)]"
                : "border-border bg-muted/20 text-muted-foreground"
            )}
          >
            <AnimatePresence mode="wait">
              {isPlaying ? (
                <motion.div
                  key="playing"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                >
                  <WaveformIcon
                    size={20}
                    weight="bold"
                    className="animate-pulse"
                  />
                </motion.div>
              ) : (
                <motion.div
                  key="paused"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                >
                  <TerminalWindowIcon size={20} weight="duotone" />
                </motion.div>
              )}
            </AnimatePresence>

            {/* Dot de Status no canto do ícone */}
            <div
              className={cn(
                "absolute -top-0.5 -right-0.5 h-2 w-2 rounded-full border-2 border-background",
                isPlaying ? "animate-pulse bg-primary" : "bg-muted-foreground"
              )}
            />
          </motion.div>

          <div className="flex flex-col overflow-hidden leading-tight">
            {/* Título da Faixa */}
            <div className="h-5 overflow-hidden">
              <AnimatePresence mode="popLayout">
                <motion.span
                  key={currentTrack.id}
                  initial={{ y: 15, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: -15, opacity: 0 }}
                  transition={{ type: "spring", stiffness: 300, damping: 20 }}
                  className="block truncate text-sm font-bold text-foreground"
                  title={getDisplayName()}
                >
                  {getDisplayName()}
                </motion.span>
              </AnimatePresence>
            </div>

            {/* Metadados Estilo Sub-header de CLI */}
            <div className="flex items-center gap-2 text-[10px] font-bold tracking-widest text-muted-foreground uppercase">
              <span className="max-w-[120px] truncate">
                {currentTrack.metadata.artist || "UNKNOWN_AUTHOR"}
              </span>
              <span className="opacity-30">|</span>
              <span className="flex items-center gap-1 text-primary/80">
                <ActivityIcon size={10} weight="bold" />
                {currentTrack.metadata.format || "RAW"}
              </span>
            </div>
          </div>
        </>
      ) : (
        /* Estado de Espera - Estilo Prompt de Comando */
        <div className="flex items-center gap-2 text-xs font-bold tracking-widest text-muted-foreground/40 uppercase">
          <span className="inline-block h-4 w-2 animate-pulse bg-muted-foreground/20" />
          <span>Aguardando_Input...</span>
        </div>
      )}
    </div>
  )
}

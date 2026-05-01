import { WaveformIcon, TerminalWindowIcon } from "@phosphor-icons/react"
import { motion, AnimatePresence } from "motion/react"
import { usePlayerStore } from "@/modules/playback/application/usePlayerStore"

export function TrackInfo() {
  const { currentTrack, isPlaying } = usePlayerStore()

  return (
    <div className="flex w-full min-w-[150px] items-center gap-3 font-mono sm:w-1/3">
      {currentTrack ? (
        <>
          <motion.div
            layoutId="track-icon"
            className="flex h-10 w-10 shrink-0 items-center justify-center border border-primary/30 bg-primary/10 text-primary shadow-sm"
          >
            {isPlaying ? (
              <WaveformIcon size={20} weight="bold" className="animate-pulse" />
            ) : (
              <TerminalWindowIcon size={20} weight="duotone" />
            )}
          </motion.div>

          <div className="flex flex-col overflow-hidden">
            {/* AnimatePresence para animar a troca de título */}
            <AnimatePresence mode="popLayout">
              <motion.span
                key={currentTrack.id}
                initial={{ y: 10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: -10, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="truncate text-sm font-bold text-primary"
                title={
                  currentTrack.metadata.title ||
                  currentTrack.path.split(/[/\\]/).pop()
                }
              >
                {currentTrack.metadata.title ||
                  currentTrack.path.split(/[/\\]/).pop()}
              </motion.span>
            </AnimatePresence>

            <div className="flex items-center gap-2 text-[10px] tracking-wider text-muted-foreground uppercase">
              <span className="truncate">
                {currentTrack.metadata.artist || "UNKNOWN_AUTHOR"}
              </span>
              <span className="shrink-0 border-l border-border/50 pl-2">
                {currentTrack.metadata.format || "RAW"}
              </span>
            </div>
          </div>
        </>
      ) : (
        <span className="text-xs font-semibold tracking-widest text-muted-foreground uppercase">
          [Aguardando_Input]
        </span>
      )}
    </div>
  )
}

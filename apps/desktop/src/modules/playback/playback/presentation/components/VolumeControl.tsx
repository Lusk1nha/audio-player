import { useState } from "react"
import {
  SpeakerHighIcon,
  SpeakerLowIcon,
  SpeakerSimpleXIcon,
} from "@phosphor-icons/react"
import { motion, AnimatePresence } from "motion/react"
import { cn } from "@audio-player/ui/lib/utils"
import { usePlayerStore } from "@/modules/playback/application/usePlayerStore"

export function VolumeControl() {
  const { volume, setVolume } = usePlayerStore()
  const [lastVolume, setLastVolume] = useState(0.7)

  const isMuted = volume === 0
  const displayPercentage = Math.round(volume * 100)

  const toggleMute = () => {
    if (isMuted) {
      setVolume(lastVolume > 0 ? lastVolume : 0.7)
    } else {
      setLastVolume(volume)
      setVolume(0)
    }
  }

  return (
    <div className="hidden w-full min-w-[180px] items-center justify-end gap-3 font-mono sm:flex sm:w-1/3">
      {/* Container Estilizado: Estética de Módulo de Rack */}
      <div className="flex items-center gap-3 rounded-md border border-border/40 bg-muted/5 px-3 py-2 transition-all hover:border-border/80 hover:bg-muted/10">
        {/* Ícone de Mute com Animação de Troca */}
        <button
          onClick={toggleMute}
          className={cn(
            "relative flex h-5 w-5 items-center justify-center transition-colors focus:outline-none",
            isMuted
              ? "text-destructive"
              : "text-muted-foreground hover:text-primary"
          )}
          title={isMuted ? "Ativar Áudio" : "Silenciar"}
        >
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={isMuted ? "muted" : displayPercentage < 50 ? "low" : "high"}
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.5 }}
              transition={{ duration: 0.1 }}
            >
              {isMuted ? (
                <SpeakerSimpleXIcon size={18} weight="bold" />
              ) : displayPercentage < 50 ? (
                <SpeakerLowIcon size={18} weight="duotone" />
              ) : (
                <SpeakerHighIcon size={18} weight="duotone" />
              )}
            </motion.div>
          </AnimatePresence>
        </button>

        {/* Área do Slider */}
        <div className="group relative flex h-5 w-24 items-center">
          {/* Input Range Nativo */}
          <input
            type="range"
            min={0}
            max={1}
            step={0.01}
            value={volume}
            onChange={(e) => setVolume(parseFloat(e.target.value))}
            className="absolute inset-0 z-20 w-full cursor-pointer opacity-0 disabled:cursor-not-allowed"
            aria-label="Volume"
          />

          {/* Track Customizada */}
          <div className="relative h-1 w-full overflow-hidden rounded-full bg-muted/40 transition-all group-hover:h-1.5">
            {/* Gradiente de Volume (Verde para Amarelo/Laranja no final) */}
            <div
              className={cn(
                "absolute inset-y-0 left-0 transition-all duration-200",
                isMuted
                  ? "bg-muted-foreground/20"
                  : "bg-primary shadow-[0_0_10px_rgba(var(--color-primary),0.4)]"
              )}
              style={{ width: `${displayPercentage}%` }}
            />
          </div>

          {/* Thumb Estilo Terminal (Cursor de Texto █) */}
          <div
            className={cn(
              "pointer-events-none absolute z-10 h-3 w-1 rounded-[1px] shadow-lg transition-all duration-150",
              isMuted ? "bg-muted-foreground/40" : "bg-foreground",
              "scale-y-50 opacity-0 group-hover:scale-y-100 group-hover:opacity-100"
            )}
            style={{ left: `calc(${displayPercentage}% - 2px)` }}
          />
        </div>

        {/* Display de Porcentagem (CLI Style) */}
        <div className="flex w-10 items-center justify-end border-l border-border/50 pl-2">
          <span
            className={cn(
              "text-[10px] font-bold tracking-tighter tabular-nums transition-colors",
              isMuted ? "text-destructive/50" : "text-muted-foreground"
            )}
          >
            {displayPercentage.toString().padStart(2, "0")}
          </span>
        </div>
      </div>
    </div>
  )
}

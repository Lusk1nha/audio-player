import {
  SpeakerHighIcon,
  SpeakerLowIcon,
  SpeakerNoneIcon,
} from "@phosphor-icons/react"
import { motion } from "motion/react"
import { cn } from "@audio-player/ui/lib/utils"
import { usePlayerStore } from "@/modules/playback/application/usePlayerStore"

export function VolumeControl() {
  const { volume, setVolume } = usePlayerStore()

  const isMuted = volume === 0

  const toggleMute = () => {
    if (isMuted) {
      setVolume(0.7)
    } else {
      setVolume(0)
    }
  }

  const displayPercentage = Math.round(volume * 100)

  return (
    <div className="hidden w-1/3 items-center justify-end gap-3 font-mono sm:flex">
      {/* Contêiner Estilizado para o Bloco de Volume */}
      <div className="flex items-center gap-3 rounded-md border border-border/40 bg-muted/10 px-3 py-1.5 shadow-sm transition-colors hover:border-border/80">
        {/* Display do Valor (Estilo Terminal) */}
        <span
          className={cn(
            "w-9 text-right text-[10px] font-bold tracking-wider uppercase transition-colors",
            isMuted ? "text-muted-foreground/50" : "text-foreground"
          )}
        >
          {displayPercentage}%
        </span>

        {/* Botão de Mute Animado */}
        <motion.button
          whileTap={{ scale: 0.85 }}
          onClick={toggleMute}
          className={cn(
            "transition-colors",
            isMuted
              ? "text-destructive"
              : "text-muted-foreground hover:text-primary"
          )}
        >
          {isMuted ? (
            <SpeakerNoneIcon size={18} weight="duotone" />
          ) : displayPercentage < 50 ? (
            <SpeakerLowIcon size={18} weight="duotone" />
          ) : (
            <SpeakerHighIcon size={18} weight="duotone" />
          )}
        </motion.button>

        {/* Área do Slider de Volume */}
        <div className="group relative flex h-5 w-24 items-center">
          {/* Input Range Nativo (Invisível, mas fornece a UX perfeita de drag e teclado) */}
          <input
            type="range"
            min={0}
            max={1}
            step={0.01}
            value={volume}
            onChange={(e) => setVolume(parseFloat(e.target.value))}
            className="absolute inset-0 z-10 w-full cursor-pointer opacity-0"
            aria-label="Volume"
          />

          {/* Track Customizada (Fundo) */}
          <div className="relative flex h-1 w-full overflow-hidden rounded-sm border border-border/50 bg-muted/50">
            {/* Barra de Progresso do Volume */}
            <motion.div
              layout
              className={cn(
                "absolute top-0 bottom-0 left-0 transition-colors",
                isMuted
                  ? "bg-muted-foreground/30"
                  : "bg-foreground shadow-[0_0_8px_rgba(var(--theme-primary),0.5)] group-hover:bg-primary"
              )}
              style={{ width: `${displayPercentage}%` }}
            />
          </div>

          {/* Thumb (O "Pino" do slider) - Visível apenas no hover para manter o minimalismo */}
          <motion.div
            layout
            className={cn(
              "absolute z-0 h-2.5 w-1.5 rounded-[1px] shadow-md transition-all duration-200",
              isMuted ? "bg-muted-foreground/50" : "bg-primary",
              "scale-50 opacity-0 group-hover:scale-100 group-hover:opacity-100"
            )}
            style={{
              left: `calc(${displayPercentage}% - 3px)`,
            }}
          />
        </div>
      </div>
    </div>
  )
}

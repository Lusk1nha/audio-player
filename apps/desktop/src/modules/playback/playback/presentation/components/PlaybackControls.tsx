import { useState, useEffect } from "react"
import { Button } from "@audio-player/ui/components/button"
import {
  SkipForwardIcon,
  PauseIcon,
  PlayIcon,
  SkipBackIcon,
} from "@phosphor-icons/react"
import { motion } from "motion/react"
import { usePlayerStore } from "@/modules/playback/application/usePlayerStore"
import { cn } from "@audio-player/ui/lib/utils"

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@audio-player/ui/components/tooltip"

export function PlaybackControls() {
  const { currentTrack, isPlaying, togglePlay, seekTo } = usePlayerStore()

  const [currentTime, setCurrentTime] = useState(0)
  const [isDragging, setIsDragging] = useState(false)

  const [hoverTime, setHoverTime] = useState<number | null>(null)
  const [hoverOffset, setHoverOffset] = useState(0)

  useEffect(() => {
    setCurrentTime(0)
  }, [currentTrack?.id])
  
  useEffect(() => {
    let interval: number

    if (isPlaying && !isDragging) {
      interval = setInterval(() => {
        setCurrentTime((prev) => {
          const maxDuration = currentTrack?.metadata.durationSeconds || 0
          if (prev >= maxDuration && maxDuration > 0) {
            clearInterval(interval)
            return maxDuration
          }
          return prev + 1
        })
      }, 1000)
    }

    return () => clearInterval(interval)
  }, [isPlaying, currentTrack, isDragging])

  const formatTime = (seconds?: number) => {
    if (!seconds || isNaN(seconds)) return "0:00"
    return `${Math.floor(seconds / 60)}:${String(Math.floor(seconds % 60)).padStart(2, "0")}`
  }

  const duration = currentTrack?.metadata.durationSeconds || 0
  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0

  // --- HANDLERS DE DRAG (INPUT) ---
  const handleSeekChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTime = Number(e.target.value)
    setIsDragging(true)
    setCurrentTime(newTime)

    // Faz o Tooltip seguir o pino duranto o arrasto (drag)
    if (duration) {
      const percentage = newTime / duration
      setHoverOffset(percentage * 100 - 50)
    }
  }

  const handleSeekEnd = async () => {
    if (currentTrack && seekTo) {
      await seekTo(currentTime)
    }
    setIsDragging(false)
  }

  // --- HANDLERS DE HOVER DA BARRA ---
  const handleMouseMove = (e: any) => {
    if (!duration) return

    const target = e.currentTarget as HTMLElement
    const bounds = target.getBoundingClientRect()

    // Posição X do mouse em relação ao início da barra
    const x = e.clientX - bounds.left
    const percentage = Math.max(0, Math.min(1, x / bounds.width))

    setHoverTime(percentage * duration)

    // Atualiza o offset do Tooltip para seguir o mouse
    setHoverOffset(x - bounds.width / 2)
  }

  const handleMouseLeave = () => {
    setHoverTime(null)
    setHoverOffset(0)
  }

  const displayTooltipTime = isDragging
    ? currentTime
    : hoverTime !== null
      ? hoverTime
      : currentTime

  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-1.5 px-4 font-mono sm:w-1/3">
      {/* Botões de Controle */}
      <div className="flex items-center gap-4">
        <motion.button
          whileTap={{ scale: 0.85 }}
          disabled={!currentTrack}
          className="text-muted-foreground transition hover:text-primary disabled:opacity-50"
        >
          <SkipBackIcon weight="fill" size={18} />
        </motion.button>

        <motion.div whileTap={{ scale: 0.95 }}>
          <Button
            onClick={togglePlay}
            disabled={!currentTrack}
            className={cn(
              "flex h-9 w-12 items-center justify-center rounded-md border p-0 transition-all duration-200",
              isPlaying
                ? "border-primary bg-primary/10 text-primary shadow-[0_0_12px_rgba(var(--color-primary),0.3)] hover:bg-primary/20"
                : "border-foreground bg-foreground text-background hover:bg-foreground/90",
              "disabled:border-muted disabled:bg-muted disabled:text-muted-foreground disabled:shadow-none"
            )}
          >
            {isPlaying ? (
              <PauseIcon weight="bold" size={18} />
            ) : (
              <PlayIcon weight="bold" size={18} />
            )}
          </Button>
        </motion.div>

        <motion.button
          whileTap={{ scale: 0.85 }}
          disabled={!currentTrack}
          className="text-muted-foreground transition hover:text-primary disabled:opacity-50"
        >
          <SkipForwardIcon weight="fill" size={18} />
        </motion.button>
      </div>

      {/* Barra de Progresso com Tooltip Rastreador */}
      <div className="hidden w-full max-w-md items-center gap-3 text-[10px] font-bold tracking-widest text-muted-foreground uppercase sm:flex">
        <span className="w-8 text-right text-foreground">
          {formatTime(currentTime)}
        </span>

        <TooltipProvider delay={0}>
          <Tooltip>
            <TooltipTrigger
              render={<div />}
              className="group relative flex h-5 flex-1 cursor-pointer items-center outline-none"
              onMouseMove={handleMouseMove}
              onMouseLeave={handleMouseLeave}
            >
              {/* Input Nativo (Invisível) */}
              <input
                type="range"
                min={0}
                max={duration || 100}
                value={currentTime}
                onChange={handleSeekChange}
                onMouseUp={handleSeekEnd}
                onTouchEnd={handleSeekEnd}
                disabled={!currentTrack}
                className="absolute inset-0 z-10 w-full cursor-pointer opacity-0 disabled:cursor-not-allowed"
              />

              {/* Fundo da Barra - Fica levemente mais espessa no hover */}
              <div className="relative flex h-1 w-full overflow-hidden border-x border-border bg-muted/40 transition-all duration-200 group-hover:h-1.5">
                <div
                  className={cn(
                    "absolute top-0 bottom-0 left-0 bg-primary",
                    isDragging
                      ? "transition-none"
                      : "transition-all duration-300 ease-linear",
                    currentTrack &&
                      !isDragging &&
                      "shadow-[0_0_10px_rgba(var(--color-primary),0.6)]"
                  )}
                  style={{ width: `${progressPercent}%` }}
                />
              </div>

              {/* Thumb Estilo Terminal (Bloco █) */}
              {currentTrack && (
                <div
                  className={cn(
                    "absolute z-0 h-3 w-1.5 rounded-[1px] bg-primary shadow-md transition-all duration-200",
                    "scale-50 opacity-0 group-hover:scale-100 group-hover:opacity-100",
                    isDragging && "scale-100 opacity-100"
                  )}
                  style={{
                    left: `calc(${progressPercent}% - 3px)`,
                  }}
                />
              )}
            </TooltipTrigger>

            <TooltipContent
              side="top"
              sideOffset={2}
              alignOffset={hoverOffset} // A MÁGICA ACONTECE AQUI!
              className={cn(
                "border border-primary/20 bg-card font-mono text-[11px] font-bold tracking-widest text-primary shadow-xl",

                isDragging &&
                  "transition-none data-[state=delayed-open]:animate-none"
              )}
            >
              {formatTime(displayTooltipTime)}
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

        <span className="w-8 text-left text-muted-foreground/50">
          {formatTime(duration)}
        </span>
      </div>
    </div>
  )
}

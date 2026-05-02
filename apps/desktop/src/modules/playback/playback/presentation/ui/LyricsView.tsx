import { usePlayerStore } from "@/modules/playback/application/usePlayerStore"
import { motion } from "motion/react"
import { useEffect, useRef } from "react"
import { cn } from "@audio-player/ui/lib/utils"

export function LyricsView() {
  const { currentTrack, currentTime, isLyricsOpen } = usePlayerStore()
  const scrollRef = useRef<HTMLDivElement>(null)

  // Mock de dados (No futuro, isso viria do asset.metadata.lyrics ou um arquivo .lrc)
  const transcript = [
    { time: 0, text: "[Início do Áudio]" },
    { time: 5, text: "Bem-vindo ao seu sistema de áudio customizado." },
    { time: 10, text: "Esta é uma demonstração de transcrição sincronizada." },
    { time: 15, text: "O texto abaixo deve brilhar conforme o tempo passa." },
  ]

  // Auto-scroll para a linha ativa
  useEffect(() => {
    const activeLine = document.querySelector(".lyric-active")
    if (activeLine) {
      activeLine.scrollIntoView({ behavior: "smooth", block: "center" })
    }
  }, [currentTime])

  if (!isLyricsOpen) return null

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      className="absolute inset-0 z-50 flex flex-col bg-background/95 p-8 font-mono backdrop-blur-md"
    >
      <div
        className="no-scrollbar mx-auto w-full max-w-2xl flex-1 overflow-y-auto py-20"
        ref={scrollRef}
      >
        {transcript.map((line, index) => {
          const isActive =
            currentTime >= line.time &&
            (index === transcript.length - 1 ||
              currentTime < transcript[index + 1].time)

          return (
            <p
              key={index}
              className={cn(
                "mb-6 text-2xl font-bold transition-all duration-500",
                isActive
                  ? "lyric-active scale-105 text-primary opacity-100 blur-none"
                  : "text-muted-foreground/30 blur-[1px] hover:blur-none"
              )}
            >
              {line.text}
            </p>
          )
        })}
      </div>
    </motion.div>
  )
}

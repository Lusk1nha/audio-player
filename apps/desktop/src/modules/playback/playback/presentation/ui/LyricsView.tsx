import { useEffect, useRef, useMemo } from "react"
import { usePlayerStore } from "@/modules/playback/application/usePlayerStore"
import { motion, AnimatePresence } from "motion/react"
import { cn } from "@audio-player/ui/lib/utils"
import {
  CpuIcon,
  XIcon,
  TerminalWindowIcon,
  TextAaIcon,
  SpeakerHighIcon,
  PlayCircleIcon,
  ArrowsClockwiseIcon,
} from "@phosphor-icons/react"

export function LyricsView() {
  const {
    currentTrack,
    currentTime,
    isLyricsOpen,
    transcripts,
    isTranscribing,
    seekTo,
    setLyricsOpen, // Assumindo que você tem essa ação no store para fechar o painel
    retranscribeAudio
  } = usePlayerStore()

  // Guardamos as referências de cada linha da letra para o scroll nativo do React
  const lineRefs = useRef<(HTMLParagraphElement | null)[]>([])

  const currentTranscript = currentTrack
    ? transcripts[currentTrack.id] || []
    : []

  // 1. OTIMIZAÇÃO: Calculamos o índice ativo de forma memoizada.
  const activeIndex = useMemo(() => {
    if (currentTranscript.length === 0) return -1

    return currentTranscript.findIndex((line, index) => {
      const nextLine = currentTranscript[index + 1]
      return (
        currentTime >= line.startTime &&
        (!nextLine || currentTime < nextLine.startTime)
      )
    })
  }, [currentTime, currentTranscript])

  // 2. OTIMIZAÇÃO: O Scroll só acontece quando o índice ativo MUDA, e não a cada milissegundo de reprodução.
  useEffect(() => {
    if (activeIndex !== -1 && lineRefs.current[activeIndex]) {
      lineRefs.current[activeIndex]?.scrollIntoView({
        behavior: "smooth",
        block: "center",
      })
    }
  }, [activeIndex])

  if (!isLyricsOpen) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 40, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 40, scale: 0.98 }}
        transition={{ type: "spring", stiffness: 300, damping: 25 }}
        className="absolute inset-0 z-50 flex flex-col bg-background/95 font-mono backdrop-blur-xl"
      >
        {/* --- HEADER SUPERIOR --- */}
        <div className="flex h-16 shrink-0 items-center justify-between border-b border-border/30 px-8">
          <div className="flex items-center gap-3 text-primary">
            <TextAaIcon size={24} weight="duotone" />
            <span className="text-sm font-bold tracking-widest uppercase">
              // Transcrição_Ativa
            </span>
          </div>

          <div className="flex items-center gap-2">
            {/* Botão de Transcrever Novamente */}
            {!isTranscribing && currentTranscript.length > 0 && (
              <button
                onClick={() => retranscribeAudio?.()}
                className="flex items-center gap-2 rounded-md px-3 py-2 text-xs font-bold tracking-tighter text-muted-foreground uppercase transition-colors hover:bg-primary/10 hover:text-primary"
                title="Gerar transcrição novamente com IA"
              >
                <ArrowsClockwiseIcon
                  size={18}
                  weight="bold"
                  className={isTranscribing ? "animate-spin" : ""}
                />
                <span className="hidden sm:inline">Regerar_IA</span>
              </button>
            )}

            <button
              onClick={() => setLyricsOpen?.(false)}
              className="rounded-md p-2 text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
            >
              <XIcon size={24} />
            </button>
          </div>
        </div>

        {/* --- ÁREA PRINCIPAL --- */}
        <div className="relative flex-1 overflow-hidden">
          {isTranscribing ? (
            /* TELA DE LOADING DA IA (Estilo Terminal/Engine) */
            <div className="flex h-full flex-col items-center justify-center gap-6 text-primary">
              <div className="relative flex h-24 w-24 items-center justify-center rounded-full border border-primary/30 bg-primary/5 shadow-[0_0_30px_rgba(var(--color-primary),0.2)]">
                <CpuIcon size={48} className="animate-pulse" weight="duotone" />
                {/* SVG de "Radar/Loading" circulando */}
                <svg className="absolute inset-0 h-full w-full animate-[spin_3s_linear_infinite] text-primary/50">
                  <circle
                    cx="48"
                    cy="48"
                    r="46"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1"
                    strokeDasharray="60 40"
                  />
                </svg>
              </div>

              <div className="flex flex-col items-center text-center">
                <p className="animate-pulse text-lg font-bold tracking-widest uppercase">
                  Whisper_Engine_Ativo
                </p>
                <div className="mt-4 flex max-w-sm flex-col gap-1 text-xs text-muted-foreground">
                  <span className="flex items-center justify-center gap-2">
                    <TerminalWindowIcon size={14} /> [sys] Inicializando
                    tensores...
                  </span>
                  <span className="flex items-center justify-center gap-2">
                    <TerminalWindowIcon size={14} /> [sys] Decodificando blocos
                    de áudio...
                  </span>
                </div>
              </div>
            </div>
          ) : (
            /* TELA DA LETRA SINCRONIZADA */
            <div className="custom-scrollbar mx-auto h-full w-full max-w-3xl overflow-y-auto px-4 py-[30vh]">
              {currentTranscript?.length === 0 ? (
                <div className="flex flex-col items-center justify-center gap-4 text-muted-foreground/50">
                  <TextAaIcon size={48} weight="thin" />
                  <p className="text-center text-sm tracking-widest uppercase">
                    Nenhum buffer de texto detectado.
                  </p>
                </div>
              ) : (
                <div className="flex flex-col gap-6">
                  {currentTranscript.map((line, index) => {
                    const isActive = index === activeIndex
                    const isPast = index < activeIndex

                    return (
                      <div
                        key={index}
                        // O Ref vai no container pai agora
                        ref={(el) => {
                          lineRefs.current[index] = el
                        }}
                        // Ação de pular para o tempo da letra
                        onClick={() => seekTo?.(line.startTime)}
                        className={cn(
                          "group flex cursor-pointer items-center gap-4 transition-all duration-500 ease-out select-none",
                          // Se for a linha ativa, aumenta o tamanho. Se não, permite a interação no hover.
                          isActive
                            ? "origin-left scale-[1.02] opacity-100 blur-none"
                            : isPast
                              ? "opacity-50 blur-[0.5px] hover:opacity-100 hover:blur-none"
                              : "opacity-30 blur-[1px] hover:opacity-100 hover:blur-none"
                        )}
                      >
                        {/* Indicador de Status / Play (A mágica do Hover acontece aqui) */}
                        <div
                          className={cn(
                            "flex shrink-0 items-center justify-center transition-all duration-300",
                            isActive
                              ? "text-primary opacity-100" // Ícone de tocando
                              : "-translate-x-4 text-muted-foreground opacity-0 group-hover:translate-x-0 group-hover:opacity-100" // Ícone de Play aparece no hover
                          )}
                        >
                          {isActive ? (
                            <SpeakerHighIcon
                              size={28}
                              weight="duotone"
                              className="animate-pulse"
                            />
                          ) : (
                            <PlayCircleIcon
                              size={28}
                              weight="fill"
                              className="transition-colors hover:text-primary"
                            />
                          )}
                        </div>

                        {/* Texto da Letra */}
                        <p
                          className={cn(
                            "text-2xl font-bold transition-all duration-300 md:text-3xl lg:text-4xl",
                            isActive
                              ? "text-primary drop-shadow-[0_0_10px_rgba(var(--color-primary),0.4)]"
                              : "text-foreground"
                          )}
                        >
                          {line.text}
                        </p>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Gradiente inferior para esconder o corte seco do texto rolando */}
        <div className="pointer-events-none absolute bottom-0 left-0 h-32 w-full bg-linear-to-t from-background/95 to-transparent" />
      </motion.div>
    </AnimatePresence>
  )
}

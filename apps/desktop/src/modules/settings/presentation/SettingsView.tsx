import { useEffect, useState } from "react"
import { useSettingsCases } from "../application/useSettingsCases"
import { useIntelligenceCases } from "../../intelligence/application/useIntelligenceCases"
import type { SystemSettings } from "../domain/SystemSettings"
import { useTheme } from "@/core/providers/theme-provider"
import {
  GearSixIcon,
  MonitorIcon,
  MoonIcon,
  SunIcon,
  FloppyDiskIcon,
  ToggleLeftIcon,
  ToggleRightIcon,
  WarningCircleIcon,
  CpuIcon,
  DownloadSimpleIcon,
  CheckCircleIcon,
} from "@phosphor-icons/react"
import { Button } from "@audio-player/ui/components/button"
import { cn } from "@audio-player/ui/lib/utils"

export function SettingsView() {
  const { settings, isFetchingSettings, updateSettings, isSaving } =
    useSettingsCases()

  // --- NOVO: Hook da camada de aplicação de Inteligência ---
  const {
    isEngineInstalled,
    isChecking: isCheckingAI,
    isDownloading: isDownloadingAI,
    downloadProgress: aiProgress,
    startDownload: startAiDownload,
  } = useIntelligenceCases()

  const { setTheme } = useTheme()

  const [localSettings, setLocalSettings] = useState<SystemSettings | null>(
    null
  )

  useEffect(() => {
    if (settings) {
      setLocalSettings(settings)
    }
  }, [settings])

  const hasChanges = JSON.stringify(localSettings) !== JSON.stringify(settings)

  const handleSave = async () => {
    if (!localSettings || !hasChanges) return
    await updateSettings(localSettings)
  }

  const handleThemeChange = (theme: SystemSettings["theme"]) => {
    if (!localSettings) return
    const updated = { ...localSettings, theme }
    setLocalSettings(updated)
    setTheme(theme) // Atualiza visualmente na hora
  }

  if (isFetchingSettings || !localSettings) {
    return (
      <div className="flex h-full items-center justify-center font-mono text-muted-foreground">
        <span className="animate-pulse">Lendo config.toml...</span>
      </div>
    )
  }

  return (
    <div className="container mx-auto w-full max-w-4xl animate-in p-4 font-mono duration-500 fade-in md:p-8">
      {/* --- CABEÇALHO --- */}
      <header className="mb-8 flex flex-col gap-6 border-b border-border/50 pb-6 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="mb-2 flex items-center gap-2 text-primary">
            <GearSixIcon size={20} weight="duotone" />
            <span className="text-xs font-semibold tracking-wider uppercase">
              ~/audio_manager/config.toml
              {hasChanges && (
                <span className="ml-1 animate-pulse text-amber-500">*</span>
              )}
            </span>
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            Configurações
          </h1>
          <p className="mt-2 hidden text-sm text-muted-foreground sm:block">
            Ajuste as preferências de interface e comportamento do sistema.
          </p>
        </div>

        <Button
          onClick={handleSave}
          disabled={!hasChanges || isSaving}
          className={cn(
            "gap-2 font-mono transition-all",
            hasChanges && !isSaving
              ? "bg-primary text-primary-foreground shadow-[0_0_15px_rgba(var(--color-primary),0.3)]"
              : ""
          )}
        >
          <FloppyDiskIcon size={18} weight={hasChanges ? "fill" : "regular"} />
          {isSaving
            ? "Escrevendo..."
            : hasChanges
              ? "Salvar Arquivo"
              : "Sem Alterações"}
        </Button>
      </header>

      <main>
        {/* --- EDITOR DE TEXTO FAKE --- */}
        <div className="overflow-hidden rounded-md border border-border bg-card shadow-sm">
          <div className="flex items-center gap-2 border-b border-border/50 bg-muted/20 px-4 py-1 text-xs text-muted-foreground">
            <span className="flex items-center gap-2 border-b-2 border-primary pt-2 pb-2 text-foreground">
              <GearSixIcon size={14} />
              config.toml{" "}
              {hasChanges && (
                <span className="text-lg leading-none text-amber-500">*</span>
              )}
            </span>
          </div>

          <div className="p-4 sm:p-8">
            {hasChanges && (
              <div className="mb-8 flex items-center gap-3 rounded-md border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-600 dark:text-amber-400">
                <WarningCircleIcon size={18} weight="duotone" />
                <p>
                  Você tem modificações não salvas no buffer. Lembre-se de
                  salvar o arquivo.
                </p>
              </div>
            )}

            <div className="mb-10 hidden text-sm text-muted-foreground/70 sm:block">
              <span className="text-primary/70">#</span> Arquivo de configuração
              de usuário gerado automaticamente
              <br />
              <span className="text-primary/70">#</span> Modifique os valores
              abaixo para alterar o comportamento do app.
            </div>

            {/* SEÇÃO: [appearance] */}
            <section className="mb-12">
              <h2 className="mb-6 text-lg font-bold text-primary">
                <span className="mr-1 text-muted-foreground/50">[</span>
                appearance
                <span className="ml-1 text-muted-foreground/50">]</span>
              </h2>

              <div className="flex flex-col gap-6 border-l-2 border-border/50 pl-4 sm:pl-6">
                {/* Setting: theme */}
                <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1fr_auto] lg:items-center">
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-2 text-sm">
                      <span className="font-semibold text-foreground">
                        theme
                      </span>
                      <span className="text-primary">=</span>
                      <span className="text-emerald-600 dark:text-emerald-400">
                        "{localSettings.theme}"
                      </span>
                    </div>
                    <span className="text-xs text-muted-foreground/70">
                      # Controle o modo de cor da interface
                    </span>
                  </div>

                  <div className="inline-flex w-fit rounded-md border border-border/50 bg-muted/20 p-1">
                    {[
                      { id: "light", label: '"light"', icon: SunIcon },
                      { id: "dark", label: '"dark"', icon: MoonIcon },
                      { id: "system", label: '"system"', icon: MonitorIcon },
                    ].map((opt) => {
                      const Icon = opt.icon
                      const isActive = localSettings.theme === opt.id
                      return (
                        <button
                          key={opt.id}
                          onClick={() =>
                            handleThemeChange(opt.id as SystemSettings["theme"])
                          }
                          className={cn(
                            "flex items-center gap-2 rounded px-3 py-1.5 text-xs font-medium transition-all duration-200",
                            isActive
                              ? "bg-background text-primary shadow-sm ring-1 ring-border"
                              : "text-muted-foreground hover:text-foreground"
                          )}
                        >
                          <Icon
                            size={14}
                            weight={isActive ? "fill" : "regular"}
                          />
                          <span className="hidden sm:inline">{opt.label}</span>
                        </button>
                      )
                    })}
                  </div>
                </div>
              </div>
            </section>

            {/* SEÇÃO: [playback] */}
            <section className="mb-12">
              <h2 className="mb-6 text-lg font-bold text-primary">
                <span className="mr-1 text-muted-foreground/50">[</span>
                playback
                <span className="ml-1 text-muted-foreground/50">]</span>
              </h2>

              <div className="flex flex-col gap-10 border-l-2 border-border/50 pl-4 sm:pl-6">
                {/* Setting: hardware_acceleration */}
                <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1fr_auto] lg:items-center">
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-2 text-sm">
                      <span className="font-semibold text-foreground">
                        hardware_acceleration
                      </span>
                      <span className="text-primary">=</span>
                      <span className="font-bold text-purple-600 dark:text-purple-400">
                        {localSettings.hardwareAcceleration ? "true" : "false"}
                      </span>
                    </div>
                    <span className="text-xs text-muted-foreground/70">
                      # Delega a decodificação de áudio para a GPU, economizando
                      CPU.
                    </span>
                  </div>

                  <button
                    onClick={() =>
                      setLocalSettings({
                        ...localSettings,
                        hardwareAcceleration:
                          !localSettings.hardwareAcceleration,
                      })
                    }
                    className="group flex w-fit items-center gap-2 transition-all hover:opacity-80 focus:outline-none"
                  >
                    {localSettings.hardwareAcceleration ? (
                      <ToggleRightIcon
                        size={32}
                        weight="fill"
                        className="text-purple-600 dark:text-purple-400"
                      />
                    ) : (
                      <ToggleLeftIcon
                        size={32}
                        weight="duotone"
                        className="text-muted-foreground"
                      />
                    )}
                  </button>
                </div>

                {/* Setting: crossfade_duration */}
                <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1fr_200px] lg:items-center">
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-2 text-sm">
                      <span className="font-semibold text-foreground">
                        crossfade_duration_sec
                      </span>
                      <span className="text-primary">=</span>
                      <span className="font-bold text-blue-600 dark:text-blue-400">
                        {localSettings.crossfadeDurationSec}
                      </span>
                    </div>
                    <span className="text-xs text-muted-foreground/70">
                      # Tempo em segundos de sobreposição suave entre faixas.
                    </span>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="text-[10px] text-muted-foreground uppercase">
                      0s
                    </span>
                    <div className="relative flex h-2 w-full flex-1 items-center rounded-sm border border-border/50 bg-muted/40">
                      <input
                        type="range"
                        min={0}
                        max={10}
                        step={1}
                        value={localSettings.crossfadeDurationSec}
                        onChange={(e) =>
                          setLocalSettings({
                            ...localSettings,
                            crossfadeDurationSec: Number(e.target.value),
                          })
                        }
                        className="absolute inset-0 z-10 w-full cursor-pointer opacity-0"
                      />
                      <div
                        className="absolute top-0 bottom-0 left-0 bg-blue-600 transition-all duration-200 dark:bg-blue-400"
                        style={{
                          width: `${(localSettings.crossfadeDurationSec / 10) * 100}%`,
                        }}
                      />
                    </div>
                    <span className="text-[10px] text-muted-foreground uppercase">
                      10s
                    </span>
                  </div>
                </div>
              </div>
            </section>

            {/* SEÇÃO: [intelligence] */}
            <section className="mb-8">
              <h2 className="mb-6 text-lg font-bold text-primary">
                <span className="mr-1 text-muted-foreground/50">[</span>
                intelligence
                <span className="ml-1 text-muted-foreground/50">]</span>
              </h2>

              <div className="flex flex-col gap-10 border-l-2 border-border/50 pl-4 sm:pl-6">
                {/* Setting: local_ai_engine */}
                <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1fr_auto] lg:items-center">
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-2 text-sm">
                      <span className="font-semibold text-foreground">
                        local_ai_engine
                      </span>
                      <span className="text-primary">=</span>
                      {isCheckingAI ? (
                        <span className="animate-pulse text-muted-foreground">
                          "checking_disk..."
                        </span>
                      ) : isEngineInstalled ? (
                        <span className="font-bold text-emerald-600 dark:text-emerald-400">
                          "installed"
                        </span>
                      ) : (
                        <span className="font-bold text-amber-600 dark:text-amber-400">
                          "missing"
                        </span>
                      )}
                    </div>
                    <span className="text-xs text-muted-foreground/70">
                      # Motor Whisper offline para transcrição de áudio e
                      análise inteligente.
                    </span>
                  </div>

                  <div className="flex items-center justify-end">
                    {isCheckingAI ? (
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <CpuIcon size={18} className="animate-pulse" />
                        Lendo disco...
                      </div>
                    ) : isEngineInstalled ? (
                      <div className="flex items-center gap-2 rounded-md border border-emerald-500/30 bg-emerald-500/10 px-3 py-1.5 text-xs font-medium text-emerald-600 dark:text-emerald-400">
                        <CheckCircleIcon size={16} weight="fill" />
                        Pronto para uso
                      </div>
                    ) : (
                      <div className="flex flex-col items-end gap-2">
                        <Button
                          onClick={startAiDownload}
                          disabled={isDownloadingAI}
                          variant="outline"
                          size="sm"
                          className="gap-2 font-mono text-xs"
                        >
                          {isDownloadingAI ? (
                            <CpuIcon size={16} className="animate-spin" />
                          ) : (
                            <DownloadSimpleIcon size={16} />
                          )}
                          {isDownloadingAI
                            ? "Baixando Modelo..."
                            : "Baixar Engine"}
                        </Button>

                        {isDownloadingAI && (
                          <div className="flex w-36 flex-col gap-1">
                            <div className="flex justify-between text-[10px] text-muted-foreground">
                              <span>Progresso</span>
                              <span>{aiProgress.toFixed(1)}%</span>
                            </div>
                            <div className="h-1.5 w-full overflow-hidden rounded-full border border-border/50 bg-muted/50">
                              <div
                                className="h-full bg-primary transition-all duration-300"
                                style={{ width: `${aiProgress}%` }}
                              />
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </section>

            {/* Indicador de Fim de Arquivo */}
            <div className="mt-16 flex items-center gap-4 text-[10px] font-bold tracking-widest text-muted-foreground/30 uppercase before:h-px before:flex-1 before:bg-border/20 after:h-px after:flex-1 after:bg-border/20">
              EOF
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

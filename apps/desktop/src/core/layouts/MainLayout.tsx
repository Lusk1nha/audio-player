import { useState } from "react"
import { Outlet } from "react-router-dom"
import { PlayerBar } from "@/modules/playback/playback/presentation/PlayerBar"
import { ListIcon, XIcon, TerminalWindowIcon } from "@phosphor-icons/react"
import { QueuePanel } from "@/modules/playback/playback/presentation/ui/QueuePanel"
import { Sidebar } from "./components/Sidebar"
import { StatusBar } from "./components/StatusBar"

export function MainLayout() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)

  return (
    <div className="flex h-screen w-full flex-col overflow-hidden bg-background text-foreground selection:bg-primary/30">
      {/* Topbar Mobile */}
      <div className="flex h-14 shrink-0 items-center justify-between border-b border-border bg-sidebar px-4 md:hidden">
        <div className="flex items-center gap-2 font-mono font-bold text-primary">
          <TerminalWindowIcon size={24} weight="duotone" />
          <span>audio_mgr</span>
        </div>
        <button
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="p-2 text-muted-foreground transition-colors hover:text-foreground"
        >
          {isSidebarOpen ? <XIcon size={24} /> : <ListIcon size={24} />}
        </button>
      </div>

      <div className="relative flex flex-1 overflow-hidden">
        {/* Overlay Mobile */}
        {isSidebarOpen && (
          <div
            className="absolute inset-0 z-20 animate-in bg-black/40 backdrop-blur-[2px] duration-300 fade-in md:hidden"
            onClick={() => setIsSidebarOpen(false)}
          />
        )}

        <Sidebar
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
        />

        {/* Área de Conteúdo Central */}
        <main className="custom-scrollbar relative flex-1 overflow-y-auto bg-background/40">
          <Outlet />
        </main>

        {/* Fila de Reprodução (Painel Direito) */}
        <div className="hidden h-full shrink-0 shadow-2xl xl:block">
          <QueuePanel />
        </div>
      </div>

      {/* Rodapé (Player + Status) */}
      <footer className="relative z-10 shrink-0 border-t border-border bg-card shadow-[0_-10px_30px_rgba(0,0,0,0.1)]">
        <PlayerBar />
        <StatusBar />
      </footer>
    </div>
  )
}

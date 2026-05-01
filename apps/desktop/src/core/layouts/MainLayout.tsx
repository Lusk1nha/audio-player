import { useState } from "react"
import { Outlet, NavLink } from "react-router-dom"
import { PlayerBar } from "@/modules/playback/playback/presentation/PlayerBar"
import {
  FolderOpenIcon,
  PlaylistIcon,
  GearIcon,
  ListIcon,
  XIcon,
  TerminalWindowIcon,
} from "@phosphor-icons/react"

// Navegação com fonte Mono para dar a estética DEV
function NavItem({
  to,
  icon,
  label,
  onClick,
}: {
  to: string
  icon: React.ReactNode
  label: string
  onClick?: () => void
}) {
  return (
    <NavLink
      to={to}
      onClick={onClick}
      className={({ isActive }) =>
        `flex items-center gap-3 rounded-md px-3 py-2 font-mono text-sm transition-all duration-200 ${
          isActive
            ? "border-l-2 border-primary bg-primary/10 text-primary"
            : "border-l-2 border-transparent text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
        }`
      }
    >
      {icon}
      {label}
    </NavLink>
  )
}

export function MainLayout() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen)

  return (
    <div className="flex h-screen w-full flex-col overflow-hidden bg-background text-foreground selection:bg-primary/30">
      {/* Topbar para Mobile (Só aparece em telas pequenas) */}
      <div className="flex h-14 items-center justify-between border-b border-border bg-sidebar px-4 md:hidden">
        <div className="flex items-center gap-2 font-mono font-bold text-primary">
          <TerminalWindowIcon size={24} weight="duotone" />
          <span>audio_mgr</span>
        </div>
        <button
          onClick={toggleSidebar}
          className="p-2 text-muted-foreground hover:text-foreground"
        >
          {isSidebarOpen ? <XIcon size={24} /> : <ListIcon size={24} />}
        </button>
      </div>

      <div className="relative flex flex-1 overflow-hidden">
        {/* Overlay escuro para mobile quando a sidebar está aberta */}
        {isSidebarOpen && (
          <div
            className="absolute inset-0 z-20 bg-black/50 backdrop-blur-sm md:hidden"
            onClick={toggleSidebar}
          />
        )}

        {/* Sidebar (Painel Esquerdo - Estilo IDE) */}
        <aside
          className={`absolute inset-y-0 left-0 z-30 flex w-64 flex-col border-r border-sidebar-border bg-sidebar transition-transform duration-300 ease-in-out md:static md:translate-x-0 ${
            isSidebarOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          {/* Logo / Header Desktop */}
          <div className="hidden h-14 items-center border-b border-border/50 px-6 md:flex">
            <div className="flex items-center gap-2 font-mono text-sm font-bold tracking-tight text-primary">
              <TerminalWindowIcon size={20} weight="duotone" />
              <span>~/audio_manager</span>
            </div>
          </div>

          <nav className="flex-1 space-y-1 p-3">
            <div className="px-3 pt-4 pb-2 font-mono text-xs font-semibold tracking-wider text-muted-foreground uppercase">
              Explorer
            </div>
            <NavItem
              to="/"
              label="biblioteca.rs"
              icon={<FolderOpenIcon size={18} weight="duotone" />}
              onClick={() => setIsSidebarOpen(false)}
            />
            <NavItem
              to="/playlists"
              label="playlists.json"
              icon={<PlaylistIcon size={18} weight="duotone" />}
              onClick={() => setIsSidebarOpen(false)}
            />

            <div className="px-3 pt-6 pb-2 font-mono text-xs font-semibold tracking-wider text-muted-foreground uppercase">
              System
            </div>
            <NavItem
              to="/settings"
              label="config.toml"
              icon={<GearIcon size={18} weight="duotone" />}
              onClick={() => setIsSidebarOpen(false)}
            />
          </nav>
        </aside>

        {/* Área Principal (Editor View) */}
        <main className="relative flex-1 overflow-y-auto bg-background/40">
          <Outlet />
        </main>
      </div>

      {/* Terminal / Output View (PlayerBar) */}
      <footer className="relative z-10 shrink-0 border-t border-border bg-card shadow-2xl">
        <PlayerBar />
      </footer>
    </div>
  )
}

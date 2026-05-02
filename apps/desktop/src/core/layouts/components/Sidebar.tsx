import { NavLink } from "react-router-dom"
import {
  FolderOpenIcon,
  PlaylistIcon,
  GearIcon,
  TerminalWindowIcon,
  GithubLogoIcon,
} from "@phosphor-icons/react"
import { cn } from "@audio-player/ui/lib/utils"

interface NavItemProps {
  to: string
  icon: React.ReactNode
  label: string
  onClick?: () => void
}

function NavItem({ to, icon, label, onClick }: NavItemProps) {
  return (
    <NavLink
      to={to}
      onClick={onClick}
      className={({ isActive }) =>
        cn(
          "flex items-center gap-3 rounded-md border-l-2 px-3 py-2 font-mono text-sm transition-all duration-200",
          isActive
            ? "border-primary bg-primary/10 text-primary shadow-[inset_0_0_10px_rgba(var(--color-primary),0.05)]"
            : "border-transparent text-sidebar-foreground/60 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
        )
      }
    >
      {icon}
      <span className="truncate">{label}</span>
    </NavLink>
  )
}

interface SidebarProps {
  isOpen: boolean
  onClose: () => void
}

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  return (
    <aside
      className={cn(
        "absolute inset-y-0 left-0 z-30 flex w-64 flex-col border-r border-sidebar-border bg-sidebar transition-transform duration-300 ease-in-out md:static md:translate-x-0",
        isOpen ? "translate-x-0" : "-translate-x-full"
      )}
    >
      {/* Header Desktop */}
      <div className="hidden h-14 items-center border-b border-border/50 px-6 md:flex">
        <div className="flex items-center gap-2 font-mono text-sm font-bold tracking-tight text-primary">
          <TerminalWindowIcon size={20} weight="duotone" />
          <span>~/audio_manager</span>
        </div>
      </div>

      <nav className="custom-scrollbar flex-1 space-y-1 overflow-y-auto p-3">
        <div className="px-3 pt-4 pb-2 font-mono text-[10px] font-bold tracking-[0.2em] text-muted-foreground/50 uppercase">
          Explorer
        </div>
        <NavItem
          to="/"
          label="biblioteca.rs"
          icon={<FolderOpenIcon size={18} weight="duotone" />}
          onClick={onClose}
        />
        <NavItem
          to="/playlists"
          label="playlists.json"
          icon={<PlaylistIcon size={18} weight="duotone" />}
          onClick={onClose}
        />

        <div className="px-3 pt-6 pb-2 font-mono text-[10px] font-bold tracking-[0.2em] text-muted-foreground/50 uppercase">
          System
        </div>
        <NavItem
          to="/settings"
          label="config.toml"
          icon={<GearIcon size={18} weight="duotone" />}
          onClick={onClose}
        />
      </nav>

      {/* Créditos do Autor (Estilo VS Code Side Footer) */}
      <div className="border-t border-border/50 p-4">
        <a
          href="https://github.com/Lusk1nha"
          target="_blank"
          rel="noopener noreferrer"
          className="group flex items-center gap-3 rounded-md bg-muted/30 p-2 transition-all hover:bg-primary/10"
        >
          <div className="flex h-8 w-8 items-center justify-center rounded-full border border-border bg-background transition-colors group-hover:border-primary/30 group-hover:text-primary">
            <GithubLogoIcon size={18} weight="fill" />
          </div>
          <div className="flex flex-col overflow-hidden">
            <span className="text-[10px] tracking-tighter text-muted-foreground uppercase">
              Developed by
            </span>
            <span className="truncate font-mono text-xs font-bold text-foreground transition-colors group-hover:text-primary">
              Lucas Pedro
            </span>
          </div>
        </a>
      </div>
    </aside>
  )
}

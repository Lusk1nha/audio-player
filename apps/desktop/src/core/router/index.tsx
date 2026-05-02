import { createBrowserRouter } from "react-router-dom"
import { MainLayout } from "../layouts/MainLayout"
import { LibraryView } from "../../modules/library/presentation/LibraryView"

// Atualizamos o Placeholder para respeitar o tema global (bg-background, text-muted-foreground)
import { WarningCircleIcon } from "@phosphor-icons/react"
import { SettingsView } from "@/modules/settings/presentation/SettingsView"

export const PlaceholderView = ({
  title,
  route,
}: {
  title: string
  route: string
}) => (
  <div className="flex h-full w-full animate-in flex-col p-6 font-mono duration-500 fade-in">
    {/* "Aba" do arquivo */}
    <div className="mb-6 flex w-fit items-center gap-2 rounded-t-md border-b-2 border-primary bg-muted/50 px-4 py-2 text-sm text-foreground">
      <span className="text-muted-foreground">src/views/</span>
      {route}
    </div>

    {/* Conteúdo do Console */}
    <div className="flex flex-1 flex-col rounded-lg border border-border bg-card p-6 shadow-sm">
      <div className="mb-4 flex items-center gap-3 text-accent">
        <WarningCircleIcon size={24} weight="duotone" />
        <h1 className="text-lg font-bold">INFO: Módulo não implementado</h1>
      </div>

      <div className="space-y-2 text-sm text-muted-foreground">
        <p>
          <span className="text-primary">{">"}</span> Processo{" "}
          <span className="text-foreground">[{title}]</span> aguardando
          desenvolvimento...
        </p>
        <p>
          <span className="text-primary">{">"}</span> Status: Pendente.
        </p>
        <p className="animate-pulse pt-4 text-foreground">_</p>
      </div>
    </div>
  </div>
)

export const router = createBrowserRouter([
  {
    path: "/",
    element: <MainLayout />,
    children: [
      {
        index: true,
        element: <LibraryView />,
      },
      {
        path: "playlists",
        element: (
          <PlaceholderView title="Suas Playlists" route="playlists.json" />
        ),
      },
      {
        path: "settings",
        element: <SettingsView />,
      },
    ],
  },
])

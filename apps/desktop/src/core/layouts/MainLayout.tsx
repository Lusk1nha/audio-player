import { Outlet, Link } from "react-router-dom"
import { PlayerBar } from "@/modules/playback/playback/presentation/PlayerBar"

export function MainLayout() {
  return (
    // Um container que ocupa a tela toda (h-screen)
    <div className="flex h-screen flex-col overflow-hidden bg-gray-950 font-sans text-white">
      {/* Parte superior: Sidebar + Conteúdo dinâmico */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar de Navegação */}
        <nav className="flex w-64 flex-col gap-2 border-r border-gray-800 bg-gray-900 p-4">
          <div className="mb-6 px-2 text-xl font-bold text-indigo-400">
            Audio Manager
          </div>

          <Link
            to="/"
            className="rounded p-2 transition-colors hover:bg-gray-800"
          >
            Biblioteca
          </Link>
          <Link
            to="/playlists"
            className="rounded p-2 transition-colors hover:bg-gray-800"
          >
            Playlists
          </Link>
          <Link
            to="/settings"
            className="rounded p-2 transition-colors hover:bg-gray-800"
          >
            Configurações
          </Link>
        </nav>

        {/* Área Principal (Onde as telas vão renderizar) */}
        <main className="flex-1 overflow-y-auto p-6">
          <Outlet /> {/* Aqui o React Router injeta a tela atual */}
        </main>
      </div>

      {/* Parte Inferior: O Módulo de Playback Fixo */}
      <div className="h-20 shrink-0 border-t border-gray-800 bg-gray-900">
        <PlayerBar />
      </div>
    </div>
  )
}

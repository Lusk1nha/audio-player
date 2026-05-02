import { QueryClientProvider } from "@tanstack/react-query"
import { RouterProvider } from "react-router-dom"
import { router } from "./core/router"
import { queryClient } from "./shared/lib/QueryClient"
import { ThemeProvider } from "./core/providers/theme-provider"
import { useEffect } from "react"
import { usePlayerStore } from "./modules/playback/application/usePlayerStore"

export function App() {
  const initPlayer = usePlayerStore((state) => state.init)

  useEffect(() => {
    initPlayer()
  }, [initPlayer])

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider storageKey="audio-player-theme" defaultTheme="system">
        <RouterProvider router={router} />
      </ThemeProvider>
    </QueryClientProvider>
  )
}

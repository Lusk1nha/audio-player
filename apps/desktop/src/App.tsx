import { QueryClientProvider } from "@tanstack/react-query"
import { RouterProvider } from "react-router-dom"
import { router } from "./core/router"
import { queryClient } from "./shared/lib/QueryClient"
import { ThemeProvider } from "./core/providers/theme-provider"

export function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider storageKey="audio-player-theme" defaultTheme="system">
        <RouterProvider router={router} />
      </ThemeProvider>
    </QueryClientProvider>
  )
}

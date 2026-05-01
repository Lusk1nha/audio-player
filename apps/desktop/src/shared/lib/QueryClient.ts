import { toast } from "sonner"
import { QueryClient, QueryCache, MutationCache } from "@tanstack/react-query"

export const queryClient = new QueryClient({
  // 1. Tratamento Global de Erros para Queries (Leituras)
  queryCache: new QueryCache({
    onError: (error, query) => {
      if (query.meta?.silenceError) return

      console.error(`[Query Error] ${query.queryKey.join(" -> ")}:`, error)
      toast.error("Erro ao carregar dados", {
        description:
          error instanceof Error
            ? error.message
            : "Falha na comunicação com o sistema.",
      })
    },
  }),

  // 2. Tratamento Global de Erros para Mutations (Ações/Escritas)
  mutationCache: new MutationCache({
    onError: (error, _variables, _context, mutation) => {
      if (mutation.meta?.silenceError) return

      console.error("[Mutation Error]:", error)
      toast.error("Falha na operação", {
        description:
          error instanceof Error
            ? error.message
            : "Não foi possível concluir a ação.",
      })
    },
  }),

  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,

      refetchOnReconnect: false,

      staleTime: 1000 * 60 * 5,

      retry: 1,
    },
    mutations: {
      retry: 0,
    },
  },
})

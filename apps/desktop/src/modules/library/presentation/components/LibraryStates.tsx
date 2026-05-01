import { FileAudioIcon } from "@phosphor-icons/react"
import { motion } from "motion/react"

export function LibraryLoading() {
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {[1, 2, 3, 4].map((i) => (
        <div
          key={i}
          className="h-28 animate-pulse rounded-md border border-border bg-muted/20"
        />
      ))}
    </div>
  )
}

export function LibraryEmpty() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center justify-center rounded-md border border-dashed border-border bg-card/30 px-6 py-16 text-center font-mono shadow-sm"
    >
      <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-lg border border-border bg-muted/50">
        <FileAudioIcon
          size={28}
          className="text-muted-foreground"
          weight="duotone"
        />
      </div>
      <h3 className="mb-2 text-lg font-semibold text-foreground">
        Diretório Vazio
      </h3>
      <div className="space-y-1 text-sm text-muted-foreground">
        <p>
          <span className="text-primary">{">"}</span> Nenhum asset de áudio
          mapeado.
        </p>
        <p>
          <span className="text-primary">{">"}</span> Execute a ação "Adicionar
          Diretório" para iniciar.
        </p>
        <p className="animate-pulse pt-2 text-primary">_</p>
      </div>
    </motion.div>
  )
}

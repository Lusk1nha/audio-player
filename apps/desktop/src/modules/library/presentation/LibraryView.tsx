import { toast } from "sonner"
import { motion, AnimatePresence, Variants } from "motion/react"

import { usePlayerStore } from "@/modules/playback/application/usePlayerStore"
import { useLibraryCases } from "../application/useLibraryCases"
import { AudioCommands } from "@audio-player/bridge"

import { LibraryHeader } from "./components/LibraryHeader"
import { LibraryLoading, LibraryEmpty } from "./components/LibraryStates"
import { AssetCard } from "./components/AssetCard"

const gridVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.05 },
  },
}

export function LibraryView() {
  const { assets, isFetchingAssets, isScanning, scanFolder } = useLibraryCases()
  const { play, currentTrack, isPlaying } = usePlayerStore()

  const handleSelectAndScan = async () => {
    try {
      const selectedPath = await AudioCommands.selectFolder()

      if (selectedPath) {
        toast.info("Lendo arquivos da pasta...")
        await scanFolder(selectedPath)
        toast.success("Biblioteca atualizada com sucesso!")
      }
    } catch (error) {
      console.error(error)
      toast.error("Erro ao selecionar a pasta ou processar o áudio.")
    }
  }

  return (
    <div className="relative container mx-auto w-full max-w-7xl animate-in p-4 duration-500 fade-in md:p-8">
      <LibraryHeader
        isScanning={isScanning}
        assetCount={assets.length}
        onScanClick={handleSelectAndScan}
      />

      <main>
        <AnimatePresence mode="wait">
          {/* 1. Loading */}
          {isFetchingAssets && (
            <motion.div key="loading" exit={{ opacity: 0 }}>
              <LibraryLoading />
            </motion.div>
          )}

          {/* 2. Empty State */}
          {!isFetchingAssets && assets.length === 0 && (
            <motion.div key="empty" exit={{ opacity: 0 }}>
              <LibraryEmpty />
            </motion.div>
          )}

          {/* 3. Grid de Assets */}
          {!isFetchingAssets && assets.length > 0 && (
            <motion.div
              key="grid"
              variants={gridVariants}
              initial="hidden"
              animate="visible"
              className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
            >
              {assets.map((asset) => (
                <AssetCard
                  key={asset.id}
                  asset={asset}
                  isActive={currentTrack?.id === asset.id}
                  isPlaying={isPlaying}
                  onClick={() => play(asset)}
                />
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  )
}

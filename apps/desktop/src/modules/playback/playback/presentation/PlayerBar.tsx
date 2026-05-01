import { motion } from "motion/react"

import { TrackInfo } from "./components/TrackInfo"
import { PlaybackControls } from "./components/PlaybackControls"
import { VolumeControl } from "./components/VolumeControl"

export function PlayerBar() {
  return (
    <motion.div
      initial={{ y: 50, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ type: "spring", stiffness: 260, damping: 20 }}
      className="relative flex h-full w-full items-center justify-between overflow-hidden bg-card px-4 py-2 shadow-md sm:px-6"
    >
      <div className="absolute top-0 right-0 left-0 h-px bg-linear-to-r from-transparent via-primary/50 to-transparent" />

      <TrackInfo />
      <PlaybackControls />
      <VolumeControl />
    </motion.div>
  )
}

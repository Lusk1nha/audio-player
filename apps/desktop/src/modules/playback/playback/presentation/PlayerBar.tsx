import { Button } from "@audio-player/ui/components/button"
import { usePlayerStore } from "@/modules/playback/application/usePlayerStore"

export function PlayerBar() {
  const { currentTrackId, isPlaying, play } = usePlayerStore()

  const handlePlayClick = () => {
    play("uuid-da-musica-123")
  }

  return (
    <div className="flex items-center justify-between bg-gray-900 p-4 text-white">
      <div>
        <span>Tocando agora: {currentTrackId || "Nenhuma"}</span>
      </div>

      <div className="controls">
        <Button onClick={handlePlayClick}>
          {isPlaying ? "Pausar" : "Tocar"}
        </Button>
      </div>
    </div>
  )
}

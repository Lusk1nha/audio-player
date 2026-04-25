import { useLibraryCases } from "../application/useLibraryCases"
import { AudioCommands } from "@audio-player/bridge"

export function LibraryView() {
  const { assets, isFetchingAssets, isScanning, scanFolder } = useLibraryCases()

  const handleSelectAndScan = async () => {
    try {
      const selectedPath = await AudioCommands.selectFolder()

      if (selectedPath) {
        await scanFolder(selectedPath)
      }
    } catch (error) {
      alert("Erro ao selecionar a pasta ou processar o áudio.")
      console.error(error)
    }
  }

  return (
    <div className="p-6">
      <h1 className="mb-4 text-2xl font-bold">Gerenciador de Mídia</h1>

      {/* Controles (Ação) - Sem o input chato! */}
      <div className="mb-6">
        <button
          onClick={handleSelectAndScan}
          disabled={isScanning}
          className="rounded-md bg-indigo-600 px-6 py-2 font-medium text-white transition-colors hover:bg-indigo-700 disabled:opacity-50"
        >
          {isScanning ? "Lendo arquivos..." : "📁 Escolher Pasta"}
        </button>
      </div>

      {/* Exibição (Estado) */}
      <div>
        <h2 className="mb-3 text-xl font-semibold">
          Seus Ativos ({assets.length})
        </h2>

        {isFetchingAssets && (
          <p className="text-gray-400">Carregando biblioteca do banco...</p>
        )}

        {!isFetchingAssets && assets.length === 0 && (
          <div className="rounded-lg border border-dashed border-gray-700 p-8 text-center text-gray-500">
            Nenhum áudio encontrado. Clique acima para adicionar uma pasta.
          </div>
        )}

        <ul className="space-y-2">
          {assets.map((asset) => (
            <li
              key={asset.id}
              className="flex items-center justify-between rounded border border-gray-800 bg-gray-900/50 p-3 transition-colors hover:bg-gray-800"
            >
              <div>
                <p className="font-medium text-white">
                  {asset.metadata.title || "Sem título"}
                </p>
                <p className="mt-1 text-xs text-gray-500">{asset.path}</p>
              </div>
              <span className="rounded-full border border-gray-700 bg-gray-800 px-3 py-1 text-xs font-semibold text-gray-300">
                {asset.category}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}

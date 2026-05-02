import { CpuIcon, GitBranchIcon, CheckIcon } from "@phosphor-icons/react"

export function StatusBar() {
  return (
    <div className="flex h-6 w-full items-center justify-between border-t border-border/50 bg-primary px-3 font-mono text-[10px] text-primary-foreground select-none">
      <div className="flex items-center gap-4">
        <a
          href="https://github.com/Lusk1nha"
          target="_blank"
          className="flex h-full items-center gap-1.5 px-2 font-bold transition-colors hover:bg-black/10"
        >
          <GitBranchIcon size={12} weight="bold" />
          main*
        </a>
        <div className="flex items-center gap-1.5 opacity-80">
          <CheckIcon size={12} weight="bold" />
          Ready
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="flex items-center gap-1.5">
          <span className="italic opacity-70">built by</span>
          <span className="font-bold tracking-tight">lucas_pedro</span>
        </div>
        <div className="hidden h-full items-center gap-1.5 bg-black/10 px-2 sm:flex">
          <CpuIcon size={12} />
          <span>UTF-8</span>
        </div>
      </div>
    </div>
  )
}

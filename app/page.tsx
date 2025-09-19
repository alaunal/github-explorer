import { GitHubExplorer } from "@/components/github-explorer"

export default function Home() {
  return (
    <main className="min-h-screen bg-background">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <div className="max-w-6xl mx-auto">
          <header className="text-center mb-8 sm:mb-12">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground mb-3 sm:mb-4 text-balance">
              GitHub Explorer
            </h1>
            <p className="text-base sm:text-lg text-muted-foreground text-pretty max-w-2xl mx-auto">
              Search for GitHub users and explore their repositories
            </p>
          </header>
          <GitHubExplorer />
        </div>
      </div>
    </main>
  )
}

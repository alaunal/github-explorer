"use client"

import { useState, useMemo } from "react"
import { ExternalLink, Star, GitFork, Clock, Search, Lock, GitBranch, Grid, List } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import type { GitHubUser, GitHubRepository } from "@/types/github"
import { cn } from "@/lib/utils"

interface RepositoryListProps {
  user: GitHubUser
  repositories: GitHubRepository[]
  isLoading: boolean
}

const languageColors: Record<string, string> = {
  JavaScript: "#f1e05a",
  TypeScript: "#2b7489",
  Python: "#3572A5",
  Java: "#b07219",
  "C++": "#f34b7d",
  "C#": "#239120",
  PHP: "#4F5D95",
  Ruby: "#701516",
  Go: "#00ADD8",
  Rust: "#dea584",
  Swift: "#ffac45",
  Kotlin: "#F18E33",
  Dart: "#00B4AB",
  HTML: "#e34c26",
  CSS: "#1572B6",
  Shell: "#89e051",
  Vue: "#2c3e50",
  React: "#61dafb",
}

export function RepositoryList({ user, repositories, isLoading }: RepositoryListProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [sortBy, setSortBy] = useState<"updated" | "stars" | "name">("updated")
  const [filterLanguage, setFilterLanguage] = useState<string>("all")
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")

  const languages = useMemo(() => {
    const langs = new Set(repositories.map((repo) => repo.language).filter(Boolean))
    return Array.from(langs).sort()
  }, [repositories])

  const filteredAndSortedRepos = useMemo(() => {
    const filtered = repositories.filter((repo) => {
      const matchesSearch =
        repo.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (repo.description?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false)
      const matchesLanguage = filterLanguage === "all" || repo.language === filterLanguage
      return matchesSearch && matchesLanguage
    })

    return filtered.sort((a, b) => {
      switch (sortBy) {
        case "stars":
          return b.stargazers_count - a.stargazers_count
        case "name":
          return a.name.localeCompare(b.name)
        case "updated":
        default:
          return new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
      }
    })
  }, [repositories, searchQuery, sortBy, filterLanguage])

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24))

    if (diffInDays === 0) return "Today"
    if (diffInDays === 1) return "Yesterday"
    if (diffInDays < 30) return `${diffInDays} days ago`
    if (diffInDays < 365) return `${Math.floor(diffInDays / 30)} months ago`
    return `${Math.floor(diffInDays / 365)} years ago`
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        {/* User Profile Skeleton */}
        <Card className="bg-card border-border">
          <CardHeader>
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
              <div className="animate-pulse bg-muted rounded-full h-16 w-16" />
              <div className="space-y-2 flex-1">
                <div className="animate-pulse bg-muted h-6 w-48 rounded" />
                <div className="animate-pulse bg-muted h-4 w-32 rounded" />
                <div className="animate-pulse bg-muted h-4 w-64 rounded" />
              </div>
              <div className="animate-pulse bg-muted h-10 w-24 rounded" />
            </div>
          </CardHeader>
        </Card>

        {/* Filters Skeleton */}
        <Card className="bg-card border-border">
          <CardContent className="pt-6">
            <div className="flex flex-col gap-4">
              <div className="animate-pulse bg-muted h-10 w-full rounded" />
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="animate-pulse bg-muted h-10 w-full sm:w-48 rounded" />
                <div className="animate-pulse bg-muted h-10 w-full sm:w-48 rounded" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Repository Cards Skeleton */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="bg-card border-border">
              <CardHeader className="pb-3">
                <div className="animate-pulse bg-muted h-6 w-3/4 rounded" />
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="animate-pulse space-y-2">
                  <div className="bg-muted rounded h-4 w-full" />
                  <div className="bg-muted rounded h-4 w-2/3" />
                </div>
                <div className="flex items-center gap-4">
                  <div className="animate-pulse bg-muted rounded-full h-3 w-3" />
                  <div className="animate-pulse bg-muted rounded h-3 w-16" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* User Profile Header */}
      <Card className="bg-card border-border">
        <CardHeader>
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <Avatar className="h-16 w-16 sm:h-20 sm:w-20">
              <AvatarImage src={user.avatar_url || "/placeholder.svg"} alt={user.login} />
              <AvatarFallback>{user.login[0].toUpperCase()}</AvatarFallback>
            </Avatar>

            <div className="flex-1 space-y-2 min-w-0">
              <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                <h2 className="text-xl sm:text-2xl font-bold text-foreground truncate">{user.name || user.login}</h2>
                {user.name && <span className="text-muted-foreground text-sm sm:text-base">@{user.login}</span>}
              </div>

              {user.bio && <p className="text-muted-foreground text-pretty text-sm sm:text-base">{user.bio}</p>}

              <div className="flex flex-wrap items-center gap-3 sm:gap-4 text-xs sm:text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <GitBranch className="h-3 w-3 sm:h-4 sm:w-4" />
                  <span>{user.public_repos} repositories</span>
                </div>
                <div className="flex items-center gap-1">
                  <span>{user.followers} followers</span>
                </div>
                <div className="flex items-center gap-1">
                  <span>{user.following} following</span>
                </div>
              </div>
            </div>

            <Button variant="outline" asChild className="w-full sm:w-auto bg-transparent">
              <a href={user.html_url} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="h-4 w-4 mr-2" />
                <span className="hidden sm:inline">View Profile</span>
                <span className="sm:hidden">Profile</span>
              </a>
            </Button>
          </div>
        </CardHeader>
      </Card>

      {/* Filters and Search */}
      <Card className="bg-card border-border">
        <CardContent className="pt-6">
          <div className="space-y-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Search repositories..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-background border-border"
              />
            </div>

            {/* Filters and View Toggle */}
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex flex-col sm:flex-row gap-4 flex-1">
                <Select value={sortBy} onValueChange={(value: any) => setSortBy(value)}>
                  <SelectTrigger className="w-full sm:w-48 bg-background border-border">
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="updated">Recently updated</SelectItem>
                    <SelectItem value="stars">Most stars</SelectItem>
                    <SelectItem value="name">Name</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={filterLanguage} onValueChange={setFilterLanguage}>
                  <SelectTrigger className="w-full sm:w-48 bg-background border-border">
                    <SelectValue placeholder="Filter by language" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All languages</SelectItem>
                    {languages.map((lang) => (
                      <SelectItem key={lang} value={lang}>
                        {lang}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* View Mode Toggle - Hidden on mobile */}
              <div className="hidden sm:block">
                <ToggleGroup
                  type="single"
                  value={viewMode}
                  onValueChange={(value) => value && setViewMode(value as any)}
                >
                  <ToggleGroupItem value="grid" aria-label="Grid view">
                    <Grid className="h-4 w-4" />
                  </ToggleGroupItem>
                  <ToggleGroupItem value="list" aria-label="List view">
                    <List className="h-4 w-4" />
                  </ToggleGroupItem>
                </ToggleGroup>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Repository Grid/List */}
      <div
        className={cn(
          "gap-4",
          viewMode === "grid" ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3" : "flex flex-col",
        )}
      >
        {filteredAndSortedRepos.map((repo) => (
          <Card
            key={repo.id}
            className={cn(
              "bg-card border-border hover:border-primary/50 transition-colors group",
              viewMode === "list" && "sm:flex sm:flex-row sm:items-center",
            )}
          >
            <div className={cn("flex-1", viewMode === "list" && "sm:flex sm:items-center sm:gap-6")}>
              <CardHeader className={cn("pb-3", viewMode === "list" && "sm:pb-6 sm:flex-1")}>
                <div className="flex items-start justify-between gap-2">
                  <CardTitle
                    className={cn(
                      "font-semibold text-foreground group-hover:text-primary transition-colors line-clamp-1",
                      viewMode === "list" ? "text-base sm:text-lg" : "text-lg",
                    )}
                  >
                    <a href={repo.html_url} target="_blank" rel="noopener noreferrer" className="hover:underline">
                      {repo.name}
                    </a>
                  </CardTitle>
                  <div className="flex items-center gap-1 shrink-0">
                    {repo.private && <Lock className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />}
                    {repo.fork && <GitFork className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />}
                  </div>
                </div>
              </CardHeader>

              <CardContent className={cn("space-y-3 sm:space-y-4", viewMode === "list" && "sm:flex-1")}>
                {repo.description && (
                  <p
                    className={cn(
                      "text-sm text-muted-foreground text-pretty",
                      viewMode === "list" ? "line-clamp-2" : "line-clamp-3",
                    )}
                  >
                    {repo.description}
                  </p>
                )}

                <div
                  className={cn(
                    "flex flex-wrap items-center gap-3 sm:gap-4 text-xs sm:text-sm",
                    viewMode === "list" && "sm:justify-between",
                  )}
                >
                  <div className="flex items-center gap-3 sm:gap-4">
                    {repo.language && (
                      <div className="flex items-center gap-1">
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: languageColors[repo.language] || "#8b5cf6" }}
                        />
                        <span className="text-muted-foreground">{repo.language}</span>
                      </div>
                    )}

                    <div className="flex items-center gap-1 text-muted-foreground">
                      <Star className="h-3 w-3" />
                      <span>{repo.stargazers_count}</span>
                    </div>

                    <div className="flex items-center gap-1 text-muted-foreground">
                      <GitFork className="h-3 w-3" />
                      <span>{repo.forks_count}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 text-muted-foreground">
                    <Clock className="h-3 w-3" />
                    <span>Updated {formatDate(repo.updated_at)}</span>
                  </div>
                </div>

                {repo.topics && repo.topics.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {repo.topics.slice(0, viewMode === "list" ? 5 : 3).map((topic) => (
                      <Badge key={topic} variant="secondary" className="text-xs">
                        {topic}
                      </Badge>
                    ))}
                    {repo.topics.length > (viewMode === "list" ? 5 : 3) && (
                      <Badge variant="secondary" className="text-xs">
                        +{repo.topics.length - (viewMode === "list" ? 5 : 3)}
                      </Badge>
                    )}
                  </div>
                )}
              </CardContent>
            </div>
          </Card>
        ))}
      </div>

      {filteredAndSortedRepos.length === 0 && !isLoading && (
        <Card className="bg-card border-border">
          <CardContent className="py-8 sm:py-12 text-center">
            <div className="space-y-2">
              <h3 className="text-lg font-semibold text-foreground">No repositories found</h3>
              <p className="text-muted-foreground text-sm sm:text-base">
                {searchQuery || filterLanguage !== "all"
                  ? "Try adjusting your search or filter criteria."
                  : "This user has no public repositories."}
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

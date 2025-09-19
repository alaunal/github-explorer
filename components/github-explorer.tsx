"use client"

import { useState } from "react"
import { AlertCircle, RefreshCw } from "lucide-react"
import { UserSearch } from "./user-search"
import { RepositoryList } from "./repository-list"
import { ErrorBoundary } from "./error-boundary"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import type { GitHubUser, GitHubRepository } from "@/types/github"

export function GitHubExplorer() {
  const [selectedUser, setSelectedUser] = useState<GitHubUser | null>(null)
  const [repositories, setRepositories] = useState<GitHubRepository[]>([])
  const [isLoadingRepos, setIsLoadingRepos] = useState(false)
  const [repoError, setRepoError] = useState<string | null>(null)

  const handleUserSelect = async (user: GitHubUser) => {
    setSelectedUser(user)
    setIsLoadingRepos(true)
    setRepoError(null)

    try {
      const response = await fetch(`https://api.github.com/users/${user.login}/repos?sort=updated&per_page=100`, {
        headers: {
          Accept: "application/vnd.github.v3+json",
        },
      })

      if (!response.ok) {
        if (response.status === 403) {
          throw new Error("GitHub API rate limit exceeded. Please try again later.")
        } else if (response.status === 404) {
          throw new Error("User repositories not found.")
        } else {
          throw new Error(`Failed to fetch repositories: ${response.status} ${response.statusText}`)
        }
      }

      const repos = await response.json()
      setRepositories(repos)
    } catch (error) {
      console.error("Error fetching repositories:", error)
      const errorMessage = error instanceof Error ? error.message : "Failed to fetch repositories"
      setRepoError(errorMessage)
      setRepositories([])
    } finally {
      setIsLoadingRepos(false)
    }
  }

  const retryFetchRepositories = () => {
    if (selectedUser) {
      handleUserSelect(selectedUser)
    }
  }

  return (
    <ErrorBoundary>
      <div className="space-y-8">
        <UserSearch onUserSelect={handleUserSelect} />

        {selectedUser && (
          <>
            {repoError ? (
              <Card className="bg-card border-border">
                <CardContent className="py-8">
                  <div className="text-center space-y-4">
                    <div className="flex justify-center">
                      <AlertCircle className="h-12 w-12 text-destructive" />
                    </div>
                    <div className="space-y-2">
                      <h3 className="text-lg font-semibold text-foreground">Failed to load repositories</h3>
                      <p className="text-muted-foreground max-w-md mx-auto text-pretty">{repoError}</p>
                    </div>
                    <Button onClick={retryFetchRepositories} variant="outline">
                      <RefreshCw className="h-4 w-4 mr-2" />
                      Try Again
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <RepositoryList user={selectedUser} repositories={repositories} isLoading={isLoadingRepos} />
            )}
          </>
        )}

        {!selectedUser && (
          <Card className="bg-card border-border">
            <CardContent className="py-12 text-center">
              <div className="space-y-2">
                <h3 className="text-lg font-semibold text-foreground">Search for a GitHub user</h3>
                <p className="text-muted-foreground">
                  Enter a username in the search box above to explore their repositories
                </p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </ErrorBoundary>
  )
}

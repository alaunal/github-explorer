"use client"

import type React from "react"

import { useState, useCallback, useRef, useEffect } from "react"
import { Search, User, MapPin, Building, Users, GitFork, AlertCircle, WifiOff } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import type { GitHubUser, GitHubSearchResponse } from "@/types/github"
import { cn } from "@/lib/utils"

interface UserSearchProps {
  onUserSelect: (user: GitHubUser) => void
}

export function UserSearch({ onUserSelect }: UserSearchProps) {
  const [query, setQuery] = useState("")
  const [users, setUsers] = useState<GitHubUser[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isOpen, setIsOpen] = useState(false)
  const [selectedIndex, setSelectedIndex] = useState(-1)
  const [isOnline, setIsOnline] = useState(true)
  const searchRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const debounceRef = useRef<NodeJS.Timeout>()

  useEffect(() => {
    const handleOnline = () => setIsOnline(true)
    const handleOffline = () => setIsOnline(false)

    window.addEventListener("online", handleOnline)
    window.addEventListener("offline", handleOffline)

    return () => {
      window.removeEventListener("online", handleOnline)
      window.removeEventListener("offline", handleOffline)
    }
  }, [])

  const searchUsers = useCallback(
    async (searchQuery: string) => {
      if (!searchQuery.trim()) {
        setUsers([])
        setIsOpen(false)
        return
      }

      if (!isOnline) {
        setError("No internet connection. Please check your network and try again.")
        return
      }

      setIsLoading(true)
      setError(null)

      try {
        const controller = new AbortController()
        const timeoutId = setTimeout(() => controller.abort(), 10000) // 10 second timeout

        const response = await fetch(
          `https://api.github.com/search/users?q=${encodeURIComponent(searchQuery)}&per_page=5`,
          {
            signal: controller.signal,
            headers: {
              Accept: "application/vnd.github.v3+json",
            },
          },
        )

        clearTimeout(timeoutId)

        if (!response.ok) {
          if (response.status === 403) {
            const resetTime = response.headers.get("X-RateLimit-Reset")
            const resetDate = resetTime ? new Date(Number.parseInt(resetTime) * 1000) : null
            const resetString = resetDate ? resetDate.toLocaleTimeString() : "later"
            throw new Error(`GitHub API rate limit exceeded. Try again at ${resetString}.`)
          } else if (response.status === 422) {
            throw new Error("Invalid search query. Please try a different search term.")
          } else {
            throw new Error(`GitHub API error: ${response.status} ${response.statusText}`)
          }
        }

        const data: GitHubSearchResponse = await response.json()

        // Fetch detailed user info for each user with error handling
        const detailedUsers = await Promise.allSettled(
          data.items.map(async (user) => {
            try {
              const userResponse = await fetch(`https://api.github.com/users/${user.login}`, {
                signal: controller.signal,
                headers: {
                  Accept: "application/vnd.github.v3+json",
                },
              })
              if (userResponse.ok) {
                return await userResponse.json()
              }
              return user
            } catch {
              return user
            }
          }),
        )

        const successfulUsers = detailedUsers
          .filter((result): result is PromiseFulfilledResult<GitHubUser> => result.status === "fulfilled")
          .map((result) => result.value)

        setUsers(successfulUsers)
        setIsOpen(true)
        setSelectedIndex(-1)
      } catch (err) {
        if (err instanceof Error) {
          if (err.name === "AbortError") {
            setError("Request timed out. Please try again.")
          } else {
            setError(err.message)
          }
        } else {
          setError("Failed to search users. Please try again.")
        }
        setUsers([])
        setIsOpen(false)
      } finally {
        setIsLoading(false)
      }
    },
    [isOnline],
  )

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setQuery(value)

    // Clear previous debounce
    if (debounceRef.current) {
      clearTimeout(debounceRef.current)
    }

    // Debounce search
    debounceRef.current = setTimeout(() => {
      searchUsers(value)
    }, 300)
  }

  const handleUserClick = (user: GitHubUser) => {
    onUserSelect(user)
    setQuery(user.login)
    setIsOpen(false)
    setSelectedIndex(-1)
    setError(null)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen || users.length === 0) return

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault()
        setSelectedIndex((prev) => (prev < users.length - 1 ? prev + 1 : prev))
        break
      case "ArrowUp":
        e.preventDefault()
        setSelectedIndex((prev) => (prev > 0 ? prev - 1 : -1))
        break
      case "Enter":
        e.preventDefault()
        if (selectedIndex >= 0 && selectedIndex < users.length) {
          handleUserClick(users[selectedIndex])
        }
        break
      case "Escape":
        setIsOpen(false)
        setSelectedIndex(-1)
        inputRef.current?.blur()
        break
    }
  }

  const retrySearch = () => {
    if (query.trim()) {
      searchUsers(query)
    }
  }

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsOpen(false)
        setSelectedIndex(-1)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
      if (debounceRef.current) {
        clearTimeout(debounceRef.current)
      }
    }
  }, [])

  return (
    <div ref={searchRef} className="relative w-full max-w-2xl mx-auto">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
        <Input
          ref={inputRef}
          type="text"
          placeholder="Search GitHub users..."
          value={query}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={() => query && users.length > 0 && setIsOpen(true)}
          disabled={!isOnline}
          className={cn(
            "pl-10 pr-4 py-3 text-base sm:text-lg bg-card border-border focus:ring-2 focus:ring-primary focus:border-transparent",
            !isOnline && "opacity-50 cursor-not-allowed",
          )}
        />
        {isLoading && (
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
            <div className="animate-spin rounded-full h-4 w-4 border-2 border-primary border-t-transparent" />
          </div>
        )}
        {!isOnline && (
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
            <WifiOff className="h-4 w-4 text-destructive" />
          </div>
        )}
      </div>

      {!isOnline && (
        <div className="mt-2 p-3 bg-destructive/10 border border-destructive/20 rounded-md">
          <div className="flex items-center gap-2">
            <WifiOff className="h-4 w-4 text-destructive" />
            <p className="text-sm text-destructive">No internet connection</p>
          </div>
        </div>
      )}

      {error && (
        <div className="mt-2 p-3 bg-destructive/10 border border-destructive/20 rounded-md">
          <div className="flex flex-col sm:flex-row items-start justify-between gap-2">
            <div className="flex items-start gap-2 flex-1">
              <AlertCircle className="h-4 w-4 text-destructive mt-0.5 shrink-0" />
              <p className="text-sm text-destructive text-pretty">{error}</p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={retrySearch}
              className="text-destructive hover:text-destructive hover:bg-destructive/10 shrink-0 w-full sm:w-auto mt-2 sm:mt-0"
            >
              Retry
            </Button>
          </div>
        </div>
      )}

      {isOpen && users.length > 0 && (
        <Card className="absolute top-full left-0 right-0 mt-2 z-50 max-h-96 overflow-y-auto bg-card border-border shadow-lg">
          <CardContent className="p-0">
            {users.map((user, index) => (
              <div
                key={user.id}
                onClick={() => handleUserClick(user)}
                className={cn(
                  "flex items-center gap-3 sm:gap-4 p-3 sm:p-4 cursor-pointer transition-colors border-b border-border last:border-b-0",
                  "hover:bg-accent/50 focus:bg-accent/50",
                  selectedIndex === index && "bg-accent/50",
                )}
                role="option"
                aria-selected={selectedIndex === index}
              >
                <Avatar className="h-10 w-10 sm:h-12 sm:w-12 shrink-0">
                  <AvatarImage src={user.avatar_url || "/placeholder.svg"} alt={user.login} />
                  <AvatarFallback>
                    <User className="h-5 w-5 sm:h-6 sm:w-6" />
                  </AvatarFallback>
                </Avatar>

                <div className="flex-1 min-w-0">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 mb-1">
                    <h3 className="font-semibold text-foreground truncate text-sm sm:text-base">
                      {user.name || user.login}
                    </h3>
                    {user.name && <span className="text-xs sm:text-sm text-muted-foreground">@{user.login}</span>}
                  </div>

                  {user.bio && (
                    <p className="text-xs sm:text-sm text-muted-foreground line-clamp-2 mb-2 text-pretty">{user.bio}</p>
                  )}

                  <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-xs text-muted-foreground">
                    {user.location && (
                      <div className="flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        <span className="truncate max-w-24 sm:max-w-none">{user.location}</span>
                      </div>
                    )}
                    {user.company && (
                      <div className="flex items-center gap-1">
                        <Building className="h-3 w-3" />
                        <span className="truncate max-w-24 sm:max-w-none">{user.company}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex flex-col items-end gap-1 text-xs text-muted-foreground shrink-0">
                  <div className="flex items-center gap-1">
                    <GitFork className="h-3 w-3" />
                    <span>{user.public_repos}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Users className="h-3 w-3" />
                    <span>{user.followers}</span>
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  )
}

"use client"

import type React from "react"

import { render, screen, fireEvent, waitFor } from "@testing-library/react"
import { GitHubExplorer } from "@/components/github-explorer"
import jest from "jest" // Import jest to declare the variable

// Mock the child components
jest.mock("@/components/user-search", () => ({
  UserSearch: ({ onUserSelect }: { onUserSelect: (user: any) => void }) => (
    <div data-testid="user-search">
      <button
        onClick={() =>
          onUserSelect({
            id: 1,
            login: "testuser",
            avatar_url: "https://example.com/avatar.jpg",
            html_url: "https://github.com/testuser",
            name: "Test User",
            public_repos: 10,
            followers: 5,
            following: 3,
          })
        }
      >
        Select User
      </button>
    </div>
  ),
}))

jest.mock("@/components/repository-list", () => ({
  RepositoryList: ({ user, repositories, isLoading }: any) => (
    <div data-testid="repository-list">
      {isLoading ? "Loading..." : `Repositories for ${user.login}: ${repositories.length}`}
    </div>
  ),
}))

jest.mock("@/components/error-boundary", () => ({
  ErrorBoundary: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}))

const mockFetch = global.fetch as jest.MockedFunction<typeof fetch>

describe("GitHubExplorer", () => {
  beforeEach(() => {
    mockFetch.mockClear()
  })

  it("renders initial state correctly", () => {
    render(<GitHubExplorer />)

    expect(screen.getByTestId("user-search")).toBeInTheDocument()
    expect(screen.getByText("Search for a GitHub user")).toBeInTheDocument()
    expect(
      screen.getByText("Enter a username in the search box above to explore their repositories"),
    ).toBeInTheDocument()
  })

  it("handles user selection and fetches repositories successfully", async () => {
    const mockRepos = [
      {
        id: 1,
        name: "test-repo",
        full_name: "testuser/test-repo",
        description: "A test repository",
        html_url: "https://github.com/testuser/test-repo",
        language: "JavaScript",
        stargazers_count: 10,
        forks_count: 2,
        updated_at: "2023-01-01T00:00:00Z",
        topics: ["test"],
        private: false,
        fork: false,
      },
    ]

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockRepos,
    } as Response)

    render(<GitHubExplorer />)

    const selectUserButton = screen.getByText("Select User")
    fireEvent.click(selectUserButton)

    await waitFor(() => {
      expect(screen.getByTestId("repository-list")).toBeInTheDocument()
      expect(screen.getByText("Repositories for testuser: 1")).toBeInTheDocument()
    })

    expect(mockFetch).toHaveBeenCalledWith("https://api.github.com/users/testuser/repos?sort=updated&per_page=100", {
      headers: {
        Accept: "application/vnd.github.v3+json",
      },
    })
  })

  it("handles API rate limit error", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 403,
      statusText: "Forbidden",
    } as Response)

    render(<GitHubExplorer />)

    const selectUserButton = screen.getByText("Select User")
    fireEvent.click(selectUserButton)

    await waitFor(() => {
      expect(screen.getByText("Failed to load repositories")).toBeInTheDocument()
      expect(screen.getByText("GitHub API rate limit exceeded. Please try again later.")).toBeInTheDocument()
      expect(screen.getByText("Try Again")).toBeInTheDocument()
    })
  })

  it("handles 404 error", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 404,
      statusText: "Not Found",
    } as Response)

    render(<GitHubExplorer />)

    const selectUserButton = screen.getByText("Select User")
    fireEvent.click(selectUserButton)

    await waitFor(() => {
      expect(screen.getByText("User repositories not found.")).toBeInTheDocument()
    })
  })

  it("handles retry functionality", async () => {
    // First call fails
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 500,
      statusText: "Internal Server Error",
    } as Response)

    // Second call succeeds
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => [],
    } as Response)

    render(<GitHubExplorer />)

    const selectUserButton = screen.getByText("Select User")
    fireEvent.click(selectUserButton)

    await waitFor(() => {
      expect(screen.getByText("Try Again")).toBeInTheDocument()
    })

    const retryButton = screen.getByText("Try Again")
    fireEvent.click(retryButton)

    await waitFor(() => {
      expect(screen.getByTestId("repository-list")).toBeInTheDocument()
    })

    expect(mockFetch).toHaveBeenCalledTimes(2)
  })

  it("shows loading state while fetching repositories", async () => {
    // Mock a delayed response
    mockFetch.mockImplementationOnce(
      () =>
        new Promise((resolve) =>
          setTimeout(
            () =>
              resolve({
                ok: true,
                json: async () => [],
              } as Response),
            100,
          ),
        ),
    )

    render(<GitHubExplorer />)

    const selectUserButton = screen.getByText("Select User")
    fireEvent.click(selectUserButton)

    // Should show loading state
    expect(screen.getByText("Loading...")).toBeInTheDocument()

    await waitFor(() => {
      expect(screen.getByText("Repositories for testuser: 0")).toBeInTheDocument()
    })
  })
})

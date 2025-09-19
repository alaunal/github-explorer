import { render, screen, fireEvent, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { UserSearch } from "@/components/user-search"
import jest from "jest" // Import jest to declare the variable

const mockFetch = global.fetch as jest.MockedFunction<typeof fetch>

const mockUsers = {
  total_count: 2,
  incomplete_results: false,
  items: [
    {
      id: 1,
      login: "testuser1",
      avatar_url: "https://example.com/avatar1.jpg",
      html_url: "https://github.com/testuser1",
      name: "Test User 1",
      bio: "A test user",
      public_repos: 10,
      followers: 5,
      following: 3,
      location: "Test City",
      company: "Test Company",
    },
    {
      id: 2,
      login: "testuser2",
      avatar_url: "https://example.com/avatar2.jpg",
      html_url: "https://github.com/testuser2",
      name: "Test User 2",
      public_repos: 15,
      followers: 8,
      following: 6,
    },
  ],
}

describe("UserSearch", () => {
  const mockOnUserSelect = jest.fn()

  beforeEach(() => {
    mockFetch.mockClear()
    mockOnUserSelect.mockClear()
  })

  it("renders search input correctly", () => {
    render(<UserSearch onUserSelect={mockOnUserSelect} />)

    expect(screen.getByPlaceholderText("Search GitHub users...")).toBeInTheDocument()
    expect(screen.getByRole("textbox")).toBeInTheDocument()
  })

  it("searches users when typing", async () => {
    const user = userEvent.setup()

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockUsers,
    } as Response)

    // Mock detailed user fetch
    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => mockUsers.items[0],
    } as Response)

    render(<UserSearch onUserSelect={mockOnUserSelect} />)

    const searchInput = screen.getByPlaceholderText("Search GitHub users...")
    await user.type(searchInput, "test")

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith(
        "https://api.github.com/search/users?q=test&per_page=5",
        expect.objectContaining({
          headers: {
            Accept: "application/vnd.github.v3+json",
          },
        }),
      )
    })
  })

  it("displays search results", async () => {
    const user = userEvent.setup()

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockUsers,
    } as Response)

    // Mock detailed user fetches
    mockUsers.items.forEach(() => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockUsers.items[0],
      } as Response)
    })

    render(<UserSearch onUserSelect={mockOnUserSelect} />)

    const searchInput = screen.getByPlaceholderText("Search GitHub users...")
    await user.type(searchInput, "test")

    await waitFor(() => {
      expect(screen.getByText("Test User 1")).toBeInTheDocument()
      expect(screen.getByText("@testuser1")).toBeInTheDocument()
      expect(screen.getByText("A test user")).toBeInTheDocument()
      expect(screen.getByText("Test City")).toBeInTheDocument()
      expect(screen.getByText("Test Company")).toBeInTheDocument()
    })
  })

  it("handles user selection", async () => {
    const user = userEvent.setup()

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockUsers,
    } as Response)

    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => mockUsers.items[0],
    } as Response)

    render(<UserSearch onUserSelect={mockOnUserSelect} />)

    const searchInput = screen.getByPlaceholderText("Search GitHub users...")
    await user.type(searchInput, "test")

    await waitFor(() => {
      expect(screen.getByText("Test User 1")).toBeInTheDocument()
    })

    const userOption = screen.getByText("Test User 1")
    fireEvent.click(userOption)

    expect(mockOnUserSelect).toHaveBeenCalledWith(
      expect.objectContaining({
        id: 1,
        login: "testuser1",
        name: "Test User 1",
      }),
    )
  })

  it("handles keyboard navigation", async () => {
    const user = userEvent.setup()

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockUsers,
    } as Response)

    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => mockUsers.items[0],
    } as Response)

    render(<UserSearch onUserSelect={mockOnUserSelect} />)

    const searchInput = screen.getByPlaceholderText("Search GitHub users...")
    await user.type(searchInput, "test")

    await waitFor(() => {
      expect(screen.getByText("Test User 1")).toBeInTheDocument()
    })

    // Test arrow down navigation
    fireEvent.keyDown(searchInput, { key: "ArrowDown" })
    fireEvent.keyDown(searchInput, { key: "Enter" })

    expect(mockOnUserSelect).toHaveBeenCalled()
  })

  it("handles API rate limit error", async () => {
    const user = userEvent.setup()

    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 403,
      headers: {
        get: () => "1640995200", // Mock reset time
      },
    } as Response)

    render(<UserSearch onUserSelect={mockOnUserSelect} />)

    const searchInput = screen.getByPlaceholderText("Search GitHub users...")
    await user.type(searchInput, "test")

    await waitFor(() => {
      expect(screen.getByText(/GitHub API rate limit exceeded/)).toBeInTheDocument()
      expect(screen.getByText("Retry")).toBeInTheDocument()
    })
  })

  it("handles network error", async () => {
    const user = userEvent.setup()

    mockFetch.mockRejectedValueOnce(new Error("Network error"))

    render(<UserSearch onUserSelect={mockOnUserSelect} />)

    const searchInput = screen.getByPlaceholderText("Search GitHub users...")
    await user.type(searchInput, "test")

    await waitFor(() => {
      expect(screen.getByText("Network error")).toBeInTheDocument()
    })
  })

  it("handles offline state", () => {
    // Mock navigator.onLine
    Object.defineProperty(navigator, "onLine", {
      writable: true,
      value: false,
    })

    render(<UserSearch onUserSelect={mockOnUserSelect} />)

    const searchInput = screen.getByPlaceholderText("Search GitHub users...")
    expect(searchInput).toBeDisabled()
    expect(screen.getByText("No internet connection")).toBeInTheDocument()
  })

  it("clears results when search is empty", async () => {
    const user = userEvent.setup()

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockUsers,
    } as Response)

    render(<UserSearch onUserSelect={mockOnUserSelect} />)

    const searchInput = screen.getByPlaceholderText("Search GitHub users...")
    await user.type(searchInput, "test")

    await waitFor(() => {
      expect(screen.getByText("Test User 1")).toBeInTheDocument()
    })

    await user.clear(searchInput)

    await waitFor(() => {
      expect(screen.queryByText("Test User 1")).not.toBeInTheDocument()
    })
  })
})

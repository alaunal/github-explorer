import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { RepositoryList } from "@/components/repository-list"

const mockUser = {
  id: 1,
  login: "testuser",
  avatar_url: "https://example.com/avatar.jpg",
  html_url: "https://github.com/testuser",
  name: "Test User",
  bio: "A test user",
  public_repos: 2,
  followers: 10,
  following: 5,
}

const mockRepositories = [
  {
    id: 1,
    name: "test-repo-1",
    full_name: "testuser/test-repo-1",
    description: "First test repository",
    html_url: "https://github.com/testuser/test-repo-1",
    language: "JavaScript",
    stargazers_count: 15,
    forks_count: 3,
    updated_at: "2023-12-01T00:00:00Z",
    topics: ["react", "typescript"],
    private: false,
    fork: false,
  },
  {
    id: 2,
    name: "test-repo-2",
    full_name: "testuser/test-repo-2",
    description: "Second test repository",
    html_url: "https://github.com/testuser/test-repo-2",
    language: "Python",
    stargazers_count: 8,
    forks_count: 1,
    updated_at: "2023-11-15T00:00:00Z",
    topics: ["python", "api"],
    private: true,
    fork: true,
  },
]

describe("RepositoryList", () => {
  it("renders loading state correctly", () => {
    render(<RepositoryList user={mockUser} repositories={[]} isLoading={true} />)

    // Should show skeleton loading elements
    expect(screen.getAllByText(/animate-pulse/i)).toBeTruthy()
  })

  it("renders user profile correctly", () => {
    render(<RepositoryList user={mockUser} repositories={mockRepositories} isLoading={false} />)

    expect(screen.getByText("Test User")).toBeInTheDocument()
    expect(screen.getByText("@testuser")).toBeInTheDocument()
    expect(screen.getByText("A test user")).toBeInTheDocument()
    expect(screen.getByText("2 repositories")).toBeInTheDocument()
    expect(screen.getByText("10 followers")).toBeInTheDocument()
    expect(screen.getByText("5 following")).toBeInTheDocument()
  })

  it("renders repositories correctly", () => {
    render(<RepositoryList user={mockUser} repositories={mockRepositories} isLoading={false} />)

    expect(screen.getByText("test-repo-1")).toBeInTheDocument()
    expect(screen.getByText("First test repository")).toBeInTheDocument()
    expect(screen.getByText("JavaScript")).toBeInTheDocument()
    expect(screen.getByText("15")).toBeInTheDocument() // stars
    expect(screen.getByText("3")).toBeInTheDocument() // forks

    expect(screen.getByText("test-repo-2")).toBeInTheDocument()
    expect(screen.getByText("Second test repository")).toBeInTheDocument()
    expect(screen.getByText("Python")).toBeInTheDocument()
  })

  it("filters repositories by search query", async () => {
    const user = userEvent.setup()

    render(<RepositoryList user={mockUser} repositories={mockRepositories} isLoading={false} />)

    const searchInput = screen.getByPlaceholderText("Search repositories...")
    await user.type(searchInput, "first")

    expect(screen.getByText("test-repo-1")).toBeInTheDocument()
    expect(screen.queryByText("test-repo-2")).not.toBeInTheDocument()
  })

  it("filters repositories by language", async () => {
    const user = userEvent.setup()

    render(<RepositoryList user={mockUser} repositories={mockRepositories} isLoading={false} />)

    // Open language filter dropdown
    const languageFilter = screen.getByRole("combobox", { name: /filter by language/i })
    await user.click(languageFilter)

    // Select Python
    const pythonOption = screen.getByText("Python")
    await user.click(pythonOption)

    expect(screen.queryByText("test-repo-1")).not.toBeInTheDocument()
    expect(screen.getByText("test-repo-2")).toBeInTheDocument()
  })

  it("sorts repositories correctly", async () => {
    const user = userEvent.setup()

    render(<RepositoryList user={mockUser} repositories={mockRepositories} isLoading={false} />)

    // Open sort dropdown
    const sortFilter = screen.getByRole("combobox", { name: /sort by/i })
    await user.click(sortFilter)

    // Select sort by stars
    const starsOption = screen.getByText("Most stars")
    await user.click(starsOption)

    const repoCards = screen.getAllByText(/test-repo-/)
    expect(repoCards[0]).toHaveTextContent("test-repo-1") // 15 stars should be first
    expect(repoCards[1]).toHaveTextContent("test-repo-2") // 8 stars should be second
  })

  it("toggles between grid and list view", async () => {
    const user = userEvent.setup()

    render(<RepositoryList user={mockUser} repositories={mockRepositories} isLoading={false} />)

    // Find view toggle buttons (only visible on desktop)
    const listViewButton = screen.getByRole("button", { name: /list view/i })
    await user.click(listViewButton)

    // Check if layout changes (this would require checking CSS classes)
    expect(listViewButton).toHaveAttribute("data-state", "on")
  })

  it("shows repository topics", () => {
    render(<RepositoryList user={mockUser} repositories={mockRepositories} isLoading={false} />)

    expect(screen.getByText("react")).toBeInTheDocument()
    expect(screen.getByText("typescript")).toBeInTheDocument()
    expect(screen.getByText("python")).toBeInTheDocument()
    expect(screen.getByText("api")).toBeInTheDocument()
  })

  it("shows private and fork indicators", () => {
    render(<RepositoryList user={mockUser} repositories={mockRepositories} isLoading={false} />)

    // Check for lock icon (private repo) and fork icon
    const lockIcons = screen.getAllByTestId("lock-icon")
    const forkIcons = screen.getAllByTestId("fork-icon")

    expect(lockIcons).toHaveLength(1) // test-repo-2 is private
    expect(forkIcons).toHaveLength(1) // test-repo-2 is a fork
  })

  it("shows empty state when no repositories match filters", async () => {
    const user = userEvent.setup()

    render(<RepositoryList user={mockUser} repositories={mockRepositories} isLoading={false} />)

    const searchInput = screen.getByPlaceholderText("Search repositories...")
    await user.type(searchInput, "nonexistent")

    expect(screen.getByText("No repositories found")).toBeInTheDocument()
    expect(screen.getByText("Try adjusting your search or filter criteria.")).toBeInTheDocument()
  })

  it("shows empty state when user has no repositories", () => {
    render(<RepositoryList user={mockUser} repositories={[]} isLoading={false} />)

    expect(screen.getByText("No repositories found")).toBeInTheDocument()
    expect(screen.getByText("This user has no public repositories.")).toBeInTheDocument()
  })

  it("formats dates correctly", () => {
    render(<RepositoryList user={mockUser} repositories={mockRepositories} isLoading={false} />)

    // Should show relative dates like "Updated X days ago"
    expect(screen.getByText(/Updated.*ago/)).toBeInTheDocument()
  })
})

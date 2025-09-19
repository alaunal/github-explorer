import { render, screen, fireEvent } from "@testing-library/react"
import { ErrorBoundary } from "@/components/error-boundary"
import jest from "jest" // Import jest to declare the variable

// Component that throws an error
const ThrowError = ({ shouldThrow }: { shouldThrow: boolean }) => {
  if (shouldThrow) {
    throw new Error("Test error message")
  }
  return <div>No error</div>
}

// Mock window.location.reload
const mockReload = jest.fn()
Object.defineProperty(window, "location", {
  value: {
    reload: mockReload,
  },
  writable: true,
})

describe("ErrorBoundary", () => {
  beforeEach(() => {
    mockReload.mockClear()
    // Suppress console.error for these tests
    jest.spyOn(console, "error").mockImplementation(() => {})
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  it("renders children when there is no error", () => {
    render(
      <ErrorBoundary>
        <ThrowError shouldThrow={false} />
      </ErrorBoundary>,
    )

    expect(screen.getByText("No error")).toBeInTheDocument()
  })

  it("renders error UI when there is an error", () => {
    render(
      <ErrorBoundary>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>,
    )

    expect(screen.getByText("Something went wrong")).toBeInTheDocument()
    expect(screen.getByText("An unexpected error occurred while loading the application.")).toBeInTheDocument()
    expect(screen.getByText("Reload Page")).toBeInTheDocument()
  })

  it("shows error details when expanded", () => {
    render(
      <ErrorBoundary>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>,
    )

    const detailsElement = screen.getByText("Error details")
    fireEvent.click(detailsElement)

    expect(screen.getByText("Test error message")).toBeInTheDocument()
  })

  it("reloads page when reload button is clicked", () => {
    render(
      <ErrorBoundary>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>,
    )

    const reloadButton = screen.getByText("Reload Page")
    fireEvent.click(reloadButton)

    expect(mockReload).toHaveBeenCalledTimes(1)
  })

  it("renders custom fallback when provided", () => {
    const customFallback = <div>Custom error fallback</div>

    render(
      <ErrorBoundary fallback={customFallback}>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>,
    )

    expect(screen.getByText("Custom error fallback")).toBeInTheDocument()
    expect(screen.queryByText("Something went wrong")).not.toBeInTheDocument()
  })

  it("logs error to console", () => {
    const consoleSpy = jest.spyOn(console, "error").mockImplementation(() => {})

    render(
      <ErrorBoundary>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>,
    )

    expect(consoleSpy).toHaveBeenCalledWith("ErrorBoundary caught an error:", expect.any(Error), expect.any(Object))
  })
})

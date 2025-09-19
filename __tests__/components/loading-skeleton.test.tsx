import { render, screen } from "@testing-library/react"
import { LoadingSkeleton, RepositoryCardSkeleton, UserProfileSkeleton } from "@/components/loading-skeleton"

describe("LoadingSkeleton", () => {
  it("renders basic loading skeleton", () => {
    render(<LoadingSkeleton />)

    const skeletonElement = screen.getByRole("generic")
    expect(skeletonElement).toHaveClass("animate-pulse")
  })

  it("applies custom className", () => {
    render(<LoadingSkeleton className="custom-class" />)

    const skeletonElement = screen.getByRole("generic")
    expect(skeletonElement).toHaveClass("animate-pulse", "custom-class")
  })
})

describe("RepositoryCardSkeleton", () => {
  it("renders repository card skeleton structure", () => {
    render(<RepositoryCardSkeleton />)

    // Should have card structure with animated elements
    expect(screen.getByRole("generic")).toBeInTheDocument()

    // Check for multiple animated skeleton elements
    const animatedElements = document.querySelectorAll(".animate-pulse")
    expect(animatedElements.length).toBeGreaterThan(1)
  })
})

describe("UserProfileSkeleton", () => {
  it("renders user profile skeleton structure", () => {
    render(<UserProfileSkeleton />)

    // Should have card structure
    expect(screen.getByRole("generic")).toBeInTheDocument()

    // Check for avatar skeleton (circular)
    const avatarSkeleton = document.querySelector(".rounded-full")
    expect(avatarSkeleton).toBeInTheDocument()

    // Check for multiple animated skeleton elements
    const animatedElements = document.querySelectorAll(".animate-pulse")
    expect(animatedElements.length).toBeGreaterThan(3)
  })
})

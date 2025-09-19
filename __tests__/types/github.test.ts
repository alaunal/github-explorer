import type { GitHubUser, GitHubRepository, GitHubSearchResponse } from "@/types/github"

describe("GitHub Types", () => {
  it("should define GitHubUser interface correctly", () => {
    const user: GitHubUser = {
      id: 1,
      login: "testuser",
      avatar_url: "https://example.com/avatar.jpg",
      html_url: "https://github.com/testuser",
      name: "Test User",
      bio: "A test user",
      public_repos: 10,
      followers: 5,
      following: 3,
      location: "Test City",
      company: "Test Company",
      blog: "https://testuser.dev",
    }

    expect(user.id).toBe(1)
    expect(user.login).toBe("testuser")
    expect(user.name).toBe("Test User")
  })

  it("should define GitHubRepository interface correctly", () => {
    const repo: GitHubRepository = {
      id: 1,
      name: "test-repo",
      full_name: "testuser/test-repo",
      description: "A test repository",
      html_url: "https://github.com/testuser/test-repo",
      language: "JavaScript",
      stargazers_count: 10,
      forks_count: 2,
      updated_at: "2023-01-01T00:00:00Z",
      topics: ["test", "javascript"],
      private: false,
      fork: false,
    }

    expect(repo.id).toBe(1)
    expect(repo.name).toBe("test-repo")
    expect(repo.topics).toEqual(["test", "javascript"])
  })

  it("should define GitHubSearchResponse interface correctly", () => {
    const searchResponse: GitHubSearchResponse = {
      total_count: 1,
      incomplete_results: false,
      items: [
        {
          id: 1,
          login: "testuser",
          avatar_url: "https://example.com/avatar.jpg",
          html_url: "https://github.com/testuser",
          public_repos: 10,
          followers: 5,
          following: 3,
        },
      ],
    }

    expect(searchResponse.total_count).toBe(1)
    expect(searchResponse.items).toHaveLength(1)
    expect(searchResponse.items[0].login).toBe("testuser")
  })
})

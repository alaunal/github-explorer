export interface GitHubUser {
  id: number
  login: string
  avatar_url: string
  html_url: string
  name?: string
  bio?: string
  public_repos: number
  followers: number
  following: number
  location?: string
  company?: string
  blog?: string
}

export interface GitHubRepository {
  id: number
  name: string
  full_name: string
  description?: string
  html_url: string
  language?: string
  stargazers_count: number
  forks_count: number
  updated_at: string
  topics: string[]
  private: boolean
  fork: boolean
}

export interface GitHubSearchResponse {
  total_count: number
  incomplete_results: boolean
  items: GitHubUser[]
}

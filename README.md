# GitHub Explorer

A modern React application built with Next.js, TypeScript, and Tailwind CSS that allows users to search for GitHub users and explore their repositories.

## Features

- **User Search**: Search for up to 5 GitHub users with autocomplete functionality
- **Repository Explorer**: View all public repositories for selected users
- **Advanced Filtering**: Filter repositories by language and sort by various criteria
- **Responsive Design**: Fully responsive design that works on all devices
- **Error Handling**: Comprehensive error handling with retry functionality
- **Loading States**: Smooth loading animations and skeleton screens
- **Keyboard Navigation**: Full keyboard support for accessibility
- **Offline Detection**: Detects network connectivity issues
- **Rate Limit Handling**: Graceful handling of GitHub API rate limits

## Tech Stack

- **Framework**: Next.js 14 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS with custom design tokens
- **UI Components**: Shadcn/ui components
- **Icons**: Lucide React
- **API**: GitHub REST API v3

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

1. Clone the repository:
\`\`\`bash
git clone <repository-url>
cd github-explorer
\`\`\`

2. Install dependencies:
\`\`\`bash
npm install
# or
yarn install
\`\`\`

3. Run the development server:
\`\`\`bash
npm run dev
# or
yarn dev
\`\`\`

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Usage

1. **Search Users**: Type a GitHub username in the search box to find users
2. **Select User**: Click on a user from the dropdown to view their profile and repositories
3. **Filter Repositories**: Use the search and filter options to find specific repositories
4. **View Repository**: Click on repository names to open them on GitHub

## Features in Detail

### User Search
- Real-time search with debouncing
- Displays user avatar, name, bio, location, and company
- Shows repository and follower counts
- Keyboard navigation support (arrow keys, enter, escape)

### Repository Display
- Grid and list view modes (desktop only)
- Language indicators with color coding
- Star and fork counts
- Last updated timestamps
- Repository topics as badges
- Sorting by update date, stars, or name
- Language filtering

### Error Handling
- Network connectivity detection
- GitHub API rate limit handling
- Request timeout handling
- User-friendly error messages with retry options

### Accessibility
- Keyboard navigation
- Screen reader support
- Focus management
- Semantic HTML structure

## API Usage

This application uses the GitHub REST API v3:
- User search: `GET /search/users`
- User details: `GET /users/{username}`
- User repositories: `GET /users/{username}/repos`

No authentication is required, but the API has rate limits for unauthenticated requests (60 requests per hour per IP).

## Deployment

The application can be deployed to any platform that supports Next.js:

### Vercel (Recommended)
\`\`\`bash
npm run build
vercel --prod
\`\`\`

### GitHub Pages
\`\`\`bash
npm run build
npm run export
# Deploy the `out` folder to GitHub Pages
\`\`\`

### Other Platforms
\`\`\`bash
npm run build
npm start
\`\`\`

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Commit your changes: `git commit -am 'Add feature'`
4. Push to the branch: `git push origin feature-name`
5. Submit a pull request

## License

This project is licensed under the MIT License.

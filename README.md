# KT Open Play - Warhammer 40k Kill Team Statistics Tracker

A comprehensive web application for tracking Warhammer 40k Kill Team battles, analyzing statistics, and competing on global leaderboards.

## Features

- **Game Submission**: Record detailed match results including players, factions, killzones, tactical operations, and victory points
- **Global Statistics**: View comprehensive statistics including faction win rates, average scores, and game trends
- **Leaderboards**: Compete with players worldwide based on Elo ratings, wins, and performance metrics
- **Match History**: Browse complete game logs with detailed information and filtering options
- **Player Profiles**: Click on any player to view detailed statistics, favorite kill teams, and most played opponents
- **Elo Rating System**: Adaptive Elo calculation with K-factors based on player experience
- **Manual Date Entry**: Record historical games with custom timestamps

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Database**: Supabase (PostgreSQL)
- **Styling**: Tailwind CSS v4
- **UI Components**: shadcn/ui
- **Deployment**: Vercel

## Getting Started

### Prerequisites

- Node.js 18+ installed
- A Supabase account and project
- Git

### Installation

1. Clone the repository:
\`\`\`bash
git clone <your-repo-url>
cd killteam-stats
\`\`\`

2. Install dependencies:
\`\`\`bash
npm install
\`\`\`

3. Set up environment variables:

Create a `.env.local` file in the root directory with the following variables:

\`\`\`env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# Supabase Database (automatically provided by Supabase integration)
POSTGRES_URL=your_postgres_connection_string
POSTGRES_PRISMA_URL=your_postgres_prisma_url
POSTGRES_URL_NON_POOLING=your_postgres_non_pooling_url
POSTGRES_USER=your_postgres_user
POSTGRES_PASSWORD=your_postgres_password
POSTGRES_DATABASE=your_postgres_database
POSTGRES_HOST=your_postgres_host
\`\`\`

4. Set up the database:

Run the SQL scripts in order in your Supabase SQL Editor:

\`\`\`bash
scripts/001_create_tables.sql
scripts/002_seed_factions.sql
scripts/003_update_schema.sql
scripts/004_seed_reference_data.sql
scripts/005_add_primary_op.sql
scripts/007_add_elo_system.sql
\`\`\`

5. Run the development server:
\`\`\`bash
npm run dev
\`\`\`

6. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Database Schema

The application uses the following main tables:

- **players**: Player information and Elo ratings
- **games**: Match records with scores and Elo changes
- **killteams**: Available factions/kill teams
- **killzones**: Map/terrain configurations
- **tacops**: Tactical operations
- **critops**: Critical operations
- **primaryops**: Primary objectives
- **countries**: Country/region data

## Elo Rating System

The app uses an adaptive Elo rating system:
- Starting Elo: 1200
- K-factor: 32 (first 20 games), 24 (21-50 games), 16 (50+ games)
- Win = 1.0, Loss = 0.0, Draw = 0.5

To recalculate all Elo ratings, run:
\`\`\`sql
scripts/011_recalculate_elo_fixed.sql
\`\`\`

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## Privacy

This application collects and stores:
- Player tags (usernames)
- Game statistics (scores, factions, dates)
- Country/region information (optional)

No personal information (email, real names, etc.) is collected. See our [Privacy Policy](/privacy) for more details.

## License

GPLv3 - feel free to use this project for your own Kill Team community!

## Support

For issues or questions, please open an issue on GitHub.

---

Built with ❤️ for the Warhammer 40k Kill Team community

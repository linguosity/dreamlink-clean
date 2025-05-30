<h1 align="center">Dreamlink</h1>

<p align="center">
 A dream journal application that leverages AI for dream analysis with biblical references
</p>

<p align="center">
  <a href="#features"><strong>Features</strong></a> ·
  <a href="#tech-stack"><strong>Tech Stack</strong></a> ·
  <a href="#quick-start"><strong>Quick Start</strong></a> ·
  <a href="#development-workflow"><strong>Development Workflow</strong></a>
</p>
<br/>

## Features

- Dream journaling and storage
- AI-powered dream analysis
- Biblical citation matching for dream symbolism
- User profiles with preferences
- Subscription system with tiered access
- Cookie-based authentication with Supabase
- Mobile-responsive design

## Tech Stack

- **Frontend**: Next.js (App Router), React, Tailwind CSS, shadcn/ui
- **Backend**: Supabase (PostgreSQL database, Auth, Edge Functions)
- **Authentication**: Supabase Auth with cookie-based sessions
- **AI**: OpenAI/ChatGPT integration via Supabase Edge Functions

## Quick Start

First, make sure you have a Supabase project set up with the proper environment variables.

1. Clone the repository and install dependencies:

```bash
git clone https://github.com/yourusername/dreamlink.git
cd dreamlink
npm install
```

2. Set up environment variables by copying `.env.example` to `.env.local`:

```bash
cp .env.example .env.local
```

3. Update the following in `.env.local`:

```
NEXT_PUBLIC_SUPABASE_URL=[INSERT SUPABASE PROJECT URL]
NEXT_PUBLIC_SUPABASE_ANON_KEY=[INSERT SUPABASE PROJECT API ANON KEY]
```

4. Run the development server:

```bash
npm run dev
```

The application should now be running on [localhost:3000](http://localhost:3000/).

## Development Workflow

### Using Claude Code

To get help from Claude for this project, run:

```bash
# Start Claude Code in the project context
./start-claude.sh
```

This will:
1. Navigate to the project directory
2. Start a Claude Code CLI session in the project context

### Automated Error Fixing

This project includes an automated error detection and correction workflow:

```bash
# Run the error detection and fixing workflow
npm run fix
```

This script will:
1. Run TypeScript type checking
2. Run linting
3. Build the project
4. Capture any errors
5. Use Claude to analyze errors and suggest fixes
6. Guide you through fixing issues

### Available Scripts

- `npm run dev` - Start the development server
- `npm run build` - Build the application
- `npm run start` - Start the production server
- `npm run lint` - Run linting
- `npm run typecheck` - Run TypeScript type checking
- `npm run fix` - Run the error detection and fixing workflow

# Garage Management System

A modern web application for managing garage operations, built with Next.js and Supabase.

## Features

- Vehicle Management
- Service Records
- Customer Management
- Real-time Updates
- Responsive Design

## Tech Stack

- Frontend: Next.js 14
- Database: Supabase
- Authentication: Supabase Auth
- Styling: Tailwind CSS

## Project Structure

```
garage-management-system/
│
├── src/
│   ├── app/              # Next.js app directory
│   ├── components/       # React components
│   ├── lib/             # Utility functions
│   └── types/           # TypeScript types
│
├── public/              # Static files
│
└── package.json         # Project dependencies
```

## Environment Variables

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## Getting Started

1. Clone the repository
2. Install dependencies: `npm install`
3. Set up environment variables
4. Run development server: `npm run dev`

## Deployment

The application can be easily deployed on Vercel:

1. Push your code to GitHub
2. Import the project in Vercel
3. Add environment variables
4. Deploy 
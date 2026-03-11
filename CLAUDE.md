# CareHaven PH - Project Guide

## Overview
CareHaven PH is an assisted living facility marketplace for the Philippines. Families can browse facilities via an interactive Philippine map, manage patient profiles, and track daily health monitoring results.

## Tech Stack
- **Framework**: Next.js 14 (App Router) + TypeScript
- **Styling**: Tailwind CSS v4
- **Database**: Supabase (Postgres + Auth)
- **Charts**: Recharts
- **Icons**: Lucide React
- **Deployment**: Vercel
- **Repository**: GitHub

## Brand & Design
### Colors
- Primary Navy: `#2D3748`
- Caring Teal: `#2DD1AC`
- Sunset Orange: `#d97757`
- Soft Blue: `#6a9bcc`
- Warm Cream Background: `#faf9f5`
- Soft Gray Background: `#e8e6dc`
- Text Primary: `#141413`
- Text Secondary: `#b0aea5`
- Health Green: `#788c5d`

### Typography
- Headings: Playfair Display (serif)
- Body: Lora (serif)
- UI/Nav: Poppins (sans-serif)

### Design Principles
- Warm, compassionate, accessible to elderly users
- Large text (18px+ body), high contrast
- Rounded corners (16-24px), soft shadows
- Subtle animations (fade-in, gentle hover effects)
- Filipino cultural warmth

## Project Structure
- `src/app/` — Next.js App Router pages
- `src/components/` — Reusable React components
- `src/lib/` — Utilities, Supabase clients, types, constants
- `src/hooks/` — Custom React hooks
- `public/assets/` — Images, videos, maps, fonts
- `supabase/migrations/` — Database migration SQL files

## Commands
- `npm run dev` — Start development server
- `npm run build` — Production build
- `npm run lint` — Run ESLint

## Key Conventions
- Use TypeScript strict mode
- Use Supabase RLS for data security
- Server components by default, 'use client' only when needed
- All health data uses proper medical units
- Phone numbers use Philippine format (+63)

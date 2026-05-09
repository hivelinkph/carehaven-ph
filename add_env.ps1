$ErrorActionPreference = "Continue"

Write-Output "https://xustleeqkwxffbtcohil.supabase.co" | npx vercel env add NEXT_PUBLIC_SUPABASE_URL production

Write-Output "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh1c3RsZWVxa3d4ZmZidGNvaGlsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzMxNjc0NjYsImV4cCI6MjA4ODc0MzQ2Nn0.mFgf0lJhYIq9x0-7C71R6CsAJPGoEa3TmuLZM85vaaA" | npx vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY production

Write-Output "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh1c3RsZWVxa3d4ZmZidGNvaGlsIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MzE2NzQ2NiwiZXhwIjoyMDg4NzQzNDY2fQ.9wf-R6uDw6_4nTuTwNZF7oSh4ldXCXcAJNp9Ovvx7bo" | npx vercel env add SUPABASE_SERVICE_ROLE_KEY production

Write-Output "fc-a0afeab63a8843b29ba191de6260a1b1" | npx vercel env add FIRECRAWL_API_KEY production

Write-Output "https://genuine-careph.vercel.app" | npx vercel env add NEXT_PUBLIC_APP_URL production

Write-Output "SeniorLiving PH" | npx vercel env add NEXT_PUBLIC_APP_NAME production

# Read GEMINI_API_KEY from $env or prompt — never hard-code.
if (-not $env:GEMINI_API_KEY) { $env:GEMINI_API_KEY = Read-Host "Paste your GEMINI_API_KEY" }
Write-Output $env:GEMINI_API_KEY | npx vercel env add GEMINI_API_KEY production

npx vercel --prod --yes

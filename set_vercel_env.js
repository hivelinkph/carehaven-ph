const { execSync } = require('child_process');
const fs = require('fs');

const envs = {
    "NEXT_PUBLIC_SUPABASE_URL": "https://xustleeqkwxffbtcohil.supabase.co",
    "NEXT_PUBLIC_SUPABASE_ANON_KEY": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh1c3RsZWVxa3d4ZmZidGNvaGlsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzMxNjc0NjYsImV4cCI6MjA4ODc0MzQ2Nn0.mFgf0lJhYIq9x0-7C71R6CsAJPGoEa3TmuLZM85vaaA",
    "SUPABASE_SERVICE_ROLE_KEY": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh1c3RsZWVxa3d4ZmZidGNvaGlsIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MzE2NzQ2NiwiZXhwIjoyMDg4NzQzNDY2fQ.9wf-R6uDw6_4nTuTwNZF7oSh4ldXCXcAJNp9Ovvx7bo",
    "FIRECRAWL_API_KEY": "fc-a0afeab63a8843b29ba191de6260a1b1",
    "NEXT_PUBLIC_APP_URL": "https://genuine-careph.vercel.app",
    "NEXT_PUBLIC_APP_NAME": "CareHaven PH"
};

for (const [key, value] of Object.entries(envs)) {
    console.log(`Setting ${key}...`);
    try {
        execSync(`npx vercel env rm ${key} production -y`, { stdio: 'ignore' });
    } catch (e) { }
    try {
        execSync(`npx vercel env rm ${key} preview -y`, { stdio: 'ignore' });
    } catch (e) { }
    try {
        execSync(`npx vercel env rm ${key} development -y`, { stdio: 'ignore' });
    } catch (e) { }

    // Write value to a temp file
    fs.writeFileSync('.temp_env_val', value);
    try {
        execSync(`npx vercel env add ${key} production < .temp_env_val`, { stdio: 'inherit', shell: true });
        execSync(`npx vercel env add ${key} preview < .temp_env_val`, { stdio: 'inherit', shell: true });
        execSync(`npx vercel env add ${key} development < .temp_env_val`, { stdio: 'inherit', shell: true });
    } catch (e) { console.error(`Failed to set ${key}`, e.message); }
}
fs.unlinkSync('.temp_env_val');

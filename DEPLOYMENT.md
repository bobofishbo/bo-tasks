# Vercel Deployment Guide

## Prerequisites
1. A Vercel account (sign up at [vercel.com](https://vercel.com))
2. Your Supabase project set up with the database schema
3. Your Supabase URL and anon key

## Step 1: Prepare Your Repository

Make sure your code is pushed to a Git repository (GitHub, GitLab, or Bitbucket).

```bash
git add .
git commit -m "Prepare for deployment"
git push origin main
```

## Step 2: Deploy to Vercel

### Option A: Deploy via Vercel Dashboard

1. Go to [vercel.com](https://vercel.com) and sign in
2. Click "Add New Project"
3. Import your Git repository
4. Vercel will auto-detect Next.js settings
5. **Before clicking Deploy**, configure environment variables (see Step 3)

### Option B: Deploy via Vercel CLI

```bash
# Install Vercel CLI
npm i -g vercel

# Login to Vercel
vercel login

# Deploy (follow prompts)
vercel

# For production deployment
vercel --prod
```

## Step 3: Configure Environment Variables (CRITICAL)

**Never commit your `.env.local` file to Git!**

### In Vercel Dashboard:

1. Go to your project settings
2. Navigate to **Settings → Environment Variables**
3. Add the following variables:

```
NEXT_PUBLIC_SUPABASE_URL = your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY = your_supabase_anon_key
```

4. Select **all environments** (Production, Preview, Development)
5. Click **Save**

### Important Notes:
- ✅ Use `NEXT_PUBLIC_` prefix for client-side accessible variables
- ✅ The anon key is safe to expose in client-side code (protected by RLS)
- ❌ Never use service role key in client-side code
- ✅ Vercel automatically injects these variables at build time

## Step 4: Update Supabase RLS Policies (Security)

Your SQL schema includes basic RLS policies. For production, you should restrict access:

### Option 1: Public Read/Write (Development/Testing)
```sql
-- Already in your schema, but review if needed
CREATE POLICY "Allow all operations on tasks" ON tasks
  FOR ALL USING (true) WITH CHECK (true);
```

### Option 2: User-Based Access (Recommended for Production)

If you add authentication later:

```sql
-- Drop existing policies
DROP POLICY IF EXISTS "Allow all operations on tasks" ON tasks;
DROP POLICY IF EXISTS "Allow all operations on time_blocks" ON time_blocks;

-- Create user-based policies
CREATE POLICY "Users can view own tasks" ON tasks
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own tasks" ON tasks
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own tasks" ON tasks
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own tasks" ON tasks
  FOR DELETE USING (auth.uid() = user_id);
```

## Step 5: Verify Deployment

1. After deployment, visit your Vercel URL
2. Check the browser console for any errors
3. Test creating a task
4. Verify data is saved in Supabase dashboard

## Step 6: Custom Domain (Optional)

1. Go to **Settings → Domains**
2. Add your custom domain
3. Follow DNS configuration instructions
4. SSL certificate is automatically provisioned

## Security Checklist

- [ ] Environment variables set in Vercel (not in code)
- [ ] `.env.local` is in `.gitignore`
- [ ] Using Supabase anon key (not service role key)
- [ ] RLS policies configured appropriately
- [ ] Database schema deployed to Supabase
- [ ] HTTPS enabled (automatic with Vercel)
- [ ] No sensitive data in client-side code

## Troubleshooting

### Build Fails
- Check environment variables are set correctly
- Verify Supabase URL and key
- Review build logs in Vercel dashboard

### Database Connection Issues
- Verify Supabase URL and anon key
- Check Supabase project is active
- Ensure RLS policies allow operations

### Environment Variables Not Working
- Make sure variables start with `NEXT_PUBLIC_` for client-side
- Redeploy after adding environment variables
- Check variable names match exactly (case-sensitive)

## Continuous Deployment

Vercel automatically deploys on every push to your main branch:
- **Production**: Deploys from `main` branch
- **Preview**: Deploys from other branches/PRs

## Monitoring

- View deployment logs in Vercel dashboard
- Set up error tracking (Sentry, etc.)
- Monitor Supabase usage in Supabase dashboard


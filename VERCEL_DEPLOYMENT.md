# Vercel Deployment Guide for Umami

This guide will help you successfully deploy Umami on Vercel, especially if you're experiencing the "Database version check successful" hang issue.

## Required Environment Variables

### For Supabase Users

You need to configure **TWO** database URLs in your Vercel environment variables:

#### 1. DATABASE_URL (Connection Pooler)
This URL uses pgbouncer for connection pooling.

**Format:**
```
DATABASE_URL=postgresql://user:password@host.pooler.supabase.com:6543/postgres?pgbouncer=true&connect_timeout=15
```

**Important notes:**
- Use port `6543` (pgbouncer port)
- Include `?pgbouncer=true&connect_timeout=15` parameters
- Host should end with `.pooler.supabase.com`

#### 2. DIRECT_DATABASE_URL (Direct Connection)
This URL connects directly to the database, bypassing pgbouncer.

**For Vercel deployments, you have two options:**

**Option A: Use pooler for direct connection (Recommended for Vercel)**
```
DIRECT_DATABASE_URL=postgresql://user:password@host.pooler.supabase.com:6543/postgres
```
Note: Same as DATABASE_URL but without the `?pgbouncer=true&connect_timeout=15` parameters

**Option B: Use true direct connection (requires Supabase port 5432 access)**
```
DIRECT_DATABASE_URL=postgresql://user:password@host.supabase.com:5432/postgres
```

**Important notes:**
- If port 5432 is not accessible from Vercel, use Option A
- Port 5432 may need to be enabled in Supabase dashboard under Settings > Database > Connection Pooling

### For Other PostgreSQL Providers

If you're not using Supabase, you still need both environment variables:

```
DATABASE_URL=postgresql://username:password@host:port/database
DIRECT_DATABASE_URL=postgresql://username:password@host:port/database
```

For non-pooled connections, both can be the same URL.

## Additional Environment Variables

Make sure you also have:
```
APP_SECRET=your-random-secret-key
```

### Optional: Skip Database Migrations

If your database is already set up with migrations applied, you can skip migrations during build:
```
SKIP_DB_MIGRATION=true
```

**When to use this:**
- Database is already migrated
- You're doing a rebuild/redeploy
- Port 5432 is not accessible and you don't need migrations

**When NOT to use this:**
- First deployment with a new database
- After pulling code with new migrations

## Vercel Configuration

The `vercel.json` file has been configured with:
- **Custom build command**: Uses the standard `npm run build` which includes database setup
- **Install command**: Uses `npm install --legacy-peer-deps` to handle React 19 peer dependency conflicts

Note: The `--legacy-peer-deps` flag is required because the project uses React 19, but some dependencies still expect React 18.

## Troubleshooting

### Build Still Hanging?

1. **Check Database Connectivity**: Ensure your database is accessible from Vercel's network
2. **Verify Environment Variables**: Double-check both `DATABASE_URL` and `DIRECT_DATABASE_URL` are set correctly
3. **Check Password Encoding**: Special characters in passwords may need URL encoding
4. **Review Vercel Logs**: Look for errors after the "Database version check successful" message

### Migration Issues

If you have pending migrations that are causing issues, run locally:

```bash
npx prisma migrate resolve --applied "migration_name"
npx prisma migrate deploy
```

Then redeploy to Vercel.

### Common Mistakes

- ❌ Using the same port (6543) for both URLs
- ❌ Missing pgbouncer parameters on DATABASE_URL
- ❌ Including pgbouncer parameters on DIRECT_DATABASE_URL
- ❌ Not URL-encoding special characters in passwords
- ❌ Using `.pooler.supabase.com` for DIRECT_DATABASE_URL

### Port Reference for Supabase

| Connection Type | Port | Host Pattern | URL Parameter |
|----------------|------|--------------|---------------|
| Pooled (DATABASE_URL) | 6543 | `*.pooler.supabase.com` | `?pgbouncer=true&connect_timeout=15` |
| Direct (DIRECT_DATABASE_URL) | 5432 | `*.supabase.com` | None |

## Deployment Steps

1. Set up both environment variables in Vercel dashboard
2. Push your code changes (including the updated `schema.prisma` and `vercel.json`)
3. Trigger a new deployment
4. Monitor the build logs

## Need Help?

If you're still experiencing issues:
- Check Vercel's deployment logs for specific errors
- Verify your database is accepting connections
- Ensure your database user has the correct permissions
- Try connecting to your database using a PostgreSQL client to verify credentials

# 🚀 Crypto Dashboard Deployment Guide

## Vercel Deployment (Recommended)

### 1. Prepare Your Repository
```bash
# Make sure all changes are committed
git add .
git commit -m "Add production features and optimizations"
git push origin main
```

### 2. Deploy to Vercel

#### Option A: Vercel CLI
```bash
# Install Vercel CLI
npm i -g vercel

# Login to Vercel
vercel login

# Deploy
vercel

# Follow the prompts:
# - Set up and deploy? Y
# - Which scope? (your account)
# - Link to existing project? N
# - Project name? crypto-dashboard
# - Directory? ./
# - Override settings? N
```

#### Option B: Vercel Dashboard
1. Go to [vercel.com](https://vercel.com)
2. Click "New Project"
3. Import your GitHub repository
4. Configure environment variables (see below)
5. Click "Deploy"

### 3. Environment Variables

Set these in your Vercel project settings:

```env
# Database
DATABASE_URL="your-database-url"

# NextAuth.js
NEXTAUTH_URL="https://your-domain.vercel.app"
NEXTAUTH_SECRET="your-secret-key"

# Email Configuration
SMTP_HOST="smtp.gmail.com"
SMTP_PORT="587"
SMTP_USER="your-email@gmail.com"
SMTP_PASS="your-app-password"
SMTP_FROM="noreply@yourdomain.com"
```

### 4. Database Setup

#### Option A: Vercel Postgres (Recommended)
1. Go to your Vercel project dashboard
2. Click "Storage" tab
3. Create a new Postgres database
4. Copy the connection string to `DATABASE_URL`

#### Option B: External Database
- **PlanetScale** (MySQL)
- **Supabase** (PostgreSQL)
- **Railway** (PostgreSQL)
- **Neon** (PostgreSQL)

### 5. Update Prisma Schema for Production

```prisma
// prisma/schema.prisma
datasource db {
  provider = "postgresql" // or "mysql" for PlanetScale
  url      = env("DATABASE_URL")
}
```

### 6. Deploy Database Changes

```bash
# Generate Prisma client
npx prisma generate

# Push schema to production database
npx prisma db push

# Or run migrations
npx prisma migrate deploy
```

## AWS Deployment

### 1. Using AWS Amplify
1. Connect your GitHub repository
2. Configure build settings:
   ```yaml
   version: 1
   frontend:
     phases:
       preBuild:
         commands:
           - npm install
           - npx prisma generate
       build:
         commands:
           - npm run build
     artifacts:
       baseDirectory: .next
       files:
         - '**/*'
   ```

### 2. Using AWS EC2
1. Launch an EC2 instance (Ubuntu 20.04)
2. Install Node.js and dependencies
3. Set up PM2 for process management
4. Configure Nginx as reverse proxy
5. Set up SSL with Let's Encrypt

## Performance Optimizations

### 1. Image Optimization
- Use Next.js Image component
- Implement lazy loading
- Optimize image formats (WebP, AVIF)

### 2. Caching
- Implement Redis for session storage
- Use CDN for static assets
- Enable browser caching

### 3. Database Optimization
- Add proper indexes
- Use connection pooling
- Implement query optimization

### 4. Monitoring
- Set up error tracking (Sentry)
- Monitor performance (Vercel Analytics)
- Set up uptime monitoring

## Security Checklist

- [ ] Environment variables secured
- [ ] HTTPS enabled
- [ ] CORS configured properly
- [ ] Rate limiting implemented
- [ ] Input validation on all forms
- [ ] SQL injection protection (Prisma)
- [ ] XSS protection enabled
- [ ] CSRF protection (NextAuth.js)

## Post-Deployment

### 1. Test All Features
- User registration and login
- Widget creation and configuration
- Real-time data updates
- Social features (sharing, comments)

### 2. Monitor Performance
- Check Core Web Vitals
- Monitor API response times
- Track error rates

### 3. Set Up Analytics
- Google Analytics
- Vercel Analytics
- Custom event tracking

## Troubleshooting

### Common Issues

1. **Database Connection Errors**
   - Check DATABASE_URL format
   - Verify database is accessible
   - Check Prisma schema compatibility

2. **Email Not Sending**
   - Verify SMTP credentials
   - Check email provider settings
   - Test with a simple email first

3. **Build Failures**
   - Check Node.js version compatibility
   - Verify all dependencies are installed
   - Check for TypeScript errors

4. **Environment Variables**
   - Ensure all required variables are set
   - Check variable names match exactly
   - Verify no typos in values

### Support

For deployment issues:
1. Check Vercel/AWS logs
2. Review build output
3. Test locally first
4. Check environment variables

## Next Steps

After successful deployment:
1. Set up custom domain
2. Configure SSL certificate
3. Set up monitoring and alerts
4. Plan for scaling
5. Implement backup strategies

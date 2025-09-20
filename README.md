# 🚀 Crypto Dashboard - Advanced Trading & Analytics Platform

A comprehensive, production-ready crypto dashboard with real-time data, social features, and advanced trading tools.

## ✨ Features

### 🔐 Authentication & Security
- **User Registration** with email verification
- **Secure Login** with NextAuth.js
- **Password Validation** with strength requirements
- **Session Management** with secure cookies
- **CSRF Protection** and input validation

### 💰 Crypto Widgets
- **Portfolio Tracker** - Track investments with real-time P&L
- **Price Alerts** - Get notified of price movements
- **Donations Widget** - Accept crypto donations with wallet integration
- **Buy Bot** - Automated trading functionality
- **Market Cap** - Live market data and analytics
- **Price Charts** - Interactive price visualization

### 🌐 Social Features
- **Widget Sharing** - Share widgets with the community
- **Comments System** - Community feedback and discussion
- **Collaboration** - Work together on widget configurations
- **Public Gallery** - Discover and use community widgets

### 📊 Real-Time Data
- **Live Price Feeds** - CoinGecko API integration
- **WebSocket Support** - Real-time price updates
- **Portfolio Tracking** - Investment performance monitoring
- **Market Analytics** - Comprehensive market insights

### 🎨 Advanced UI/UX
- **Modern Design** - Tailwind CSS with dark theme
- **Responsive Layout** - Works on all devices
- **Interactive Components** - Smooth animations and transitions
- **Customizable Themes** - Personalize your experience

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- npm or pnpm
- Git

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/yourusername/crypto-dashboard.git
cd crypto-dashboard
```

2. **Install dependencies**
```bash
npm install
# or
pnpm install
```

3. **Set up environment variables**
```bash
cp .env.example .env.local
```

4. **Configure your environment**
Edit `.env.local` with your settings:
```env
# Database
DATABASE_URL="file:./dev.db"

# NextAuth.js
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key"

# Email Configuration
SMTP_HOST="smtp.gmail.com"
SMTP_PORT="587"
SMTP_USER="your-email@gmail.com"
SMTP_PASS="your-app-password"
SMTP_FROM="noreply@yourdomain.com"
```

5. **Set up the database**
```bash
npx prisma generate
npx prisma db push
```

6. **Start the development server**
```bash
npm run dev
```

7. **Open your browser**
Visit `http://localhost:3000`

## 📱 Available Pages

- **Dashboard** - `/` - Main dashboard with analytics
- **Configure** - `/configure` - Widget configuration
- **Sign Up** - `/auth/signup` - User registration
- **Sign In** - `/auth/signin` - User login
- **Community** - `/community` - Shared widgets gallery
- **Analytics** - `/analytics` - Usage analytics

## 🛠️ Widget Types

### 1. Portfolio Tracker
Track your cryptocurrency investments with real-time P&L calculations.

**Features:**
- Add/remove crypto positions
- Real-time price updates
- Profit/loss calculations
- Performance percentages
- Portfolio summary

### 2. Price Alerts
Set up automated alerts for price movements.

**Features:**
- Above/below price alerts
- Email notifications
- Sound alerts
- Multiple alert management
- Real-time price monitoring

### 3. Donations Widget
Accept cryptocurrency donations with wallet integration.

**Features:**
- Multiple wallet support (Phantom, Solflare, Coinbase)
- Token selection
- Custom donation URLs
- Minimum amount settings
- QR code generation

### 4. Buy Bot
Automated trading functionality for crypto purchases.

**Features:**
- Real-time buy alerts
- Tier-based notifications
- Audio feedback
- Custom buy amounts
- Transaction tracking

### 5. Market Cap Widget
Live market data and analytics.

**Features:**
- Real-time market cap data
- Price change tracking
- Volume analysis
- Market trends
- Customizable display

## 🔧 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `GET /api/auth/verify-email` - Email verification
- `POST /api/auth/signin` - User login

### Crypto Data
- `GET /api/crypto/prices` - Get crypto prices
- `GET /api/crypto/prices?symbol=bitcoin` - Get specific crypto price

### Widgets
- `POST /api/widgets/share` - Share a widget
- `GET /api/widgets/comments` - Get widget comments
- `POST /api/widgets/comments` - Add a comment

### Analytics
- `GET /api/analytics/summary` - Get analytics summary
- `POST /api/analytics/track` - Track user actions

## 🚀 Deployment

### Vercel (Recommended)

1. **Connect to Vercel**
```bash
npm i -g vercel
vercel login
vercel
```

2. **Set environment variables** in Vercel dashboard:
   - `DATABASE_URL`
   - `NEXTAUTH_URL`
   - `NEXTAUTH_SECRET`
   - `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `SMTP_FROM`

3. **Deploy**
```bash
vercel --prod
```

### Other Platforms

See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed deployment instructions for:
- AWS Amplify
- AWS EC2
- Railway
- Heroku

## 🗄️ Database Schema

The application uses Prisma with SQLite (development) or PostgreSQL (production).

### Key Models
- **User** - User accounts and authentication
- **Preset** - Saved widget configurations
- **SharedWidget** - Community-shared widgets
- **WidgetComment** - Comments on widgets
- **VerificationToken** - Email verification
- **ResetToken** - Password reset

## 🔒 Security Features

- **Password Hashing** - bcrypt with salt rounds
- **Email Verification** - Secure token-based verification
- **CSRF Protection** - Built-in NextAuth.js protection
- **Input Validation** - Comprehensive form validation
- **Rate Limiting** - API rate limiting
- **SQL Injection Protection** - Prisma ORM protection

## 📊 Performance

- **Next.js 14** - Latest framework optimizations
- **Image Optimization** - Automatic image optimization
- **Caching** - Intelligent caching strategies
- **Code Splitting** - Automatic code splitting
- **Bundle Analysis** - Optimized bundle sizes

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

- **Documentation** - Check the `/docs` folder
- **Issues** - Open an issue on GitHub
- **Discussions** - Use GitHub Discussions for questions
- **Email** - Contact support@yourdomain.com

## 🎯 Roadmap

### Upcoming Features
- [ ] Mobile app (React Native)
- [ ] Advanced charting (TradingView integration)
- [ ] Social trading features
- [ ] API rate limiting dashboard
- [ ] Advanced analytics
- [ ] Multi-language support
- [ ] Dark/light theme toggle
- [ ] Widget marketplace

### Recent Updates
- ✅ Real-time crypto data feeds
- ✅ Social widget sharing
- ✅ Portfolio tracking
- ✅ Price alerts system
- ✅ Production deployment setup
- ✅ Advanced authentication
- ✅ Community features

## 🙏 Acknowledgments

- **Next.js** - React framework
- **Tailwind CSS** - Styling
- **Prisma** - Database ORM
- **NextAuth.js** - Authentication
- **CoinGecko** - Crypto data API
- **Lucide React** - Icons

---

**Built with ❤️ for the crypto community**

[Live Demo](https://your-dashboard.vercel.app) | [Documentation](./docs) | [Support](./support)

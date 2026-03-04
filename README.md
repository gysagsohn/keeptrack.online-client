<p align="center">
  <a href="https://github.com/gysagsohn/keeptrack.online-client">
    <img src="https://img.shields.io/github/stars/gysagsohn/keeptrack.online-client?style=social" alt="GitHub stars">
  </a>
  <a href="https://keeptrack.online">
    <img src="https://img.shields.io/netlify/54a5c9e5-9595-48c7-a422-221e8a15bc1d?label=Netlify%20Deploy&logo=netlify" alt="Netlify frontend">
  </a>
  <a href="https://game-tracker-server-zq2k.onrender.com">
    <img src="https://img.shields.io/badge/Render-Backend-green?logo=render" alt="Render backend">
  </a>
  <img src="https://img.shields.io/badge/status-Live-brightgreen" alt="App status">
</p>

# Keep Track – Frontend

React + Vite frontend for Keep Track, a full-stack MERN application for tracking board and card game results with friends.

**Live Application:** [https://keeptrack.online](https://keeptrack.online)
**Backend Repository:** [keeptrack.online-server](https://github.com/gysagsohn/keeptrack.online-server)

---

## Tech Stack

**Core:**
- React 19 with Hooks
- Vite 7 (build tooling)
- Tailwind CSS 4 (styling with custom design tokens)
- React Router DOM 7 (routing & navigation)

**State Management:**
- React Context API (authentication, toast notifications)
- localStorage for JWT token persistence

**HTTP Client:**
- Axios with interceptors for automatic token injection and 401 handling

**UI Components:**
- React Icons (navigation icons)
- React Day Picker (date selection)
- date-fns (date formatting)

**Development:**
- ESLint (code quality)
- PostCSS + Autoprefixer

---

## Project Structure
```
keeptrack-client/
├── public/
│   ├── _redirects              # Netlify SPA routing config
│   ├── 404.html                # Custom 404 page
│   ├── logo.png
│   └── favicon.ico
├── src/
│   ├── assets/
│   │   ├── logo.png
│   │   ├── google-logo.svg
│   │   └── wireframes/         # Design mockups
│   ├── components/
│   │   ├── ui/                 # Reusable UI components
│   │   │   ├── Button.jsx
│   │   │   ├── Card.jsx
│   │   │   ├── Input.jsx
│   │   │   ├── Skeleton.jsx
│   │   │   ├── PasswordInput.jsx
│   │   │   ├── PasswordStrength.jsx
│   │   │   └── LogoutButton.jsx
│   │   ├── nav/                # Navigation components
│   │   │   ├── SideNav.jsx     # Desktop navigation
│   │   │   └── MobileNav.jsx   # Mobile bottom nav
│   │   ├── friends/
│   │   │   └── FriendSearch.jsx
│   │   ├── forms/
│   │   │   ├── GameSelect.jsx
│   │   │   └── PlayersField.jsx
│   │   ├── dashboard/
│   │   │   ├── ActionButtons.jsx
│   │   │   ├── LastGameCard.jsx
│   │   │   └── StatsCard.jsx
│   │   ├── matches/
│   │   │   ├── ActivityLog.jsx
│   │   │   └── MatchCard.jsx
│   │   ├── AuthedShell.jsx     # Layout wrapper for authenticated routes
│   │   ├── ProtectedRoute.jsx  # Route protection HOC
│   │   ├── ErrorBoundary.jsx   # Error handling
│   │   ├── DateInput.jsx       # Date picker component
│   │   └── GoogleButton.jsx    # OAuth button
│   ├── contexts/
│   │   ├── AuthProvider.jsx    # Authentication state
│   │   ├── AuthContextBase.js
│   │   ├── useAuth.js          # Auth hook
│   │   ├── ToastProvider.jsx   # Toast notifications
│   │   ├── toastContext.js
│   │   └── useToast.js         # Toast hook
│   ├── lib/
│   │   ├── axios.js            # Configured axios instance
│   │   └── api/                # API service layer
│   │       ├── friends.js
│   │       ├── notifications.js
│   │       └── sessions.js
│   ├── pages/
│   │   ├── Login.jsx
│   │   ├── Signup.jsx
│   │   ├── ForgotPassword.jsx
│   │   ├── ResetPassword.jsx
│   │   ├── CheckEmail.jsx
│   │   ├── VerifyEmail.jsx
│   │   ├── OAuthSuccess.jsx
│   │   ├── Dashboard.jsx
│   │   ├── Matches.jsx
│   │   ├── NewMatch.jsx
│   │   ├── MatchDetail.jsx
│   │   ├── Friends.jsx
│   │   ├── FriendRequests.jsx
│   │   ├── Profile.jsx
│   │   ├── Notifications.jsx
│   │   └── AddGame.jsx
│   ├── utils/
│   │   ├── validators.js       # Form validation helpers
│   │   └── tokenStorage.js     # Token management utility
│   ├── constants/
│   │   └── notificationTypes.js
│   ├── App.jsx                 # Route configuration
│   ├── main.jsx                # Application entry point
│   └── index.css               # Global styles & design tokens
├── .env                        # Production environment variables
├── .env.development            # Development environment variables
├── .gitignore
├── eslint.config.js
├── index.html
├── package.json
├── postcss.config.js
├── tailwind.config.js
├── vite.config.js
└── README.md
```

---

## Features

### Authentication & Authorization
- Email/password authentication with JWT tokens (7-day expiry)
- Google OAuth integration via Passport.js
- Email verification required before login
- Secure password reset with auto-login
- Session persistence with localStorage
- Protected routes with automatic redirect on 401
- Client-side validation with inline error messages
- Password strength indicator with real-time feedback
- CapsLock warning on password fields
- Show/hide password toggle

### Match Tracking
- Create matches with multiple players (friends or guests)
- Guest player support with optional email invitations
- Match confirmation workflow (all players must confirm)
- Match editing (any player in the match)
- Match deletion (creator only)
- Decline match invitations with automatic player removal
- Detailed match view with activity log
- Score and result tracking (Win/Loss/Draw)
- Match filtering by game and result
- Match history with status indicators
- Email reminders for unconfirmed matches (rate limited)

### Friend System
- Search for users by name or email
- Send friend requests via email
- Accept/reject friend requests
- View friends list, sent requests, suggested friends
- Unfriend functionality

### Notifications
- In-app notification system with unread badge counts
- Notification types: friend requests, match invites, match updates, confirmations, declines
- Mark individual or all notifications as read
- Filter by read/unread status
- Inline accept/decline actions

### Games Library
- Browse available games
- Create custom games
- Game search and selection with autocomplete
- Game categories (Card, Board, Dice, Word, Strategy, Trivia, Party)

### UI/UX
- Mobile-first responsive design
- Desktop sidebar + mobile bottom navigation
- Skeleton loading states
- Toast notifications (success/error/info)
- Error boundary for graceful error handling
- Inline form validation
- Custom 404 page

---

## Design System

### Custom Tailwind Theme

```css
--color-default: #F5F6FA      /* Background */
--color-card: #FFFFFF          /* Card backgrounds */
--color-primary: #1E1F22       /* Primary text */
--color-secondary: #4F545C     /* Secondary text */
--color-placeholder: #8C8C8C   /* Input placeholders */
--color-link: #5865F2          /* Links */
--color-cta: #5865F2           /* Primary buttons */
--color-cta-hover: #4752C4     /* Button hover */
--color-warning: #ED4245       /* Error/warning */
--color-success: #57F287       /* Success */
--color-border-muted: #D1D5DB  /* Borders */
```

**Component Classes:**
- `.btn`, `.btn-primary`, `.btn-success`, `.btn-warning`, `.btn-sm`
- `.input`, `.input-error`, `.input-success`
- `.card`, `.shadow-card`
- `.h1`, `.h2`, `.text-secondary`

---

## Getting Started

### Prerequisites
- Node.js 18+
- Backend API running (see [keeptrack.online-server](https://github.com/gysagsohn/keeptrack.online-server))

### Installation

1. **Clone the repository**
```bash
git clone git@github.com:gysagsohn/keeptrack.online-client.git
cd keeptrack.online-client
```

2. **Install dependencies**
```bash
npm install
```

3. **Configure environment variables**

Create `.env.development` for local development:
```env
VITE_API_URL=http://localhost:3001
```

Create `.env` for production:
```env
VITE_API_URL=https://game-tracker-server-zq2k.onrender.com
```

4. **Start development server**
```bash
npm run dev
```

Application will start at `http://localhost:5173`

---

## Available Scripts
```bash
npm run dev      # Start Vite development server with HMR
npm run build    # Build for production (outputs to dist/)
npm run preview  # Preview production build locally
npm run lint     # Run ESLint for code quality checks
```

---

## Deployment

### Netlify Configuration

**Build Settings:**
- Build command: `npm run build`
- Publish directory: `dist`
- Node version: 18+

**Environment Variables:**
Add `VITE_API_URL` in Netlify dashboard → Site settings → Environment variables

**Redirects** (`public/_redirects`):
```
/oauth-success  /index.html  200
/*              /index.html  200
```

---

## Architecture

### State Management

**AuthContext** — manages user authentication state, provides `login()`, `signup()`, `logout()`, `setToken()`, `setUser()`. Automatically hydrates from token on load and handles token expiry.

**ToastContext** — global toast system. Provides `toast.success()`, `toast.error()`, `toast.info()`, `toast.loading()`. Auto-dismisses, limits to 6 simultaneous toasts.

### API Client

Axios instance with:
- Automatic JWT injection on every request
- Automatic logout + redirect on 401
- User-friendly messages for 429 rate limit responses

---

## Known Limitations & Future Improvements

- No real-time updates (requires page refresh for new data)
- Token stored in localStorage (future: httpOnly cookies)
- No automatic token refresh
- Pagination for matches and notifications (planned)
- WebSocket integration for real-time notifications (planned)
- PWA / offline support (planned)
- Comprehensive test coverage with Vitest/Playwright (planned)

### Planned Features
- **Game favourites UI** — backend toggle (`POST /games/:id/like`) is implemented; frontend UI not yet built
- **Mutual friends page** — backend endpoint (`GET /friends/mutual/:id`) is implemented; no frontend page yet  
- **Admin dashboard** — full admin API is built (user management, analytics, suspend/verify); no frontend UI yet
- **Password complexity enforcement** — currently only minimum length (8 chars) is enforced on both frontend and backend; letter + number + symbol requirement shown in UI placeholder is not yet validated server-side

### Technical Debt
- `GET /users` endpoint returns all users with no pagination; reserved for a future admin UI
- `POST /users` endpoint (raw user creation) is unvalidated; reserved for future admin tooling or should be removed
- `user.stats` fields (`wins`, `losses`, `mostPlayed`) on the User model are not currently updated — stats are calculated dynamically from sessions; `getTopPlayers` and `getUserWinRates` admin analytics will need these fields to be kept in sync before they are accurate
- Password reset complexity validation should be tightened to match frontend requirements
- JWT stored in localStorage (XSS risk); planned migration to httpOnly cookies

---

## Author

**Gy Sohn**
Full-Stack Developer
[LinkedIn](https://www.linkedin.com/in/gysohn) | [GitHub](https://github.com/gysagsohn) | [Portfolio](https://gysohn.com)

---

## License

Open source and available for educational purposes.

---

## Recent Updates

### Version 2.0 - Security & UX Enhancements (February 2026)
- Password reset auto-login — seamless UX after successful reset
- Enhanced token management via centralized `tokenStorage.js`
- Rate limit error handling with user-friendly messages
- Improved 401 handling — automatic logout and redirect
- Match decline functionality — users can decline match invitations
- Edit match — any player in the match can edit details
- ActivityLog updates correctly after match edits
- Matches list re-fetches on navigation back from match detail
- Responsive NewMatch page — card layout for players on mobile, stacked inputs, toast appears at top of screen on mobile
- Mid-range screen sizing — side margins added at tablet sizes to prevent stretched layouts

### Version 1.2 - UX & Performance (January 2026)
- Skeleton loading states across all pages
- Error boundary for graceful crash handling
- Enhanced toast notification system
- Redesigned sidebar navigation
- Real-time notification badges on nav
- Improved Friends page layout

### Version 1.1 - Profile & Security (December 2025)
- Complete profile page with user statistics
- Password change functionality
- Account deletion with confirmation
- Silent authentication check
- Improved form validation

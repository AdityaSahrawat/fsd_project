# UniConnet

A campus community platform where students can report problems, start discussions, and engage through comments in real-time with secure authentication.

## 🎯 Project Overview

UniConnet is a web application designed to give students a centralized platform to:
- **Report Campus Problems** - Submit and track campus issues (broken facilities, safety concerns, etc.)
- **Start Discussions** - Create and participate in campus-related conversations
- **Engage with Community** - Comment and interact in real-time without page reloads

## 🛠️ Tech Stack

### Frontend
- **React** - UI library for building interactive interfaces
- **React Router** - Client-side routing for SPA navigation
- **Context API** - Global state management
- **Axios** - HTTP client for API requests
- **Vite** - Fast build tool and development server
- **CSS** - Custom styling with Flexbox/Grid for responsive design

### Backend
- **Node.js** - JavaScript runtime
- **Express** - Web framework for building REST APIs
- **Prisma** - ORM for database management
- **PostgreSQL** - Database (hosted on Neon)
- **JWT** - Authentication with JSON Web Tokens
- **Nodemailer** - Email service for OTP verification
- **TypeScript** - Type-safe backend code

## 📁 Project Structure

```
fsd/
├── client/                 # Frontend React application
│   ├── src/
│   │   ├── components/    # Reusable UI components
│   │   ├── context/       # Context providers for state management
│   │   ├── pages/         # Page components
│   │   ├── App.jsx        # Main app with routing
│   │   └── main.jsx       # App entry point
│   └── package.json
│
└── server/                # Backend API
    ├── src/
    │   ├── routes/        # API route handlers
    │   ├── middleware/    # Auth middleware
    │   ├── lib/          # Utilities (Prisma, Nodemailer)
    │   └── index.ts      # Server entry point
    ├── prisma/
    │   └── schema.prisma # Database schema
    └── package.json
```

## 🚀 Features

### 1. **Problem Reporting System**
- Submit campus issues with descriptions and images
- View all reported problems
- Track problem status

### 2. **Discussion Forum**
- Create discussion topics
- Browse and search discussions
- Detailed discussion view with full conversation thread

### 3. **Real-time Comments**
- Comment on problems and discussions
- Instant updates without page refresh
- Interactive engagement

### 4. **User Authentication**
- Secure signup with email OTP verification
- Login with JWT-based authentication
- Protected routes for authenticated users
- Admin role support

### 5. **Responsive Design**
- Mobile-friendly interface
- Works on tablets and desktops
- Modern, clean UI

## 🔧 Setup & Installation

### Prerequisites
- Node.js (v16+)
- PostgreSQL database or Neon account
- npm or pnpm

### Backend Setup

1. Navigate to server directory:
```bash
cd server
```

2. Install dependencies:
```bash
npm install
```

3. Create `.env` file:
```env
DATABASE_URL="your_postgresql_connection_string"
JWT_SECRET="your_secret_key"
EMAIL_USER="your_email@gmail.com"
EMAIL_PASS="your_app_password"
PORT=5000
CLIENT_URL="http://localhost:5173"
```

4. Run database migrations:
```bash
npx prisma migrate dev
```

5. Start server:
```bash
npm run dev
```

### Frontend Setup

1. Navigate to client directory:
```bash
cd client
```

2. Install dependencies:
```bash
npm install
```

3. Start development server:
```bash
npm run dev
```

4. Open browser at `http://localhost:5173`

## 🗄️ Database Schema

### Main Models:
- **User** - Student accounts with email, name, password
- **Problem** - Reported campus issues
- **Discussion** - Forum topics
- **Comment** - Comments on problems/discussions
- **Vote** - Upvote/downvote system

## 🔐 Authentication Flow

1. User signs up with email
2. OTP sent to email via Nodemailer
3. User verifies OTP and completes signup
4. JWT token stored in HTTP-only cookies
5. Token validated on protected routes

## 🌐 API Endpoints

### Auth Routes
- `POST /api/auth/signup` - Send OTP to email
- `POST /api/auth/signup/verify` - Verify OTP and create account
- `POST /api/auth/login` - Login user
- `POST /api/auth/logout` - Logout user
- `GET /api/auth/me` - Get current user

### Problem Routes
- `GET /api/problems` - Get all problems
- `POST /api/problems` - Create new problem

### Discussion Routes
- `GET /api/discussions` - Get all discussions
- `GET /api/discussions/:id` - Get discussion detail
- `POST /api/discussions` - Create new discussion

### Comment Routes
- `POST /api/comments` - Add comment
- `GET /api/comments/:type/:id` - Get comments for problem/discussion

## 📱 How It Works

### Single Page Application (SPA)
- React Router manages navigation without page reloads
- Only data is fetched from backend, not full HTML pages
- Fast, smooth user experience

### State Management
- **Context API** provides global state (AuthContext, ProblemContext, DiscussionContext)
- Custom hooks (`useAuth`, `useProblem`, `useDiscussion`) to access state
- Avoids prop drilling and keeps code clean

### Real-time Updates
- When user posts comment/problem → API call to backend
- Backend saves to database and returns new data
- Frontend updates state with new data
- React automatically re-renders affected components
- User sees update instantly without refresh

## 🎨 Design Patterns

- **Component-based Architecture** - Reusable, modular components
- **Context Provider Pattern** - Centralized state management
- **Custom Hooks** - Encapsulated logic for reusability
- **Protected Routes** - Authentication guards
- **Responsive Design** - Mobile-first approach with media queries

## 🔮 Future Enhancements

- Search and filter functionality
- Image upload for problems/discussions
- Notification system
- Admin dashboard for problem management
- Like/dislike system for comments
- User profiles and activity tracking
- Dark mode toggle

Built with ❤️ for campus community engagement

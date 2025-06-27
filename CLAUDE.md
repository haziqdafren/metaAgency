# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

### Environment Setup
- `npm install` - Install dependencies
- Create `.env` file with Supabase credentials:
  ```
  VITE_SUPABASE_URL="YOUR_SUPABASE_URL"
  VITE_SUPABASE_ANON_KEY="YOUR_SUPABASE_ANON_KEY"
  ```

### Development
- `npm run dev` or `npm start` - Run development server on http://localhost:3000
- `npm run build` - Build for production
- `npm test` - Run tests in watch mode
- `npm run analyze` - Analyze bundle size with source-map-explorer

## Architecture Overview

### Tech Stack
- **Frontend**: React 19.1.0 with Create React App
- **Styling**: Tailwind CSS with custom Meta Agency design system
- **State Management**: Zustand for auth, theme, and sidebar state
- **Backend**: Supabase (PostgreSQL database, auth, real-time subscriptions)
- **Routing**: React Router v6 with lazy loading
- **Forms**: React Hook Form with Yup validation
- **Charts**: Chart.js and Recharts
- **Rich Text**: TipTap editor

### Project Structure
- **`src/components/`**: Reusable UI components
  - `admin/` - Admin-specific components (sidebar, calculators, etc.)
  - `common/` - Shared components (Button, Input, Navbar, etc.)
  - `sections/` - Page sections (Hero, About, Services, etc.)
- **`src/pages/`**: Page components organized by user type
  - `public/` - Public pages (Home, About, Articles, etc.)
  - `admin/` - Admin dashboard pages
  - `talent/` - Talent dashboard pages
  - `auth/` - Authentication pages
- **`src/store/`**: Zustand stores for global state
- **`src/hooks/`**: Custom React hooks
- **`src/lib/`**: External service configurations (Supabase)

### Authentication & Authorization
- Role-based access with three user types: `admin`, `talent`, `public`
- Protected routes with `ProtectedRoute` component
- Dummy admin login for testing: `admin@metaagency.id` / `admin123`
- Auth state managed via Zustand store (`src/store/authStore.js`)

### Admin Panel
- Forced light mode (admin routes disable dark theme)
- Collapsible sidebar with route-based navigation
- Dedicated layout component (`AdminLayout`) for admin pages
- Role-based access control for admin features

### Theme System
- Light/dark mode toggle for public pages
- Admin section enforces light mode only
- Custom color palette with `meta-` prefixed colors
- Theme state persisted in localStorage

### Database Integration
- Supabase client configured in `src/lib/supabase.js`
- Helper functions for common operations (auth, articles, talent data)
- Real-time subscriptions for live updates
- Separate profiles for different user roles

### Key Features
- Responsive design with mobile-first approach
- Lazy loading for performance optimization
- Custom cursor and scroll animations
- Article management system with rich text editor
- Talent performance tracking and bonus calculations
- File upload capabilities for performance data

### Brand Components (Available for Future Use)
- **`src/components/brand/MetaBrandElements.jsx`**: Custom Meta Agency visual identity components including Indonesian-inspired logo, patterns, and illustrations
- **`src/components/brand/MetaAnimations.jsx`**: Signature animation system with TikTok-style bounces and cultural elements
- **`src/components/sections/EnhancedHeroSection.jsx`**: Enhanced hero section with authentic Indonesian branding
- **Enhanced CSS classes**: Indonesian cultural styling available in `src/index.css` (batik patterns, cultural gradients, etc.)
- **Note**: Brand components use advanced Framer Motion features and react-helmet for SEO optimization
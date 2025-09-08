# KrushiLink - Farmer Resource Platform

## Project Overview
KrushiLink is a comprehensive web platform that connects farmers in Maharashtra to trusted agro-stores, government schemes, and agricultural resources. The application features complete user authentication, store directory with filtering, comment system, and distinguishes between government stores (with schemes) and private stores.

## Recent Changes (September 08, 2025)
- **MAJOR UPDATE**: Implemented complete Supabase backend integration with local database
- **Database**: Created comprehensive schema with stores, comments, and schemes tables
- **Authentication**: Enhanced user auth system with "Welcome username" + logout on every page  
- **Store System**: Complete overhaul with working filters, detailed store cards, and comment functionality
- **Government Schemes**: Added 6 government schemes for government stores
- **Comment System**: Users can add/delete their own comments (login required)
- **Filtering**: Removed taluka filter, added government/private store type filter
- **Store Data**: Added 6 sample stores (3 government, 3 private) with full details

## Project Architecture

### Frontend
- **Technology**: Enhanced HTML/CSS/JavaScript with Bootstrap 5
- **Authentication**: Supabase authentication with comprehensive state management
- **Database Integration**: Custom database.js for store management and comments
- **Hosting**: Python HTTP server serving static files
- **Port**: 5000 (configured for Replit environment)

### Backend Database
- **PostgreSQL Database**: Comprehensive schema with 4 main tables:
  - `stores` - Store information with type (government/private), services, images
  - `schemes` - Government schemes (only for government stores)
  - `comments` - User reviews and ratings for stores
  - `users` - Extended user profiles
- **Sample Data**: 6 stores across Maharashtra with complete details
- **Government Schemes**: 6 active schemes with subsidies and eligibility

### Key Features
- **Complete Authentication**: Register, login, password reset with enhanced UI
- **Store Directory**: Advanced filtering by district, type (government/private), and search
- **Store Details**: Comprehensive store information with images, services, contact details
- **Government Schemes**: Detailed scheme information for government stores only
- **Comment System**: Logged-in users can add comments and ratings, delete their own comments
- **Responsive Design**: Enhanced Bootstrap interface with improved user experience
- **User State Management**: "Welcome username" and logout displayed on every page when logged in

### File Structure
```
/
├── assets/
│   ├── images/          # Static images for the website
│   └── scripts/         # JavaScript modules
│       ├── auth.js      # Authentication logic (enhanced)
│       ├── database.js  # NEW: Complete database integration system
│       ├── supabaseClient.js # Supabase configuration
│       └── script.js    # Main application scripts
├── *.html               # HTML pages (all enhanced with new features)
├── *.css                # Stylesheets for different pages
└── replit.md            # Updated project documentation
```

### Store System Features
- **Store Types**: Government stores (with schemes) vs Private stores (no schemes)
- **Filtering**: District, type, and real-time search functionality
- **Store Cards**: Professional cards with ratings, services, and verification badges
- **Detailed View**: Modal popups with complete store information
- **Government Schemes**: Subsidy information, eligibility, and application process
- **Comment System**: User reviews with 5-star ratings

### Authentication Enhancements
- **Universal State**: Authentication status shown on all pages
- **Welcome Message**: Personalized "Welcome, username" with user icon
- **Logout Functionality**: One-click logout available everywhere
- **Enhanced UI**: Improved login/register forms with better spacing
- **Session Management**: Robust session handling across all pages

### External Dependencies
- **Bootstrap 5**: UI framework and components
- **Bootstrap Icons**: Icon library (enhanced usage)
- **Supabase**: Backend-as-a-Service for authentication
- **Python HTTP Server**: Static file serving
- **PostgreSQL**: Database for stores, comments, and schemes

### Database Schema
- **stores**: Complete store information with government/private classification
- **schemes**: Government subsidy schemes linked to government stores
- **comments**: User reviews with ratings and moderation capabilities
- **Sample Data**: Real Maharashtra districts with authentic store information

## Deployment Configuration
- **Target**: Autoscale (suitable for static websites with database)
- **Command**: `python -m http.server 5000`
- **No build process required** (static HTML/CSS/JS with database integration)
- **Database**: PostgreSQL backend for persistent data storage

## User Preferences
- Focus on complete functionality with Supabase backend integration
- Distinguish government stores (with schemes) from private stores
- Comment system only for logged-in users with delete capability
- Professional UI with enhanced user experience
- Clean, organized codebase with proper feature separation
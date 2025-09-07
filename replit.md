# KrushiLink - Farmer Resource Platform

## Project Overview
KrushiLink is a web platform that connects farmers in Maharashtra to trusted agro-stores, government schemes, and agricultural resources. The application helps farmers find nearby stores, access government subsidies, and connect with agricultural support.

## Recent Changes (September 07, 2025)
- Successfully imported the project from GitHub
- Set up Python HTTP server to serve static HTML files
- Configured workflow to run on port 5000
- Configured deployment settings for production (autoscale)
- Verified Supabase authentication integration is working

## Project Architecture

### Frontend
- **Technology**: Static HTML/CSS/JavaScript with Bootstrap 5
- **Authentication**: Supabase authentication with ES6 modules
- **Hosting**: Python HTTP server serving static files
- **Port**: 5000 (configured for Replit environment)

### Key Features
- User authentication (register, login, password reset)
- Responsive design with Bootstrap
- Farmer testimonials and service listings
- Multi-language support (English, Hindi, Marathi)
- Contact forms and store directory

### File Structure
```
/
├── assets/
│   ├── images/          # Static images for the website
│   └── scripts/         # JavaScript modules
│       ├── auth.js      # Authentication logic
│       ├── supabaseClient.js # Supabase configuration
│       └── script.js    # Main application scripts
├── *.html               # HTML pages (index, login, register, etc.)
├── *.css                # Stylesheets for different pages
└── replit.md            # Project documentation
```

### External Dependencies
- **Bootstrap 5**: UI framework and components
- **Bootstrap Icons**: Icon library
- **Supabase**: Backend-as-a-Service for authentication
- **Python HTTP Server**: Static file serving

### Database & Authentication
- Uses Supabase for user authentication
- Configured with proper session management
- Supports password reset functionality
- Already configured with working API keys

## Deployment Configuration
- **Target**: Autoscale (suitable for static websites)
- **Command**: `python -m http.server 5000`
- **No build process required** (static HTML/CSS/JS)

## User Preferences
- Prefers simple, clean setup without unnecessary complexity
- Focus on functionality and proper Replit environment configuration
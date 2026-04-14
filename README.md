# Whisper — Anonymous Messaging Platform

> A full-stack simulation of a real-world anonymous messaging system, inspired by platforms like Sarahah and NGL.  
> Built to practice end-to-end integration: connecting a production-grade Angular frontend with a fully-featured REST API, and deploying the complete system on AWS.

---

## Live Demo

🔗 **[LIVE_DEMO_LINK]**  
📁 **[GITHUB_LINK]**

---

## Overview

Whisper is a full-stack web application that allows users to:

- Create a public profile with a unique shareable link
- Receive anonymous messages from anyone — no account required to send
- Manage messages, profile photos, and security settings
- Authenticate securely via email + OTP, with optional two-factor authentication

The focus of this project was not building UI from scratch, but **real-world integration**: wiring a modern Angular frontend to a production-grade backend with JWT auth, OTP flows, file uploads, and refresh token rotation — then shipping the entire system to a live AWS server.

---

## Features

### Authentication
- Email/password signup with OTP email verification
- Login with 2FA (email OTP) support
- Forgot password → OTP verify → reset password (3-step flow)
- Google OAuth login/signup
- JWT access + refresh token system with automatic token rotation on 401

### Messaging
- Send anonymous messages to any public profile (no login required)
- Optional file attachment on messages
- View, read, and delete received messages
- Auto-polling inbox every 10 seconds for new messages

### Profile
- Public shareable profile link (`/p/:username`)
- Upload profile photo and cover photo
- View message statistics (total, unread)

### Security
- Change password (strong password enforced)
- Enable / confirm two-factor authentication
- Delete account
- OTP resend with 60-second cooldown on all OTP screens

### UI/UX
- Glassmorphism design with dark mode (persisted in localStorage)
- Fully responsive (mobile + desktop)
- Toast notification system
- Skeleton loading states
- Smooth animations

---

## Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | Angular 19 (Standalone Components, Signals) |
| **State Management** | Angular Signals — `signal()`, `computed()`, `effect()` |
| **Styling** | TailwindCSS 3 + custom CSS variables |
| **Forms** | Angular Reactive Forms + custom validators |
| **HTTP** | Angular HttpClient with functional interceptors |
| **Backend** | Node.js / Express (provided) |
| **Auth** | JWT (access + refresh tokens), OTP via Redis |
| **File Storage** | Multer (backend-handled uploads) |
| **Deployment** | AWS EC2 (Ubuntu) |
| **Process Manager** | PM2 |
| **Reverse Proxy** | Nginx |

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────┐
│                        Browser                          │
│                                                         │
│   Angular SPA (Standalone Components + Signals)         │
│   ┌──────────┐  ┌──────────┐  ┌──────────────────────┐ │
│   │  Auth    │  │ Messages │  │  Profile / Settings  │ │
│   │ Feature  │  │ Feature  │  │      Feature         │ │
│   └────┬─────┘  └────┬─────┘  └──────────┬───────────┘ │
│        │             │                   │             │
│   ┌────▼─────────────▼───────────────────▼───────────┐ │
│   │         HTTP Interceptors (Auth + Error)         │ │
│   │    → Attach access_Token header                  │ │
│   │    → Auto-refresh on 401 via /profile/rotate     │ │
│   └──────────────────────┬────────────────────────────┘ │
└─────────────────────────────────────────────────────────┘
                           │ HTTPS
┌──────────────────────────▼────────────────────────────┐
│                    AWS EC2 Instance                    │
│                                                        │
│  ┌─────────────────────────────────────────────────┐  │
│  │                    Nginx                        │  │
│  │   /         → serves Angular build (dist/)      │  │
│  │   /whisper  → proxy_pass to Node.js :3000       │  │
│  └────────────────────────────┬────────────────────┘  │
│                               │                       │
│  ┌────────────────────────────▼────────────────────┐  │
│  │         Node.js API (PM2 managed)               │  │
│  │   Express → JWT → Redis OTP → MongoDB           │  │
│  └─────────────────────────────────────────────────┘  │
└────────────────────────────────────────────────────────┘
```

**Token flow:**
1. Login → backend returns `access_Token` + `refreash_Token`
2. All requests attach `Authorization: Bearer access_Token`
3. On 401 → Angular interceptor calls `GET /profile/rotate` with `refreash_Token`
4. New tokens stored → original request retried automatically

---

## Setup & Installation

### Prerequisites

- Node.js 18+
- Angular CLI 19+
- Backend API running (see backend repo)

### Frontend

```bash
# 1. Clone the repository
git clone [GITHUB_LINK]
cd whisper-app

# 2. Install dependencies
npm install

# 3. Configure environment
# Edit src/environments/environment.ts
# Set apiBaseUrl to your backend URL

# 4. Start development server
ng serve

# 5. Open browser
# http://localhost:4200
```

### Build for Production

```bash
ng build --configuration production
# Output: dist/whisper-app/
```

---

## Deployment (AWS)

The project is deployed on **AWS EC2** using the following stack:

- **EC2 instance**: Ubuntu Server 22.04 LTS
- **Nginx**: Serves the Angular static build and reverse-proxies API calls to the Node.js backend
- **PM2**: Keeps the Node.js process alive with auto-restart on crash
- **Backend**: Runs on port 3000, accessible only via Nginx proxy

### Nginx configuration (summary)

```nginx
server {
    listen 80;

    # Serve Angular app
    root /var/www/whisper/dist/whisper-app/browser;
    index index.html;

    # SPA fallback — all routes serve index.html
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Proxy API requests to Node.js
    location /whisper {
        proxy_pass http://localhost:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

### Deployment steps

```bash
# On EC2:
# 1. Install Node.js, Nginx, PM2
# 2. Clone repo and install dependencies
# 3. Build Angular: ng build --configuration production
# 4. Copy dist/ to Nginx web root
# 5. Configure and reload Nginx
# 6. Start backend with PM2: pm2 start server.js --name whisper-api
# 7. Save PM2 process list: pm2 save && pm2 startup
```

---

## Project Structure

```
src/app/
├── core/
│   ├── services/        # auth, user, message, token services
│   ├── interceptors/    # auth (token attach + refresh), error (toast)
│   └── guards/          # authGuard, guestGuard
├── shared/
│   ├── models/          # User, Message, ApiResponse interfaces
│   ├── stores/          # Signal-based: AuthStore, MessageStore, UiStore
│   └── ui/              # Button, Input, OTP, Modal, Toast, FileUpload, Skeleton
├── features/
│   ├── auth/            # login, signup, confirm-email, confirm-login,
│   │                    # forgot-password, confirm-forgot, reset-password
│   ├── messages/        # message-list (with polling), message-detail
│   ├── profile/         # my-profile, edit-profile, public-profile
│   └── settings/        # security (password, 2FA, delete account)
└── layouts/
    ├── auth-layout/     # centered card layout for auth pages
    └── main-layout/     # sidebar + mobile nav for app pages
```

---

## Challenges & What I Learned

### Integration challenges

- **Exact API contracts matter**: The backend used non-standard field names (`refreash_Token` with a typo, `userName` not `username`). Learning to read and respect exact API contracts — rather than assuming conventional names — was a key lesson.

- **Token refresh without loops**: Implementing automatic token rotation on 401 responses required careful handling to prevent infinite retry loops when the refresh itself fails.

- **OTP flows**: Managing multi-step flows (signup → confirm email → login → 2FA → forgot password → OTP verify → reset) required careful routing, state passing via query params, and resend cooldown timers on every screen.

- **Joi validation error shape**: The backend returned validation errors inside a deeply nested structure (`error.extra.errors[0].details[0].message`). Building a generic extractor for this was important for consistent UX.

### Deployment challenges

- **Nginx SPA fallback**: Angular's client-side routing returns 404 on direct URL access unless Nginx is configured with `try_files $uri $uri/ /index.html`.

- **CORS and proxy config**: Understanding how to route `/whisper` API calls through Nginx to the Node.js backend running on a different port.

- **PM2 and process persistence**: Ensuring the backend restarts automatically after server reboots using `pm2 startup` and `pm2 save`.

### What I learned

- How to architect a production Angular app with proper separation of concerns (stores, services, interceptors, guards)
- Angular Signals for reactive state management without RxJS overhead
- HTTP interceptor patterns for authentication and error handling
- Real-world JWT token lifecycle management
- Linux server administration basics (Nginx, PM2, file permissions)
- Full deployment pipeline from local development to live AWS server

---

## Future Improvements

- [ ] Add real-time notifications via WebSockets instead of polling
- [ ] Add message reactions or emoji replies
- [ ] Implement rate limiting on the send-message form (client-side)
- [ ] Add profile customization (username, bio, display name editing via API)
- [ ] Improve accessibility (ARIA labels, keyboard navigation)
- [ ] Add HTTPS / SSL certificate via Let's Encrypt
- [ ] Add CI/CD pipeline (GitHub Actions → auto-deploy on push)
- [ ] Write unit tests for services and stores

---

## Acknowledgements

Special thanks to **[MENTOR_NAME]** for building the backend, guiding the architecture, and providing constant support throughout this project.

---

## License

This project was built for educational purposes as part of a full-stack development training program.

# Whisper - Anonymous Messaging Platform

## Setup Commands

```bash
# 1. Create Angular project
npm install -g @angular/cli
ng new whisper-app --style=css --routing=true --strict=true --standalone=true
cd whisper-app

# 2. Install dependencies
npm install @angular/cdk
npm install tailwindcss @tailwindcss/forms postcss autoprefixer
npm install lucide-angular

# 3. Initialize Tailwind
npx tailwindcss init

# 4. Run dev server
ng serve
```

## Project Structure
```
src/app/
├── core/
│   ├── services/
│   │   ├── auth.service.ts
│   │   ├── user.service.ts
│   │   └── message.service.ts
│   ├── interceptors/
│   │   ├── auth.interceptor.ts
│   │   └── error.interceptor.ts
│   ├── guards/
│   │   ├── auth.guard.ts
│   │   └── guest.guard.ts
│   └── config/
│       └── app.config.ts
├── shared/
│   ├── models/
│   │   ├── user.model.ts
│   │   ├── message.model.ts
│   │   └── api.model.ts
│   ├── stores/
│   │   ├── auth.store.ts
│   │   ├── message.store.ts
│   │   └── ui.store.ts
│   └── ui/
│       ├── button/
│       ├── input/
│       ├── card/
│       ├── modal/
│       ├── toast/
│       ├── loader/
│       ├── skeleton/
│       ├── otp-input/
│       └── file-upload/
├── features/
│   ├── auth/
│   │   ├── login/
│   │   ├── signup/
│   │   ├── forgot-password/
│   │   ├── reset-password/
│   │   └── confirm-email/
│   ├── profile/
│   │   ├── my-profile/
│   │   ├── public-profile/
│   │   └── edit-profile/
│   ├── messages/
│   │   ├── message-list/
│   │   └── message-detail/
│   └── settings/
│       └── security/
├── layouts/
│   ├── main-layout/
│   └── auth-layout/
└── environments/
    ├── environment.ts
    └── environment.prod.ts
```

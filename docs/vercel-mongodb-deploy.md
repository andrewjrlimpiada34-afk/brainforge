# Vercel Deployment: Firebase Auth + MongoDB

This app now uses:

- `Vercel` for the Next.js app
- `Firebase Auth` for signup, login, and email verification
- `MongoDB Atlas` for application data
- `Cloudinary` for profile image hosting

## 1. Required Vercel Environment Variables

Add these variables in the Vercel project settings for `Production`, `Preview`, and `Development`:

```env
GEMINI_API_KEY=

CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
CLOUDINARY_UPLOAD_FOLDER=brainforge/avatars

MONGODB_URI=
MONGODB_DB_NAME=brainforge

FIREBASE_ADMIN_PROJECT_ID=
FIREBASE_ADMIN_CLIENT_EMAIL=
FIREBASE_ADMIN_PRIVATE_KEY=
```

## 2. Important Formatting Notes

### `FIREBASE_ADMIN_PRIVATE_KEY`

Paste the private key as a single env value with escaped newlines:

```env
FIREBASE_ADMIN_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
```

### `MONGODB_URI`

Use the Atlas connection string with a database user that has read/write access to your cluster.

## 3. Firebase Client Config

The current client Firebase config is stored in:

- [src/firebase/config.ts](/c:/Users/andre/OneDrive/Desktop/SOFTWARE%20PROJECTS%20(c2026)/brainforge/src/firebase/config.ts:1)

That means no extra `NEXT_PUBLIC_FIREBASE_*` vars are required right now unless you choose to move that config to env later.

## 4. Install and Seed

After pulling the repo locally:

```powershell
npm install
npm run seed:mongodb
```

This seeds:

- `games`
- `achievements`
- `daily_challenges`

## 5. Deploy Flow

1. Push the repo to GitHub.
2. Import the repo into Vercel.
3. Add all env vars listed above.
4. Deploy.
5. After deployment, test:
   - account registration
   - email verification
   - login
   - profile load
   - username edit
   - avatar upload
   - game session save

## 6. Runtime Notes

- MongoDB routes verify Firebase ID tokens server-side using Firebase Admin.
- Cloudinary upload signing happens server-side in the Next.js API route.
- If registration works but profile/session APIs fail, the usual cause is a bad `FIREBASE_ADMIN_PRIVATE_KEY` format or a missing MongoDB env var.

## 7. Recommended Secret Hygiene

If any secrets were ever pasted into chat or committed accidentally, rotate them before production:

- MongoDB database password
- Firebase Admin private key
- Cloudinary API secret

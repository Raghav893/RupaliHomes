This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Firebase Phone OTP

Phone verification uses Firebase Authentication on the client. Add these values
to your local env file before using signup/profile phone verification:

```bash
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
```

In Firebase Console, enable Authentication > Sign-in method > Phone, configure
the SMS region policy for India if needed, and add your deployed domain under
Authentication > Settings > Authorized domains.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

In the Vercel project's Settings > Build and Deployment, set Root Directory to
`frontend` and Framework Preset to Next.js. Leave Output Directory at its default.
The `vercel.json` in this directory sets Install Command to `npm ci` and Build
Command to `npm run build`. Remove old dashboard overrides containing
`cd frontend`, since commands already run inside the selected Root Directory.

Set `NEXT_PUBLIC_API_URL=https://api.rupalihomes.com` in the project's environment
variables, along with the Firebase values above. Save the settings and deploy the
latest commit; redeploying an older commit will retain the old configuration.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

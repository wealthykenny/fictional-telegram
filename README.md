# Flex4Genz (Netlify + AWS-backed)

Flex4Genz is a mobile-first React app for AI image generation with:
- Thick liquid-glass UI (orange + white, high visibility)
- SVG robot walking loading screen
- Admin-only login (no public signup)
- Prompt + extra text instructions
- Local image upload for supported models
- Temporary saves (display/delete), save-to-profile, save-to-device
- Admin referral links

## Model and Gemini key assignment

- **Fazon Realistic Pro**
  - Keys: `GEMINI_KEY_1`, `GEMINI_KEY_2`, `GEMINI_KEY_3`
  - Supports text + image input
  - System prompt tuned for extremely realistic output
- **Fazon Photography**
  - Keys: `GEMINI_KEY_4`, `GEMINI_KEY_5`
  - Text-only generation
  - System prompt tuned for aesthetics/editorial composition
- **Nano Banana Pro**
  - Keys: `GEMINI_KEY_6`, `GEMINI_KEY_7`
  - Supports text + image input/edit
- **Reserve/fallback keys**
  - `GEMINI_KEY_8`, `GEMINI_KEY_9`

Key shuffle policy: each model rotates to its next key every **100 image generations**.

## Supported aspect ratios

`1:1`, `2:3`, `4:5`, `9:16`, `16:9`

## Run locally

```bash
npm install
npm run dev
```

Build:

```bash
npm run build
```

## Netlify deployment (final target)

This project is designed for Netlify:
- Frontend is built to `frontend/dist`
- API routes are Netlify Functions under `netlify/functions`
- `netlify.toml` already maps `/api/*` to `/.netlify/functions/*`

### Netlify environment secrets
In Netlify dashboard:
1. Site settings → **Environment variables**.
2. Add:
   - `ADMIN_USERNAME`
   - `ADMIN_PASSWORD`
   - `GEMINI_KEY_1` ... `GEMINI_KEY_9`

These are server-side values for functions only (never expose in frontend code).

## Concrete AWS storage/database setup (used by Netlify functions)

Use AWS for persistent data while keeping Netlify runtime:

1. **S3 bucket**: `flex4genz-images-prod`
   - Store generated images and edited outputs.
2. **DynamoDB tables** (recommended):
   - `flex4genz_drafts`
   - `flex4genz_profile_saves`
   - `flex4genz_referrals`
   - `flex4genz_key_usage`
3. **AWS secrets** (optional central source):
   - AWS Secrets Manager secret name: `flex4genz/prod/app`
   - JSON payload:

```json
{
  "ADMIN_USERNAME": "...",
  "ADMIN_PASSWORD": "...",
  "GEMINI_KEY_1": "...",
  "GEMINI_KEY_2": "...",
  "GEMINI_KEY_3": "...",
  "GEMINI_KEY_4": "...",
  "GEMINI_KEY_5": "...",
  "GEMINI_KEY_6": "...",
  "GEMINI_KEY_7": "...",
  "GEMINI_KEY_8": "...",
  "GEMINI_KEY_9": "..."
}
```

If you store secrets in AWS Secrets Manager, sync them into Netlify environment variables during deployment.

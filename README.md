# Cabinet Samet – Mobile App

The mobile app for clients of the Cabinet Samet accounting firm, built with React Native and Expo. It uses the same backend and accounts as the web portal: [cabinet-samet](https://github.com/mohamedalikhbou45-star/cabinet-samet).

![CI](https://github.com/mohamedalikhbou45-star/cabinet-samet-app/actions/workflows/ci.yml/badge.svg)

## Features

- Login with email two-factor authentication, plus biometric unlock (Face ID / fingerprint)
- Document upload by taking a photo in the app or picking a file
- Dashboard, document history with processing status, and messages from the firm
- Push notifications when a document's status changes
- Help chatbot for common questions
- Three languages: French, English and Arabic (with right-to-left layout)
- Light and dark theme

## Tech stack

React Native, Expo, TypeScript, React Navigation, Expo Notifications, Expo Local Authentication, Expo Camera and Document Picker.

## Run locally

Start the backend first (`npm run dev` in the [cabinet-samet](https://github.com/mohamedalikhbou45-star/cabinet-samet) project), then:

```bash
npm install
npx expo start
```

Scan the QR code with Expo Go, or press `i` / `a` to open an iOS simulator or Android emulator.

### Backend URL

The API URL is set in `app.json` under `expo.extra.apiUrl` (default `http://localhost:3000`):

- **iOS simulator:** `http://localhost:3000` works as is.
- **Android emulator:** use `http://10.0.2.2:3000`.
- **Physical device:** use your computer's local IP, e.g. `http://192.168.1.23:3000`, with both devices on the same Wi-Fi.

## Backend routes used

| Route | Purpose |
| --- | --- |
| `POST /api/mobile/login` | Login (same accounts as the website) |
| `POST /api/mobile/verify-2fa` | Verify the email code |
| `POST /api/register` | Create an account |
| `GET /api/dashboard` | Statistics, recent documents and messages |
| `GET` / `POST /api/documents` | Document history and upload |
| `GET /api/messages` | Messages from the firm |
| `POST /api/push-token` | Register the Expo push token |

All routes accept an `Authorization: Bearer <token>` header in addition to the session cookie used by the website.

## Push notifications

Notifications are sent through the Expo push API when an admin changes a document's status. Testing them on a physical device needs a development build (dev client or EAS build); Expo Go has limited push support since SDK 53.

## Continuous integration

Every push runs a GitHub Actions workflow that installs the dependencies and type-checks the code.

## How I work with AI

I build with AI coding agents (Claude Code) and treat them like a fast junior developer that needs clear direction:

- **Context first:** [AGENTS.md](AGENTS.md) gives the agent the rules of this project (one API client, translations in three languages, right-to-left layout, theming), so it doesn't have to guess.
- **Small, reviewable steps:** one feature or fix per change, and I read every diff before committing.
- **I own the decisions:** I decide the screens and user flows. The agent helps implement them, and I test them on my phone.
- **Automated checks:** CI (type-check) runs on every push, so mistakes from me or the agent are caught early.

## About

Built by Mohamed Ali Khbou, Computational Engineering Science student at TU Berlin.

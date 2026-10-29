# Agent instructions: cabinet-samet-app

Context for AI coding agents (Claude Code, Codex, etc.) working in this repository.

## Project
React Native app (Expo SDK 57, TypeScript) for clients of the accounting firm. It talks to the Next.js backend in `cabinet-samet` through `src/api/client.ts`.

Expo changes quickly: check the versioned docs at https://docs.expo.dev/versions/v57.0.0/ before using any Expo API, instead of relying on memory.

## Commands
- `npx expo start`: run the app
- `npx tsc --noEmit`: type-check (CI runs this)

## Rules
- All network calls go through `src/api/client.ts`. Do not call `fetch` from screens.
- Every user-facing string is a key in `src/i18n/translations.ts` with French, English and Arabic values. Arabic is right-to-left: use `isRTL` from `useLanguage()` for layout.
- Use colors from `src/theme` for new UI so light and dark mode both work.
- Never store passwords. The session token lives in AsyncStorage only when "keep me signed in" is on.
- Backend response shapes are defined by `cabinet-samet`; if one changes, update both repositories together.

## Before finishing
Run the type-check and describe what you changed and why.

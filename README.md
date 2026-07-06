# Cabinet Samet — App mobile

App React Native (Expo) pour les clients du Cabinet Samet, connectée au même
backend Next.js que le site web (`~/Desktop/cabinet-digital`).

## Démarrer

```bash
npm install
npx expo start
```

Scannez le QR code avec Expo Go, ou lancez `npx expo start --ios` / `--android`
avec un simulateur installé.

## Connexion au backend

L'URL de l'API est définie dans `app.json` sous `expo.extra.apiUrl`
(par défaut `http://localhost:3000`). Le serveur Next.js doit tourner en
local (`npm run dev` dans `cabinet-digital`).

- **Simulateur iOS** : `http://localhost:3000` fonctionne tel quel.
- **Émulateur Android** : remplacez par `http://10.0.2.2:3000`.
- **Appareil physique** : remplacez par l'adresse IP locale de votre machine
  (ex. `http://192.168.1.23:3000`), les deux appareils devant être sur le
  même réseau Wi-Fi.

## Ce que l'app utilise côté backend

- `POST /api/mobile/login` — authentification (mêmes comptes que le site).
- `POST /api/register` — création de compte.
- `GET /api/dashboard` — statistiques + documents/messages récents.
- `GET/POST /api/documents` — historique et dépôt de documents.
- `GET /api/messages` — messages du cabinet.
- `POST /api/push-token` — enregistrement du jeton de notification push Expo.

Toutes ces routes acceptent un en-tête `Authorization: Bearer <token>` en plus
du cookie de session utilisé par le site web (voir `src/lib/mobileAuth.ts`
dans le projet backend).

## Notifications push

Les notifications sont envoyées via l'API push d'Expo lorsqu'un admin change
le statut d'un document (voir `src/lib/push.ts` côté backend). Pour les
tester sur un appareil physique, un vrai build (dev client ou EAS build) est
nécessaire — Expo Go a un support limité des notifications push depuis le
SDK 53.

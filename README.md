# Família Rolim Pedro

App familiar partilhada para tarefas, compras, calendário, família, refeições, férias e ligações futuras ao RJP Study e SwimTrack.

## Instalar

```bash
npm install
npm run dev
```

## Build Web

```bash
npm run build
```

## Android APK

```bash
npm run build
npx cap add android
npx cap sync android
```

Depois gerar APK pelo GitHub Actions ou Android Studio.

## Google

O ficheiro `src/googleConfig.js` já está preparado para o módulo Google reutilizável:
Login Google, Google Sheets, Google Drive e Google Calendar.

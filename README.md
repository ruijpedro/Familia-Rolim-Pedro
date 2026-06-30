# Família Rolim Pedro V3.1 — Hub Familiar com Sync Google

App familiar React/Vite/Capacitor com calendário familiar, tarefas, compras, refeições, férias, despesas, veículos, saúde, RJP Study e SwimTrack.

## Novidade V3.1

- O URL do Apps Script já pode ser colado dentro da própria app, no separador **Sync**.
- Não é preciso recompilar a app só para trocar o URL.
- WebApp e APK usam o mesmo ecrã e a mesma configuração.

## Configuração do calendário

Lê o ficheiro:

`README_CONFIGURAR_CALENDARIO.md`

## Desenvolvimento

```bash
npm install --no-audit --no-fund --legacy-peer-deps
npm run build
```

## Android

O workflow `.github/workflows/build-android.yml` compila a APK.

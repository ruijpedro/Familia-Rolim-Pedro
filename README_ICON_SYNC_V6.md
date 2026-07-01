# Família Rolim Pedro V6 — Ícone Android corrigido

Esta versão corrige o problema do ícone genérico no telemóvel.

## O que foi corrigido

- O `AndroidManifest.xml` correto foi reposto.
- O workflow Android copia os ícones personalizados depois do `npx cap sync android`.
- Foram mantidos `ic_launcher` e `ic_launcher_round` em todas as densidades Android.

## Ficheiros importantes

- `src/main/AndroidManifest.xml`
- `src/main/res/mipmap-*`
- `.github/workflows/build-android.yml`

## Como usar

1. Extrair o ZIP.
2. Subir os ficheiros soltos para o GitHub, substituindo os atuais.
3. Ir a **Actions**.
4. Correr **Build Android APK**.

Se o telemóvel ainda mostrar o ícone antigo, desinstala a app anterior antes de instalar a nova APK. O Android pode manter cache do launcher.

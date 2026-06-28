# Família Rolim Pedro V2

App familiar funcional para WebApp e APK.

## Funcionalidades

- Calendário familiar sincronizado por Google Apps Script + Google Calendar partilhado.
- Tarefas, compras, refeições, férias, despesas, saúde, veículos, RJP Study e SwimTrack.
- Cada registo pode ser marcado para entrar no calendário familiar.
- Leitura dos eventos existentes no Google Calendar.
- Backup local em JSON.
- Funciona offline com `localStorage` e sincroniza quando houver URL do Apps Script.

## Configuração do calendário familiar

1. No Google Calendar cria um calendário chamado **Família Rolim Pedro**.
2. Partilha esse calendário com as contas da família com permissão **Fazer alterações aos eventos**.
3. Copia o ID do calendário: definições do calendário > Integrar calendário > ID do calendário.
4. Abre `google-apps-script/Code.gs` e troca:

```js
const FAMILY_CALENDAR_ID = 'COLOCA_AQUI_O_ID_DO_CALENDARIO_FAMILIAR';
```

5. No Apps Script, cola o conteúdo de `google-apps-script/Code.gs`.
6. Implementar > Nova implementação > App Web.
7. Executar como: **Eu**.
8. Quem tem acesso: **Qualquer pessoa com o link**.
9. Copia o URL `/exec`.
10. Cola esse URL em `src/googleConfig.js`:

```js
export const GOOGLE_SCRIPT_URL = 'https://script.google.com/macros/s/.../exec';
```

## GitHub / WebApp

```bash
npm install --legacy-peer-deps
npm run build
```

## APK

Usa o workflow `.github/workflows/build-android.yml`.

## Nota

A sincronização com todas as contas é feita através do calendário partilhado. A app grava no calendário familiar, e cada membro vê os eventos na sua própria conta Google porque o calendário está partilhado com permissões de edição.

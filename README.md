# Família Rolim Pedro V2.3

Versão unificada para WebApp e APK: a interface é a mesma nas duas plataformas.

## Funcionalidades
- Calendário familiar sincronizado por Google Apps Script.
- Tarefas, compras, refeições, férias, despesas, veículos e saúde funcionais.
- Importação da RJP Study para o calendário familiar.
- Importação do SwimTrack para o calendário familiar.
- Exportação PDF e ICS.
- Ícone Android reposto a partir de `src/main/res`.

## Configuração Google
1. Criar um Google Calendar partilhado: `Família Rolim Pedro`.
2. Partilhar com as contas Rui, Gina, Constança e Lourenço com permissão de edição.
3. Copiar o ID do calendário.
4. Criar Google Apps Script.
5. Colar `google-apps-script/Code.gs`.
6. Colocar o ID em `FAMILY_CALENDAR_ID`.
7. Publicar como Web App.
8. Colar o URL `/exec` em `src/googleConfig.js`.

## GitHub
Fazer upload dos ficheiros soltos para a raiz do repositório: `src`, `public`, `package.json`, `vite.config.js`, `.github`, etc.

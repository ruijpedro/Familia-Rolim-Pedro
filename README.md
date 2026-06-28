# Família Rolim Pedro V2 Funcional

Hub familiar em React/Vite/Capacitor.

## Funcionalidades adicionadas

- Tarefas funcionais com responsável, data, hora, prioridade, marcar como feito e apagar.
- Lista de compras funcional, com categorias, marcar comprado, apagar e limpar concluídos.
- Calendário familiar interno funcional.
- Exportação de calendário em ficheiro `.ics`, importável no Google Calendar, Apple Calendar e Outlook.
- Botão por evento para abrir/criar no Google Calendar.
- Refeições, férias, despesas, veículos e saúde adicionam automaticamente evento ao calendário familiar.
- Ligação prática ao RJP Study: testes, tarefas e sessões de estudo entram no calendário.
- Ligação prática ao SwimTrack: treinos, provas, TAC e alertas entram no calendário.
- Documentos/notas familiares com link para Drive.
- Pesquisa global.
- Exportação PDF de resumo familiar.
- Funcionamento offline por `localStorage`.

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

O ficheiro `src/googleConfig.js` fica preparado para Login Google, Drive, Sheets e Calendar. Nesta V2, sem credenciais Google, a app já permite exportar `.ics` e abrir eventos no Google Calendar.

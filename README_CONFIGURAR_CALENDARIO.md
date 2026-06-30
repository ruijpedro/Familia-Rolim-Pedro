# Família Rolim Pedro V3.1 — Ligar calendário sincronizado

## 1. Criar calendário partilhado

1. Abrir Google Calendar no computador.
2. Clicar em `+` junto a `Outros calendários`.
3. Escolher `Criar novo calendário`.
4. Nome: `Família Rolim Pedro`.
5. Criar calendário.
6. Entrar em `Definições e partilha` desse calendário.
7. Em `Partilhar com pessoas específicas`, adicionar as contas Google da família.
8. Dar permissão: `Fazer alterações aos eventos`.

## 2. Copiar o ID do calendário

Nas definições do calendário, em `Integrar calendário`, copiar o `ID do calendário`.
Exemplo:

```txt
xxxxxxxxxxxx@group.calendar.google.com
```

## 3. Criar Apps Script

1. Abrir https://script.google.com
2. Novo projeto.
3. Apagar o conteúdo do ficheiro `Code.gs`.
4. Colar o conteúdo de `google-apps-script/Code.gs` deste projeto.
5. No topo do `Code.gs`, trocar:

```js
const FAMILY_CALENDAR_ID = 'COLOCAR_ID_DO_CALENDARIO_FAMILIAR_AQUI';
```

pelo ID real do calendário familiar.

Opcionalmente, preencher também:

```js
const STUDY_SHEET_ID = '';
const SWIM_SHEET_ID = '';
```

## 4. Publicar Apps Script

1. Clicar em `Implementar`.
2. Escolher `Nova implementação`.
3. Tipo: `Aplicação Web`.
4. Executar como: `Eu`.
5. Quem tem acesso: `Qualquer pessoa com o link`.
6. Autorizar permissões.
7. Copiar o URL terminado em `/exec`.

## 5. Colar URL na app

Na app Família Rolim Pedro:

1. Abrir separador `Sync`.
2. Colar o URL `/exec` do Apps Script.
3. Carregar em `Guardar URL`.
4. Carregar em `Testar sincronização`.

A partir daqui a app sincroniza com o Google Calendar familiar.

## 6. Teste rápido

1. Ir a `Calendário`.
2. Criar evento: `Teste Família`.
3. Carregar em `Enviar` ou `Sync tudo`.
4. Abrir Google Calendar e confirmar que o evento aparece no calendário `Família Rolim Pedro`.

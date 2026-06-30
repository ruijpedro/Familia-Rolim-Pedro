# Família Rolim Pedro V3 - Hub Familiar Inteligente

Versão V3 com WebApp e APK unificadas.

## Principais novidades

- Sincronização automática ao abrir a app.
- Botão **Sincronizar tudo**: Família + Google Calendar + RJP Study + SwimTrack.
- Calendário familiar único e partilhado.
- Evita duplicados no Google Calendar através de `frpId`.
- RJP Study e SwimTrack entram no calendário familiar.
- Separador **Sync** para testar e controlar a sincronização.
- Ícone Android preservado.
- Workflows corrigidos para WebApp e APK.

## Configuração Google

1. Criar um Google Calendar chamado, por exemplo, `Família Rolim Pedro`.
2. Partilhar com Rui, Gina, Constança e Lourenço com permissão para editar eventos.
3. Copiar o ID do calendário.
4. Criar Apps Script e colar `google-apps-script/Code.gs`.
5. No `Code.gs`, preencher:
   - `FAMILY_CALENDAR_ID`
   - `STUDY_SHEET_ID` se quiser importar da Study
   - `SWIM_SHEET_ID` se quiser importar do SwimTrack
6. Publicar como Web App.
7. Copiar o URL `/exec` para `src/googleConfig.js`.

## GitHub

Extrair o ZIP e enviar os ficheiros soltos para a raiz do repositório.

// Configuração do módulo Google reutilizável RJP.
// Depois de criares credenciais na Google Cloud, substitui estes valores.
export const GOOGLE_CONFIG = {
  APP_NAME: 'Família Rolim Pedro',
  CLIENT_ID: 'COLOCAR_CLIENT_ID.apps.googleusercontent.com',
  API_KEY: 'COLOCAR_API_KEY',
  SHEET_ID: 'COLOCAR_ID_DA_GOOGLE_SHEET',
  CALENDAR_ID: 'primary',
  DRIVE_FOLDER_ID: 'COLOCAR_ID_DA_PASTA_DRIVE',
  SCOPES: [
    'https://www.googleapis.com/auth/spreadsheets',
    'https://www.googleapis.com/auth/drive.file',
    'https://www.googleapis.com/auth/calendar.events'
  ]
}

/*******************************************************
 * Família Rolim Pedro - Google Apps Script
 * Sincroniza a app com um Google Calendar familiar.
 *
 * PASSOS:
 * 1. Google Calendar > criar calendário "Família Rolim Pedro".
 * 2. Partilhar esse calendário com todas as contas da família.
 * 3. Definir FAMILY_CALENDAR_ID abaixo.
 * 4. Implementar > Nova implementação > App Web.
 * 5. Executar como: Eu.
 * 6. Quem tem acesso: Qualquer pessoa com o link.
 *******************************************************/

const FAMILY_CALENDAR_ID = 'COLOCA_AQUI_O_ID_DO_CALENDARIO_FAMILIAR';
const SHEET_NAME = 'Familia_Rolim_Pedro_Dados';

function doGet(e) {
  return handle_(e);
}

function doPost(e) {
  return handle_(e);
}

function handle_(e) {
  try {
    const p = getParams_(e);
    const action = p.action || 'ping';
    if (action === 'ping') return json_({ ok: true, app: 'Familia Rolim Pedro', time: new Date().toISOString() });
    if (action === 'listEvents') return json_(listEvents_(p));
    if (action === 'addEvent') return json_(addEvent_(p));
    if (action === 'updateEvent') return json_(updateEvent_(p));
    if (action === 'deleteEvent') return json_(deleteEvent_(p));
    if (action === 'saveData') return json_(saveData_(p));
    if (action === 'loadData') return json_(loadData_());
    return json_({ ok: false, error: 'Ação desconhecida: ' + action });
  } catch (err) {
    return json_({ ok: false, error: String(err && err.message ? err.message : err) });
  }
}

function getParams_(e) {
  let p = Object.assign({}, e && e.parameter ? e.parameter : {});
  if (e && e.postData && e.postData.contents) {
    try { p = Object.assign(p, JSON.parse(e.postData.contents)); } catch (err) {}
  }
  return p;
}

function calendar_() {
  const cal = CalendarApp.getCalendarById(FAMILY_CALENDAR_ID);
  if (!cal) throw new Error('Calendário não encontrado. Confirma o FAMILY_CALENDAR_ID e as permissões.');
  return cal;
}

function listEvents_(p) {
  const start = p.start ? new Date(p.start) : new Date();
  const end = p.end ? new Date(p.end) : new Date(Date.now() + 1000 * 60 * 60 * 24 * 90);
  const events = calendar_().getEvents(start, end).map(ev => ({
    id: ev.getId(),
    titulo: ev.getTitle(),
    inicio: ev.getStartTime().toISOString(),
    fim: ev.getEndTime().toISOString(),
    descricao: ev.getDescription() || '',
    local: ev.getLocation() || '',
    calendario: FAMILY_CALENDAR_ID
  }));
  return { ok: true, events };
}

function addEvent_(p) {
  const title = p.titulo || p.title || 'Evento Família';
  const start = new Date(p.inicio || p.start);
  const end = new Date(p.fim || p.end || (start.getTime() + 60 * 60 * 1000));
  const desc = p.descricao || p.description || '';
  const location = p.local || p.location || '';
  const ev = calendar_().createEvent(title, start, end, { description: desc, location });
  return { ok: true, id: ev.getId(), htmlLink: 'https://calendar.google.com/calendar/u/0/r/eventedit/' + encodeURIComponent(ev.getId()) };
}

function updateEvent_(p) {
  const ev = calendar_().getEventById(p.id);
  if (!ev) throw new Error('Evento não encontrado: ' + p.id);
  if (p.titulo || p.title) ev.setTitle(p.titulo || p.title);
  if (p.inicio || p.start) ev.setTime(new Date(p.inicio || p.start), new Date(p.fim || p.end));
  if (p.descricao || p.description) ev.setDescription(p.descricao || p.description);
  if (p.local || p.location) ev.setLocation(p.local || p.location);
  return { ok: true, id: ev.getId() };
}

function deleteEvent_(p) {
  const ev = calendar_().getEventById(p.id);
  if (!ev) throw new Error('Evento não encontrado: ' + p.id);
  ev.deleteEvent();
  return { ok: true, id: p.id };
}

function saveData_(p) {
  const ss = getSpreadsheet_();
  const sh = ss.getSheetByName('dados') || ss.insertSheet('dados');
  sh.clear();
  sh.appendRow(['updatedAt', 'json']);
  sh.appendRow([new Date(), p.json || '{}']);
  return { ok: true, spreadsheetUrl: ss.getUrl() };
}

function loadData_() {
  const ss = getSpreadsheet_();
  const sh = ss.getSheetByName('dados');
  if (!sh || sh.getLastRow() < 2) return { ok: true, data: null };
  return { ok: true, data: sh.getRange(2, 2).getValue() };
}

function getSpreadsheet_() {
  const files = DriveApp.getFilesByName(SHEET_NAME);
  if (files.hasNext()) return SpreadsheetApp.open(files.next());
  const ss = SpreadsheetApp.create(SHEET_NAME);
  return ss;
}

function json_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}

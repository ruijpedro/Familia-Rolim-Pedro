// Família Rolim Pedro - Google Apps Script
// Preencher estes dados antes de publicar:
const FAMILY_CALENDAR_ID = 'COLOCAR_ID_DO_CALENDARIO_FAMILIAR_AQUI';
const STUDY_SHEET_ID = ''; // opcional: ID da Google Sheet da RJP Study
const SWIM_SHEET_ID = '';  // opcional: ID da Google Sheet SwimTrack

function doPost(e){
  try{
    const req = JSON.parse(e.postData.contents || '{}');
    let out = {ok:false,error:'Ação desconhecida'};
    if(req.action === 'syncEvents') out = syncEvents(req.events || []);
    if(req.action === 'listEvents') out = listEvents();
    if(req.action === 'importStudy') out = importStudy();
    if(req.action === 'importSwim') out = importSwim();
    return json(out);
  }catch(err){ return json({ok:false,error:String(err.message || err)}); }
}
function doGet(){ return json({ok:true,app:'Família Rolim Pedro'}); }
function json(o){ return ContentService.createTextOutput(JSON.stringify(o)).setMimeType(ContentService.MimeType.JSON); }
function cal(){ return CalendarApp.getCalendarById(FAMILY_CALENDAR_ID); }
function syncEvents(events){
  const c = cal(); if(!c) throw new Error('Calendário familiar não encontrado. Confirma o FAMILY_CALENDAR_ID.');
  events.forEach(ev=>{
    const d = ev.data ? new Date(ev.data + 'T09:00:00') : new Date();
    const title = `[${ev.origem || 'Família'}] ${ev.titulo || 'Evento'}`;
    c.createAllDayEvent(title, d, { description: `Membro: ${ev.membro || 'Todos'}\nNotas: ${ev.notas || ''}` });
  });
  return {ok:true,count:events.length};
}
function listEvents(){
  const c = cal(); if(!c) throw new Error('Calendário familiar não encontrado.');
  const start = new Date(); start.setDate(start.getDate()-30);
  const end = new Date(); end.setDate(end.getDate()+365);
  const events = c.getEvents(start,end).map(e=>({ id:e.getId(), titulo:e.getTitle(), data:Utilities.formatDate(e.getStartTime(),Session.getScriptTimeZone(),'yyyy-MM-dd'), hora:Utilities.formatDate(e.getStartTime(),Session.getScriptTimeZone(),'HH:mm'), membro:'Todos', origem:'Google Calendar', notas:e.getDescription() }));
  return {ok:true,events};
}
function importStudy(){ return {ok:true,items:readSheet(STUDY_SHEET_ID,'RJP Study')}; }
function importSwim(){ return {ok:true,items:readSheet(SWIM_SHEET_ID,'SwimTrack')}; }
function readSheet(id, origem){
  if(!id) return [];
  const sh = SpreadsheetApp.openById(id).getSheets()[0];
  const values = sh.getDataRange().getValues();
  const head = values.shift().map(h=>String(h).toLowerCase());
  return values.filter(r=>r.join('').trim()).map((r,i)=>({
    id: origem + '_' + i,
    titulo: val(r,head,['titulo','nome','disciplina','prova','evento']) || origem,
    data: formatDate(val(r,head,['data','dia','date'])),
    hora: val(r,head,['hora','time']) || '',
    membro: val(r,head,['membro','aluno','atleta']) || 'Todos',
    origem,
    notas: val(r,head,['notas','observações','obs']) || ''
  }));
}
function val(r,head,names){ for(const n of names){ const i=head.indexOf(n); if(i>=0) return r[i]; } return ''; }
function formatDate(v){ if(v instanceof Date) return Utilities.formatDate(v,Session.getScriptTimeZone(),'yyyy-MM-dd'); return String(v||'').slice(0,10); }

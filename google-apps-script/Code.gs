// Família Rolim Pedro V3 - Google Apps Script
// 1) Criar um Google Calendar partilhado da família.
// 2) Colar aqui o ID do calendário familiar.
// 3) Opcional: colar IDs das Google Sheets da RJP Study e SwimTrack.
// 4) Publicar como Web App: Executar como "Eu"; acesso "Qualquer pessoa com o link".

const FAMILY_CALENDAR_ID = 'COLOCAR_ID_DO_CALENDARIO_FAMILIAR_AQUI';
const STUDY_SHEET_ID = ''; // opcional
const SWIM_SHEET_ID = '';  // opcional
const DB_SHEET_ID = '';    // opcional; se vazio cria/usa a folha "Familia_Rolim_Pedro_DB" no Drive

function doPost(e){
  try{
    const req = JSON.parse((e.postData && e.postData.contents) || '{}');
    let out = {ok:false,error:'Ação desconhecida'};
    if(req.action === 'syncHub') out = syncHub(req);
    if(req.action === 'syncEvents') out = syncEvents(req.events || []);
    if(req.action === 'listEvents') out = listEvents();
    if(req.action === 'importStudy') out = {ok:true,items:readSheet(STUDY_SHEET_ID,'RJP Study')};
    if(req.action === 'importSwim') out = {ok:true,items:readSheet(SWIM_SHEET_ID,'SwimTrack')};
    return json(out);
  }catch(err){ return json({ok:false,error:String(err.message || err)}); }
}
function doGet(){ return json({ok:true,app:'Família Rolim Pedro V3'}); }
function json(o){ return ContentService.createTextOutput(JSON.stringify(o)).setMimeType(ContentService.MimeType.JSON); }
function cal(){ return CalendarApp.getCalendarById(FAMILY_CALENDAR_ID); }

function syncHub(req){
  const events = req.events || [];
  const synced = syncEvents(events);
  saveDb('tarefas', req.tasks || []);
  saveDb('compras', req.compras || []);
  const listed = listEvents();
  const study = readSheet(STUDY_SHEET_ID,'RJP Study');
  const swim = readSheet(SWIM_SHEET_ID,'SwimTrack');
  return {ok:true, synced:synced.count, events:listed.events, study, swim};
}

function syncEvents(events){
  const c = cal(); if(!c) throw new Error('Calendário familiar não encontrado. Confirma o FAMILY_CALENDAR_ID.');
  const start = new Date(); start.setDate(start.getDate()-90);
  const end = new Date(); end.setDate(end.getDate()+730);
  const existing = c.getEvents(start,end);
  const byFrp = {};
  existing.forEach(ev=>{ const id = ev.getTag && ev.getTag('frpId'); if(id) byFrp[id]=ev; });
  let count = 0;
  events.filter(ev=>ev && ev.titulo && ev.data).forEach(ev=>{
    const id = String(ev.id || ev.titulo + ev.data + (ev.hora||''));
    const title = `[${ev.origem || 'Família'}] ${ev.titulo || 'Evento'}`;
    const desc = `Membro: ${ev.membro || 'Todos'}\nPrioridade: ${ev.prioridade || 'Normal'}\nNotas: ${ev.notas || ''}`;
    let ce = byFrp[id];
    if(ce){
      ce.setTitle(title); ce.setDescription(desc);
      setDate(ce, ev);
    }else{
      const d = new Date(ev.data + 'T' + (ev.hora || '09:00') + ':00');
      ce = ev.hora ? c.createEvent(title, d, new Date(d.getTime()+60*60*1000), {description:desc}) : c.createAllDayEvent(title, new Date(ev.data + 'T09:00:00'), {description:desc});
      if(ce.setTag) ce.setTag('frpId', id);
      if(ce.setTag) ce.setTag('origem', ev.origem || 'Família');
    }
    count++;
  });
  return {ok:true,count};
}
function setDate(ce, ev){
  if(ev.hora){ const d = new Date(ev.data + 'T' + ev.hora + ':00'); ce.setTime(d, new Date(d.getTime()+60*60*1000)); }
  else { ce.setAllDayDate(new Date(ev.data + 'T09:00:00')); }
}
function listEvents(){
  const c = cal(); if(!c) throw new Error('Calendário familiar não encontrado.');
  const start = new Date(); start.setDate(start.getDate()-30);
  const end = new Date(); end.setDate(end.getDate()+365);
  const tz = Session.getScriptTimeZone();
  const events = c.getEvents(start,end).map(e=>({
    id: (e.getTag && e.getTag('frpId')) || e.getId(),
    titulo: cleanTitle(e.getTitle()),
    data: Utilities.formatDate(e.getStartTime(),tz,'yyyy-MM-dd'),
    hora: e.isAllDayEvent() ? '' : Utilities.formatDate(e.getStartTime(),tz,'HH:mm'),
    membro: readDesc(e.getDescription(),'Membro') || 'Todos',
    origem: (e.getTag && e.getTag('origem')) || origemFromTitle(e.getTitle()),
    prioridade: readDesc(e.getDescription(),'Prioridade') || 'Normal',
    notas: readDesc(e.getDescription(),'Notas') || ''
  }));
  return {ok:true,events};
}
function cleanTitle(t){ return String(t||'').replace(/^\[[^\]]+\]\s*/, ''); }
function origemFromTitle(t){ const m=String(t||'').match(/^\[([^\]]+)\]/); return m ? m[1] : 'Google Calendar'; }
function readDesc(desc,key){ const m=String(desc||'').match(new RegExp(key+':\\s*([^\\n]*)')); return m ? m[1] : ''; }

function readSheet(id, origem){
  if(!id) return [];
  const sh = SpreadsheetApp.openById(id).getSheets()[0];
  const values = sh.getDataRange().getValues();
  if(values.length < 2) return [];
  const head = values.shift().map(h=>String(h).trim().toLowerCase());
  return values.filter(r=>r.join('').trim()).map((r,i)=>({
    id: origem.replace(/\s+/g,'_') + '_' + i + '_' + formatDate(val(r,head,['data','dia','date'])),
    titulo: val(r,head,['titulo','nome','disciplina','prova','evento','tarefa']) || origem,
    data: formatDate(val(r,head,['data','dia','date'])),
    hora: val(r,head,['hora','time']) || '',
    membro: val(r,head,['membro','aluno','atleta','pessoa']) || 'Todos',
    origem,
    notas: val(r,head,['notas','observações','observacoes','obs']) || '',
    prioridade: val(r,head,['prioridade']) || 'Normal'
  })).filter(x=>x.data);
}
function val(r,head,names){ for(const n of names){ const i=head.indexOf(n); if(i>=0) return r[i]; } return ''; }
function formatDate(v){ if(v instanceof Date) return Utilities.formatDate(v,Session.getScriptTimeZone(),'yyyy-MM-dd'); return String(v||'').slice(0,10); }

function saveDb(name, items){
  const ss = getDb();
  const sh = ss.getSheetByName(name) || ss.insertSheet(name);
  sh.clear(); sh.appendRow(['json','updatedAt']);
  (items||[]).forEach(x=>sh.appendRow([JSON.stringify(x), new Date()]));
}
function getDb(){
  if(DB_SHEET_ID) return SpreadsheetApp.openById(DB_SHEET_ID);
  const files = DriveApp.getFilesByName('Familia_Rolim_Pedro_DB');
  if(files.hasNext()) return SpreadsheetApp.open(files.next());
  return SpreadsheetApp.create('Familia_Rolim_Pedro_DB');
}

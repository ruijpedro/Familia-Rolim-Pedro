import React, { useEffect, useMemo, useState } from 'react'
import { createRoot } from 'react-dom/client'
import { Home, CheckSquare, ShoppingCart, CalendarDays, Users, Utensils, Plane, Waves, GraduationCap, Bell, Search, Plus, Download, RefreshCw, Trash2, WalletCards, Car, HeartPulse, UploadCloud } from 'lucide-react'
import { jsPDF } from 'jspdf'
import { GOOGLE_SCRIPT_URL, FAMILY_MEMBERS } from './googleConfig.js'
import './style.css'

const logoUrl = `${import.meta.env.BASE_URL}logo.png`
const membros = FAMILY_MEMBERS?.length ? FAMILY_MEMBERS : ['Rui','Gina','Constança','Lourenço']
const emptyForm = { titulo:'', data:'', hora:'', membro:'Todos', notas:'' }
const todayISO = () => new Date().toISOString().slice(0,10)
const uid = () => `${Date.now()}_${Math.random().toString(16).slice(2)}`

const initial = {
  tarefas: [], compras: [], refeicoes: [], ferias: [], despesas: [], veiculos: [], saude: [],
  eventos: [], study: [], swim: [], syncAt: ''
}

const sections = [
  ['inicio','Início',Home], ['calendario','Calendário',CalendarDays], ['tarefas','Tarefas',CheckSquare], ['compras','Compras',ShoppingCart],
  ['refeicoes','Refeições',Utensils], ['familia','Família',Users], ['ferias','Férias',Plane], ['study','RJP Study',GraduationCap],
  ['swim','SwimTrack',Waves], ['despesas','Despesas',WalletCards], ['veiculos','Veículos',Car], ['saude','Saúde',HeartPulse]
]

function load(){ try { return { ...initial, ...(JSON.parse(localStorage.getItem('frp_v23')||'{}')) } } catch { return initial } }
function saveAll(next){ localStorage.setItem('frp_v23', JSON.stringify(next)); return next }

async function api(action, payload={}){
  if(!GOOGLE_SCRIPT_URL) throw new Error('Falta colar o URL do Apps Script em src/googleConfig.js')
  const res = await fetch(GOOGLE_SCRIPT_URL, { method:'POST', body: JSON.stringify({action, ...payload}) })
  const json = await res.json().catch(()=>({ok:false,error:'Resposta inválida do Apps Script'}))
  if(!json.ok) throw new Error(json.error || 'Erro no Apps Script')
  return json
}

function toEvent(item, origem){
  return { id:item.eventId || item.id || uid(), titulo:item.titulo || item.nome || item.destino || origem, data:item.data || item.inicio || todayISO(), hora:item.hora || '', membro:item.membro || item.resp || 'Todos', origem, notas:item.notas || item.obs || '' }
}

function App(){
  const [tab,setTab]=useState('inicio')
  const [data,setData]=useState(load)
  const [user,setUser]=useState(localStorage.getItem('frp_user') || 'Rui')
  const [msg,setMsg]=useState('')
  const [q,setQ]=useState('')
  const [busy,setBusy]=useState(false)
  const persist = next => setData(saveAll(next))
  const flash = t => { setMsg(t); setTimeout(()=>setMsg(''),5000) }
  const setU = u => { setUser(u); localStorage.setItem('frp_user',u) }

  const addItem = (kind, item, addCalendar=true) => {
    const novo = { id:uid(), ...item }
    const next = { ...data, [kind]: [novo, ...data[kind]] }
    if(addCalendar && item.data) next.eventos = [toEvent(novo, labelOf(kind)), ...next.eventos]
    persist(next)
    flash('Guardado na Família')
  }
  const removeItem = (kind,id) => persist({...data,[kind]:data[kind].filter(x=>x.id!==id)})
  const toggle = (kind,id) => persist({...data,[kind]:data[kind].map(x=>x.id===id?{...x,ok:!x.ok}:x)})

  const syncCalendar = async () => {
    setBusy(true)
    try { await api('syncEvents', { events:data.eventos }); persist({...data, syncAt:new Date().toLocaleString('pt-PT')}); flash('Calendário familiar sincronizado') }
    catch(e){ flash(e.message) } finally { setBusy(false) }
  }
  const readCalendar = async () => {
    setBusy(true)
    try { const r = await api('listEvents'); persist({...data, eventos:r.events||[], syncAt:new Date().toLocaleString('pt-PT')}); flash('Google Calendar lido') }
    catch(e){ flash(e.message) } finally { setBusy(false) }
  }
  const importStudy = async () => {
    setBusy(true)
    try { const r = await api('importStudy'); const study = r.items || []; const evs = study.map(x=>toEvent(x,'RJP Study')); persist({...data, study:[...study,...data.study], eventos:[...evs,...data.eventos]}); flash(`${study.length} itens importados da Study`) }
    catch(e){ flash(e.message) } finally { setBusy(false) }
  }
  const importSwim = async () => {
    setBusy(true)
    try { const r = await api('importSwim'); const swim = r.items || []; const evs = swim.map(x=>toEvent(x,'SwimTrack')); persist({...data, swim:[...swim,...data.swim], eventos:[...evs,...data.eventos]}); flash(`${swim.length} itens importados do SwimTrack`) }
    catch(e){ flash(e.message) } finally { setBusy(false) }
  }

  const filtered = useMemo(()=>{
    const text = q.trim().toLowerCase(); if(!text) return null
    return Object.entries(data).flatMap(([kind,arr])=>Array.isArray(arr)?arr.filter(x=>JSON.stringify(x).toLowerCase().includes(text)).map(x=>({...x,kind})):[])
  },[q,data])

  return <div className="app">
    <header className="top"><img src={logoUrl} alt="logo"/><div><b>Família</b><h1>Rolim Pedro</h1></div><select value={user} onChange={e=>setU(e.target.value)}>{membros.map(m=><option key={m}>{m}</option>)}</select><Bell/></header>
    <main>
      <div className="search"><Search/><input value={q} onChange={e=>setQ(e.target.value)} placeholder="Pesquisar em tudo..."/></div>
      {msg && <div className={msg.includes('Falta')||msg.includes('Erro')?'notice warn':'notice'}>{msg}</div>}
      {!GOOGLE_SCRIPT_URL && <div className="notice warn">Falta colar o URL do Apps Script em src/googleConfig.js</div>}
      {filtered ? <SearchResults items={filtered}/> : <>
        {tab==='inicio' && <Inicio data={data} user={user} setTab={setTab} syncCalendar={syncCalendar} readCalendar={readCalendar} busy={busy}/>} 
        {tab==='calendario' && <Calendario data={data} addItem={addItem} removeItem={removeItem} syncCalendar={syncCalendar} readCalendar={readCalendar} busy={busy}/>} 
        {tab==='tarefas' && <Generic title="Tarefas" kind="tarefas" data={data.tarefas} addItem={addItem} removeItem={removeItem} toggle={toggle}/>} 
        {tab==='compras' && <Generic title="Compras" kind="compras" data={data.compras} addItem={addItem} removeItem={removeItem} toggle={toggle} noDate/>} 
        {tab==='refeicoes' && <Generic title="Refeições" kind="refeicoes" data={data.refeicoes} addItem={addItem} removeItem={removeItem}/>} 
        {tab==='familia' && <Familia data={data}/>} 
        {tab==='ferias' && <Generic title="Férias" kind="ferias" data={data.ferias} addItem={addItem} removeItem={removeItem}/>} 
        {tab==='study' && <ImportPage title="RJP Study" kind="study" icon={<GraduationCap/>} data={data.study} importer={importStudy} removeItem={removeItem} addItem={addItem} busy={busy}/>} 
        {tab==='swim' && <ImportPage title="SwimTrack" kind="swim" icon={<Waves/>} data={data.swim} importer={importSwim} removeItem={removeItem} addItem={addItem} busy={busy}/>} 
        {tab==='despesas' && <Generic title="Despesas" kind="despesas" data={data.despesas} addItem={addItem} removeItem={removeItem}/>} 
        {tab==='veiculos' && <Generic title="Veículos" kind="veiculos" data={data.veiculos} addItem={addItem} removeItem={removeItem}/>} 
        {tab==='saude' && <Generic title="Saúde" kind="saude" data={data.saude} addItem={addItem} removeItem={removeItem}/>} 
      </>}
    </main>
    <nav>{sections.map(([id,label,Icon])=><button key={id} className={tab===id?'active':''} onClick={()=>{setQ('');setTab(id)}}><Icon size={19}/><span>{label}</span></button>)}</nav>
  </div>
}

function labelOf(kind){ return ({tarefas:'Tarefa', compras:'Compras', refeicoes:'Refeição', ferias:'Férias', despesas:'Despesa', veiculos:'Veículo', saude:'Saúde', study:'RJP Study', swim:'SwimTrack'})[kind] || kind }
function Card({title,children,action,onClick}){return <section className="card"><div className="cardTop"><h2>{title}</h2>{action&&<button onClick={onClick}>{action}</button>}</div>{children}</section>}
function Inicio({data,user,setTab,syncCalendar,readCalendar,busy}){return <><section className="hero"><h1>Hub familiar sincronizado</h1><p>Tarefas, compras, refeições, férias, despesas, saúde, veículos, Study e SwimTrack no mesmo calendário.</p><small>Bom dia, {user}. {data.tarefas.filter(x=>!x.ok).length} tarefas abertas · {data.eventos.length} eventos no calendário.</small></section><div className="quick"><button onClick={syncCalendar} disabled={busy}><RefreshCw/> Sincronizar calendário</button><button onClick={readCalendar} disabled={busy}><CalendarDays/> Ler Google Calendar</button><button onClick={()=>exportPDF(data)}><Download/> PDF</button><button onClick={()=>exportICS(data.eventos)}><Download/> ICS</button></div><Card title="Próximos eventos" action="Ver calendário" onClick={()=>setTab('calendario')}>{data.eventos.slice(0,4).map(e=><Event key={e.id} e={e}/>)}</Card><Card title="Tarefas pendentes" action="Ver todas" onClick={()=>setTab('tarefas')}>{data.tarefas.filter(x=>!x.ok).slice(0,4).map(t=><Item key={t.id} item={t}/>)}</Card><div className="stats"><Stat n={data.compras.filter(x=>!x.ok).length} t="Compras"/><Stat n={data.study.length} t="Study"/><Stat n={data.swim.length} t="SwimTrack"/></div></>}
function Stat({n,t}){return <div className="stat"><b>{n}</b><span>{t}</span></div>}
function Event({e,onDelete}){return <div className="item"><span className="dot"></span><div><b>{e.titulo}</b><p>{e.data||'Sem data'} {e.hora && `· ${e.hora}`} · {e.membro||'Todos'} · {e.origem||'Família'}</p></div>{onDelete&&<button className="small" onClick={onDelete}><Trash2 size={16}/></button>}</div>}
function Item({item,onDelete,onToggle}){return <div className="item"><button className={item.ok?'check on':'check'} onClick={onToggle}></button><div><b className={item.ok?'done':''}>{item.titulo||item.nome||item.destino}</b><p>{item.data||'Sem data'} · {item.membro||item.resp||'Todos'} {item.notas?`· ${item.notas}`:''}</p></div>{onDelete&&<button className="small" onClick={onDelete}><Trash2 size={16}/></button>}</div>}
function MiniForm({kind,addItem,noDate=false}){const [f,setF]=useState({...emptyForm,data:noDate?'':todayISO()}); return <form className="form" onSubmit={e=>{e.preventDefault(); if(!f.titulo.trim())return; addItem(kind,{...f,nome:f.titulo},!noDate); setF({...emptyForm,data:noDate?'':todayISO()})}}><input value={f.titulo} onChange={e=>setF({...f,titulo:e.target.value})} placeholder={`Adicionar ${labelOf(kind).toLowerCase()}`}/>{!noDate&&<input type="date" value={f.data} onChange={e=>setF({...f,data:e.target.value})}/>}<input type="time" value={f.hora} onChange={e=>setF({...f,hora:e.target.value})}/><select value={f.membro} onChange={e=>setF({...f,membro:e.target.value})}>{['Todos',...membros].map(m=><option key={m}>{m}</option>)}</select><input value={f.notas} onChange={e=>setF({...f,notas:e.target.value})} placeholder="Notas"/><button><Plus/> Guardar</button></form>}
function Generic({title,kind,data,addItem,removeItem,toggle,noDate}){return <><Toolbar title={title}/><MiniForm kind={kind} addItem={addItem} noDate={noDate}/><Card title={`${data.length} registos`}>{data.map(x=><Item key={x.id} item={x} onDelete={()=>removeItem(kind,x.id)} onToggle={toggle?()=>toggle(kind,x.id):undefined}/>)}</Card></>}
function Calendario({data,addItem,removeItem,syncCalendar,readCalendar,busy}){return <><Toolbar title="Calendário familiar"/><div className="quick"><button onClick={syncCalendar} disabled={busy}><RefreshCw/> Sincronizar</button><button onClick={readCalendar} disabled={busy}><CalendarDays/> Ler Google</button></div><MiniForm kind="eventos" addItem={(k,item)=>addItem('eventos',toEvent(item,'Família'),false)}/><Card title="Eventos familiares">{data.eventos.map(e=><Event key={e.id} e={e} onDelete={()=>removeItem('eventos',e.id)}/>)}</Card></>}
function Familia({data}){return <><Toolbar title="Família"/><div className="people">{membros.map(m=><div key={m}><div className="avatar">{m[0]}</div><b>{m}</b><p>{data.eventos.filter(e=>e.membro===m||e.membro==='Todos').length} eventos</p><p>{data.tarefas.filter(t=>t.membro===m||t.resp===m).length} tarefas</p></div>)}</div></>}
function ImportPage({title,kind,icon,data,importer,removeItem,addItem,busy}){return <><Toolbar title={title}/><section className="hero smallHero">{icon}<h1>{title}</h1><p>Importa eventos e tarefas para o calendário familiar.</p></section><div className="quick"><button onClick={importer} disabled={busy}><UploadCloud/> Importar</button></div><MiniForm kind={kind} addItem={addItem}/><Card title={`${data.length} itens importados`}>{data.map(x=><Item key={x.id} item={x} onDelete={()=>removeItem(kind,x.id)}/>)}</Card></>}
function SearchResults({items}){return <Card title="Resultados da pesquisa">{items.map((x,i)=><Item key={i} item={{...x,titulo:x.titulo||x.nome||x.destino,notas:labelOf(x.kind)}} />)}</Card>}
function Toolbar({title}){return <div className="toolbar"><h1>{title}</h1></div>}
function exportICS(events){ const dt=s=>(s||todayISO()).replaceAll('-',''); const body=['BEGIN:VCALENDAR','VERSION:2.0','PRODID:-//Familia Rolim Pedro//PT'].concat(events.map(e=>['BEGIN:VEVENT',`UID:${e.id}@familia-rp`,`DTSTAMP:${dt(todayISO())}T090000Z`,`DTSTART;VALUE=DATE:${dt(e.data)}`,`SUMMARY:${e.titulo}`,`DESCRIPTION:${e.origem||''} ${e.membro||''} ${e.notas||''}`,'END:VEVENT']).flat(),['END:VCALENDAR']).join('\n'); download('familia-rolim-pedro.ics',body,'text/calendar') }
function exportPDF(data){ const doc=new jsPDF(); doc.setFontSize(18); doc.text('Família Rolim Pedro',14,18); doc.setFontSize(11); let y=32; Object.entries(data).forEach(([k,v])=>{ if(!Array.isArray(v))return; doc.text(`${labelOf(k)}: ${v.length}`,14,y); y+=8; v.slice(0,8).forEach(x=>{doc.text(`- ${x.titulo||x.nome||x.destino||''} ${x.data||''}`,18,y); y+=6; if(y>280){doc.addPage(); y=18}})}); doc.save('familia-rolim-pedro.pdf') }
function download(name,text,type){ const a=document.createElement('a'); a.href=URL.createObjectURL(new Blob([text],{type})); a.download=name; a.click(); URL.revokeObjectURL(a.href) }

createRoot(document.getElementById('root')).render(<App />)

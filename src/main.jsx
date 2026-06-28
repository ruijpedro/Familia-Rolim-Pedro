import React, { useMemo, useState } from 'react'
import { createRoot } from 'react-dom/client'
import jsPDF from 'jspdf'
import {
  Home, CheckSquare, ShoppingCart, CalendarDays, Users, Utensils, Plane,
  Waves, GraduationCap, Plus, Bell, Search, MoreHorizontal, FileText,
  Trash2, Download, Share2, WalletCards, Car, HeartPulse, RotateCcw
} from 'lucide-react'
import './style.css'

const membros = ['Rui', 'Gina', 'Constança', 'Lourenço']
const tabs = [
  ['inicio', 'Início', Home], ['tarefas', 'Tarefas', CheckSquare], ['compras', 'Compras', ShoppingCart],
  ['calendario', 'Calendário', CalendarDays], ['familia', 'Família', Users], ['refeicoes', 'Refeições', Utensils],
  ['ferias', 'Férias', Plane], ['study', 'RJP Study', GraduationCap], ['swim', 'SwimTrack', Waves],
  ['despesas', 'Despesas', WalletCards], ['veiculos', 'Veículos', Car], ['saude', 'Saúde', HeartPulse]
]

const todayISO = () => new Date().toISOString().slice(0, 10)
const nowTime = () => new Date().toTimeString().slice(0, 5)
const uid = () => Date.now() + Math.floor(Math.random() * 1000)

const seed = {
  tarefas: [], compras: [], eventos: [], refeicoes: [], ferias: [], documentos: [], despesas: [], veiculos: [], saude: []
}

function normalizar(raw){
  return { ...seed, ...(raw || {}) }
}
function load(){
  try { return normalizar(JSON.parse(localStorage.getItem('frp_data') || 'null')) } catch { return seed }
}
function saveData(next){ localStorage.setItem('frp_data', JSON.stringify(next)) }
function useStore(){
  const [data, setData] = useState(load)
  const save = (next) => { const fixed = normalizar(next); setData(fixed); saveData(fixed) }
  return [data, save]
}
function downloadFile(name, text, type = 'text/plain'){
  const blob = new Blob([text], { type })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url; a.download = name; a.click()
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}
function toICSDate(date, time='09:00'){
  const safeDate = date || todayISO()
  const safeTime = (time || '09:00').split(' ')[0].slice(0,5)
  return `${safeDate.replaceAll('-','')}T${safeTime.replace(':','')}00`
}
function makeICS(eventos){
  const lines = ['BEGIN:VCALENDAR','VERSION:2.0','PRODID:-//RJP//Familia Rolim Pedro//PT']
  eventos.forEach(e => {
    lines.push('BEGIN:VEVENT')
    lines.push(`UID:${e.id}@familia-rolim-pedro`)
    lines.push(`SUMMARY:${e.titulo}`)
    lines.push(`DTSTART:${toICSDate(e.data, e.hora)}`)
    lines.push(`DESCRIPTION:${e.tipo || 'Família'}${e.resp ? ' - ' + e.resp : ''}${e.notas ? ' - ' + e.notas : ''}`)
    lines.push('END:VEVENT')
  })
  lines.push('END:VCALENDAR')
  return lines.join('\r\n')
}
function googleCalendarUrl(e){
  const start = toICSDate(e.data, e.hora)
  const end = toICSDate(e.data, e.horaFim || e.hora || '10:00')
  const p = new URLSearchParams({ action:'TEMPLATE', text:e.titulo, dates:`${start}/${end}`, details:e.notas || e.tipo || 'Família Rolim Pedro' })
  return `https://calendar.google.com/calendar/render?${p.toString()}`
}
function exportPDF(data){
  const doc = new jsPDF()
  doc.setFontSize(18); doc.text('Família Rolim Pedro', 14, 18)
  doc.setFontSize(11); doc.text(`Resumo familiar - ${new Date().toLocaleDateString('pt-PT')}`, 14, 26)
  let y = 38
  const section = (title, rows) => {
    doc.setFontSize(14); doc.text(title, 14, y); y += 8
    doc.setFontSize(10)
    if (!rows.length) { doc.text('Sem registos.', 18, y); y += 7; return }
    rows.slice(0, 12).forEach(r => { doc.text(String(r).slice(0, 95), 18, y); y += 6; if (y > 280) { doc.addPage(); y = 20 } })
    y += 3
  }
  section('Tarefas', data.tarefas.map(t => `${t.ok ? '[OK]' : '[ ]'} ${t.titulo} - ${t.resp} - ${t.data}`))
  section('Calendário', data.eventos.map(e => `${e.data} ${e.hora || ''} - ${e.titulo} - ${e.tipo}`))
  section('Compras', data.compras.map(c => `${c.ok ? '[OK]' : '[ ]'} ${c.nome} - ${c.cat}`))
  section('Refeições', data.refeicoes.map(r => `${r.data || r.dia}: almoço ${r.almoco}; jantar ${r.jantar}`))
  section('Férias', data.ferias.map(f => `${f.destino} - ${f.dataInicio || f.datas} - ${f.estado}`))
  doc.save('Familia_Rolim_Pedro_resumo.pdf')
}
function App(){
  const [tab,setTab]=useState('inicio')
  const [data,save]=useStore()
  const [user,setUser]=useState(localStorage.getItem('frp_user')||'Rui')
  const [q,setQ]=useState('')
  const setU=u=>{setUser(u);localStorage.setItem('frp_user',u)}
  const add = (kind, item, calendar=false) => {
    const next = { ...data, [kind]: [{ id: uid(), ...item }, ...data[kind]] }
    if (calendar) next.eventos = [{ id: uid(), titulo:item.titulo || item.destino || item.nome, data:item.data || item.dataInicio || todayISO(), hora:item.hora || '09:00', tipo:item.tipo || titleOf(kind), resp:item.resp || user, notas:item.notas || item.obs || '' }, ...next.eventos]
    save(next)
  }
  const update = (kind,id,patch)=>save({...data,[kind]:data[kind].map(x=>x.id===id?{...x,...patch}:x)})
  const del = (kind,id)=>save({...data,[kind]:data[kind].filter(x=>x.id!==id)})
  const clearDone = () => save({...data, compras:data.compras.filter(x=>!x.ok), tarefas:data.tarefas.filter(x=>!x.ok)})
  const resetAll = () => { if(confirm('Limpar todos os dados locais da app?')) save(seed) }
  const filtered = useMemo(()=>filterAll(data,q),[data,q])
  return <div className="app">
    <header><img src="/logo.png" onError={e=>e.currentTarget.style.display='none'}/><div><b>Família</b><h1>Rolim Pedro</h1></div><select value={user} onChange={e=>setU(e.target.value)}>{membros.map(m=><option key={m}>{m}</option>)}</select><Bell size={21}/></header>
    <main>
      <div className="search"><Search size={18}/><input placeholder="Pesquisar na família..." value={q} onChange={e=>setQ(e.target.value)}/></div>
      {tab==='inicio'&&<Inicio data={filtered} all={data} user={user} setTab={setTab} exportPDF={()=>exportPDF(data)} exportICS={()=>downloadFile('familia_rolim_pedro.ics', makeICS(data.eventos), 'text/calendar')} clearDone={clearDone} resetAll={resetAll}/>}      
      {tab==='tarefas'&&<Tarefas data={filtered} add={(x)=>add('tarefas',x,true)} update={update} del={del} user={user}/>}      
      {tab==='compras'&&<Compras data={filtered} add={(x)=>add('compras',x,false)} update={update} del={del}/>}      
      {tab==='calendario'&&<Calendario data={filtered} add={(x)=>add('eventos',x,false)} del={del} exportICS={()=>downloadFile('familia_rolim_pedro.ics', makeICS(data.eventos), 'text/calendar')}/>}      
      {tab==='familia'&&<Familia data={filtered} add={(x)=>add('documentos',x,false)} del={del}/>}      
      {tab==='refeicoes'&&<Refeicoes data={filtered} add={(x)=>add('refeicoes',x,true)} del={del}/>}      
      {tab==='ferias'&&<Ferias data={filtered} add={(x)=>add('ferias',x,true)} del={del}/>}      
      {tab==='study'&&<Study data={filtered} add={(x)=>add('tarefas',{...x,origem:'RJP Study',tipo:'RJP Study'},true)} del={del}/>}      
      {tab==='swim'&&<Swim data={filtered} add={(x)=>add('eventos',{...x,tipo:'SwimTrack'},false)} del={del}/>}      
      {tab==='despesas'&&<Despesas data={filtered} add={(x)=>add('despesas',x,true)} del={del}/>}      
      {tab==='veiculos'&&<Veiculos data={filtered} add={(x)=>add('veiculos',x,true)} del={del}/>}      
      {tab==='saude'&&<Saude data={filtered} add={(x)=>add('saude',x,true)} del={del}/>}      
    </main>
    <nav>{tabs.map(([id,label,Icon])=><button className={tab===id?'active':''} onClick={()=>setTab(id)} key={id}><Icon size={18}/><span>{label}</span></button>)}</nav>
  </div>
}
function titleOf(k){ return ({tarefas:'Tarefa',refeicoes:'Refeição',ferias:'Férias',despesas:'Despesa',veiculos:'Veículo',saude:'Saúde'})[k] || 'Família' }
function filterAll(data,q){
  if(!q.trim()) return data
  const s = q.toLowerCase()
  const hit = x => JSON.stringify(x).toLowerCase().includes(s)
  return Object.fromEntries(Object.entries(data).map(([k,v])=>[k,Array.isArray(v)?v.filter(hit):v]))
}
function Card({title,children,action,onClick}){return <section className="card"><div className="cardTop"><h2>{title}</h2>{action&&<button onClick={onClick}>{action}</button>}</div>{children}</section>}
function Toolbar({title,add,extra}){return <div className="toolbar"><h1>{title}</h1><div>{extra}{add&&<button onClick={add}><Plus size={20}/></button>}<MoreHorizontal size={20}/></div></div>}
function Inicio({data,all,user,setTab,exportPDF,exportICS,clearDone,resetAll}){return <>
  <div className="hero"><span>🏠</span><div><h2>Bom dia, {user}!</h2><p>{all.tarefas.filter(t=>!t.ok).length} tarefas abertas · {all.eventos.length} eventos no calendário</p></div></div>
  <div className="actions"><button onClick={exportPDF}><Download size={16}/> PDF</button><button onClick={exportICS}><CalendarDays size={16}/> ICS</button><button onClick={clearDone}><Trash2 size={16}/> Limpar feitos</button><button onClick={resetAll}><RotateCcw size={16}/> Reset</button></div>
  <Card title="Tarefas pendentes" action="Ver todas" onClick={()=>setTab('tarefas')}>{data.tarefas.filter(t=>!t.ok).slice(0,4).map(t=><Row key={t.id} item={t}/>)}</Card>
  <Card title="Próximos eventos" action="Ver calendário" onClick={()=>setTab('calendario')}>{data.eventos.slice(0,5).map(e=><Event key={e.id} e={e}/>)}</Card>
  <Card title="Compras pendentes" action="Ver lista" onClick={()=>setTab('compras')}><div className="chips">{data.compras.filter(x=>!x.ok).slice(0,8).map(x=><span key={x.id}>{x.nome}</span>)}</div></Card>
  <div className="grid2"><Mini title="RJP Study" icon={<GraduationCap/>} onClick={()=>setTab('study')}/><Mini title="SwimTrack" icon={<Waves/>} onClick={()=>setTab('swim')}/><Mini title="Refeições" icon={<Utensils/>} onClick={()=>setTab('refeicoes')}/><Mini title="Férias" icon={<Plane/>} onClick={()=>setTab('ferias')}/></div>
</>}
function Row({item,toggle,onDelete}){return <div className="row"><button onClick={toggle} className={item.ok?'check on':'check'}></button><div><b className={item.ok?'done':''}>{item.titulo||item.nome}</b><p>{item.resp||item.cat||item.tipo||'Família'} · {item.data||item.origem||''}</p></div>{item.prio&&<em className={item.prio}>{item.prio}</em>}{onDelete&&<button className="icon" onClick={onDelete}><Trash2 size={16}/></button>}</div>}
function Event({e,onDelete}){return <div className="row event"><span className="dot"></span><div><b>{e.titulo}</b><p>{e.data} · {e.hora||'--:--'} · {e.tipo}</p></div><a className="icon" href={googleCalendarUrl(e)} target="_blank"><CalendarDays size={16}/></a>{onDelete&&<button className="icon" onClick={onDelete}><Trash2 size={16}/></button>}</div>}
function Mini({title,icon,onClick}){return <button className="mini" onClick={onClick}>{icon}<b>{title}</b></button>}
function promptObj(fields){
  const out = {}
  for (const [k,label,def=''] of fields){ const v = prompt(label, def); if(v===null) return null; out[k]=v }
  return out
}
function Tarefas({data,add,update,del,user}){const form=()=>{const x=promptObj([['titulo','Título da tarefa'],['resp','Responsável',user],['data','Data YYYY-MM-DD',todayISO()],['hora','Hora HH:MM',nowTime()],['prio','Prioridade Alta/Média/Baixa','Média']]); if(x)add({...x,ok:false,origem:'Família'})};return <><Toolbar title="Tarefas" add={form}/>{data.tarefas.map(t=><Row key={t.id} item={t} toggle={()=>update('tarefas',t.id,{ok:!t.ok})} onDelete={()=>del('tarefas',t.id)}/>)}</>}
function Compras({data,add,update,del}){const form=()=>{const x=promptObj([['nome','Item de compras'],['cat','Categoria','Geral']]); if(x)add({...x,ok:false})};return <><Toolbar title="Compras" add={form}/>{data.compras.map(c=><Row key={c.id} item={c} toggle={()=>update('compras',c.id,{ok:!c.ok})} onDelete={()=>del('compras',c.id)}/>)}</>}
function Calendario({data,add,del,exportICS}){const form=()=>{const x=promptObj([['titulo','Título do evento'],['data','Data YYYY-MM-DD',todayISO()],['hora','Hora HH:MM',nowTime()],['tipo','Tipo','Família'],['notas','Notas','']]); if(x)add(x)};return <><Toolbar title="Calendário familiar" add={form} extra={<button onClick={exportICS}><Share2 size={19}/></button>}/><Card title="Eventos familiares">{data.eventos.map(e=><Event key={e.id} e={e} onDelete={()=>del('eventos',e.id)}/>)}</Card></>}
function Familia({data,add,del}){const form=()=>{const x=promptObj([['nome','Nome do documento/nota'],['tipo','Tipo','Família'],['url','Link Drive/nota','']]); if(x)add(x)};return <><Toolbar title="Família" add={form}/><div className="people">{membros.map(m=><div key={m}><div className="avatar">{m[0]}</div><b>{m}</b><p>{data.tarefas.filter(t=>t.resp===m&&!t.ok).length} tarefas</p></div>)}</div><Card title="Documentos e notas importantes">{data.documentos.map(d=><div className="doc" key={d.id}><FileText size={18}/>{d.url?<a href={d.url} target="_blank">{d.nome}</a>:d.nome}<em>{d.tipo}</em><button className="icon" onClick={()=>del('documentos',d.id)}><Trash2 size={16}/></button></div>)}</Card></>}
function Refeicoes({data,add,del}){const form=()=>{const x=promptObj([['titulo','Título no calendário','Planeamento refeição'],['data','Data YYYY-MM-DD',todayISO()],['hora','Hora','19:30'],['almoco','Almoço',''],['jantar','Jantar','']]); if(x)add({...x,tipo:'Refeição',notas:`Almoço: ${x.almoco} | Jantar: ${x.jantar}`})};return <><Toolbar title="Planeamento de refeições" add={form}/><Card title="Refeições">{data.refeicoes.map(r=><div className="meal" key={r.id}><b>{r.data}</b><p>Almoço: {r.almoco}</p><p>Jantar: {r.jantar}</p><button onClick={()=>del('refeicoes',r.id)}>Apagar</button></div>)}</Card></>}
function Ferias({data,add,del}){const form=()=>{const x=promptObj([['destino','Destino'],['dataInicio','Data início YYYY-MM-DD',todayISO()],['hora','Hora','09:00'],['estado','Estado','A planear'],['notas','Notas','']]); if(x)add({...x,tipo:'Férias'})};return <><Toolbar title="Férias e escapadinhas" add={form}/><Card title="Planos">{data.ferias.map(f=><div className="meal" key={f.id}><b>{f.destino}</b><p>{f.dataInicio} · {f.estado}</p><p>{f.notas}</p><button onClick={()=>del('ferias',f.id)}>Apagar</button></div>)}</Card></>}
function Study({data,add,del}){const form=()=>{const x=promptObj([['titulo','Teste/trabalho/tarefa de estudo'],['resp','Aluno/responsável','Constança'],['data','Data YYYY-MM-DD',todayISO()],['hora','Hora','18:00'],['prio','Prioridade','Média']]); if(x)add({...x,ok:false})};return <><Toolbar title="Ligação RJP Study" add={form}/><Card title="Estudo no calendário familiar"><p className="muted">Adiciona testes, fichas, matrizes e sessões de estudo. Cada registo entra também no calendário.</p>{data.tarefas.filter(t=>t.origem==='RJP Study').map(t=><Row item={t} key={t.id} onDelete={()=>del('tarefas',t.id)}/>)}</Card></>}
function Swim({data,add,del}){const form=()=>{const x=promptObj([['titulo','Treino/prova/TAC'],['data','Data YYYY-MM-DD',todayISO()],['hora','Hora','18:00'],['notas','Notas','']]); if(x)add(x)};return <><Toolbar title="Ligação SwimTrack" add={form}/><Card title="Natação Constança"><p className="muted">Treinos, provas, TAC e alertas da Constança no calendário familiar.</p>{data.eventos.filter(e=>e.tipo==='SwimTrack').map(e=><Event e={e} key={e.id} onDelete={()=>del('eventos',e.id)}/>)}</Card></>}
function Despesas({data,add,del}){const form=()=>{const x=promptObj([['titulo','Despesa/pagamento'],['data','Data limite YYYY-MM-DD',todayISO()],['hora','Hora','20:00'],['valor','Valor €','0'],['notas','Notas','']]); if(x)add({...x,tipo:'Despesa'})};return <><Toolbar title="Despesas" add={form}/><Card title="Pagamentos e orçamento">{data.despesas.map(d=><div className="meal" key={d.id}><b>{d.titulo}</b><p>{d.data} · {d.valor} €</p><p>{d.notas}</p><button onClick={()=>del('despesas',d.id)}>Apagar</button></div>)}</Card></>}
function Veiculos({data,add,del}){const form=()=>{const x=promptObj([['titulo','Seguro/inspeção/manutenção'],['data','Data YYYY-MM-DD',todayISO()],['hora','Hora','09:00'],['notas','Veículo/notas','']]); if(x)add({...x,tipo:'Veículo'})};return <><Toolbar title="Veículos" add={form}/><Card title="Seguros, inspeções e manutenções">{data.veiculos.map(v=><Event key={v.id} e={{...v,tipo:'Veículo'}} onDelete={()=>del('veiculos',v.id)}/>)}</Card></>}
function Saude({data,add,del}){const form=()=>{const x=promptObj([['titulo','Consulta/medicação/exame'],['resp','Pessoa',''],['data','Data YYYY-MM-DD',todayISO()],['hora','Hora','09:00'],['notas','Notas','']]); if(x)add({...x,tipo:'Saúde'})};return <><Toolbar title="Saúde" add={form}/><Card title="Consultas, exames e medicação">{data.saude.map(s=><Event key={s.id} e={{...s,tipo:'Saúde'}} onDelete={()=>del('saude',s.id)}/>)}</Card></>}

createRoot(document.getElementById('root')).render(<App />)

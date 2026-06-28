import React, { useMemo, useState } from 'react'
import { createRoot } from 'react-dom/client'
import { Home, CheckSquare, ShoppingCart, CalendarDays, Users, Utensils, Plane, Waves, GraduationCap, Plus, Search, Trash2, RefreshCw, Download, WalletCards, Car, HeartPulse, Save, Bell } from 'lucide-react'
import { GOOGLE_SCRIPT_URL, FAMILY_MEMBERS } from './googleConfig.js'
import './style.css'

const membros = FAMILY_MEMBERS || ['Rui','Gina','Constança','Lourenço']
const tabs = [
  ['inicio','Início',Home], ['calendario','Calendário',CalendarDays], ['tarefas','Tarefas',CheckSquare], ['compras','Compras',ShoppingCart],
  ['refeicoes','Refeições',Utensils], ['ferias','Férias',Plane], ['despesas','Despesas',WalletCards], ['saude','Saúde',HeartPulse],
  ['veiculos','Veículos',Car], ['study','Study',GraduationCap], ['swim','Swim',Waves], ['familia','Família',Users]
]
const hoje = new Date().toISOString().slice(0,10)
const seed = { tarefas:[], compras:[], refeicoes:[], ferias:[], despesas:[], saude:[], veiculos:[], study:[], swim:[], eventos:[] }
const tipos = {
  tarefas:'Tarefa', compras:'Compra', refeicoes:'Refeição', ferias:'Férias', despesas:'Despesa', saude:'Saúde', veiculos:'Veículo', study:'RJP Study', swim:'SwimTrack'
}
function uid(){ return Date.now()+Math.random().toString(16).slice(2) }
function useStore(){
  const [data,setData]=useState(()=>JSON.parse(localStorage.getItem('frp_data_v3')||'null')||seed)
  const save=(next)=>{ setData(next); localStorage.setItem('frp_data_v3',JSON.stringify(next)) }
  return [data,save]
}
async function api(payload){
  if(!GOOGLE_SCRIPT_URL) throw new Error('Falta colar o URL do Apps Script em src/googleConfig.js')
  const r = await fetch(GOOGLE_SCRIPT_URL,{method:'POST',headers:{'Content-Type':'text/plain;charset=utf-8'},body:JSON.stringify(payload)})
  const j = await r.json(); if(!j.ok) throw new Error(j.error||'Erro Google'); return j
}
function toEvent(item, tipo){
  const start = item.data || hoje; const hour = item.hora || '09:00'
  return { id:item.eventId||'', titulo:`${tipo}: ${item.titulo||item.nome||item.destino||item.descricao}`, inicio:`${start}T${hour}:00`, fim:`${start}T${item.fim||'10:00'}:00`, descricao:`Família Rolim Pedro\nResponsável: ${item.resp||'Todos'}\nMembros: ${(item.membros||[]).join(', ')}`, local:item.local||'' }
}
function App(){
  const [tab,setTab]=useState('inicio'), [data,save]=useStore(), [user,setUser]=useState(localStorage.getItem('frp_user')||membros[0]), [q,setQ]=useState(''), [msg,setMsg]=useState('')
  const all = useMemo(()=>Object.entries(data).flatMap(([k,a])=>(a||[]).map(x=>({...x,kind:k}))),[data])
  const filtered = q ? all.filter(x=>JSON.stringify(x).toLowerCase().includes(q.toLowerCase())) : []
  const add=(kind,obj)=>save({...data,[kind]:[{id:uid(),resp:user,membros:[user],data:hoje,calendar:false,done:false,...obj},...(data[kind]||[])]})
  const update=(kind,id,patch)=>save({...data,[kind]:data[kind].map(x=>x.id===id?{...x,...patch}:x)})
  const del=(kind,id)=>save({...data,[kind]:data[kind].filter(x=>x.id!==id)})
  const syncItem=async(kind,item)=>{ try{ const ev=toEvent(item,tipos[kind]||kind); const j=await api({action:'addEvent',...ev}); update(kind,item.id,{calendar:true,eventId:j.id}); setMsg('Evento sincronizado no calendário familiar') }catch(e){setMsg(e.message)} }
  const syncAll=async()=>{ let n=0; for(const [k,arr] of Object.entries(data)){ if(k==='eventos') continue; for(const it of arr||[]) if(it.calendar && !it.eventId){ await syncItem(k,it); n++ } } setMsg(`Sincronização concluída: ${n} eventos`) }
  const loadCalendar=async()=>{ try{ const j=await api({action:'listEvents',start:new Date(Date.now()-86400000*30).toISOString(),end:new Date(Date.now()+86400000*180).toISOString()}); save({...data,eventos:j.events||[]}); setMsg('Calendário familiar atualizado') }catch(e){setMsg(e.message)} }
  const backup=()=>{ const blob=new Blob([JSON.stringify(data,null,2)],{type:'application/json'}); const a=document.createElement('a'); a.href=URL.createObjectURL(blob); a.download='familia-rolim-pedro-backup.json'; a.click() }
  return <div className="app"><header><img src="/logo.png"/><div><b>Família</b><h1>Rolim Pedro</h1></div><select value={user} onChange={e=>{setUser(e.target.value);localStorage.setItem('frp_user',e.target.value)}}>{membros.map(m=><option key={m}>{m}</option>)}</select><Bell/></header>
  <main><div className="search"><Search size={18}/><input placeholder="Pesquisar em tudo..." value={q} onChange={e=>setQ(e.target.value)}/></div>{msg&&<p className="msg">{msg}</p>}{q&&<List title="Resultados" items={filtered} del={del} update={update} syncItem={syncItem}/>} {!q&&<>
  {tab==='inicio'&&<Inicio data={data} setTab={setTab} syncAll={syncAll} loadCalendar={loadCalendar} backup={backup}/>} {tab==='calendario'&&<Calendario data={data} loadCalendar={loadCalendar}/>} {tab==='familia'&&<Familia data={data}/>} 
  {['tarefas','compras','refeicoes','ferias','despesas','saude','veiculos','study','swim'].includes(tab)&&<Modulo kind={tab} data={data} add={add} del={del} update={update} syncItem={syncItem}/>} </>}</main>
  <nav>{tabs.map(([id,label,Icon])=><button className={tab===id?'active':''} onClick={()=>setTab(id)} key={id}><Icon size={18}/><span>{label}</span></button>)}</nav></div>
}
function Inicio({data,setTab,syncAll,loadCalendar,backup}){ const pend=data.tarefas.filter(x=>!x.done).length; const cal=Object.entries(data).flatMap(([k,a])=>k==='eventos'?[]:(a||[]).filter(x=>x.calendar)).length
return <><div className="hero"><h2>Hub familiar sincronizado</h2><p>Tarefas, compras, refeições, férias, despesas, saúde, veículos, Study e SwimTrack no mesmo calendário.</p></div><div className="actions"><button onClick={syncAll}><RefreshCw/> Sincronizar calendário</button><button onClick={loadCalendar}><CalendarDays/> Ler Google Calendar</button><button onClick={backup}><Download/> Backup</button></div><div className="grid"><Card t="Tarefas pendentes" v={pend} onClick={()=>setTab('tarefas')}/><Card t="Itens com calendário" v={cal} onClick={()=>setTab('calendario')}/><Card t="Compras" v={data.compras.length} onClick={()=>setTab('compras')}/><Card t="Eventos Google" v={data.eventos.length} onClick={()=>setTab('calendario')}/></div></> }
function Card({t,v,onClick}){return <button className="card mini" onClick={onClick}><b>{v}</b><span>{t}</span></button>}
function Modulo({kind,data,add,del,update,syncItem}){ const title=tipos[kind]; const blank={titulo:'',nome:'',descricao:'',data:hoje,hora:'09:00',resp:membros[0],calendar:true}; const [f,setF]=useState(blank); const list=data[kind]||[]; const submit=()=>{ const main=f.titulo||f.nome||f.descricao||f.destino; if(!main) return; add(kind,f); setF(blank)}
return <><div className="toolbar"><h1>{title}</h1><button onClick={submit}><Plus/>Adicionar</button></div><section className="form"><input placeholder="Título / nome / descrição" value={f.titulo} onChange={e=>setF({...f,titulo:e.target.value,nome:e.target.value,descricao:e.target.value})}/><input type="date" value={f.data} onChange={e=>setF({...f,data:e.target.value})}/><input type="time" value={f.hora} onChange={e=>setF({...f,hora:e.target.value})}/><select value={f.resp} onChange={e=>setF({...f,resp:e.target.value})}>{membros.map(m=><option key={m}>{m}</option>)}</select><label><input type="checkbox" checked={f.calendar} onChange={e=>setF({...f,calendar:e.target.checked})}/> adicionar ao calendário familiar</label></section><List title={title} items={list.map(x=>({...x,kind}))} del={del} update={update} syncItem={syncItem}/></> }
function List({title,items,del,update,syncItem}){return <section className="card"><h2>{title}</h2>{items.length===0&&<p className="muted">Sem registos.</p>}{items.map(it=><div className="row" key={it.id}><input type="checkbox" checked={!!it.done} onChange={e=>update(it.kind,it.id,{done:e.target.checked})}/><div><b className={it.done?'done':''}>{it.titulo||it.nome||it.destino||it.descricao}</b><p>{it.data||''} {it.hora||''} · {it.resp||'Todos'} {it.calendar?'· entra no calendário':''} {it.eventId?'· sincronizado':''}</p></div>{it.calendar&&!it.eventId&&<button onClick={()=>syncItem(it.kind,it)}><CalendarDays size={16}/></button>}<button onClick={()=>del(it.kind,it.id)}><Trash2 size={16}/></button></div>)}</section>}
function Calendario({data,loadCalendar}){ const local=Object.entries(data).flatMap(([k,a])=>k==='eventos'?[]:(a||[]).filter(x=>x.calendar).map(x=>({...x,kind:k,tipo:tipos[k]}))); return <><div className="toolbar"><h1>Calendário familiar</h1><button onClick={loadCalendar}><RefreshCw/>Ler Google</button></div><section className="card"><h2>Eventos locais a sincronizar</h2>{local.map(e=><div className="row" key={e.id}><span className="dot"/><div><b>{e.tipo}: {e.titulo||e.nome||e.descricao}</b><p>{e.data} {e.hora} · {e.resp}</p></div></div>)}</section><section className="card"><h2>Eventos vindos do Google Calendar</h2>{data.eventos.map(e=><div className="row" key={e.id}><span className="dot ok"/><div><b>{e.titulo}</b><p>{String(e.inicio).slice(0,16).replace('T',' ')} · {e.local||''}</p></div></div>)}</section></>}
function Familia({data}){return <><div className="toolbar"><h1>Família</h1></div><div className="people">{membros.map(m=><div className="person" key={m}><div className="avatar">{m[0]}</div><b>{m}</b><p>{Object.values(data).flat().filter(x=>x.resp===m&&!x.done).length} pendentes</p></div>)}</div></>}
createRoot(document.getElementById('root')).render(<App />)

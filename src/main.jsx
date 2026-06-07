import React, { useMemo, useState } from 'react'
import { createRoot } from 'react-dom/client'
import { Home, CheckSquare, ShoppingCart, CalendarDays, Users, Utensils, Plane, Waves, GraduationCap, Plus, Bell, Search, MoreHorizontal, FileText, WalletCards } from 'lucide-react'
import './style.css'

const membros = ['Rui','Gina','Constança','Lourenço']
const tabs = [
  ['inicio','Início',Home], ['tarefas','Tarefas',CheckSquare], ['compras','Compras',ShoppingCart],
  ['calendario','Calendário',CalendarDays], ['familia','Família',Users], ['refeicoes','Refeições',Utensils],
  ['ferias','Férias',Plane], ['study','RJP Study',GraduationCap], ['swim','SwimTrack',Waves]
]
const seed = {
  tarefas:[
    {id:1,titulo:'Levar Constança ao treino',resp:'Rui',data:'Hoje',prio:'Alta',ok:false,origem:'Família'},
    {id:2,titulo:'Estudar RMII',resp:'Rui',data:'Hoje',prio:'Média',ok:false,origem:'RJP Study'},
    {id:3,titulo:'Preparar mochila da natação',resp:'Constança',data:'Amanhã',prio:'Média',ok:false,origem:'SwimTrack'},
    {id:4,titulo:'Arrumar o quarto',resp:'Lourenço',data:'20 mai',prio:'Baixa',ok:false,origem:'Casa'}
  ],
  compras:[
    {id:1,nome:'Leite',cat:'Laticínios',ok:false},{id:2,nome:'Pão',cat:'Padaria',ok:true},{id:3,nome:'Ovos',cat:'Mercearia',ok:true},{id:4,nome:'Fruta',cat:'Frutas e legumes',ok:false},{id:5,nome:'Arroz',cat:'Mercearia',ok:false},{id:6,nome:'Detergente',cat:'Limpeza',ok:false}
  ],
  eventos:[
    {id:1,titulo:'Treino Constança',data:'Hoje',hora:'18:00 - 19:30',tipo:'SwimTrack'},
    {id:2,titulo:'Teste de Matemática',data:'Amanhã',hora:'10:00',tipo:'RJP Study'},
    {id:3,titulo:'Reunião Escola Lourenço',data:'Quinta',hora:'18:30',tipo:'Família'},
    {id:4,titulo:'Pagar conta da luz',data:'Sexta',hora:'20:00',tipo:'Casa'}
  ],
  refeicoes:[
    {id:1,dia:'Segunda',almoco:'Sopa + frango grelhado',jantar:'Massa com atum'},
    {id:2,dia:'Terça',almoco:'Arroz de peru',jantar:'Peixe no forno'},
    {id:3,dia:'Quarta',almoco:'Omelete + salada',jantar:'Bifinhos com legumes'}
  ],
  ferias:[
    {id:1,destino:'Galiza',datas:'Agosto',estado:'A planear',notas:'Ver alojamento e custos'},
    {id:2,destino:'Fim de semana família',datas:'Junho',estado:'Ideia',notas:'Escolher local perto da praia'}
  ],
  documentos:[
    {id:1,nome:'Horário escolar Constança',tipo:'RJP Study'},
    {id:2,nome:'TAC natação',tipo:'SwimTrack'},
    {id:3,nome:'Documentos férias',tipo:'Férias'}
  ]
}
function useStore(){
  const [data,setData]=useState(()=>JSON.parse(localStorage.getItem('frp_data')||'null')||seed)
  const save=(next)=>{setData(next);localStorage.setItem('frp_data',JSON.stringify(next))}
  return [data,save]
}
function App(){
  const [tab,setTab]=useState('inicio'); const [data,save]=useStore();
  const [user,setUser]=useState(localStorage.getItem('frp_user')||'Rui')
  const setU=u=>{setUser(u);localStorage.setItem('frp_user',u)}
  const addTarefa=()=>{const titulo=prompt('Nova tarefa'); if(!titulo)return; save({...data,tarefas:[{id:Date.now(),titulo,resp:user,data:'Hoje',prio:'Média',ok:false,origem:'Família'},...data.tarefas]})}
  const addCompra=()=>{const nome=prompt('Novo item de compras'); if(!nome)return; save({...data,compras:[{id:Date.now(),nome,cat:'Geral',ok:false},...data.compras]})}
  const toggle=(kind,id)=>save({...data,[kind]:data[kind].map(x=>x.id===id?{...x,ok:!x.ok}:x)})
  return <div className="app">
    <header><img src="/logo.png"/><div><b>Família</b><h1>Rolim Pedro</h1></div><select value={user} onChange={e=>setU(e.target.value)}>{membros.map(m=><option key={m}>{m}</option>)}</select><Bell size={21}/></header>
    <main>
      {tab==='inicio'&&<Inicio data={data} user={user} setTab={setTab}/>} 
      {tab==='tarefas'&&<Tarefas data={data} add={addTarefa} toggle={id=>toggle('tarefas',id)}/>} 
      {tab==='compras'&&<Compras data={data} add={addCompra} toggle={id=>toggle('compras',id)}/>} 
      {tab==='calendario'&&<Calendario data={data}/>} 
      {tab==='familia'&&<Familia data={data}/>} 
      {tab==='refeicoes'&&<Refeicoes data={data}/>} 
      {tab==='ferias'&&<Ferias data={data}/>} 
      {tab==='study'&&<Study data={data}/>} 
      {tab==='swim'&&<Swim data={data}/>} 
    </main>
    <nav>{tabs.map(([id,label,Icon])=><button className={tab===id?'active':''} onClick={()=>setTab(id)} key={id}><Icon size={18}/><span>{label}</span></button>)}</nav>
  </div>
}
function Card({title,children,action,onClick}){return <section className="card"><div className="cardTop"><h2>{title}</h2>{action&&<button onClick={onClick}>{action}</button>}</div>{children}</section>}
function Inicio({data,user,setTab}){return <><div className="hero"><span>☀️</span><div><h2>Bom dia, {user}!</h2><p>Organização • Tarefas • Compras • Calendário</p></div></div><Card title="Tarefas para hoje" action="Ver todas" onClick={()=>setTab('tarefas')}>{data.tarefas.slice(0,3).map(t=><Row key={t.id} item={t}/>)}</Card><Card title="Próximos eventos" action="Ver calendário" onClick={()=>setTab('calendario')}>{data.eventos.slice(0,3).map(e=><Event key={e.id} e={e}/>)}</Card><Card title="Compras pendentes" action="Ver lista" onClick={()=>setTab('compras')}><div className="chips">{data.compras.filter(x=>!x.ok).slice(0,5).map(x=><span key={x.id}>{x.nome}</span>)}</div></Card><div className="grid2"><Mini title="RJP Study" icon={<GraduationCap/>} onClick={()=>setTab('study')}/><Mini title="SwimTrack" icon={<Waves/>} onClick={()=>setTab('swim')}/><Mini title="Refeições" icon={<Utensils/>} onClick={()=>setTab('refeicoes')}/><Mini title="Férias" icon={<Plane/>} onClick={()=>setTab('ferias')}/></div></>}
function Row({item,toggle}){return <div className="row"><button onClick={toggle} className={item.ok?'check on':'check'}></button><div><b className={item.ok?'done':''}>{item.titulo||item.nome}</b><p>{item.resp||item.cat} · {item.data||item.origem}</p></div>{item.prio&&<em className={item.prio}>{item.prio}</em>}</div>}
function Event({e}){return <div className="row event"><span className="dot"></span><div><b>{e.titulo}</b><p>{e.data} · {e.hora} · {e.tipo}</p></div></div>}
function Mini({title,icon,onClick}){return <button className="mini" onClick={onClick}>{icon}<b>{title}</b></button>}
function Tarefas({data,add,toggle}){return <><Toolbar title="Tarefas" add={add}/>{data.tarefas.map(t=><Row key={t.id} item={t} toggle={()=>toggle(t.id)}/>)}</>}
function Compras({data,add,toggle}){return <><Toolbar title="Compras" add={add}/>{data.compras.map(c=><Row key={c.id} item={c} toggle={()=>toggle(c.id)}/>)}</>}
function Calendario({data}){return <><Toolbar title="Calendário familiar"/><Card title="Maio 2025"><div className="days">{['Seg 19','Ter 20','Qua 21','Qui 22','Sex 23','Sáb 24','Dom 25'].map((d,i)=><span className={i===1?'sel':''} key={d}>{d}</span>)}</div>{data.eventos.map(e=><Event key={e.id} e={e}/>)}</Card></>}
function Familia({data}){return <><Toolbar title="Família"/><div className="people">{membros.map(m=><div><div className="avatar">{m[0]}</div><b>{m}</b><p>{data.tarefas.filter(t=>t.resp===m&&!t.ok).length} tarefas</p></div>)}</div><Card title="Documentos importantes">{data.documentos.map(d=><div className="doc"><FileText size={18}/>{d.nome}<em>{d.tipo}</em></div>)}</Card></>}
function Refeicoes({data}){return <><Toolbar title="Planeamento de refeições"/><Card title="Semana atual">{data.refeicoes.map(r=><div className="meal"><b>{r.dia}</b><p>Almoço: {r.almoco}</p><p>Jantar: {r.jantar}</p></div>)}</Card></>}
function Ferias({data}){return <><Toolbar title="Férias e escapadinhas"/><Card title="Planos">{data.ferias.map(f=><div className="meal"><b>{f.destino}</b><p>{f.datas} · {f.estado}</p><p>{f.notas}</p></div>)}</Card></>}
function Study({data}){return <><Toolbar title="Ligação RJP Study"/><Card title="Estudo dos filhos"><p className="muted">Aqui entram testes, disciplinas, matrizes, PDFs e plano semanal vindos da app RJP_Study.</p>{data.tarefas.filter(t=>t.origem==='RJP Study').map(t=><Row item={t} key={t.id}/>)}</Card></>}
function Swim({data}){return <><Toolbar title="Ligação SwimTrack"/><Card title="Natação Constança"><p className="muted">Aqui entram treinos, provas, TAC, tempos e alertas vindos do SwimTrack.</p>{data.eventos.filter(e=>e.tipo==='SwimTrack').map(e=><Event e={e} key={e.id}/>)}</Card></>}
function Toolbar({title,add}){return <div className="toolbar"><h1>{title}</h1><div><Search size={20}/>{add&&<button onClick={add}><Plus size={20}/></button>}<MoreHorizontal size={20}/></div></div>}

createRoot(document.getElementById('root')).render(<App />)

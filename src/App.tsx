import { useEffect, useMemo, useReducer, useState } from 'react';
import {
  Activity, AlertCircle, ArrowRight, BarChart3, Bell, Check, CheckCheck,
  ChevronDown, CircleHelp, ClipboardCheck, Clock3, Coins, FileText,
  Headphones, Inbox, Mail, Package, PackageCheck, Pause, PhoneCall, Play,
  Printer, RefreshCw, ShieldCheck, Sparkles, Star, Store, Timer, TrendingUp,
  UserRound, Zap
} from 'lucide-react';
import { initialGame, reducer, clockText, type Intake, type Job, type ActionType } from './game/engine';
import './styles/rework.css';

type Accent = 'counter' | 'phone' | 'email' | 'pickup';
const fmt = (n:number) => new Intl.NumberFormat('es-ES',{maximumFractionDigits:0}).format(n);
const euro = (n:number) => fmt(n)+' €';
const channelName:Record<Accent,string>={counter:'Mostrador',phone:'Teléfono',email:'Correo',pickup:'Recogida'};
const channelLabel = (c:Accent) => {
  const icons={counter:UserRound,phone:PhoneCall,email:Mail,pickup:PackageCheck};
  const Icon=icons[c];
  return <Icon size={18} strokeWidth={2.3}/>;
};
const statusName:Record<Job['status'],string>={
  queued:'En cola',printing:'Imprimiendo',finishing:'Acabados',ready:'Listo',delivered:'Entregado'
};
const PRODUCT_BADGES:Record<string,string>={
  'Tarjetas de visita':'TC','Folletos A5':'A5','Carteles A3':'A3',
  'Trípticos':'DL','Etiquetas':'ET','Invitaciones':'IN'
};

function MiniProduct({product}:{product:string}) {
  const kind=product.includes('Tarjetas')?'cards':product.includes('Folletos')?'flyers':
    product.includes('Carteles')?'posters':product.includes('Trípticos')?'fold':
    product.includes('Etiquetas')?'labels':'invites';
  return <div className={'mini-product mini-'+kind} aria-hidden="true">
    <div className="mock-shadow"></div>
    <div className="mock-paper">
      <span className="mock-overline">STUDIO / PRINT</span>
      <strong>{kind==='cards'?'hola!':kind==='posters'?'NOVA':kind==='labels'?'EDICIÓ':kind==='fold'?'IDEES':'DISEÑO'}</strong>
      <i className="mock-art"></i><span className="mock-lines"></span>
      <small>{PRODUCT_BADGES[product]||'PRINT'} · CMYK</small>
    </div>
    <span className="mock-swatch sw1"></span><span className="mock-swatch sw2"></span>
  </div>;
}
function Machine({active}:{active:boolean}) {
  return <div className={'machine '+(active?'machine-running':'')} aria-label={active?'Impresora en marcha':'Impresora en espera'}>
    <div className="machine-glow"></div>
    <div className="machine-paper-stack"><div></div><div></div></div>
    <div className="machine-top"><span></span><span></span></div>
    <div className="machine-body">
      <div className="machine-display">{active?'PRINTING...':'READY'}</div>
      <div className="machine-slot"><div className="machine-page"></div></div>
      <div className="machine-dots"><i></i><i></i><i></i><i></i></div>
    </div>
    <div className="machine-base"></div>
    <div className="machine-shadow"></div>
  </div>;
}
function Help({close}:{close:()=>void}) {
  return <div className="modal-backdrop" role="presentation" onMouseDown={close}>
    <div className="help-modal" role="dialog" aria-modal="true" aria-labelledby="help-title"
      onMouseDown={e=>e.stopPropagation()}>
      <button className="modal-close" onClick={close} aria-label="Cerrar">×</button>
      <div className="pill pill-teal"><Sparkles size={14}/> TUTORIAL RÁPIDO</div>
      <h2 id="help-title">Tu primera jornada RUSH</h2>
      <p>Atiende a los clientes, confirma encargos completos y deja que la imprenta los procese. Cuando estén listos, llegará alguien a recogerlos.</p>
      <div className="help-steps">
        <div><span>01</span><strong>Elige una entrada</strong><small>Mostrador, correo, llamada o recogida, en la columna izquierda.</small></div>
        <div><span>02</span><strong>Toma una decisión</strong><small>Lee el mensaje y selecciona cómo actuar. Las prisas tienen consecuencias.</small></div>
        <div><span>03</span><strong>Controla producción</strong><small>La máquina trabaja automáticamente. Los encargos tienen plazos.</small></div>
        <div><span>04</span><strong>Sobrevive al RUSH</strong><small>Gana puntos y dinero, pero protege la reputación de la imprenta.</small></div>
      </div>
      <div className="help-note"><ShieldCheck size={17}/> El reloj se puede pausar para pensar. La velocidad de lectura no determina la nota.</div>
      <button className="action-primary full" onClick={close}>¡Entendido! <ArrowRight size={16}/></button>
    </div>
  </div>;
}

function RequestDetails({item,jobs,onDecide}:{item:Intake;jobs:Job[];onDecide:(d:ActionType)=>void}) {
  const linked=jobs.find(job=>job.id===item.parentId);
  const isPickup=item.channel==='pickup';
  const isFollowup=!!item.parentId && !isPickup;
  return <div className="case-body" key={item.id}>
    <div className="case-customer">
      <div className={'avatar avatar-'+item.channel}>{item.customer.slice(0,1)}</div>
      <div className="customer-title"><strong>{item.customer}</strong><span>{channelName[item.channel]} · Solicitud #{item.id}</span></div>
      <div className={'case-priority '+(item.urgent?'priority-high':'')}>{item.urgent?'URGENTE':'NORMAL'}</div>
    </div>
    <div className="dialogue">
      <span className="dialogue-tag"><span className="tiny-pulse"></span> MENSAJE DEL CLIENTE</span>
      <p>“{item.message}”</p>
    </div>
    {linked ? <div className="linked-order">
      <div className="linked-order-header"><span>EXPEDIENTE RELACIONADO</span><strong>#{linked.id}</strong></div>
      <div className="linked-order-content"><Package size={21}/><div><b>{linked.product}</b><small>{linked.qty} uds. · {statusName[linked.status]}</small></div></div>
      <div className="linked-timing"><Clock3 size={13}/> Plazo comprometido: {clockText(linked.deadline)}</div>
    </div> : <div className="proposal-card">
      <MiniProduct product={item.product||'Tarjetas de visita'}/>
      <div className="proposal-info"><span className="eyebrow">SOLICITUD</span><h3>{item.product}</h3>
        <p>{item.qty} unidades · Impresión comercial</p>
        <div className={'data-status '+(item.ambiguous?'data-warning':'')}>
          {item.ambiguous?<AlertCircle size={15}/>:<Check size={15}/>}
          {item.ambiguous?'Faltan datos por confirmar':'Datos suficientes para presupuestar'}
        </div>
      </div>
    </div>}
    <div className="decision-block">
      <div className="decision-heading"><span>TU DECISIÓN</span><span className="decision-tip"><Timer size={13}/> El tiempo sigue avanzando</span></div>
      {!linked && <div className="decisions">
        {item.ambiguous && <button className="action-primary" onClick={()=>onDecide('clarify')}>
          <ClipboardCheck size={17}/> Aclarar necesidades <ArrowRight size={16}/>
        </button>}
        <button className={item.ambiguous?'action-secondary':'action-primary'} onClick={()=>onDecide('confirm')}>
          <CheckCheck size={17}/> Confirmar y registrar pedido <ArrowRight size={16}/>
        </button>
        <button className="action-tertiary" onClick={()=>onDecide('reject')}>No aceptar este encargo</button>
      </div>}
      {isFollowup && <div className="decisions">
        <button className="action-primary" onClick={()=>onDecide('check')}><ShieldCheck size={17}/> Comprobar el estado y responder <ArrowRight size={16}/></button>
        <button className="action-secondary" onClick={()=>onDecide('promise')}><Clock3 size={17}/> Prometer que estará a tiempo</button>
      </div>}
      {isPickup && <div className="decisions">
        <button className="action-primary" onClick={()=>onDecide('verify')}><PackageCheck size={17}/> Verificar referencia y entregar <ArrowRight size={16}/></button>
        <button className="action-secondary" onClick={()=>onDecide('blind')}><Package size={17}/> Entregar sin comprobar</button>
        {linked?.status!=='ready' && <div className="hint-warning"><AlertCircle size={14}/> Este pedido aún no está listo; no puede entregarse.</div>}
      </div>}
    </div>
  </div>;
}

export default function App() {
  const [state,dispatch]=useReducer(reducer,undefined,initialGame);
  const [selected,setSelected]=useState<number|null>(301);
  const [speed,setSpeed]=useState(1);
  const [showHelp,setShowHelp]=useState(false);
  const [inboxFilter,setInboxFilter]=useState<'all'|'urgent'>('all');
  useEffect(()=>{
    if(!state.playing)return;
    const timer=window.setInterval(()=>dispatch({type:'TICK'}),speed===2?580:1160);
    return ()=>window.clearInterval(timer);
  },[state.playing,speed]);
  const active=state.inbox.find(i=>i.id===selected)||state.inbox[0]||null;
  const inbox=useMemo(()=>state.inbox.filter(x=>inboxFilter==='all'||x.urgent),[state.inbox,inboxFilter]);
  const printing=state.jobs.find(j=>j.status==='printing');
  const waiting=state.jobs.filter(j=>j.status==='queued');
  const finishing=state.jobs.filter(j=>j.status==='finishing');
  const ready=state.jobs.filter(j=>j.status==='ready');
  const level=1+Math.floor(state.ticks/25);
  const decide=(decision:ActionType)=>{if(active)dispatch({type:'DECIDE',id:active.id,decision});};
  const restart=()=>{dispatch({type:'RESET'});setSelected(301);setSpeed(1);};
  return <div className="app-shell">
    <div className="top-stripe"><span></span><span></span><span></span><span></span></div>
    <header className="topbar">
      <div className="identity">
        <div className="logo-mark"><Printer size={26} strokeWidth={2.5}/><i></i></div>
        <div className="identity-main"><div className="logo-type">PRINT<span>RUSH</span><sup>®</sup></div><div className="logo-sub">THE PRINT SHOP SIMULATOR <b>·</b> FP ARTES GRÁFICAS</div></div>
      </div>
      <div className="top-actions">
        <span className="build-label">BETA 0.2 <span>2D REWORK</span></span>
        <button className="help-button" onClick={()=>setShowHelp(true)}><CircleHelp size={17}/> Cómo jugar</button>
        <button className="reset-button" onClick={restart} title="Reiniciar partida"><RefreshCw size={17}/></button>
      </div>
    </header>

    <section className="game-hud" aria-label="Indicadores de la partida">
      <div className="day-info">
        <span className="online-dot"></span><div><span>LOCAL #01 · IMPRENTA DE BARRIO</span><strong>JORNADA {String(state.day).padStart(2,'0')}</strong></div>
      </div>
      <div className="stat-group">
        <div className="hud-stat"><Clock3 size={18}/><div><small>RELOJ</small><strong>{clockText(state.clock)}</strong></div></div>
        <div className="hud-stat"><Coins size={19}/><div><small>CAJA</small><strong>{euro(state.cash)}</strong></div></div>
        <div className="hud-stat"><Star size={19}/><div><small>REPUTACIÓN</small><strong>{state.reputation}<span className="stat-denom">/100</span></strong></div></div>
        <div className="hud-stat"><Zap size={19}/><div><small>PUNTUACIÓN</small><strong>{fmt(state.score)}</strong></div></div>
      </div>
      <div className="hud-controls">
        <span className="rush-mark"><Activity size={16}/> RUSH · NIVEL {level}</span>
        <button className={'speed-button '+(speed===2?'selected':'')} onClick={()=>setSpeed(v=>v===1?2:1)} title="Cambiar velocidad">{speed}×</button>
        <button className={'play-button '+(state.playing?'is-playing':'')} onClick={()=>dispatch({type:'TOGGLE'})} disabled={state.gameOver}>
          {state.playing?<Pause size={17} fill="currentColor"/>:<Play size={17} fill="currentColor"/>}{state.playing?'Pausar':'Iniciar'}
        </button>
      </div>
    </section>

    <div className="game-grid">
      <aside className="inbox-panel surface">
        <div className="panel-topline">
          <div className="panel-title"><span className="icon-frame"><Inbox size={18}/></span><div><small>01 / RECEPCIÓN</small><h2>Entradas <span className="count">{state.inbox.length}</span></h2></div></div>
          <Bell size={17} className={state.inbox.some(i=>i.patience<15)?'bell-warning':''}/>
        </div>
        <div className="inbox-switch"><button className={inboxFilter==='all'?'active':''} onClick={()=>setInboxFilter('all')}>Todas</button><button className={inboxFilter==='urgent'?'active':''} onClick={()=>setInboxFilter('urgent')}>Urgentes</button></div>
        <div className="inbox-list">
          {inbox.map(item=>{
            const ratio=Math.max(0,100*item.patience/item.maxPatience);
            return <button key={item.id} className={'inbox-item '+(active?.id===item.id?'is-active':'')} onClick={()=>setSelected(item.id)}>
              <div className={'inbox-icon channel-'+item.channel}>{channelLabel(item.channel)}</div>
              <div className="inbox-copy"><div className="inbox-first"><strong>{item.customer}</strong>{item.urgent&&<span className="urgent-mark">!</span>}</div>
                <div className="inbox-second">{item.subject}</div><div className="inbox-third">{channelName[item.channel]} · #{item.id}</div>
                <div className="patience-track"><span style={{width:ratio+'%',background:ratio<28?'#ef705a':ratio<50?'#e5a449':'#42bba4'}}></span></div>
              </div>
              <span className="inbox-chevron">›</span>
            </button>;
          })}
          {inbox.length===0&&<div className="inbox-empty"><CheckCheck size={28}/><strong>¡Bandeja despejada!</strong><span>{inboxFilter==='urgent'?'No hay asuntos urgentes.':'La siguiente solicitud llegará pronto si el reloj avanza.'}</span></div>}
        </div>
        <div className="inbox-foot"><span className="status-pulse"></span><span>{state.playing?'RECIBIENDO SOLICITUDES':'TIEMPO DETENIDO'}</span><strong>{state.inbox.length}/7</strong></div>
      </aside>

      <main className="service-panel surface">
        <div className="service-header"><div><div className="eyebrow">02 / ÁREA DE ATENCIÓN</div><h2>{active?'Atender solicitud':'Todo bajo control'}<span className="service-spark">✳</span></h2></div>
          <div className="service-live"><span></span>{state.playing?'EN DIRECTO':'EN PAUSA'}</div></div>
        {active?<RequestDetails item={active} jobs={state.jobs} onDecide={decide}/>:
          <div className="case-empty"><div className="empty-illustration"><Headphones size={54}/><Sparkles size={20}/></div><h3>No hay clientes pendientes</h3><p>Aprovecha para revisar el taller. Cuando llegue una solicitud aparecerá en la bandeja de entradas.</p><button className="action-secondary" onClick={()=>dispatch({type:'TOGGLE'})} disabled={state.playing}>Reanudar jornada <ArrowRight size={16}/></button></div>}
        <div className="service-bottom"><div className="tip-light"><Sparkles size={16}/></div><span><strong>CONSEJO PROFESIONAL</strong> Comprueba las condiciones antes de prometer plazos o autorizar cambios.</span></div>
      </main>

      <aside className="workshop-panel surface">
        <div className="panel-topline"><div className="panel-title"><span className="icon-frame printer-frame"><Printer size={18}/></span><div><small>03 / OPERACIONES</small><h2>Producción</h2></div></div><span className="capacity-chip">1 MÁQUINA</span></div>
        <div className="printer-card">
          <div className="printer-head"><span><span className={'machine-led '+(printing?'on':'')}></span> DIGITAL PRESS 01</span><span>{printing?'ACTIVA':'LIBRE'}</span></div>
          <Machine active={!!printing}/>
          <div className="printer-work">
            {printing?<><strong>#{printing.id} · {printing.product}</strong><small>{printing.customer} · {printing.qty} unidades</small>
            <div className="big-progress"><span style={{width:Math.round((1-printing.remaining/printing.total)*100)+'%'}}></span></div>
            <div className="progress-caption"><span>PRODUCCIÓN EN MARCHA</span><b>{Math.round((1-printing.remaining/printing.total)*100)}%</b></div></>
            :<><strong>Máquina disponible</strong><small>Esperando el siguiente trabajo de la cola</small><div className="big-progress"><span style={{width:'0%'}}></span></div></>}
          </div>
        </div>
        <div className="queue-heading"><strong>Cola de trabajos</strong><span>{waiting.length+finishing.length+ready.length} pedidos</span></div>
        <div className="job-list">
          {finishing.map(j=><div className="job-card" key={j.id}><div className="job-badge finishing-badge"><FileText size={16}/></div><div><b>#{j.id} · {j.product}</b><small>En acabados</small></div><span className="job-dot processing"></span></div>)}
          {waiting.slice(0,3).map(j=><div className="job-card" key={j.id}><div className="job-badge"><Package size={16}/></div><div><b>#{j.id} · {j.product}</b><small>En espera · {clockText(j.deadline)} límite</small></div><span className="job-dot"></span></div>)}
          {ready.slice(0,3).map(j=><div className="job-card" key={j.id}><div className="job-badge ready-badge"><PackageCheck size={16}/></div><div><b>#{j.id} · {j.product}</b><small>Preparado para recoger</small></div><span className="job-dot ready"></span></div>)}
          {waiting.length+finishing.length+ready.length===0&&<div className="job-empty">No hay trabajos pendientes.</div>}
          {waiting.length+finishing.length+ready.length>9&&<div className="job-more">Y otros trabajos en el sistema…</div>}
        </div>
        <div className="workshop-footer"><TrendingUp size={17}/><span>Entregados hoy</span><strong>{state.delivered}</strong></div>
      </aside>
    </div>

    <div className="under-grid">
      <section className="flow-card surface">
        <div className="bottom-heading"><div><span className="eyebrow">FLUJO DE TRABAJO</span><h3>La imprenta nunca se detiene</h3></div><span className="flow-infotag">SIMULACIÓN EN TIEMPO REAL</span></div>
        <div className="production-flow">
          <div className="flow-segment"><div className="flow-icon icon-received"><Inbox size={23}/></div><div><small>01</small><strong>Recepción</strong><span>{state.inbox.length} pendientes</span></div></div>
          <ArrowRight className="flow-arrow" size={19}/>
          <div className="flow-segment"><div className="flow-icon icon-print"><Printer size={23}/></div><div><small>02</small><strong>Impresión</strong><span>{waiting.length+(printing?1:0)} trabajos</span></div></div>
          <ArrowRight className="flow-arrow" size={19}/>
          <div className="flow-segment"><div className="flow-icon icon-finish"><FileText size={23}/></div><div><small>03</small><strong>Acabados</strong><span>{finishing.length} trabajos</span></div></div>
          <ArrowRight className="flow-arrow" size={19}/>
          <div className="flow-segment"><div className="flow-icon icon-ready"><PackageCheck size={23}/></div><div><small>04</small><strong>Recogidas</strong><span>{ready.length} preparados</span></div></div>
        </div>
      </section>
      <section className="log-card surface">
        <div className="bottom-heading log-heading"><div><span className="eyebrow">REGISTRO</span><h3>Últimos eventos</h3></div><Activity size={18}/></div>
        <div className="log-items">
          {state.logs.slice(0,4).map(e=><div className={'log-line tone-'+e.tone} key={e.id}><span className="log-time">{clockText(e.at)}</span><i></i><span>{e.text}</span></div>)}
        </div>
      </section>
    </div>
    <footer className="footer"><span>PRINT RUSH <b>®</b> · PROTOTIPO EDUCATIVO / ARTES GRÁFICAS</span><span>V0.2 · 2D REWORK · Las cifras son ficticias</span><span>«ATENDER BIEN ES PRODUCIR MEJOR»</span></footer>
    {!state.playing&&!state.gameOver&&<div className="pause-fab"><span className="paused-tag"><Pause size={14}/> JUEGO EN PAUSA</span><button onClick={()=>dispatch({type:'TOGGLE'})}><Play size={16} fill="currentColor"/> {state.ticks===0?'Empezar jornada':'Continuar RUSH'}</button></div>}
    {state.gameOver&&<div className="modal-backdrop"><div className="gameover-modal"><div className="gameover-mark"><BarChart3 size={32}/></div><span className="eyebrow">FIN DE LA PARTIDA</span><h2>La imprenta necesita un nuevo comienzo</h2><p>Has atendido {state.serviced} solicitudes, entregado {state.delivered} encargos y conseguido {fmt(state.score)} puntos.</p><button className="action-primary full" onClick={restart}>Nueva partida <RefreshCw size={17}/></button></div></div>}
    {showHelp&&<Help close={()=>setShowHelp(false)}/>}
  </div>;
}

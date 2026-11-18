export type Channel = 'counter' | 'phone' | 'email' | 'pickup';
export type JobStatus = 'queued' | 'printing' | 'finishing' | 'ready' | 'delivered';
export type ActionType = 'confirm' | 'clarify' | 'reject' | 'check' | 'promise' | 'verify' | 'blind';
export interface Intake {
  id: number;
  channel: Channel;
  customer: string;
  subject: string;
  message: string;
  product?: string;
  qty?: number;
  urgent: boolean;
  ambiguous: boolean;
  clarified: boolean;
  parentId?: number;
  patience: number;
  maxPatience: number;
}
export interface Job {
  id: number;
  customer: string;
  product: string;
  qty: number;
  price: number;
  total: number;
  remaining: number;
  deadline: number;
  status: JobStatus;
  risk: boolean;
  pickupRequested: boolean;
  readyTick?: number;
  delayNotified: boolean;
}
export interface LogEntry { id: number; at: number; text: string; tone: 'info' | 'good' | 'bad'; }
export interface GameState {
  playing: boolean;
  gameOver: boolean;
  ticks: number;
  clock: number;
  day: number;
  cash: number;
  reputation: number;
  serviced: number;
  delivered: number;
  lost: number;
  score: number;
  nextIntake: number;
  nextJob: number;
  rng: number;
  inbox: Intake[];
  jobs: Job[];
  logs: LogEntry[];
}
export type Action =
  | {type:'TICK'}
  | {type:'TOGGLE'}
  | {type:'RESET'}
  | {type:'DECIDE'; id:number; decision:ActionType};

const PEOPLE = ['Aina', 'Marcos', 'Clara', 'Nora', 'Joan', 'Lucía', 'Hugo', 'Marta', 'Pau', 'Laura', 'Sofía', 'Eric'];
const PRODUCTS = [
  { name:'Tarjetas de visita', qty:250, base:58, duration:15 },
  { name:'Folletos A5', qty:500, base:115, duration:26 },
  { name:'Carteles A3', qty:70, base:91, duration:21 },
  { name:'Trípticos', qty:350, base:170, duration:35 },
  { name:'Etiquetas', qty:400, base:78, duration:17 },
  { name:'Invitaciones', qty:150, base:105, duration:24 }
];
const rand = (s:number):[number,number] => {
  const n = (Math.imul(s,1664525) + 1013904223) >>> 0;
  return [n, n / 4294967296];
};
export const pad = (v:number) => String(v).padStart(2,'0');
export const clockText = (time:number) => pad(Math.floor(time / 60) % 24) + ':' + pad(time % 60);
const log = (s:GameState,text:string,tone:LogEntry['tone']='info') => {
  s.logs = [{ id:s.ticks * 100 + s.logs.length + 1, at:s.clock, text, tone },...s.logs].slice(0,25);
};
const clamp = (v:number) => Math.max(0,Math.min(100,v));
const seeded = (s:GameState) => { const [seed,value] = rand(s.rng);s.rng=seed;return value; };

export function initialGame():GameState {
  return {
    playing:false,gameOver:false,ticks:0,clock:9*60,day:1,cash:780,reputation:86,
    serviced:0,delivered:0,lost:0,score:0,nextIntake:304,nextJob:1042,rng:72917,
    inbox:[
      {id:301,channel:'counter',customer:'Clara',subject:'Folletos para una cafetería',
       message:'Hola, necesito unos folletos para una inauguración. Me gustaría que fueran bonitos y económicos, pero no he decidido la cantidad.',
       product:'Folletos A5',qty:500,urgent:false,ambiguous:true,clarified:false,patience:40,maxPatience:40},
      {id:302,channel:'phone',customer:'Joan',subject:'Consulta sobre el pedido #1040',
       message:'Buenos días, llamo para saber si mis carteles estarán listos hoy. ¿Puedes consultar cómo va el pedido?',
       parentId:1040,urgent:false,ambiguous:false,clarified:false,patience:28,maxPatience:28},
      {id:303,channel:'email',customer:'Laura',subject:'Presupuesto de tarjetas',
       message:'Necesito 250 tarjetas de visita, por favor. Me iría bien recibirlas esta semana.',
       product:'Tarjetas de visita',qty:250,urgent:false,ambiguous:false,clarified:false,patience:85,maxPatience:85}
    ],
    jobs:[
      {id:1040,customer:'Joan',product:'Carteles A3',qty:70,price:91,total:21,remaining:13,deadline:9*60+85,
       status:'printing',risk:false,pickupRequested:false,delayNotified:false},
      {id:1041,customer:'Marta',product:'Etiquetas',qty:400,price:78,total:17,remaining:17,deadline:9*60+105,
       status:'queued',risk:false,pickupRequested:false,delayNotified:false}
    ],
    logs:[
      {id:1,at:9*60,text:'El taller abre sus puertas. ¡Buena jornada!',tone:'good'},
      {id:2,at:9*60,text:'Los encargos #1040 y #1041 ya están registrados.',tone:'info'}
    ]
  };
}

function generateRequest(s:GameState):void {
  const availableReady = s.jobs.filter(j => j.status === 'ready' && !j.pickupRequested);
  const active = s.jobs.filter(j=>j.status==='printing' || j.status==='queued' || j.status==='finishing');
  const roll = seeded(s);
  let req:Intake;
  const who=PEOPLE[Math.floor(seeded(s)*PEOPLE.length)];
  const urgent=seeded(s)>.75;
  const patience=urgent?27:42;
  const base={ id:s.nextIntake++, customer:who,urgent,ambiguous:false,clarified:false,patience,maxPatience:patience };
  if(availableReady.length>0 && roll>.68){
    const job=availableReady[Math.floor(seeded(s)*availableReady.length)];
    job.pickupRequested=true;
    req={...base,channel:'pickup',customer:job.customer,subject:'Recoger pedido #' + job.id,
      message:'Hola, vengo a recoger mi encargo. ¿Puedes comprobar que esté preparado y que corresponde a mi pedido?',
      parentId:job.id,patience:34,maxPatience:34};
  } else if(active.length>0 && roll>.47){
    const job=active[Math.floor(seeded(s)*active.length)];
    req={...base,channel:seeded(s)>.5?'phone':'email',customer:job.customer,
      subject:'Seguimiento del pedido #' + job.id,parentId:job.id,
      message:'Quería saber cómo va el pedido #' + job.id + '. ¿Llegaremos al plazo acordado?',
      patience:45,maxPatience:45};
  } else {
    const p=PRODUCTS[Math.floor(seeded(s)*PRODUCTS.length)];
    const unclear=seeded(s)>.63;
    req={...base,channel:roll<.40?'counter':roll<.70?'phone':'email',
      subject:p.name+' · Solicitud nueva', product:p.name,qty:p.qty,ambiguous:unclear,
      message: unclear
        ? 'Necesito '+p.name.toLowerCase()+' para un evento. Todavía no sé exactamente qué cantidad pedir y me corre algo de prisa.'
        : 'Quiero encargar '+p.qty+' unidades de '+p.name.toLowerCase()+'. ¿Podéis prepararlas y decirme cuándo estarán?',
      patience:roll<.70?patience:90,maxPatience:roll<.70?patience:90};
  }
  s.inbox=[...s.inbox,req];
  log(s,(req.channel==='counter'?'Nuevo cliente en el mostrador':req.channel==='phone'?'Teléfono sonando':req.channel==='email'?'Correo recibido':'Cliente en recogidas')+' · '+req.customer+'.');
}
function finishWork(s:GameState):void {
  const working=s.jobs.find(j=>j.status==='printing');
  if(working){
    working.remaining=Math.max(0,working.remaining-3);
    if(working.remaining===0){
      working.status='finishing';
      working.remaining=6;
      log(s,'#'+working.id+' pasa a acabados.');
    }
  }
  for(const j of s.jobs.filter(x=>x.status==='finishing')){
    // The newly entered finishing job also receives the normal tick.
    j.remaining=Math.max(0,j.remaining-3);
    if(j.remaining<=0){
      j.status='ready';j.remaining=0;j.readyTick=s.ticks;
      log(s,'Pedido #'+j.id+' terminado. Preparado para recogida.','good');
      s.score+=30;
    }
  }
  if(!s.jobs.some(j=>j.status==='printing')){
    const next=s.jobs.find(j=>j.status==='queued');
    if(next){
      next.status='printing';
      log(s,'Imprimiendo #'+next.id+' · '+next.product+'.');
    }
  }
  for(const job of s.jobs.filter(j=>j.status!=='delivered' && j.status!=='ready')){
    if(s.clock>job.deadline && !job.delayNotified){
      job.delayNotified=true;
      s.reputation=clamp(s.reputation-4);
      log(s,'El pedido #'+job.id+' ha superado el plazo comprometido.','bad');
    }
  }
}
function consume(s:GameState,id:number):void {
  s.inbox=s.inbox.filter(req=>req.id!==id);
}
export function reducer(state:GameState,action:Action):GameState {
  if(action.type==='RESET')return initialGame();
  if(action.type==='TOGGLE')return {...state,playing:!state.playing && !state.gameOver};
  if(action.type==='TICK'){
    if(!state.playing || state.gameOver)return state;
    const s:GameState={...state,inbox:state.inbox.map(r=>({...r})),jobs:state.jobs.map(j=>({...j})),
      logs:[...state.logs],ticks:state.ticks+1,clock:state.clock+3};
    if(s.clock>=18*60){s.day++;s.clock=9*60;log(s,'¡Nueva jornada! El taller vuelve a abrir.','good');}
    finishWork(s);
    for(const req of [...s.inbox]){
      req.patience-=(req.channel==='email'?1:3);
      if(req.patience<=0){
        consume(s,req.id);
        s.lost++;s.reputation=clamp(s.reputation-(req.channel==='email'?2:5));
        log(s,req.customer+' ha abandonado la espera.','bad');
      }
    }
    const interval=Math.max(2,5-Math.floor(s.ticks/24));
    if(s.ticks%interval===0 && s.inbox.length<7)generateRequest(s);
    if(s.reputation===0){s.gameOver=true;s.playing=false;log(s,'Fin del turno: la reputación ha llegado a cero.','bad');}
    return s;
  }
  if(action.type==='DECIDE'){
    const req=state.inbox.find(r=>r.id===action.id);
    if(!req)return state;
    const s:GameState={...state,inbox:state.inbox.map(r=>({...r})),jobs:state.jobs.map(j=>({...j})),logs:[...state.logs]};
    const current=s.inbox.find(r=>r.id===action.id)!;
    const linked=s.jobs.find(j=>j.id===current.parentId);
    if(action.decision==='clarify'){
      if(current.parentId)return state;
      current.clarified=true;current.ambiguous=false;
      current.message='Perfecto. Confirmamos el producto '+current.product+', '+current.qty+' unidades y un plazo orientativo que debemos comprobar antes de prometerlo.';
      s.reputation=clamp(s.reputation+1);
      log(s,'Has aclarado las necesidades de '+current.customer+'.','good');
      return s;
    }
    if(action.decision==='confirm'){
      if(current.parentId || !current.product || !current.qty)return state;
      const p=PRODUCTS.find(p=>p.name===current.product)!;
      const qty=current.qty;
      const price=Math.round(p.base*(qty/p.qty));
      const backlog=s.jobs.filter(j=>j.status==='queued'||j.status==='printing').reduce((t,j)=>t+j.remaining,0);
      const deadline=s.clock + Math.max(42,backlog+p.duration+15);
      const risk=current.ambiguous&&!current.clarified;
      const job:Job={id:s.nextJob++,customer:current.customer,product:current.product,
        qty,price,total:p.duration,remaining:p.duration,deadline,status:'queued',
        risk,pickupRequested:false,delayNotified:false};
      s.jobs.push(job);
      s.cash-=Math.round(price*.32);
      s.serviced++;s.score+=risk?7:35;
      s.reputation=clamp(s.reputation+(risk?-3:2));
      log(s,'Pedido #'+job.id+' confirmado para '+current.customer+'.',risk?'bad':'good');
      if(risk)log(s,'Atención: se aceptó un pedido sin aclarar todos los datos.','bad');
      consume(s,current.id);
      return s;
    }
    if(action.decision==='reject'){
      consume(s,current.id);
      s.score+=2;
      log(s,'Solicitud de '+current.customer+' rechazada con cortesía.');
      return s;
    }
    if(action.decision==='check' || action.decision==='promise'){
      if(!linked)return state;
      consume(s,current.id);s.serviced++;
      if(action.decision==='check'){
        s.score+=25;s.reputation=clamp(s.reputation+2);
        log(s,'Has comprobado el estado real del pedido #'+linked.id+' antes de responder.','good');
      }else{
        s.score+=3;s.reputation=clamp(s.reputation-4);
        log(s,'Promesa no comprobada sobre el pedido #'+linked.id+'.','bad');
      }
      return s;
    }
    if(action.decision==='verify' || action.decision==='blind'){
      if(!linked)return state;
      if(linked.status!=='ready'){
        log(s,'El pedido #'+linked.id+' todavía no está preparado.','bad');
        return s;
      }
      consume(s,current.id);linked.status='delivered';
      s.delivered++;s.serviced++;s.cash+=linked.price;
      if(action.decision==='verify'){
        s.score+=linked.risk?12:75;
        s.reputation=clamp(s.reputation+(linked.risk?-3:3));
        log(s,'Pedido #'+linked.id+' verificado y entregado.',linked.risk?'bad':'good');
      }else{
        s.score+=8;s.reputation=clamp(s.reputation-7);
        log(s,'Pedido #'+linked.id+' entregado sin verificar su referencia.','bad');
      }
      if(linked.risk)log(s,'Un dato ambiguo en el pedido puede provocar una reclamación.','bad');
      return s;
    }
  }
  return state;
}

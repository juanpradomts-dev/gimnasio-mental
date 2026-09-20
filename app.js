/* Gimnasio Mental — PWA offline-first (dark) con panel de escritorio,
   Camino a Top (hitos) y sync opcional a Supabase. */
(function(){
"use strict";
var $=function(s){return document.querySelector(s)};
var CHECK='<svg viewBox="0 0 24 24" fill="none" stroke="#04252a" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round"><path d="M4 12.5l5 5L20 6"/></svg>';
var DOW=["Dom","Lun","Mar","Mié","Jue","Vie","Sáb"], MES=["ene","feb","mar","abr","may","jun","jul","ago","sep","oct","nov","dic"];
var HABITS=[
  {id:"piedra", grupo:"Nucleo", emoji:"🪨", name:"Piedra grande del día", meta:"Deep Work del curso duro, sin celular"},
  {id:"ingles", grupo:"Nucleo", emoji:"🇬🇧", name:"Inglés → TOEFL", meta:"Lección + Anki de frases"},
  {id:"anki",   grupo:"Nucleo", emoji:"🧠", name:"Anki (active recall)", meta:"Repaso espaciado, aunque sean 10'"},
  {id:"lectura",grupo:"Nucleo", emoji:"📖", name:"Lectura", meta:"30 min · 1 idea = 1 nota"},
  {id:"ritual", grupo:"Mente",  emoji:"🎲", name:"Ritual de aprendizaje", meta:""},
  {id:"entreno",grupo:"Cuerpo", emoji:"🏋️", name:"Entreno (gym o casa)", meta:"Técnica antes que peso"}
];
var NAV=[
  {id:"hoy",label:"Hoy",title:"Hoy",icon:'<path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/>'},
  {id:"progreso",label:"Progreso",title:"Progreso",icon:'<path d="M3 3v18h18"/><path d="M7 14l4-4 3 3 5-6"/>'},
  {id:"top",label:"Top",title:"Camino a Top",icon:'<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="4"/><circle cx="12" cy="12" r="0.6" fill="currentColor"/>'},
  {id:"metas",label:"Metas",title:"Metas",icon:'<path d="M12 2v4M12 18v4M2 12h4M18 12h4"/><circle cx="12" cy="12" r="4"/>'},
  {id:"ajustes",label:"Ajustes",title:"Ajustes",icon:'<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>'}
];
var HITOS_DEF=[
  {id:"toefl",cat:"Compuertas",titulo:"TOEFL ≥ 105",sub:"Reservar fecha y alcanzar el score",estado:"pendiente"},
  {id:"gre",cat:"Compuertas",titulo:"GRE Quant ≥ 165",sub:"Preparar y rendir",estado:"pendiente"},
  {id:"algebra",cat:"Matemática nivel OR",titulo:"Álgebra lineal sólida",sub:"Base para optimización",estado:"pendiente"},
  {id:"prob",cat:"Matemática nivel OR",titulo:"Probabilidad",sub:"Variables, distribuciones, inferencia",estado:"pendiente"},
  {id:"opti",cat:"Matemática nivel OR",titulo:"Optimización: modelar + resolver un MIP",sub:"Gurobi/CPLEX sobre un caso real",estado:"pendiente"},
  {id:"papers",cat:"Research y perfil",titulo:"Papers Scopus publicados",sub:"2 en revisión → publicados (tu foso)",estado:"curso"},
  {id:"cartas",cat:"Research y perfil",titulo:"3 cartas de recomendación",sub:"Cultivar relación con profesores",estado:"pendiente"},
  {id:"fulbright",cat:"Research y perfil",titulo:"Fulbright / funding",sub:"Investigar y aplicar a beca",estado:"pendiente"},
  {id:"data",cat:"Computación",titulo:"Programa Data Analyst",sub:"Python + SQL + Estadística",estado:"curso"},
  {id:"ponderado",cat:"Base",titulo:"Ponderado ≥ 18",sub:"La nota, cada ciclo",estado:"curso"}
];
var CATS=["Compuertas","Matemática nivel OR","Research y perfil","Computación","Base"];
var QUOTES=[
  ["Somos lo que hacemos repetidamente. La excelencia, entonces, no es un acto, sino un hábito.","Will Durant"],
  ["La disciplina es el puente entre las metas y los logros.","Jim Rohn"],
  ["El éxito es la suma de pequeños esfuerzos repetidos día tras día.","Robert Collier"],
  ["El que tiene un porqué para vivir puede soportar casi cualquier cómo.","Friedrich Nietzsche"],
  ["No cuentes los días; haz que los días cuenten.","Muhammad Ali"],
  ["El hombre que mueve montañas comienza apartando pequeñas piedras.","Confucio"],
  ["No he fracasado. Solo he encontrado 10 000 maneras que no funcionan.","Thomas Edison"],
  ["Cuida los minutos, que las horas se cuidarán solas.","Lord Chesterfield"],
  ["Grandes cosas no se hacen por impulso, sino por una serie de pequeñas cosas reunidas.","Vincent van Gogh"],
  ["Nunca es demasiado tarde para ser lo que podrías haber sido.","George Eliot"],
  ["La paciencia es amarga, pero su fruto es dulce.","Jean-Jacques Rousseau"],
  ["El secreto para salir adelante es comenzar.","Mark Twain"],
  ["La constancia vence lo que la dicha no alcanza.","Simón Bolívar"],
  ["El único modo de hacer un gran trabajo es amar lo que haces.","Steve Jobs"],
  ["Primero resuelve el problema; luego escribe el código.","John Johnson"],
  ["La calidad no es un acto, es un hábito.","Aristóteles"],
  ["Aprende como si fueras a vivir para siempre.","Mahatma Gandhi"],
  ["El conocimiento habla, pero la sabiduría escucha.","Jimi Hendrix"],
  ["Lo que no te mata te hace más fuerte.","Friedrich Nietzsche"],
  ["Solo sé que no sé nada.","Sócrates"],
  ["La suerte es lo que ocurre cuando la preparación se encuentra con la oportunidad.","Séneca"],
  ["Vivir es la cosa más rara del mundo; la mayoría de la gente solo existe.","Oscar Wilde"],
  ["El futuro depende de lo que hagas hoy.","Mahatma Gandhi"],
  ["La excelencia no es una habilidad, es una actitud.","Ralph Marston"]
];
function dayOfYear(d){var s=new Date(d.getFullYear(),0,0);return Math.floor((d-s)/86400000)}

function ritualFor(d){var g=d.getDay();
  if(g===1||g===3||g===5)return{emoji:"🎲",name:"Tema random",meta:"Tema al azar 10' + explícalo 1' (Feynman)"};
  if(g===4||g===6||g===0)return{emoji:"🗣️",name:"Exposición oral 10'",meta:"De pie, sin apuntes, grabando"};
  return null;}
function applies(id,d){if(id==="ritual")return !!ritualFor(d);return true;}

var state={activeDate:iso(new Date()),days:{},
  metas:{objetivoSemana:"",toeflFecha:"",toeflScore:105,metaPct:80,metaSleep:7.5,metaRacha:14,hitos:null},
  sb:null,uid:null,tab:"hoy",charts:{}};

function iso(d){return d.getFullYear()+"-"+String(d.getMonth()+1).padStart(2,"0")+"-"+String(d.getDate()).padStart(2,"0")}
function parseISO(s){var p=s.split("-");return new Date(+p[0],+p[1]-1,+p[2])}
function dayObj(date){return state.days[date]||{done:{},dormir:"",despertar:"",nota:""}}
function css(v){return getComputedStyle(document.documentElement).getPropertyValue(v).trim()}

/* ---------- almacenamiento local ---------- */
function loadLS(){try{var d=localStorage.getItem("gm_days");if(d)state.days=JSON.parse(d);
  var m=localStorage.getItem("gm_metas");if(m)state.metas=Object.assign(state.metas,JSON.parse(m));}catch(e){}
  if(!state.metas.hitos)state.metas.hitos=HITOS_DEF.map(function(h){return Object.assign({},h)});}
function saveDays(){try{localStorage.setItem("gm_days",JSON.stringify(state.days))}catch(e){}}
function saveMetas(){try{localStorage.setItem("gm_metas",JSON.stringify(state.metas))}catch(e){}}

/* ---------- cálculos hábitos ---------- */
function doneOn(date,id){var d=state.days[date];return !!(d&&d.done&&d.done[id])}
function dayScore(date){var d=parseISO(date),tot=0,done=0;HABITS.forEach(function(h){if(applies(h.id,d)){tot++;if(doneOn(date,h.id))done++}});return{done:done,tot:tot,pct:tot?done/tot:0}}
function streak(id){var n=0,d=new Date();if(!doneOn(iso(d),id))d.setDate(d.getDate()-1);
  for(var i=0;i<400;i++){var ds=iso(d);if(!applies(id,d)){d.setDate(d.getDate()-1);continue}if(doneOn(ds,id)){n++;d.setDate(d.getDate()-1)}else break}return n}
function globalStreak(){var thr=(state.metas.metaPct||80)/100,n=0,d=new Date();
  if(dayScore(iso(d)).pct<thr)d.setDate(d.getDate()-1);
  for(var i=0;i<400;i++){var s=dayScore(iso(d));if(s.tot===0){d.setDate(d.getDate()-1);continue}if(s.pct>=thr){n++;d.setDate(d.getDate()-1)}else break}return n}
function bestGlobalStreak(){var thr=(state.metas.metaPct||80)/100,best=0,cur=0,d=new Date();d.setDate(d.getDate()-120);
  for(var i=0;i<121;i++){var s=dayScore(iso(d));if(s.tot>0){if(s.pct>=thr){cur++;if(cur>best)best=cur}else cur=0}d.setDate(d.getDate()+1)}return best}
function sleepHours(date){var o=state.days[date];if(!o||!o.dormir||!o.despertar)return null;var a=o.dormir.split(":"),b=o.despertar.split(":");var m=(+b[0]*60+ +b[1])-(+a[0]*60+ +a[1]);if(m<=0)m+=1440;return m/60}
function avgSleep(n){var sum=0,c=0,d=new Date();for(var i=0;i<n;i++){var h=sleepHours(iso(d));if(h!=null){sum+=h;c++}d.setDate(d.getDate()-1)}return c?sum/c:null}
function rangeRate(n){var td=0,tt=0,d=new Date();for(var i=0;i<n;i++){var s=dayScore(iso(d));td+=s.done;tt+=s.tot;d.setDate(d.getDate()-1)}return tt?td/tt:0}
function weekRate(){var base=new Date(),off=(base.getDay()+6)%7,mon=new Date();mon.setDate(base.getDate()-off);var td=0,tt=0;for(var i=0;i<7;i++){var dd=new Date(mon);dd.setDate(mon.getDate()+i);if(dd>base)break;var s=dayScore(iso(dd));td+=s.done;tt+=s.tot}return tt?td/tt:0}
function activeDays(){return Object.keys(state.days).filter(function(k){var d=state.days[k];return d&&d.done&&Object.keys(d.done).some(function(x){return d.done[x]})}).length}
function toeflDays(){if(!state.metas.toeflFecha)return null;return Math.ceil((parseISO(state.metas.toeflFecha)-new Date())/86400000)}
function topReadiness(){var h=state.metas.hitos||[];if(!h.length)return 0;var s=0;h.forEach(function(x){s+=x.estado==="hecho"?1:(x.estado==="curso"?.5:0)});return s/h.length}

/* ---------- navegación ---------- */
function buildNav(){
  $("#sidenav").innerHTML=NAV.map(function(n){return '<button class="navlink" data-tab="'+n.id+'" aria-current="'+(n.id===state.tab)+'"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">'+n.icon+'</svg>'+n.title+'</button>'}).join("");
  $("#bottomnav").innerHTML=NAV.map(function(n){return '<button class="tab" data-tab="'+n.id+'" aria-selected="'+(n.id===state.tab)+'"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">'+n.icon+'</svg>'+n.label+'</button>'}).join("");
}
function switchTab(name){state.tab=name;
  document.querySelectorAll(".navlink").forEach(function(t){t.setAttribute("aria-current",t.getAttribute("data-tab")===name)});
  document.querySelectorAll(".tab").forEach(function(t){t.setAttribute("aria-selected",t.getAttribute("data-tab")===name)});
  NAV.forEach(function(n){$("#v-"+n.id).hidden=(n.id!==name)});
  window.scrollTo(0,0);render()}

/* ---------- render HOY ---------- */
function ring(){var s=dayScore(state.activeDate),pct=Math.round(s.pct*100),C=213.6;
  $("#ringFill").setAttribute("stroke-dashoffset",C-C*pct/100);
  $("#ringFill").setAttribute("stroke",pct>=100?"var(--good)":"var(--accent)");
  $("#ringPct").textContent=pct+"%";
  var big=pct>=100?"¡Día redondo! 🎯":(pct>=60?"Buen ritmo":(pct>0?"Vas empezando":"Arranca el día"));
  $("#ringBig").textContent=big;$("#ringSub").textContent=s.done+" de "+s.tot+" hábitos hoy"}
function rowHTML(h,d){var na=!applies(h.id,d),on=doneOn(state.activeDate,h.id),info=h;
  if(h.id==="ritual"){var r=ritualFor(d);info=r?{emoji:r.emoji,name:r.name,meta:r.meta}:{emoji:"🎲",name:"Ritual de aprendizaje",meta:"Hoy descansa este ritual"}}
  var st=na?0:streak(h.id),sh=(st>=2)?'<span class="streak mono">🔥 '+st+'</span>':'';
  return '<button class="row'+(na?' na':'')+'" aria-pressed="'+on+'" data-id="'+h.id+'"'+(na?' tabindex="-1" aria-disabled="true"':'')+'><span class="emoji">'+info.emoji+'</span><span class="rt"><div class="rn">'+info.name+'</div>'+(info.meta?'<div class="rm">'+info.meta+'</div>':'')+'</span>'+sh+'<span class="check">'+CHECK+'</span></button>'}
function renderLists(){var d=parseISO(state.activeDate),g={Nucleo:[],Mente:[],Cuerpo:[]};
  HABITS.forEach(function(h){g[h.grupo].push(rowHTML(h,d))});
  $("#listNucleo").innerHTML=g.Nucleo.join("");$("#listMente").innerHTML=g.Mente.join("");$("#listCuerpo").innerHTML=g.Cuerpo.join("")}
function renderSleep(){var o=dayObj(state.activeDate);$("#dormir").value=o.dormir||"";$("#despertar").value=o.despertar||"";
  var el=$("#sleepHrs"),h=sleepHours(state.activeDate);
  if(h!=null){var H=Math.floor(h),mm=Math.round((h-H)*60);el.innerHTML=H+"h "+(mm?mm+"m":"")+'<small>'+(h>=(state.metas.metaSleep||7)?'✓ meta':'poco')+'</small>';el.style.color=h>=(state.metas.metaSleep||7)?"var(--good)":"var(--fire)"}
  else{el.innerHTML='—<small>sueño</small>';el.style.color="var(--ink)"}}
function kpi(n,t,s,cls){return '<div class="kpi'+(cls?" "+cls:"")+'"><div class="n mono">'+n+'</div><div class="t">'+t+'</div>'+(s?'<div class="s">'+s+'</div>':'')+'</div>'}
function renderMiniKpis(){var wk=Math.round(weekRate()*100),gs=globalStreak(),as=avgSleep(7),td=toeflDays();
  $("#miniKpis").innerHTML=
    kpi(wk+"%","Esta semana","meta "+(state.metas.metaPct||80)+"%","accent")+
    kpi("🔥 "+gs,"Racha","mejor "+bestGlobalStreak())+
    kpi(as!=null?as.toFixed(1)+"h":"—","Sueño 7d","meta "+(state.metas.metaSleep||7.5)+"h")+
    kpi(td!=null?(td>=0?td:"—"):Math.round(topReadiness()*100)+"%",td!=null?"días al TOEFL":"listo p/ top",td!=null?(state.metas.toeflFecha):"Camino a Top")}
function renderWeek(){var base=parseISO(state.activeDate),off=(base.getDay()+6)%7,mon=new Date(base);mon.setDate(base.getDate()-off);
  var t=iso(new Date()),html="",first,last;
  for(var i=0;i<7;i++){var d=new Date(mon);d.setDate(mon.getDate()+i);var ds=iso(d);if(i===0)first=d;if(i===6)last=d;
    var s=dayScore(ds),pct=s.pct,C=50.3,col=pct>=1?"var(--good)":(pct>0?"var(--accent)":"var(--surface-2)");
    html+='<button class="day'+(ds===state.activeDate?' sel':'')+(ds===t?' today':'')+'" data-date="'+ds+'"><span class="dn">'+DOW[d.getDay()]+'</span><svg width="24" height="24" viewBox="0 0 20 20" aria-hidden="true"><circle cx="10" cy="10" r="8" fill="none" stroke="var(--surface-2)" stroke-width="3"/><circle cx="10" cy="10" r="8" fill="none" stroke="'+col+'" stroke-width="3" stroke-linecap="round" stroke-dasharray="50.3" stroke-dashoffset="'+(C-C*pct)+'" transform="rotate(-90 10 10)"/></svg><span class="dnum mono">'+d.getDate()+'</span></button>'}
  $("#week").innerHTML=html;$("#weekRange").textContent=first.getDate()+"–"+last.getDate()+" "+MES[last.getMonth()]}

/* ---------- render PROGRESO ---------- */
function renderKpis(){var wk=Math.round(weekRate()*100),m30=Math.round(rangeRate(30)*100),gs=globalStreak(),as=avgSleep(7);
  $("#kpis").innerHTML=
    kpi(Math.round(dayScore(iso(new Date())).pct*100)+"%","Hoy","","hero accent")+
    kpi(wk+"%","Esta semana","meta "+(state.metas.metaPct||80)+"%")+
    kpi(m30+"%","Últimos 30 días","adherencia global")+
    kpi("🔥 "+gs,"Racha actual","mejor: "+bestGlobalStreak())+
    kpi(activeDays(),"Días registrados","")+
    kpi(as!=null?as.toFixed(1)+"h":"—","Sueño prom. 7d","meta "+(state.metas.metaSleep||7.5)+"h")}
function lastDates(n){var a=[],d=new Date();for(var i=0;i<n;i++){a.unshift(iso(d));d.setDate(d.getDate()-1)}return a}
function makeCharts(){if(typeof Chart==="undefined")return;
  var muted=css("--muted"),grid=css("--border"),accent=css("--accent"),good=css("--good"),fire=css("--fire");
  Chart.defaults.color=muted;Chart.defaults.font={family:"'IBM Plex Sans',sans-serif"};
  var dates=lastDates(21),labels=dates.map(function(s){var d=parseISO(s);return d.getDate()+"/"+(d.getMonth()+1)});
  var dailyPct=dates.map(function(s){return Math.round(dayScore(s).pct*100)});
  var sleepArr=dates.map(function(s){return sleepHours(s)});
  var hlabels=HABITS.map(function(h){return h.name.replace(" del día","").replace(" (active recall)","").replace(" → TOEFL"," (TOEFL)")});
  var hvals=HABITS.map(function(h){var c=0,t=0,d=new Date();for(var i=0;i<30;i++){var ds=iso(d);if(applies(h.id,d)){t++;if(doneOn(ds,h.id))c++}d.setDate(d.getDate()-1)}return t?Math.round(100*c/t):0});
  destroyCharts();
  state.charts.daily=new Chart($("#chDaily"),{type:"line",data:{labels:labels,datasets:[{data:dailyPct,borderColor:accent,backgroundColor:accent+"22",fill:true,tension:.3,pointRadius:2,borderWidth:2}]},options:baseOpts(grid,100,"%")});
  state.charts.habit=new Chart($("#chHabit"),{type:"bar",data:{labels:hlabels,datasets:[{data:hvals,backgroundColor:hvals.map(function(v){return v>=(state.metas.metaPct||80)?good:accent}),borderRadius:6}]},options:Object.assign(baseOpts(grid,100,"%"),{indexAxis:"y"})});
  state.charts.sleep=new Chart($("#chSleep"),{type:"line",data:{labels:labels,datasets:[{data:sleepArr,borderColor:fire,backgroundColor:fire+"22",fill:true,tension:.3,spanGaps:true,pointRadius:2,borderWidth:2}]},options:baseOpts(grid,11,"h")});}
function baseOpts(grid,max,suf){return{responsive:true,maintainAspectRatio:false,plugins:{legend:{display:false}},scales:{x:{grid:{display:false},ticks:{maxRotation:0,autoSkip:true,maxTicksLimit:7}},y:{beginAtZero:true,max:max,grid:{color:grid},ticks:{callback:function(v){return v+suf}}}}}}
function destroyCharts(){["daily","habit","sleep"].forEach(function(k){if(state.charts[k]){state.charts[k].destroy();state.charts[k]=null}})}
function heatColor(pct){if(pct<=0)return"var(--surface-2)";var p=pct>=1?100:(pct>=.75?78:(pct>=.5?55:32));return"color-mix(in srgb, var(--accent) "+p+"%, var(--surface-2))"}
function renderHeatmap(){var el=$("#heat");if(!el)return;var today=new Date(),off=(today.getDay()+6)%7;
  var end=new Date(today);end.setDate(today.getDate()+(6-off));var d=new Date(end);d.setDate(end.getDate()-(13*7-1));
  var html="",t=iso(today);
  for(var i=0;i<91;i++){var ds=iso(d),fut=d>today,s=dayScore(ds);
    html+='<div class="hcell" title="'+ds+(fut?"":" · "+Math.round(s.pct*100)+"%")+'" style="background:'+(fut?"transparent":heatColor(s.pct))+(fut?";opacity:.2":"")+(ds===t?";outline:1.5px solid var(--accent-ink);outline-offset:-1px":"")+'"></div>';
    d.setDate(d.getDate()+1)}
  el.innerHTML=html}
function confetti(){try{if(matchMedia("(prefers-reduced-motion: reduce)").matches)return}catch(e){}
  var cv=$("#confetti");if(!cv)return;var ctx=cv.getContext("2d");var W=cv.width=innerWidth,H=cv.height=innerHeight;
  var cols=[css("--accent"),css("--good"),css("--warn"),css("--accent-ink")],P=[];
  for(var i=0;i<110;i++)P.push({x:W/2+(Math.random()-.5)*160,y:H*.3,vx:(Math.random()-.5)*10,vy:Math.random()*-9-3,g:.3,s:4+Math.random()*6,c:cols[i%cols.length],r:Math.random()*6,vr:(Math.random()-.5)*.5});
  var t0=performance.now();
  (function frame(t){ctx.clearRect(0,0,W,H);var al=false;
    P.forEach(function(p){p.vy+=p.g;p.x+=p.vx;p.y+=p.vy;p.r+=p.vr;if(p.y<H+30)al=true;
      ctx.save();ctx.translate(p.x,p.y);ctx.rotate(p.r);ctx.globalAlpha=Math.max(0,1-(t-t0)/1700);ctx.fillStyle=p.c;ctx.fillRect(-p.s/2,-p.s/2,p.s,p.s*.62);ctx.restore()});
    if(al&&t-t0<1800)requestAnimationFrame(frame);else ctx.clearRect(0,0,W,H)})(t0)}

/* ---------- render CAMINO A TOP ---------- */
var ESTADOS={pendiente:{next:"curso",cls:"",label:"Pendiente"},curso:{next:"hecho",cls:"curso",label:"En curso"},hecho:{next:"pendiente",cls:"hecho",label:"Hecho"}};
function renderTop(){
  var r=topReadiness(),C=207.3,pct=Math.round(r*100);
  $("#topRing").setAttribute("stroke-dashoffset",C-C*pct/100);$("#topRingPct").textContent=pct+"%";
  var h=state.metas.hitos,html="";
  CATS.forEach(function(cat){var items=h.filter(function(x){return x.cat===cat});if(!items.length)return;
    var s=0;items.forEach(function(x){s+=x.estado==="hecho"?1:(x.estado==="curso"?.5:0)});var cp=Math.round(100*s/items.length);
    html+='<div class="card catcard"><div class="ch"><h3>'+cat+'</h3><span class="pct mono">'+cp+'%</span></div>';
    items.forEach(function(x){var e=ESTADOS[x.estado]||ESTADOS.pendiente;
      html+='<div class="mile"><div class="mt"><div class="mn">'+x.titulo+'</div><div class="ms">'+x.sub+'</div></div><button class="pill '+e.cls+'" data-hito="'+x.id+'">'+e.label+'</button></div>'});
    html+='<div style="padding:12px 15px"><div class="bar"><i style="width:'+cp+'%"></i></div></div></div>'});
  $("#catgrid").innerHTML=html;
  var next=null;for(var ci=0;ci<CATS.length&&!next;ci++){var arr=h.filter(function(x){return x.cat===CATS[ci]&&x.estado!=="hecho"});if(arr.length)next=arr[0]}
  var nc=$("#nextHito");if(nc)nc.innerHTML=next?'<span class="nextchip">▶ Próximo paso: '+next.titulo+'</span>':'<span class="nextchip done">✓ Todos los hitos logrados — a por el papeleo de admisión</span>'}
function cycleHito(id){var x=state.metas.hitos.filter(function(y){return y.id===id})[0];if(!x)return;
  x.estado=(ESTADOS[x.estado]||ESTADOS.pendiente).next;saveMetas();pushMetas();scheduleObsidian();renderTop()}

/* ---------- render METAS ---------- */
function renderMetas(){
  $("#goal").value=state.metas.objetivoSemana||"";$("#mToefl").value=state.metas.toeflFecha||"";
  $("#mToeflScore").value=state.metas.toeflScore;$("#mPct").value=state.metas.metaPct;$("#mSleep").value=state.metas.metaSleep;$("#mRacha").value=state.metas.metaRacha;
  var out="",td=toeflDays();
  if(td!=null)out+=kpi(td>=0?td:"—",td>=0?"días para el TOEFL":"TOEFL pasó","objetivo "+(state.metas.toeflScore||105),"hero accent");
  var wk=Math.round(weekRate()*100),mp=state.metas.metaPct||80;out+=kpi(wk+"%","Semana vs meta",wk>=mp?"✓ sobre "+mp+"%":"falta "+(mp-wk)+" pts");
  var gs=globalStreak();out+=kpi("🔥 "+gs,"Racha vs meta",gs>=state.metas.metaRacha?"✓ lograda":"meta "+state.metas.metaRacha);
  var as=avgSleep(7),ms=state.metas.metaSleep||7.5;out+=kpi(as!=null?as.toFixed(1)+"h":"—","Sueño vs meta",as!=null?(as>=ms?"✓ sobre "+ms+"h":"dormir más"):"registra tu sueño");
  out+=kpi(Math.round(topReadiness()*100)+"%","Camino a Top","hitos logrados");
  $("#metaKpis").innerHTML=out}

/* ---------- header + orquestador ---------- */
function renderHeader(){var n=NAV.filter(function(x){return x.id===state.tab})[0];$("#pageTitle").textContent=n?n.title:"";
  if(state.tab==="hoy"){var d=parseISO(state.activeDate),t=iso(new Date());$("#pageDate").textContent=(state.activeDate===t?"Hoy · ":"")+DOW[d.getDay()]+" "+d.getDate()+" "+MES[d.getMonth()]}
  else{var td=new Date();$("#pageDate").textContent=DOW[td.getDay()]+" "+td.getDate()+" "+MES[td.getMonth()]}}
function renderQuote(){var q=QUOTES[dayOfYear(new Date())%QUOTES.length];$("#qText").textContent="“"+q[0]+"”";$("#qAuth").textContent="— "+q[1];$("#quoteCard").hidden=false}
function render(){renderHeader();
  if(state.tab==="hoy"){renderQuote();ring();renderLists();renderSleep();renderMiniKpis();renderWeek()}
  else if(state.tab==="progreso"){renderKpis();renderHeatmap();makeCharts()}
  else if(state.tab==="top"){renderTop()}
  else if(state.tab==="metas"){renderMetas()}}

/* ---------- eventos ---------- */
document.addEventListener("click",function(e){
  var nav=e.target.closest("[data-tab]");if(nav){switchTab(nav.getAttribute("data-tab"));return}
  var row=e.target.closest(".row");if(row&&!row.classList.contains("na")){var id=row.getAttribute("data-id");
    var before=dayScore(state.activeDate).pct;
    var o=state.days[state.activeDate]||(state.days[state.activeDate]={done:{},dormir:"",despertar:"",nota:""});o.done=o.done||{};o.done[id]=!o.done[id];touch(state.activeDate);
    if(before<1&&dayScore(state.activeDate).pct>=1&&state.activeDate===iso(new Date()))confetti();
    render();return}
  var day=e.target.closest(".day");if(day){state.activeDate=day.getAttribute("data-date");render();return}
  var pill=e.target.closest(".pill");if(pill){cycleHito(pill.getAttribute("data-hito"));return}
});
$("#dormir").addEventListener("change",sleepChange);$("#despertar").addEventListener("change",sleepChange);
function sleepChange(){var o=state.days[state.activeDate]||(state.days[state.activeDate]={done:{},dormir:"",despertar:"",nota:""});o.dormir=$("#dormir").value;o.despertar=$("#despertar").value;touch(state.activeDate);renderSleep();ring();renderMiniKpis()}
var gT;$("#goal").addEventListener("input",function(){state.metas.objetivoSemana=$("#goal").value;saveMetas();clearTimeout(gT);gT=setTimeout(pushMetas,600);scheduleObsidian()});
["mToefl","mToeflScore","mPct","mSleep","mRacha"].forEach(function(id){$("#"+id).addEventListener("change",function(){
  state.metas.toeflFecha=$("#mToefl").value;state.metas.toeflScore=+$("#mToeflScore").value||105;state.metas.metaPct=+$("#mPct").value||80;state.metas.metaSleep=+$("#mSleep").value||7.5;state.metas.metaRacha=+$("#mRacha").value||14;
  saveMetas();pushMetas();scheduleObsidian();renderMetas()})});

/* ---------- respaldo / tema ---------- */
$("#btnExport").addEventListener("click",function(){var blob=new Blob([JSON.stringify({days:state.days,metas:state.metas},null,2)],{type:"application/json"});var a=document.createElement("a");a.href=URL.createObjectURL(blob);a.download="gimnasio-mental-"+iso(new Date())+".json";a.click();setTimeout(function(){URL.revokeObjectURL(a.href)},1000)});
$("#btnImport").addEventListener("click",function(){$("#fileImport").click()});
$("#fileImport").addEventListener("change",function(e){var f=e.target.files[0];if(!f)return;var r=new FileReader();r.onload=function(){try{var o=JSON.parse(r.result);if(o.days)Object.keys(o.days).forEach(function(k){state.days[k]=o.days[k]});if(o.metas)state.metas=Object.assign(state.metas,o.metas);saveDays();saveMetas();render();alert("Progreso importado.")}catch(err){alert("Archivo inválido.")}};r.readAsText(f)});
function toggleTheme(){var cur=document.documentElement.getAttribute("data-theme");var next=cur==="light"?"":"light";
  if(next)document.documentElement.setAttribute("data-theme",next);else document.documentElement.removeAttribute("data-theme");
  try{localStorage.setItem("gm_theme",next)}catch(e){}
  document.querySelector('meta[name=theme-color]').setAttribute("content",next==="light"?"#eef2f4":"#0a0a0c");
  if(state.tab==="progreso")makeCharts()}
$("#btnTheme").addEventListener("click",toggleTheme);$("#btnThemeTop").addEventListener("click",toggleTheme);

/* ---------- Supabase sync ---------- */
function status(cls,txt,sub){$("#sDot").className="dot"+(cls?" "+cls:"");$("#sTxt").textContent=txt;if(sub)$("#sSub").textContent=sub}
function syncMsg(txt,cls){var el=$("#syncMsg");el.textContent=txt||"";el.className="msg"+(cls?" "+cls:"")}
function touch(date){var o=state.days[date];if(o)o.u=new Date().toISOString();saveDays();pushDay(date);scheduleObsidian()}
function loadCfg(){try{return JSON.parse(localStorage.getItem("gm_cfg")||"null")}catch(e){return null}}
function initSupabase(){var cfg=loadCfg();if(!cfg||!cfg.url||!cfg.key){status("","local","Datos en este dispositivo");return}
  if(typeof supabase==="undefined"){status("warn","sin librería");return}
  try{state.sb=supabase.createClient(cfg.url,cfg.key,{auth:{persistSession:true,autoRefreshToken:true,detectSessionInUrl:true}})}catch(e){status("warn","config inválida");return}
  $("#supUrl").value=cfg.url;$("#supKey").value=cfg.key;$("#authBox").hidden=false;$("#btnLogin").hidden=false;
  state.sb.auth.getSession().then(function(r){onSession(r.data.session)});
  state.sb.auth.onAuthStateChange(function(_e,s){onSession(s)})}
function onSession(session){if(session&&session.user){state.uid=session.user.id;status("on","sincronizado",(session.user.email||""));syncMsg("Conectado como "+(session.user.email||""),"ok");$("#btnLogin").hidden=true;$("#btnLogout").hidden=false;$("#authBox").hidden=true;pullCloud();subscribeCloud()}
  else{state.uid=null;status("warn","conecta tu correo","Falta iniciar sesión");$("#btnLogout").hidden=true;$("#btnLogin").hidden=false;$("#authBox").hidden=false}}
$("#btnSaveSup").addEventListener("click",function(){var url=$("#supUrl").value.trim(),key=$("#supKey").value.trim();if(!url||!key){syncMsg("Pega la URL y la anon key.","err");return}try{localStorage.setItem("gm_cfg",JSON.stringify({url:url,key:key}))}catch(e){}syncMsg("Guardado. Conectando…");setTimeout(function(){location.reload()},400)});
$("#btnLogin").addEventListener("click",function(){if(!state.sb)return;var email=$("#supEmail").value.trim();if(!email){syncMsg("Escribe tu correo.","err");return}syncMsg("Enviando enlace…");state.sb.auth.signInWithOtp({email:email,options:{emailRedirectTo:location.href.split("#")[0]}}).then(function(r){if(r.error)syncMsg("Error: "+r.error.message,"err");else syncMsg("Revisa tu correo y abre el enlace en ESTE dispositivo.","ok")})});
$("#btnLogout").addEventListener("click",function(){if(state.sb)state.sb.auth.signOut().then(function(){location.reload()})});
function pushDay(date){if(!state.sb||!state.uid)return;var o=state.days[date];if(!o)return;state.sb.from("dias").upsert({user_id:state.uid,fecha:date,done:o.done||{},dormir:o.dormir||"",despertar:o.despertar||"",nota:o.nota||"",updated_at:o.u||new Date().toISOString()},{onConflict:"user_id,fecha"}).then(function(r){if(r&&r.error)syncMsg("Sync: "+r.error.message,"err")})}
function pushMetas(){if(!state.sb||!state.uid)return;state.sb.from("metas").upsert({user_id:state.uid,data:state.metas,updated_at:new Date().toISOString()},{onConflict:"user_id"}).then(function(){})}
function pullCloud(){if(!state.sb||!state.uid)return;
  state.sb.from("dias").select("*").eq("user_id",state.uid).then(function(r){if(r.error){syncMsg("Sync: "+r.error.message+" (¿creaste las tablas? ver README)","err");return}
    (r.data||[]).forEach(function(row){var loc=state.days[row.fecha];if(!loc||!loc.u||Date.parse(row.updated_at)>=Date.parse(loc.u||0))state.days[row.fecha]={done:row.done||{},dormir:row.dormir||"",despertar:row.despertar||"",nota:row.nota||"",u:row.updated_at}});
    saveDays();var cloud={};(r.data||[]).forEach(function(row){cloud[row.fecha]=Date.parse(row.updated_at)});
    Object.keys(state.days).forEach(function(d){var lu=Date.parse(state.days[d].u||0);if(!cloud[d]||lu>cloud[d])pushDay(d)});render()});
  state.sb.from("metas").select("*").eq("user_id",state.uid).maybeSingle().then(function(r){if(r&&r.data&&r.data.data){state.metas=Object.assign(state.metas,r.data.data);if(!state.metas.hitos)state.metas.hitos=HITOS_DEF.map(function(h){return Object.assign({},h)});saveMetas();render()}})}
function subscribeCloud(){if(!state.sb||!state.uid)return;try{state.sb.channel("gm").on("postgres_changes",{event:"*",schema:"public",table:"dias",filter:"user_id=eq."+state.uid},function(p){var row=p.new;if(!row||!row.fecha)return;var loc=state.days[row.fecha];if(!loc||!loc.u||Date.parse(row.updated_at)>Date.parse(loc.u||0)){state.days[row.fecha]={done:row.done||{},dormir:row.dormir||"",despertar:row.despertar||"",nota:row.nota||"",u:row.updated_at};saveDays();render()}}).on("postgres_changes",{event:"*",schema:"public",table:"metas",filter:"user_id=eq."+state.uid},function(p){if(p.new&&p.new.data){state.metas=Object.assign(state.metas,p.new.data);saveMetas();render()}}).subscribe()}catch(e){}}

/* ---------- Conexión a Obsidian (File System Access API) ---------- */
function obsMsg(t,cls){var el=$("#obsMsg");if(el){el.textContent=t||"";el.className="msg"+(cls?" "+cls:"")}}
function idbOpen(){return new Promise(function(res,rej){var r=indexedDB.open("gm-fs",1);r.onupgradeneeded=function(){r.result.createObjectStore("h")};r.onsuccess=function(){res(r.result)};r.onerror=function(){rej(r.error)}})}
function idbSet(k,v){return idbOpen().then(function(db){return new Promise(function(res,rej){var t=db.transaction("h","readwrite");t.objectStore("h").put(v,k);t.oncomplete=function(){res()};t.onerror=function(){rej(t.error)}})})}
function idbGet(k){return idbOpen().then(function(db){return new Promise(function(res){var t=db.transaction("h","readonly"),rq=t.objectStore("h").get(k);rq.onsuccess=function(){res(rq.result)};rq.onerror=function(){res(null)}})})}
function verifyPerm(h,canPrompt){var o={mode:"readwrite"};return Promise.resolve().then(function(){return h.queryPermission(o)}).then(function(p){if(p==="granted")return true;if(canPrompt)return h.requestPermission(o).then(function(q){return q==="granted"});return false}).catch(function(){return false})}
function estadoTxt(e){return e==="hecho"?"hecho":(e==="curso"?"en curso":"pendiente")}
function genMarkdown(){var now=new Date(),f=function(v){return Math.round(v*100)+"%"};
  var md="---\n"+'titulo: "Gimnasio Mental — Progreso"\n'+"tipo: dashboard\n"+"actualizado: "+now.toISOString()+"\n"+"tags: [progreso, habitos, tracker, camino-a-top]\n"+"---\n\n";
  md+="# 🎯 Gimnasio Mental — Progreso\n\n";
  md+="> [!info] Nota generada automáticamente por la app. Última actualización: "+now.toLocaleString()+". El origen editable es la app; esta nota es su reflejo en tu vault.\n\n";
  md+="## 📊 Resumen\n";
  md+="- **Hoy:** "+f(dayScore(iso(now)).pct)+" · **Semana:** "+f(weekRate())+" · **Últimos 30 días:** "+f(rangeRate(30))+"\n";
  var as=avgSleep(7);md+="- **Racha actual:** "+globalStreak()+" días (mejor: "+bestGlobalStreak()+") · **Sueño 7d:** "+(as!=null?as.toFixed(1)+"h":"—")+"\n";
  md+="- **Camino a Top:** "+f(topReadiness())+"\n";
  var td=toeflDays();if(td!=null)md+="- **Días para el TOEFL:** "+(td>=0?td:"—")+" (objetivo "+(state.metas.toeflScore||105)+")\n";
  md+="\n";
  if(state.metas.objetivoSemana)md+="## ⭐ Objetivo de la semana\n"+state.metas.objetivoSemana+"\n\n";
  md+="## 🚀 Camino a Top\n";
  CATS.forEach(function(cat){var it=(state.metas.hitos||[]).filter(function(x){return x.cat===cat});if(!it.length)return;md+="\n**"+cat+"**\n";
    it.forEach(function(x){var b=x.estado==="hecho"?"[x]":(x.estado==="curso"?"[/]":"[ ]");md+="- "+b+" "+x.titulo+" — _"+estadoTxt(x.estado)+"_\n"})});
  md+="\n## 🗓️ Registro (últimos 30 días)\n\n| Fecha | % día | Hábitos cumplidos | Sueño |\n|---|---|---|---|\n";
  var d=new Date(now);for(var i=0;i<30;i++){var ds=iso(d),o=state.days[ds];
    if(o&&o.done&&Object.keys(o.done).some(function(k){return o.done[k]})){var s=dayScore(ds),done=Object.keys(o.done).filter(function(k){return o.done[k]}).join(", "),sh=sleepHours(ds);
      md+="| "+ds+" | "+Math.round(s.pct*100)+"% | "+done+" | "+(sh!=null?sh.toFixed(1)+"h":"—")+" |\n"}d.setDate(d.getDate()-1)}
  md+="\n> Origen: app **Gimnasio Mental** (https://juanpradomts-dev.github.io/gimnasio-mental/).\n";
  return md}
function writeObsidian(manual){if(!state.obsHandle)return Promise.resolve();
  return verifyPerm(state.obsHandle,manual).then(function(ok){if(!ok){if(manual)obsMsg("Permiso denegado. Toca 'Conectar' otra vez.","err");return}
    return state.obsHandle.getFileHandle("Gimnasio Mental — Progreso.md",{create:true}).then(function(fh){return fh.createWritable()}).then(function(w){return w.write(genMarkdown()).then(function(){return w.close()})}).then(function(){obsMsg("✓ Guardado en tu vault ("+state.obsHandle.name+") · "+new Date().toLocaleTimeString(),"ok")}).catch(function(e){obsMsg("No se pudo escribir: "+e.message,"err")})})}
var obsT;function scheduleObsidian(){if(!state.obsHandle||!state.obsAuto)return;clearTimeout(obsT);obsT=setTimeout(function(){writeObsidian(false)},1600)}
function setObsUI(){var has=!!state.obsHandle;$("#btnObsSave").hidden=!has;$("#obsAutoWrap").hidden=!has;
  $("#btnObsConnect").textContent=has?("Reconectar vault ("+state.obsHandle.name+")"):"Conectar mi vault de Obsidian";
  $("#obsAuto").checked=!!state.obsAuto}
function connectObsidian(){if(!window.showDirectoryPicker){obsMsg("Tu navegador no soporta conexión directa. Usa 'Descargar nota .md' y arrástrala al vault.","err");return}
  window.showDirectoryPicker({mode:"readwrite",id:"gm-vault"}).then(function(h){state.obsHandle=h;return idbSet("dir",h).then(function(){setObsUI();return writeObsidian(true)})}).catch(function(){})}
function initObsidian(){
  try{state.obsAuto=localStorage.getItem("gm_obsauto")==="1"}catch(e){}
  $("#btnObsConnect").addEventListener("click",connectObsidian);
  $("#btnObsSave").addEventListener("click",function(){writeObsidian(true)});
  $("#obsAuto").addEventListener("change",function(){state.obsAuto=$("#obsAuto").checked;try{localStorage.setItem("gm_obsauto",state.obsAuto?"1":"0")}catch(e){}if(state.obsAuto)writeObsidian(false)});
  $("#btnObsMd").addEventListener("click",function(){var blob=new Blob([genMarkdown()],{type:"text/markdown"});var a=document.createElement("a");a.href=URL.createObjectURL(blob);a.download="Gimnasio Mental — Progreso.md";a.click();setTimeout(function(){URL.revokeObjectURL(a.href)},1000)});
  if(!window.showDirectoryPicker){$("#btnObsConnect").disabled=true;$("#btnObsConnect").textContent="Conexión directa no disponible aquí";obsMsg("En este navegador (p. ej. celular) usa 'Descargar nota .md'.");}
  else{idbGet("dir").then(function(h){if(h){state.obsHandle=h;setObsUI()}}).catch(function(){})}
}

/* ---------- arranque ---------- */
(function boot(){
  try{var th=localStorage.getItem("gm_theme");if(th==="light")document.documentElement.setAttribute("data-theme","light")}catch(e){}
  loadLS();buildNav();switchTab("hoy");initSupabase();initObsidian();
})();
})();

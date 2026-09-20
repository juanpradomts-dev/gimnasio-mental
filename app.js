/* Gimnasio Mental — PWA offline-first con sync opcional a Supabase.
   Datos siempre en localStorage; si hay Supabase conectado + sesión, sincroniza. */
(function(){
"use strict";
var $=function(s){return document.querySelector(s)};
var CHECK='<svg viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round"><path d="M4 12.5l5 5L20 6"/></svg>';
var DOW=["Dom","Lun","Mar","Mié","Jue","Vie","Sáb"], MES=["ene","feb","mar","abr","may","jun","jul","ago","sep","oct","nov","dic"];
var HABITS=[
  {id:"piedra", grupo:"Nucleo", emoji:"🪨", name:"Piedra grande del día", meta:"Deep Work del curso duro, sin celular"},
  {id:"ingles", grupo:"Nucleo", emoji:"🇬🇧", name:"Inglés → TOEFL", meta:"Lección + Anki de frases"},
  {id:"anki",   grupo:"Nucleo", emoji:"🧠", name:"Anki (active recall)", meta:"Repaso espaciado, aunque sean 10'"},
  {id:"lectura",grupo:"Nucleo", emoji:"📖", name:"Lectura", meta:"30 min · 1 idea = 1 nota"},
  {id:"ritual", grupo:"Mente",  emoji:"🎲", name:"Ritual de aprendizaje", meta:""},
  {id:"entreno",grupo:"Cuerpo", emoji:"🏋️", name:"Entreno (gym o casa)", meta:"Técnica antes que peso"}
];
function ritualFor(d){var g=d.getDay();
  if(g===1||g===3||g===5)return{emoji:"🎲",name:"Tema random",meta:"Tema al azar 10' + explícalo 1' (Feynman)"};
  if(g===4||g===6||g===0)return{emoji:"🗣️",name:"Exposición oral 10'",meta:"De pie, sin apuntes, grabando"};
  return null;}
function applies(id,d){if(id==="ritual")return !!ritualFor(d);return true;}

var state={activeDate:iso(new Date()),days:{},metas:{objetivoSemana:"",toeflFecha:"",metaPct:80,metaSleep:7.5,metaRacha:14},
  sb:null,uid:null,tab:"hoy",charts:{}};

function iso(d){return d.getFullYear()+"-"+String(d.getMonth()+1).padStart(2,"0")+"-"+String(d.getDate()).padStart(2,"0")}
function parseISO(s){var p=s.split("-");return new Date(+p[0],+p[1]-1,+p[2])}
function dayObj(date){return state.days[date]||{done:{},dormir:"",despertar:"",nota:""}}
function css(v){return getComputedStyle(document.documentElement).getPropertyValue(v).trim()}

/* ---------- almacenamiento local ---------- */
function loadLS(){try{var d=localStorage.getItem("gm_days");if(d)state.days=JSON.parse(d);
  var m=localStorage.getItem("gm_metas");if(m)state.metas=Object.assign(state.metas,JSON.parse(m));}catch(e){}}
function saveDays(){try{localStorage.setItem("gm_days",JSON.stringify(state.days))}catch(e){}}
function saveMetas(){try{localStorage.setItem("gm_metas",JSON.stringify(state.metas))}catch(e){}}

/* ---------- cálculos ---------- */
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

/* ---------- render: HOY ---------- */
function ring(){var s=dayScore(state.activeDate),pct=Math.round(s.pct*100),C=144.5;
  $("#ringFill").setAttribute("stroke-dashoffset",C-C*pct/100);
  $("#ringFill").setAttribute("stroke",pct>=100?"var(--good)":"var(--accent)");
  $("#ringPct").textContent=pct+"%"}
function rowHTML(h,d){var na=!applies(h.id,d),on=doneOn(state.activeDate,h.id),info=h;
  if(h.id==="ritual"){var r=ritualFor(d);info=r?{emoji:r.emoji,name:r.name,meta:r.meta}:{emoji:"🎲",name:"Ritual de aprendizaje",meta:"Hoy descansa este ritual"}}
  var st=na?0:streak(h.id),sh=(st>=2)?'<span class="streak mono">🔥 '+st+'</span>':'';
  return '<button class="row'+(na?' na':'')+'" aria-pressed="'+on+'" data-id="'+h.id+'"'+(na?' tabindex="-1" aria-disabled="true"':'')+'>'+
    '<span class="emoji">'+info.emoji+'</span><span class="rt"><div class="rn">'+info.name+'</div>'+(info.meta?'<div class="rm">'+info.meta+'</div>':'')+'</span>'+sh+'<span class="check">'+CHECK+'</span></button>'}
function renderLists(){var d=parseISO(state.activeDate),g={Nucleo:[],Mente:[],Cuerpo:[]};
  HABITS.forEach(function(h){g[h.grupo].push(rowHTML(h,d))});
  $("#listNucleo").innerHTML=g.Nucleo.join("");$("#listMente").innerHTML=g.Mente.join("");$("#listCuerpo").innerHTML=g.Cuerpo.join("")}
function renderSleep(){var o=dayObj(state.activeDate);$("#dormir").value=o.dormir||"";$("#despertar").value=o.despertar||"";
  var el=$("#sleepHrs"),h=sleepHours(state.activeDate);
  if(h!=null){var H=Math.floor(h),mm=Math.round((h-H)*60);el.innerHTML=H+"h "+(mm?mm+"m":"")+'<small>'+(h>=(state.metas.metaSleep||7)?'✓ meta':'poco')+'</small>';el.style.color=h>=(state.metas.metaSleep||7)?"var(--good)":"var(--fire)"}
  else{el.innerHTML='—<small>sueño</small>';el.style.color="var(--ink)"}}
function renderHeader(){var d=parseISO(state.activeDate),t=iso(new Date());
  $("#dateTitle").textContent=(state.activeDate===t?"Hoy · ":"")+DOW[d.getDay()]+" "+d.getDate()+" "+MES[d.getMonth()];ring()}
function renderWeek(){var base=parseISO(state.activeDate),off=(base.getDay()+6)%7,mon=new Date(base);mon.setDate(base.getDate()-off);
  var t=iso(new Date()),html="",first,last;
  for(var i=0;i<7;i++){var d=new Date(mon);d.setDate(mon.getDate()+i);var ds=iso(d);if(i===0)first=d;if(i===6)last=d;
    var s=dayScore(ds),pct=s.pct,C=50.3,col=pct>=1?"var(--good)":(pct>0?"var(--accent)":"var(--track)");
    html+='<button class="day'+(ds===state.activeDate?' sel':'')+(ds===t?' today':'')+'" data-date="'+ds+'"><span class="dn">'+DOW[d.getDay()]+'</span>'+
      '<svg width="22" height="22" viewBox="0 0 20 20" aria-hidden="true"><circle cx="10" cy="10" r="8" fill="none" stroke="var(--track)" stroke-width="3"/><circle cx="10" cy="10" r="8" fill="none" stroke="'+col+'" stroke-width="3" stroke-linecap="round" stroke-dasharray="50.3" stroke-dashoffset="'+(C-C*pct)+'" transform="rotate(-90 10 10)"/></svg>'+
      '<span class="dnum mono">'+d.getDate()+'</span></button>'}
  $("#week").innerHTML=html;$("#weekRange").textContent=first.getDate()+"–"+last.getDate()+" "+MES[last.getMonth()]}

/* ---------- render: PROGRESO ---------- */
function kpi(n,t,s,cls){return '<div class="kpi'+(cls?" "+cls:"")+'"><div class="n mono">'+n+'</div><div class="t">'+t+'</div>'+(s?'<div class="s">'+s+'</div>':'')+'</div>'}
function renderKpis(){
  var wk=Math.round(weekRate()*100),m30=Math.round(rangeRate(30)*100),gs=globalStreak(),as=avgSleep(7);
  $("#kpis").innerHTML=
    kpi(Math.round(dayScore(iso(new Date())).pct*100)+"%","Hoy","","big accent")+
    kpi(wk+"%","Esta semana","meta "+(state.metas.metaPct||80)+"%")+
    kpi(m30+"%","Últimos 30 días","adherencia global")+
    kpi("🔥 "+gs,"Racha actual","mejor: "+bestGlobalStreak())+
    kpi(activeDays(),"Días registrados","")+
    kpi(as!=null?as.toFixed(1)+"h":"—","Sueño prom. 7d","meta "+(state.metas.metaSleep||7.5)+"h")}
function lastDates(n){var a=[],d=new Date();for(var i=0;i<n;i++){a.unshift(iso(d));d.setDate(d.getDate()-1)}return a}
function chartFont(){return{family:"'IBM Plex Sans',sans-serif"}}
function makeCharts(){
  if(typeof Chart==="undefined")return;
  var ink=css("--ink"),muted=css("--muted"),grid=css("--border"),accent=css("--accent"),good=css("--good"),fire=css("--fire");
  Chart.defaults.color=muted;Chart.defaults.font=chartFont();
  var dates=lastDates(21),labels=dates.map(function(s){var d=parseISO(s);return d.getDate()+"/"+(d.getMonth()+1)});
  var dailyPct=dates.map(function(s){return Math.round(dayScore(s).pct*100)});
  var sleepArr=dates.map(function(s){return sleepHours(s)});
  var hlabels=HABITS.map(function(h){return h.name.replace(" del día","").replace(" (active recall)","").replace(" → TOEFL"," (TOEFL)")});
  var hvals=HABITS.map(function(h){var c=0,t=0,d=new Date();for(var i=0;i<30;i++){var ds=iso(d);if(applies(h.id,d)){t++;if(doneOn(ds,h.id))c++}d.setDate(d.getDate()-1)}return t?Math.round(100*c/t):0});
  destroyCharts();
  state.charts.daily=new Chart($("#chDaily"),{type:"line",data:{labels:labels,datasets:[{data:dailyPct,borderColor:accent,backgroundColor:accent+"22",fill:true,tension:.3,pointRadius:2,borderWidth:2}]},
    options:baseOpts(grid,{max:100,ticks:function(v){return v+"%"}})});
  state.charts.habit=new Chart($("#chHabit"),{type:"bar",data:{labels:hlabels,datasets:[{data:hvals,backgroundColor:hvals.map(function(v){return v>=(state.metas.metaPct||80)?good:accent}),borderRadius:6}]},
    options:Object.assign(baseOpts(grid,{max:100,ticks:function(v){return v+"%"}}),{indexAxis:"y"})});
  state.charts.sleep=new Chart($("#chSleep"),{type:"line",data:{labels:labels,datasets:[{data:sleepArr,borderColor:fire,backgroundColor:fire+"22",fill:true,tension:.3,spanGaps:true,pointRadius:2,borderWidth:2}]},
    options:baseOpts(grid,{max:11,ticks:function(v){return v+"h"}})});
}
function baseOpts(grid,y){return{responsive:true,maintainAspectRatio:false,plugins:{legend:{display:false},tooltip:{callbacks:{}}},
  scales:{x:{grid:{display:false},ticks:{maxRotation:0,autoSkip:true,maxTicksLimit:7}},
    y:{beginAtZero:true,max:y.max,grid:{color:grid},ticks:{callback:y.ticks}}}}}
function destroyCharts(){["daily","habit","sleep"].forEach(function(k){if(state.charts[k]){state.charts[k].destroy();state.charts[k]=null}})}

/* ---------- render: METAS ---------- */
function renderMetas(){
  $("#goal").value=state.metas.objetivoSemana||"";$("#mToefl").value=state.metas.toeflFecha||"";
  $("#mPct").value=state.metas.metaPct;$("#mSleep").value=state.metas.metaSleep;$("#mRacha").value=state.metas.metaRacha;
  var out="";
  if(state.metas.toeflFecha){var diff=Math.ceil((parseISO(state.metas.toeflFecha)-new Date())/86400000);out+=kpi(diff>=0?diff:"—",diff>=0?"días para el TOEFL":"TOEFL pasó",state.metas.toeflFecha,"big accent")}
  var wk=Math.round(weekRate()*100),mp=state.metas.metaPct||80;out+=kpi(wk+"%","Semana vs meta",wk>=mp?"✓ vas sobre "+mp+"%":"falta "+(mp-wk)+" pts");
  var gs=globalStreak();out+=kpi("🔥 "+gs,"Racha vs meta",gs>=state.metas.metaRacha?"✓ meta lograda":"meta "+state.metas.metaRacha);
  var as=avgSleep(7),ms=state.metas.metaSleep||7.5;out+=kpi(as!=null?as.toFixed(1)+"h":"—","Sueño vs meta",as!=null?(as>=ms?"✓ sobre "+ms+"h":"falta dormir más"):"registra tu sueño");
  $("#metaKpis").innerHTML=out}

function renderActive(){renderHeader();
  if(state.tab==="hoy"){renderLists();renderSleep();renderWeek()}
  else if(state.tab==="progreso"){renderKpis();makeCharts()}
  else if(state.tab==="metas"){renderMetas()}}
function render(){renderActive()}

/* ---------- eventos ---------- */
document.addEventListener("click",function(e){
  var row=e.target.closest(".row");
  if(row&&!row.classList.contains("na")){var id=row.getAttribute("data-id");
    var o=state.days[state.activeDate]||(state.days[state.activeDate]={done:{},dormir:"",despertar:"",nota:""});o.done=o.done||{};o.done[id]=!o.done[id];
    touch(state.activeDate);render();return}
  var day=e.target.closest(".day");if(day){state.activeDate=day.getAttribute("data-date");render();return}
  var tab=e.target.closest(".tab");if(tab){switchTab(tab.getAttribute("data-tab"))}
});
function switchTab(name){state.tab=name;
  document.querySelectorAll(".tab").forEach(function(t){t.setAttribute("aria-selected",t.getAttribute("data-tab")===name)});
  ["hoy","progreso","metas","ajustes"].forEach(function(n){$("#tab-"+n).hidden=(n!==name)});
  window.scrollTo(0,0);render()}
$("#dormir").addEventListener("change",sleepChange);$("#despertar").addEventListener("change",sleepChange);
function sleepChange(){var o=state.days[state.activeDate]||(state.days[state.activeDate]={done:{},dormir:"",despertar:"",nota:""});
  o.dormir=$("#dormir").value;o.despertar=$("#despertar").value;touch(state.activeDate);renderSleep();renderHeader()}
var gT;$("#goal").addEventListener("input",function(){state.metas.objetivoSemana=$("#goal").value;clearTimeout(gT);gT=setTimeout(pushMetas,600);saveMetas()});
["mToefl","mPct","mSleep","mRacha"].forEach(function(id){$("#"+id).addEventListener("change",function(){
  state.metas.toeflFecha=$("#mToefl").value;state.metas.metaPct=+$("#mPct").value||80;state.metas.metaSleep=+$("#mSleep").value||7.5;state.metas.metaRacha=+$("#mRacha").value||14;
  saveMetas();pushMetas();renderMetas()})});

/* ---------- respaldo local ---------- */
$("#btnExport").addEventListener("click",function(){var blob=new Blob([JSON.stringify({days:state.days,metas:state.metas},null,2)],{type:"application/json"});
  var a=document.createElement("a");a.href=URL.createObjectURL(blob);a.download="gimnasio-mental-"+iso(new Date())+".json";a.click();setTimeout(function(){URL.revokeObjectURL(a.href)},1000)});
$("#btnImport").addEventListener("click",function(){$("#fileImport").click()});
$("#fileImport").addEventListener("change",function(e){var f=e.target.files[0];if(!f)return;var r=new FileReader();r.onload=function(){try{var o=JSON.parse(r.result);
  if(o.days){Object.keys(o.days).forEach(function(k){state.days[k]=o.days[k]});saveDays()}if(o.metas){state.metas=Object.assign(state.metas,o.metas);saveMetas()}
  render();alert("Progreso importado.")}catch(err){alert("Archivo inválido.")}};r.readAsText(f)});
$("#btnTheme").addEventListener("click",function(){var cur=document.documentElement.getAttribute("data-theme");var next=cur==="dark"?"light":(cur==="light"?"":"dark");
  if(next)document.documentElement.setAttribute("data-theme",next);else document.documentElement.removeAttribute("data-theme");
  try{localStorage.setItem("gm_theme",next)}catch(e){}if(state.tab==="progreso")makeCharts()});

/* ---------- Supabase sync ---------- */
function status(cls,txt){$("#statusDot").className="dot"+(cls?" "+cls:"");$("#statusText").textContent=txt}
function syncMsg(txt,cls){var el=$("#syncMsg");el.textContent=txt||"";el.className="msg"+(cls?" "+cls:"")}
function touch(date){var o=state.days[date];if(o)o.u=new Date().toISOString();saveDays();pushDay(date)}
function loadCfg(){try{return JSON.parse(localStorage.getItem("gm_cfg")||"null")}catch(e){return null}}
function initSupabase(){
  var cfg=loadCfg();if(!cfg||!cfg.url||!cfg.key){status("","local");return}
  if(typeof supabase==="undefined"){status("warn","sin librería");return}
  try{state.sb=supabase.createClient(cfg.url,cfg.key,{auth:{persistSession:true,autoRefreshToken:true,detectSessionInUrl:true}});}
  catch(e){status("warn","config inválida");return}
  $("#supUrl").value=cfg.url;$("#supKey").value=cfg.key;$("#authBox").hidden=false;$("#btnLogin").hidden=false;
  state.sb.auth.getSession().then(function(r){onSession(r.data.session)});
  state.sb.auth.onAuthStateChange(function(_e,s){onSession(s)});
}
function onSession(session){
  if(session&&session.user){state.uid=session.user.id;status("on","sincronizado");syncMsg("Conectado como "+ (session.user.email||"") ,"ok");
    $("#btnLogin").hidden=true;$("#btnLogout").hidden=false;$("#authBox").hidden=true;pullCloud();subscribeCloud();}
  else{state.uid=null;status("warn","conecta tu correo");$("#btnLogout").hidden=true;$("#btnLogin").hidden=false;$("#authBox").hidden=false}
}
$("#btnSaveSup").addEventListener("click",function(){var url=$("#supUrl").value.trim(),key=$("#supKey").value.trim();
  if(!url||!key){syncMsg("Pega la URL y la anon key.","err");return}
  try{localStorage.setItem("gm_cfg",JSON.stringify({url:url,key:key}))}catch(e){}
  syncMsg("Guardado. Conectando…");setTimeout(function(){location.reload()},400)});
$("#btnLogin").addEventListener("click",function(){if(!state.sb)return;var email=$("#supEmail").value.trim();if(!email){syncMsg("Escribe tu correo.","err");return}
  syncMsg("Enviando enlace…");state.sb.auth.signInWithOtp({email:email,options:{emailRedirectTo:location.href.split("#")[0]}})
    .then(function(r){if(r.error)syncMsg("Error: "+r.error.message,"err");else syncMsg("Revisa tu correo y abre el enlace en ESTE dispositivo.","ok")})});
$("#btnLogout").addEventListener("click",function(){if(state.sb)state.sb.auth.signOut().then(function(){location.reload()})});

function pushDay(date){if(!state.sb||!state.uid)return;var o=state.days[date];if(!o)return;
  state.sb.from("dias").upsert({user_id:state.uid,fecha:date,done:o.done||{},dormir:o.dormir||"",despertar:o.despertar||"",nota:o.nota||"",updated_at:o.u||new Date().toISOString()},{onConflict:"user_id,fecha"}).then(function(r){if(r&&r.error)syncMsg("Sync: "+r.error.message,"err")})}
function pushMetas(){if(!state.sb||!state.uid)return;
  state.sb.from("metas").upsert({user_id:state.uid,data:state.metas,updated_at:new Date().toISOString()},{onConflict:"user_id"}).then(function(){})}
function pullCloud(){if(!state.sb||!state.uid)return;
  state.sb.from("dias").select("*").eq("user_id",state.uid).then(function(r){
    if(r.error){syncMsg("Sync: "+r.error.message+" (¿creaste las tablas? ver README)","err");return}
    (r.data||[]).forEach(function(row){var loc=state.days[row.fecha];var newer=!loc||!loc.u||Date.parse(row.updated_at)>=Date.parse(loc.u||0);
      if(newer)state.days[row.fecha]={done:row.done||{},dormir:row.dormir||"",despertar:row.despertar||"",nota:row.nota||"",u:row.updated_at}});
    saveDays();
    // empujar días locales más nuevos que la nube
    var cloud={};(r.data||[]).forEach(function(row){cloud[row.fecha]=Date.parse(row.updated_at)});
    Object.keys(state.days).forEach(function(d){var lu=Date.parse(state.days[d].u||0);if(!cloud[d]||lu>cloud[d])pushDay(d)});
    render()});
  state.sb.from("metas").select("*").eq("user_id",state.uid).maybeSingle().then(function(r){if(r&&r.data&&r.data.data){state.metas=Object.assign(state.metas,r.data.data);saveMetas();if(state.tab==="metas")renderMetas()}})}
function subscribeCloud(){if(!state.sb||!state.uid)return;
  try{state.sb.channel("gm").on("postgres_changes",{event:"*",schema:"public",table:"dias",filter:"user_id=eq."+state.uid},function(p){var row=p.new;if(!row||!row.fecha)return;
    var loc=state.days[row.fecha];if(!loc||!loc.u||Date.parse(row.updated_at)>Date.parse(loc.u||0)){state.days[row.fecha]={done:row.done||{},dormir:row.dormir||"",despertar:row.despertar||"",nota:row.nota||"",u:row.updated_at};saveDays();render()}})
    .on("postgres_changes",{event:"*",schema:"public",table:"metas",filter:"user_id=eq."+state.uid},function(p){if(p.new&&p.new.data){state.metas=Object.assign(state.metas,p.new.data);saveMetas();if(state.tab==="metas")renderMetas()}}).subscribe()}catch(e){}}

/* ---------- arranque ---------- */
(function boot(){
  try{var th=localStorage.getItem("gm_theme");if(th)document.documentElement.setAttribute("data-theme",th)}catch(e){}
  loadLS();render();initSupabase();
})();
})();

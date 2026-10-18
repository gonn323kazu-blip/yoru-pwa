const KEY="yoru_final_pwa_v1";
const ROUTINES={
 breath:{name:"呼吸を整える",desc:"自然な呼吸を感じる · 1分",title:"ゆっくり、ひと息。",detail:"無理に深く吸おうとせず、自然な呼吸を感じてみましょう。",icon:"〰",seconds:60},
 stretch:{name:"体をゆるめる",desc:"肩や背中をゆっくり伸ばす · 2分",title:"体の力を、そっとぬく。",detail:"肩をゆっくり回し、首や背中を気持ちよい範囲で伸ばしましょう。痛みがあれば止めてください。",icon:"✧",seconds:120},
 quiet:{name:"静かに過ごす",desc:"目を閉じてひと休み · 1分",title:"何もしない時間も、大切に。",detail:"楽な姿勢で目を閉じても、ぼんやり夜を眺めても大丈夫です。",icon:"☾",seconds:60}
};
const $=id=>document.getElementById(id);
const todayKey=(d=new Date())=>`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`;
function blank(){return {stars:0,rituals:{},records:{},settings:{bedtime:"23:30",reminder:false,lastReminderDate:""}}}
function load(){try{const x=JSON.parse(localStorage.getItem(KEY)||"null");return x?{...blank(),...x,settings:{...blank().settings,...x.settings}}:blank()}catch{return blank()}}
let data=load(), chosen="breath", remaining=60, interval=null, running=false;
function persist(){try{localStorage.setItem(KEY,JSON.stringify(data))}catch{notify("保存できませんでした。端末の空き容量をご確認ください。")}}
function notify(msg){const el=$("toast");el.textContent=msg;el.classList.add("show");clearTimeout(notify.t);notify.t=setTimeout(()=>el.classList.remove("show"),2400)}
function go(screen){document.querySelectorAll(".screen").forEach(el=>el.classList.toggle("active",el.id===`screen-${screen}`));document.querySelectorAll(".nav-item").forEach(el=>el.classList.toggle("active",el.dataset.screen===screen));document.body.classList.toggle("hide-nav",screen==="goodnight");if(screen==="home")renderHome();if(screen==="journal")renderJournal();if(screen==="settings")renderSettings();window.scrollTo({top:0,behavior:"smooth"})}
document.querySelectorAll("[data-screen]").forEach(el=>el.addEventListener("click",()=>go(el.dataset.screen)));
function renderHome(){const d=new Date();$("today-date").textContent=new Intl.DateTimeFormat("ja-JP",{month:"long",day:"numeric",weekday:"short"}).format(d).toUpperCase();$("star-count").textContent=data.stars;const done=data.rituals[todayKey()]?.done;const key=data.rituals[todayKey()]?.type||chosen;const r=ROUTINES[key]||ROUTINES.breath;$("home-routine-title").textContent=done?"今夜の習慣は完了しました":r.name;$("home-routine-desc").textContent=done?"おつかれさま。今夜も自分のペースで。":r.desc;$("home-symbol").textContent=done?"✦":r.icon}
function beginRitual(key){chosen=key;const r=ROUTINES[key];remaining=r.seconds;running=false;stopInterval();$("session-icon").textContent=r.icon;$("session-title").textContent=r.title;$("session-desc").textContent=r.detail;$("timer").textContent=fmt(remaining);$("timer-note").textContent="準備ができたら始めましょう";$("timer-toggle").innerHTML='始める <span>→</span>';$("breath-orb").classList.remove("running");go("session")}
function fmt(n){return `${String(Math.floor(n/60)).padStart(2,"0")}:${String(n%60).padStart(2,"0")}`}
function stopInterval(){if(interval)clearInterval(interval);interval=null;running=false;$("breath-orb").classList.remove("running")}
function toggleTimer(){if(running){stopInterval();$("timer-toggle").textContent="再開する";$("timer-note").textContent="ひと休み中";return}running=true;$("timer-toggle").textContent="一時停止";$("timer-note").textContent=chosen==="breath"?"呼吸のペースは自由です":"心地よいペースで続けましょう";$("breath-orb").classList.add("running");interval=setInterval(()=>{remaining--; $("timer").textContent=fmt(Math.max(remaining,0));if(remaining<=0)complete(true)},1000)}
function complete(fromTimer){stopInterval();const k=todayKey(),old=data.rituals[k]?.done;data.rituals[k]={done:true,type:chosen,completedAt:new Date().toISOString()};if(!old)data.stars++;persist();$("completed-name").textContent=ROUTINES[chosen].name+" · 完了";$("complete-message").textContent=old?"おかえりなさい。今夜も自分のペースで大丈夫。":"今日も自分を休ませる時間が作れたね。";go("complete")}
document.querySelectorAll("[data-ritual]").forEach(el=>el.addEventListener("click",()=>beginRitual(el.dataset.ritual)));
$("home-quick-start").addEventListener("click",()=>beginRitual("breath"));
$("timer-toggle").addEventListener("click",toggleTimer);
$("finish-now").addEventListener("click",()=>complete(false));
$("finish-night").addEventListener("click",()=>{go("home");notify("おやすみなさい。")});
$("skip-tonight").addEventListener("click",()=>{go("goodnight")});
function renderJournal(){const now=new Date(),monday=new Date(now);monday.setDate(now.getDate()-(now.getDay()+6)%7);const names=["月","火","水","木","金","土","日"];let count=0;$("week-grid").innerHTML="";for(let i=0;i<7;i++){const d=new Date(monday);d.setDate(monday.getDate()+i);const done=!!data.rituals[todayKey(d)]?.done;if(done)count++;const cell=document.createElement("div");cell.className="day";const label=document.createElement("span");label.textContent=names[i];const dot=document.createElement("div");dot.className="dot"+(done?" done":"");dot.textContent=done?"✦":"·";cell.append(label,dot);$("week-grid").appendChild(cell)}$("week-count").textContent=count+"日";$("week-reflection").textContent=count===0?"今週はこれから。できそうな日に、ひとつだけ試してみよう。":`今週は${count}日、夜の習慣に取り組めました。自分のペースで続けていこう。`;const r=data.records[todayKey()]||{};$("bedtime").value=r.bedtime||"";$("latency").value=r.latency??"";$("phone").value=r.phone??"";$("waketime").value=r.waketime||"";$("feeling").value=r.feeling||3;$("feeling-label").textContent=feelingText(Number($("feeling").value));$("note").value=r.note||"";renderCharts()}
let chartRange="week";
document.querySelectorAll("[data-range]").forEach(button=>button.addEventListener("click",()=>{
 chartRange=button.dataset.range;
 document.querySelectorAll("[data-range]").forEach(b=>{const active=b.dataset.range===chartRange;b.classList.toggle("active",active);b.setAttribute("aria-pressed",String(active))});
 renderCharts();
}));
function getChartDays(range){
 const now=new Date();now.setHours(0,0,0,0);const days=[];
 if(range==="day"){
  const key=todayKey(now);return [{key,label:"今日",record:data.records[key]||{},fullLabel:key}];
 }
 if(range==="year"){
  for(let i=11;i>=0;i--){const d=new Date(now.getFullYear(),now.getMonth()-i,1);const key=todayKey(d);const prefix=`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}`;const entries=Object.entries(data.records).filter(([k,r])=>k.startsWith(prefix)&&r&&Object.keys(r).some(f=>["bedtime","latency","phone","waketime","feeling","note"].includes(f)));const record={};["phone","latency"].forEach(field=>{const vals=entries.map(([,r])=>r[field]).filter(v=>v!==null&&v!==undefined&&v!=="").map(Number).filter(Number.isFinite);record[field]=vals.length?Math.round(vals.reduce((a,b)=>a+b,0)/vals.length):null});days.push({key,label:`${d.getMonth()+1}月`,record,fullLabel:prefix});}
  return days;
 }
 const count=range==="month"?30:7;
 for(let i=count-1;i>=0;i--){const d=new Date(now);d.setDate(now.getDate()-i);const key=todayKey(d);days.push({key,label:range==="week"?`${d.getMonth()+1}/${d.getDate()}`:`${d.getMonth()+1}/${d.getDate()}`,record:data.records[key]||{},fullLabel:key});}
 return days;
}
function renderCharts(){
 const days=getChartDays(chartRange),period={day:"1日",week:"1週間",month:"1か月",year:"1年"}[chartRange];
 $("chart-period-label").textContent=period;
 drawLineChart("phone-chart",days,"phone","分","phone-trend","寝る前のスマホ時間",chartRange);
 drawLineChart("latency-chart",days,"latency","分","latency-trend","寝つくまでの時間",chartRange);
 const recordDays=Object.values(data.records).filter(r=>r&&Object.keys(r).some(k=>["bedtime","latency","phone","waketime","feeling","note"].includes(k))).length;$("record-days").textContent=recordDays+"日分";$("record-progress").style.width=Math.min(recordDays/14*100,100)+"%";$("progress-message").textContent=recordDays===0?"まずは、わかる項目だけで大丈夫。":"これまでに"+recordDays+"日分の記録がたまりました。比較できる日が増えるほど、自分の傾向を見つけやすくなります。";
}
function drawLineChart(id,days,field,unit,trendId,label,range){
 const root=$(id);root.innerHTML="";const ns="http://www.w3.org/2000/svg";const width=320,height=174,left=34,right=12,top=12,bottom=30,plotW=width-left-right,plotH=height-top-bottom;
 const values=days.map(d=>{const v=d.record[field];return v!==null&&v!==undefined&&v!==""&&Number.isFinite(Number(v))&&Number(v)>=0?Number(v):null});const valid=values.filter(v=>v!==null);const maxVal=Math.max(30,...valid);const max=Math.ceil(maxVal/10)*10;const y=v=>top+plotH-(v/max)*plotH;const x=i=>left+(days.length===1?plotW/2:i*plotW/(days.length-1));
 const svg=document.createElementNS(ns,"svg");svg.setAttribute("viewBox",`0 0 ${width} ${height}`);svg.setAttribute("role","img");svg.setAttribute("aria-label",`${label}、${({day:"今日",week:"直近1週間",month:"直近1か月",year:"過去1年"})[range]}の折れ線グラフ`);
 for(let i=0;i<=3;i++){const value=max*i/3,yy=y(value),line=document.createElementNS(ns,"line");line.setAttribute("x1",left);line.setAttribute("x2",width-right);line.setAttribute("y1",yy);line.setAttribute("y2",yy);line.setAttribute("class","chart-gridline");svg.appendChild(line);const text=document.createElementNS(ns,"text");text.setAttribute("x",left-7);text.setAttribute("y",yy+3);text.setAttribute("text-anchor","end");text.setAttribute("class","chart-axis-label");text.textContent=Math.round(value);svg.appendChild(text)}
 let segment=[];const flush=()=>{if(segment.length>1){const poly=document.createElementNS(ns,"polyline");poly.setAttribute("points",segment.map(p=>`${p.x},${p.y}`).join(" "));poly.setAttribute("class","chart-line");svg.appendChild(poly)}segment.forEach(p=>{const circle=document.createElementNS(ns,"circle");circle.setAttribute("cx",p.x);circle.setAttribute("cy",p.y);circle.setAttribute("r",days.length>45?2.1:3.2);circle.setAttribute("class","chart-point");const title=document.createElementNS(ns,"title");title.textContent=`${p.label}: ${p.value}${unit}`;circle.appendChild(title);svg.appendChild(circle)});segment=[]};
 values.forEach((v,i)=>{if(v===null){flush();return}segment.push({x:x(i),y:y(v),label:days[i].fullLabel,value:v})});flush();
 const labelIndices=days.length===1?[0]:days.length<=7?days.map((_,i)=>i):[0,Math.floor((days.length-1)/2),days.length-1];[...new Set(labelIndices)].forEach(i=>{const text=document.createElementNS(ns,"text");text.setAttribute("x",x(i));text.setAttribute("y",height-9);text.setAttribute("text-anchor",i===0?"start":i===days.length-1?"end":"middle");text.setAttribute("class","chart-axis-label");text.textContent=days[i].label;svg.appendChild(text)});
 root.appendChild(svg);
 if(valid.length===0){const empty=document.createElement("p");empty.className="chart-empty";empty.textContent=range==="day"?"今日の記録はまだありません。":"この期間の記録はまだありません。";root.appendChild(empty)}
 const recorded=days.map((d,i)=>({date:d.label,fullLabel:d.fullLabel,value:values[i]})).filter(d=>d.value!==null);const trend=$(trendId);if(recorded.length===0){trend.textContent=label+"を記録すると、ここに変化が表示されます。";return}if(recorded.length===1){trend.textContent=range==="day"?"今日の記録は"+recorded[0].value+unit+"です。":"この期間は"+recorded[0].fullLabel+"の"+recorded[0].value+unit+"が記録されています。";return}const first=recorded[0],last=recorded[recorded.length-1],diff=last.value-first.value;trend.textContent="期間内の最初の記録（"+first.value+unit+"）から直近（"+last.value+unit+"）は"+(diff===0?"同じくらい":Math.abs(diff)+unit+(diff<0?"短く":"長く"))+"なっています。日ごとの違いも含めて、自分の傾向を見てみましょう。";
}
function feelingText(n){return ["","かなり疲れた","少し疲れた","ふつう","少しすっきり","すっきり"][n]||"ふつう"}
$("feeling").addEventListener("input",()=>$("feeling-label").textContent=feelingText(Number($("feeling").value)));
$("sleep-form").addEventListener("submit",e=>{e.preventDefault();data.records[todayKey()]={bedtime:$("bedtime").value,latency:val("latency"),phone:val("phone"),waketime:$("waketime").value,feeling:Number($("feeling").value),note:$("note").value.trim(),updatedAt:new Date().toISOString()};persist();renderCharts();$("record-status").textContent="今日の記録を保存しました。";setTimeout(()=>$("record-status").textContent="",2500)});
function val(id){const v=$(id).value;return v===""?null:Number(v)}
function renderSettings(){$("goal-bedtime").value=data.settings.bedtime||"23:30";$("reminder-on").checked=!!data.settings.reminder}
$("settings-form").addEventListener("submit",e=>{e.preventDefault();data.settings.bedtime=$("goal-bedtime").value||"23:30";data.settings.reminder=$("reminder-on").checked;persist();$("settings-status").textContent="設定を保存しました。";setTimeout(()=>$("settings-status").textContent="",2500);if(data.settings.reminder)startReminderCheck();else if(reminderInterval){clearInterval(reminderInterval);reminderInterval=null}});
$("test-reminder").addEventListener("click",async()=>{if(!("Notification"in window)){notify("このブラウザは通知に対応していません。");return}try{let p=Notification.permission;if(p==="default")p=await Notification.requestPermission();if(p==="granted")new Notification("YORU｜夜の準備",{body:"そろそろ夜の準備を始めてみませんか？",icon:"./icons/icon-192.png"});else notify("通知が許可されていません。ブラウザの設定をご確認ください。")}catch{notify("この環境では通知を表示できませんでした。")}});
function startReminderCheck(){if(reminderInterval)clearInterval(reminderInterval);reminderInterval=setInterval(checkReminder,60000);checkReminder()}
let reminderInterval=null;
function checkReminder(){if(!data.settings.reminder||!("Notification"in window)||Notification.permission!=="granted")return;const now=new Date(),[h,m]=(data.settings.bedtime||"23:30").split(":").map(Number);let target=h*60+m-60;if(target<0)target+=1440;const cur=now.getHours()*60+now.getMinutes();if(cur===target&&data.settings.lastReminderDate!==todayKey()){try{new Notification("YORU｜夜の準備",{body:"そろそろ夜の準備を始めてみませんか？",icon:"./icons/icon-192.png"});data.settings.lastReminderDate=todayKey();persist()}catch{}}}
$("export-data").addEventListener("click",()=>{const rows=[["日付","ベッドに入った時刻","寝つくまでの時間(分)","寝る前スマホ(分)","起床時刻","目覚め","ひとこと","習慣","習慣完了"]];const keys=new Set([...Object.keys(data.records),...Object.keys(data.rituals)]);[...keys].sort().forEach(k=>{const r=data.records[k]||{},rit=data.rituals[k]||{};rows.push([k,r.bedtime??"",r.latency??"",r.phone??"",r.waketime??"",r.feeling?feelingText(r.feeling):"",r.note??"",rit.type?ROUTINES[rit.type]?.name:"",rit.done?"はい":"いいえ"])});const csv="\\ufeff"+rows.map(row=>row.map(v=>`"${String(v??"").replace(/"/g,'""')}"`).join(",")).join("\\r\\n");const blob=new Blob([csv],{type:"text/csv;charset=utf-8"});const url=URL.createObjectURL(blob),a=document.createElement("a");a.href=url;a.download="YORU_記録.csv";a.click();URL.revokeObjectURL(url)});
$("delete-data").addEventListener("click",()=>{if(confirm("この端末に保存されたYORUの記録と設定をすべて削除しますか？この操作は取り消せません。")){localStorage.removeItem(KEY);data=blank();renderHome();renderJournal();renderSettings();notify("記録を削除しました。")}});
if("serviceWorker"in navigator&&/^https?:$/.test(location.protocol))navigator.serviceWorker.register("./sw.js").catch(()=>{});
renderHome();renderSettings();renderJournal();if(data.settings.reminder)startReminderCheck();

const KEY="yoru_final_pwa_v1";
const EXTRA_KEY="yoru_improved_features_v1";
let extra=(()=>{try{return JSON.parse(localStorage.getItem(EXTRA_KEY)||"{}")||{}}catch{return {}}})();
function saveExtra(){try{localStorage.setItem(EXTRA_KEY,JSON.stringify(extra))}catch{notify("追加データを保存できませんでした。")}}
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
function go(screen){document.querySelectorAll(".screen").forEach(el=>el.classList.toggle("active",el.id===`screen-${screen}`));document.querySelectorAll(".nav-item").forEach(el=>el.classList.toggle("active",el.dataset.screen===screen));document.body.classList.toggle("hide-nav",screen==="goodnight");if(screen==="home")renderHome();if(screen==="journal")renderJournal();if(screen==="constellations")renderConstellations();if(screen==="settings")renderSettings();window.scrollTo({top:0,behavior:"smooth"})}
document.querySelectorAll("[data-screen]").forEach(el=>el.addEventListener("click",()=>go(el.dataset.screen)));
function renderHome(){const d=new Date();$("today-date").textContent=new Intl.DateTimeFormat("ja-JP",{month:"long",day:"numeric",weekday:"short"}).format(d).toUpperCase();$("star-count").textContent=data.stars;const done=data.rituals[todayKey()]?.done;const key=data.rituals[todayKey()]?.type||chosen;const r=ROUTINES[key]||ROUTINES.breath;$("home-routine-title").textContent=done?"今夜の習慣は完了しました":r.name;$("home-routine-desc").textContent=done?"おつかれさま。今夜も自分のペースで。":r.desc;$("home-symbol").textContent=done?"✦":r.icon}
function beginRitual(key){chosen=key;const r=ROUTINES[key];remaining=r.seconds;running=false;stopInterval();$("session-icon").textContent=r.icon;$("session-title").textContent=r.title;$("session-desc").textContent=r.detail;$("timer").textContent=fmt(remaining);$("timer-note").textContent="準備ができたら始めましょう";$("timer-toggle").innerHTML='始める <span>→</span>';$("breath-orb").classList.remove("running");const visual=$("guide-visual");visual.dataset.kind=key;const guides={breath:{caption:"鼻から自然に吸って、ゆっくり吐く。呼吸を無理に変えなくても大丈夫。",art:"◯",extra:"〰"},stretch:{caption:"肩をゆっくり回し、首や背中を心地よい範囲で伸ばそう。痛みがあれば中止してね。",art:"↗",extra:"✧"},quiet:{caption:"楽な姿勢で目を閉じるか、ぼんやり過ごそう。何もしなくても大丈夫。",art:"☾",extra:"·"}};const g=guides[key];const guide=$('routine-guide');guide.hidden=key==='breath';if(key==='quiet'){visual.innerHTML='<img class="routine-image" src="./images/quiet-meditation.png" alt="座って目を閉じ、静かに休息する男性のイラスト">';}else if(key==='stretch'){visual.innerHTML='<div class="stretch-gallery"><img class="routine-image" src="./images/stretch-back.jpg" alt="背中を丸めたり伸ばしたりするストレッチ"><img class="routine-image" src="./images/stretch-shoulders.png" alt="両肘を曲げて肩を回すストレッチ"><img class="routine-image" src="./images/stretch-neck.png" alt="首を横にゆっくり倒すストレッチ"></div>';}else{visual.innerHTML='';}$("guide-caption").textContent=g.caption;$("self-check").hidden=false;$("star-status").textContent="";go("session")}
function fmt(n){return `${String(Math.floor(n/60)).padStart(2,"0")}:${String(n%60).padStart(2,"0")}`}
function stopInterval(){if(interval)clearInterval(interval);interval=null;running=false;$("breath-orb").classList.remove("running")}
const toggleTimerOriginal=toggleTimer;
function toggleTimer(){if(running){stopInterval();$("timer-toggle").textContent="再開する";$("timer-note").textContent="ひと休み中";return}running=true;$("timer-toggle").textContent="一時停止";$("timer-note").textContent=chosen==="breath"?"呼吸のペースは自由です":"心地よいペースで続けましょう";$("breath-orb").classList.add("running");interval=setInterval(()=>{remaining--; $("timer").textContent=fmt(Math.max(remaining,0));if(remaining<=0)complete(true)},1000)}
function complete(fromTimer){stopInterval();const k=todayKey(),old=data.rituals[k]?.done;data.rituals[k]={done:true,type:chosen,completedAt:new Date().toISOString(),timerFinished:!!fromTimer};persist();if(fromTimer){try{if("vibrate" in navigator)navigator.vibrate([180,80,180])}catch{}}$("completed-name").textContent=ROUTINES[chosen].name+" · 完了";$("complete-message").textContent="今日も自分を休ませる時間が作れたね。できたことを、そっと振り返ってみよう。";const already=!!extra.starDays?.[k];$("self-check").hidden=already;$("star-status").textContent=already?"今夜の星はもう灯っています。":"";$("self-check-yes").disabled=already;go("complete")}
document.querySelectorAll("[data-ritual]").forEach(el=>el.addEventListener("click",()=>beginRitual(el.dataset.ritual)));
$("home-quick-start").addEventListener("click",()=>beginRitual("breath"));
$("timer-toggle").addEventListener("click",toggleTimer);
$("finish-now").addEventListener("click",()=>complete(false));
$("finish-night").addEventListener("click",()=>{go("home");notify("おやすみなさい。")});
$("skip-tonight").addEventListener("click",()=>{go("goodnight")});
function renderJournal(){renderInsight();const now=new Date(),monday=new Date(now);monday.setDate(now.getDate()-(now.getDay()+6)%7);const names=["月","火","水","木","金","土","日"];let count=0;$("week-grid").innerHTML="";for(let i=0;i<7;i++){const d=new Date(monday);d.setDate(monday.getDate()+i);const done=!!data.rituals[todayKey(d)]?.done;if(done)count++;const cell=document.createElement("div");cell.className="day";const label=document.createElement("span");label.textContent=names[i];const dot=document.createElement("div");dot.className="dot"+(done?" done":"");dot.textContent=done?"✦":"·";cell.append(label,dot);$("week-grid").appendChild(cell)}$("week-count").textContent=count+"日";$("week-reflection").textContent=count===0?"今週はこれから。できそうな日に、ひとつだけ試してみよう。":`今週は${count}日、夜の習慣に取り組めました。自分のペースで続けていこう。`;const r=data.records[$("record-date").value||todayKey()]||{};$("bedtime").value=r.bedtime||"";$("latency").value=r.latency??"";$("phone").value=r.phone??"";$("waketime").value=r.waketime||"";$("feeling").value=r.feeling||3;$("feeling-label").textContent=feelingText(Number($("feeling").value));$("note").value=r.note||"";renderCharts()}
let chartRange="week";
document.querySelectorAll("[data-range]").forEach(button=>button.addEventListener("click",()=>{
 chartRange=button.dataset.range;
 document.querySelectorAll("[data-range]").forEach(b=>{const active=b.dataset.range===chartRange;b.classList.toggle("active",active);b.setAttribute("aria-pressed",String(active))});
 renderCharts();
}));
function getChartDays(range){
 const now=new Date(($("record-date").value||todayKey())+"T12:00:00");now.setHours(0,0,0,0);const days=[];
 if(range==="day"){
  const key=todayKey(now);return [{key,label:key,record:data.records[key]||{},fullLabel:key}];
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
 const svg=document.createElementNS(ns,"svg");svg.setAttribute("viewBox",`0 0 ${width} ${height}`);svg.setAttribute("role","img");svg.setAttribute("aria-label",`${label}、${({day:"選択日",week:"直近1週間",month:"直近1か月",year:"過去1年"})[range]}の折れ線グラフ`);
 for(let i=0;i<=3;i++){const value=max*i/3,yy=y(value),line=document.createElementNS(ns,"line");line.setAttribute("x1",left);line.setAttribute("x2",width-right);line.setAttribute("y1",yy);line.setAttribute("y2",yy);line.setAttribute("class","chart-gridline");svg.appendChild(line);const text=document.createElementNS(ns,"text");text.setAttribute("x",left-7);text.setAttribute("y",yy+3);text.setAttribute("text-anchor","end");text.setAttribute("class","chart-axis-label");text.textContent=Math.round(value);svg.appendChild(text)}
 let segment=[];const flush=()=>{if(segment.length>1){const poly=document.createElementNS(ns,"polyline");poly.setAttribute("points",segment.map(p=>`${p.x},${p.y}`).join(" "));poly.setAttribute("class","chart-line");svg.appendChild(poly)}segment.forEach(p=>{const circle=document.createElementNS(ns,"circle");circle.setAttribute("cx",p.x);circle.setAttribute("cy",p.y);circle.setAttribute("r",days.length>45?2.1:3.2);circle.setAttribute("class","chart-point");const title=document.createElementNS(ns,"title");title.textContent=`${p.label}: ${p.value}${unit}`;circle.appendChild(title);svg.appendChild(circle)});segment=[]};
 values.forEach((v,i)=>{if(v===null){flush();return}segment.push({x:x(i),y:y(v),label:days[i].fullLabel,value:v})});flush();
 const labelIndices=days.length===1?[0]:days.length<=7?days.map((_,i)=>i):[0,Math.floor((days.length-1)/2),days.length-1];[...new Set(labelIndices)].forEach(i=>{const text=document.createElementNS(ns,"text");text.setAttribute("x",x(i));text.setAttribute("y",height-9);text.setAttribute("text-anchor",i===0?"start":i===days.length-1?"end":"middle");text.setAttribute("class","chart-axis-label");text.textContent=days[i].label;svg.appendChild(text)});
 root.appendChild(svg);
 if(valid.length===0){const empty=document.createElement("p");empty.className="chart-empty";empty.textContent=range==="day"?"選択日の記録はまだありません。":"この期間の記録はまだありません。";root.appendChild(empty)}
 const recorded=days.map((d,i)=>({date:d.label,fullLabel:d.fullLabel,value:values[i]})).filter(d=>d.value!==null);const trend=$(trendId);if(recorded.length===0){trend.textContent=label+"を記録すると、ここに変化が表示されます。";return}if(recorded.length===1){trend.textContent=range==="day"?"選択日の記録は"+recorded[0].value+unit+"です。":"この期間は"+recorded[0].fullLabel+"の"+recorded[0].value+unit+"が記録されています。";return}const first=recorded[0],last=recorded[recorded.length-1],diff=last.value-first.value;trend.textContent="期間内の最初の記録（"+first.value+unit+"）から直近（"+last.value+unit+"）は"+(diff===0?"同じくらい":Math.abs(diff)+unit+(diff<0?"短く":"長く"))+"なっています。日ごとの違いも含めて、自分の傾向を見てみましょう。";
}
function feelingText(n){return ["","かなり疲れた","少し疲れた","ふつう","少しすっきり","すっきり"][n]||"ふつう"}
$("feeling").addEventListener("input",()=>$("feeling-label").textContent=feelingText(Number($("feeling").value)));

function val(id){const v=$(id).value;return v===""?null:Number(v)}
function renderSettings(){$("goal-bedtime").value=data.settings.bedtime||"23:30";$("reminder-on").checked=!!data.settings.reminder}
$("settings-form").addEventListener("submit",e=>{e.preventDefault();data.settings.bedtime=$("goal-bedtime").value||"23:30";data.settings.reminder=$("reminder-on").checked;persist();$("settings-status").textContent="設定を保存しました。";setTimeout(()=>$("settings-status").textContent="",2500);if(data.settings.reminder)startReminderCheck();else if(reminderInterval){clearInterval(reminderInterval);reminderInterval=null}});
$("test-reminder").addEventListener("click",async()=>{if(!("Notification"in window)){notify("このブラウザは通知に対応していません。");return}try{let p=Notification.permission;if(p==="default")p=await Notification.requestPermission();if(p==="granted")new Notification("YORU｜夜の準備",{body:"そろそろ夜の準備を始めてみませんか？",icon:"./icons/icon-192.png"});else notify("通知が許可されていません。ブラウザの設定をご確認ください。")}catch{notify("この環境では通知を表示できませんでした。")}});
function startReminderCheck(){if(reminderInterval)clearInterval(reminderInterval);reminderInterval=setInterval(checkReminder,60000);checkReminder()}
let reminderInterval=null;
function checkReminder(){if(!data.settings.reminder||!("Notification"in window)||Notification.permission!=="granted")return;const now=new Date(),[h,m]=(data.settings.bedtime||"23:30").split(":").map(Number);let target=h*60+m-60;if(target<0)target+=1440;const cur=now.getHours()*60+now.getMinutes();if(cur===target&&data.settings.lastReminderDate!==todayKey()){try{new Notification("YORU｜夜の準備",{body:"そろそろ夜の準備を始めてみませんか？",icon:"./icons/icon-192.png"});data.settings.lastReminderDate=todayKey();persist()}catch{}}}
$("export-data").addEventListener("click",()=>{const rows=[["日付","ベッドに入った時刻","寝つくまでの時間(分)","寝る前スマホ(分)","起床時刻","目覚め","ひとこと","習慣","習慣完了"]];const keys=new Set([...Object.keys(data.records),...Object.keys(data.rituals)]);[...keys].sort().forEach(k=>{const r=data.records[k]||{},rit=data.rituals[k]||{};rows.push([k,r.bedtime??"",r.latency??"",r.phone??"",r.waketime??"",r.feeling?feelingText(r.feeling):"",r.note??"",rit.type?ROUTINES[rit.type]?.name:"",rit.done?"はい":"いいえ"])});const csv="\ufeff"+rows.map(row=>row.map(v=>`"${String(v??"").replace(/"/g,'""')}"`).join(",")).join("\r\n");const blob=new Blob([csv],{type:"text/csv;charset=utf-8"});const url=URL.createObjectURL(blob),a=document.createElement("a");a.href=url;a.download="YORU_記録.csv";a.click();URL.revokeObjectURL(url)});
$("delete-data").addEventListener("click",()=>{if(confirm("この端末に保存されたYORUの記録と設定をすべて削除しますか？この操作は取り消せません。")){localStorage.removeItem(KEY);localStorage.removeItem(EXTRA_KEY);localStorage.removeItem("yoru_before_daily_v2");extra={};data=blank();data.dailyRewards={};renderHome();renderJournal();renderConstellations();renderSettings();notify("記録を削除しました。")}});
if("serviceWorker"in navigator&&/^https?:$/.test(location.protocol))navigator.serviceWorker.register("./sw.js").catch(()=>{});

function weekStartKey(date=new Date()){const d=new Date(date);d.setHours(0,0,0,0);d.setDate(d.getDate()-(d.getDay()+6)%7);return todayKey(d)}
function weekStarCount(start){let n=0;for(let i=0;i<7;i++){const d=new Date(start+"T12:00:00");d.setDate(d.getDate()+i);if(extra.starDays?.[todayKey(d)])n++}return n}
function awardStar(){const k=todayKey();extra.starDays=extra.starDays||{};if(extra.starDays[k]){notify("今夜の星はすでに灯っています。");return}extra.starDays[k]=true;data.stars=(Number(data.stars)||0)+1;persist();saveExtra();const wk=weekStartKey();extra.constellations=extra.constellations||{};if(weekStarCount(wk)>=3&&!extra.constellations[wk])extra.constellations[wk]={completedAt:new Date().toISOString(),stars:weekStarCount(wk)};saveExtra();$("self-check").hidden=true;$("star-status").textContent="星がひとつ灯りました。今夜の自分を大切にできたね ✦";$("star-status").hidden=false;notify("星をひとつ獲得しました ✦");renderHome();renderConstellations()}
$("self-check-yes").addEventListener("click",()=>awardStar());
$("self-check-skip").addEventListener("click",()=>{$("self-check").hidden=true;notify("今回は星を付けずに終了しました。")});
function renderConstellations(){const all=extra.constellations||{},keys=Object.keys(all).sort().reverse(),wk=weekStartKey(),count=weekStarCount(wk);$("constellation-count").textContent=keys.length+"個";const current=$("constellation-current");if(all[wk])current.innerHTML='<span class="constellation-art">✦ · ✧</span><p>今週の星座が完成しました。おめでとう！</p>';else current.innerHTML='<span class="constellation-art">'+(count?"✦ ".repeat(count)+"· ".repeat(Math.max(0,3-count)):"✧ · ✦")+'</span><p>今週 '+count+'/3 個の星。あと '+Math.max(0,3-count)+' 個で星座が完成します。</p>';const gallery=$("constellation-gallery");gallery.innerHTML="";keys.forEach((key,i)=>{const card=document.createElement("div");card.className="constellation-card";const art=document.createElement("span");art.className="constellation-art";art.textContent=["✦ · ✧","☾ · ✦","✧ · ☼","✦ · ·"][i%4];const title=document.createElement("b");title.textContent="夜の星座";const small=document.createElement("small");small.textContent=key+" の週";card.append(art,title,small);gallery.appendChild(card)});if(!keys.length){const p=document.createElement("p");p.className="muted";p.textContent="完成した星座は、ここに保存されます。";gallery.appendChild(p)}}
function renderInsight(){const entries=Object.entries(data.records).filter(([k,r])=>r&&r.phone!==null&&r.phone!==undefined&&Number.isFinite(Number(r.phone))&&r.phone!=="").sort(([a],[b])=>a.localeCompare(b));const target=$("insight-text");if(entries.length<2){target.textContent="スマートフォンの使用時間を2日分以上記録すると、変化の傾向を確認できます。数値は診断ではなく、自分の夜を振り返るための目安です。";return}const recent=entries.slice(-7),avg=Math.round(recent.reduce((s,[,r])=>s+Number(r.phone),0)/recent.length),first=Number(entries[0][1].phone),last=Number(entries[entries.length-1][1].phone);target.textContent=`最近の記録 ${recent.length}日分では、寝る前のスマートフォン使用は平均約${avg}分です。最初の記録（${first}分）と直近（${last}分）を比べると${last<first?"短くなっています":last>first?"長くなっています":"大きな変化はありません"}。一日の違いも含めて、無理なく振り返ってみましょう。`}
function buildAIPrompt(){const entries=Object.entries(data.records).filter(([k,r])=>r&&Object.keys(r).some(f=>["bedtime","latency","phone","waketime","feeling"].includes(f))).sort(([a],[b])=>a.localeCompare(b)).slice(-14);if(!entries.length){notify("まずは睡眠記録を保存してください。");return ""}const lines=entries.map(([k,r])=>`${k}: ベッドに入った時刻=${r.bedtime||"未記録"}, 寝つくまで=${r.latency??"未記録"}分, 寝る前スマホ=${r.phone??"未記録"}分, 起床=${r.waketime||"未記録"}, 目覚め=${r.feeling?feelingText(Number(r.feeling)):"未記録"}`).join("\n");return `私は寝る前のスマートフォン使用を減らし、入眠前の習慣を整えたいです。以下は私が記録した最大14日分のデータです。診断はせず、データから見える傾向と、無理なく試せる小さな工夫を3つ提案してください。記録が少ない場合は断定せず、追加で記録するとよい項目も教えてください。\n\n${lines}`}
$("make-ai-prompt").addEventListener("click",()=>{const p=buildAIPrompt();$("ai-prompt").value=p;if(p)notify("相談文を作成しました。内容を確認してください。")});
$("copy-ai-prompt").addEventListener("click",async()=>{const p=$("ai-prompt").value;if(!p){notify("先に相談文を作成してください。");return}try{await navigator.clipboard.writeText(p);notify("相談文をコピーしました。")}catch{$("ai-prompt").focus();$("ai-prompt").select();notify("文章を選択しました。コピーしてください。")}});


// Daily rewards live in the original data object: one atomic storage write.
function commit(){try{localStorage.setItem(KEY,JSON.stringify(data));return true}catch{notify('保存できませんでした。空き容量を確認して再度お試しください。');return false}}
function dayTasks(k=todayKey()){return data.dailyRewards?.[k]?.tasks||{}}
function dayCount(k=todayKey()){return Object.keys(dayTasks(k)).filter(k=>ROUTINES[k]).length}
function migrateDaily(){if(data.dailyRewards)return;const backup={data,extra};try{if(!localStorage.getItem('yoru_before_daily_v2'))localStorage.setItem('yoru_before_daily_v2',JSON.stringify(backup))}catch{notify('移行前バックアップを保存できませんでした。');return}data.dailyRewards={};for(const [k,v] of Object.entries(extra.starDays||{})){if(v){const type=data.rituals[k]?.type;if(ROUTINES[type])data.dailyRewards[k]={tasks:{[type]:{legacy:true}}}}}commit()}
migrateDaily();
let timerDeadline=0,completionTask=null,completionDate=null;
const originalBegin=beginRitual;
beginRitual=function(key){originalBegin(key);completionTask=null;completionDate=null;};
function timerTick(){remaining=Math.max(0,Math.ceil((timerDeadline-Date.now())/1000));$('timer').textContent=fmt(remaining);if(!remaining)complete(true)}
toggleTimer=function(){if(running){remaining=Math.max(0,Math.ceil((timerDeadline-Date.now())/1000));stopInterval();$('timer-toggle').textContent='再開する';return}timerDeadline=Date.now()+remaining*1000;running=true;$('timer-toggle').textContent='一時停止';$('timer-note').textContent='心地よいペースで続けましょう';$('breath-orb').classList.add('running');interval=setInterval(timerTick,250)};
// Replace the listener's original function reference.
$('timer-toggle').removeEventListener('click',toggleTimerOriginal);
async function endSignal(){notify('タイマーが終了しました。できましたか？');try{navigator.vibrate?.([180,80,180])}catch{}try{const Audio=window.AudioContext||window.webkitAudioContext;if(Audio){const a=new Audio(),o=a.createOscillator(),g=a.createGain();o.connect(g);g.connect(a.destination);o.frequency.value=660;g.gain.value=.08;o.start();o.stop(a.currentTime+.4);o.onended=()=>a.close()}}catch{}if('Notification'in window&&Notification.permission==='granted'){try{const reg=await navigator.serviceWorker?.getRegistration();if(reg)await reg.showNotification('YORU｜習慣の時間が終わりました',{body:'できましたか？アプリで「はい」「いいえ」を選んでください。',icon:'./icons/icon-192.png',tag:'yoru-timer'});else new Notification('YORU｜習慣の時間が終わりました')}catch{}}}
complete=function(fromTimer){stopInterval();completionTask=chosen;completionDate=todayKey();if(fromTimer)endSignal();const already=!!dayTasks(completionDate)[chosen];$('completed-name').textContent=ROUTINES[chosen].name;$('complete-title').textContent='習慣を終えました。';$('complete-message').textContent='できたかどうか、教えてください。';$('self-check').hidden=false;$('self-check-yes').disabled=already;$('star-status').textContent=already?'この習慣の星は今日は獲得済みです。':'';go('complete')};
const POOLS=[{rarity:'ノーマル',weight:70,names:['ひと息の星座','やすらぎの星座','月明かりの星座']},{rarity:'レア',weight:25,names:['流れ星の星座','夜風の星座','銀の月の星座']},{rarity:'スーパーレア',weight:5,names:['天の川の星座','オーロラの星座','夢の翼の星座']}];
function streakAt(k){let n=0,d=new Date(k+'T12:00:00');while(data.dailyRewards?.[todayKey(d)]?.constellation){n++;d.setDate(d.getDate()-1)}return n}
function makeConstellation(k){const prev=new Date(k+'T12:00:00');prev.setDate(prev.getDate()-1);const streak=streakAt(todayKey(prev))+1;if(streak===4)return {name:'3日坊主回避の星座',rarity:'特別',streak,date:k};const r=Math.random()*100;let sum=0,p=POOLS[0];for(const pool of POOLS){sum+=pool.weight;if(r<sum){p=pool;break}}return {name:p.names[Math.floor(Math.random()*p.names.length)],rarity:p.rarity,streak,date:k}}
awardStar=function(){if(!completionTask||completionDate!==todayKey()){notify('日付が変わりました。習慣を選び直してください。');return}if(dayTasks()[completionTask]){notify('この習慣の星は今日は獲得済みです。');return}const before=JSON.stringify(data),k=todayKey();data.dailyRewards??={};const day=data.dailyRewards[k]??={tasks:{}};day.tasks[completionTask]={completedAt:new Date().toISOString()};data.stars=(Number(data.stars)||0)+1;data.rituals[k]={...data.rituals[k],done:true,type:completionTask,completedAt:new Date().toISOString()};const zodiacMessage=addZodiacStar(k);if(!commit()){data=JSON.parse(before);return}$('self-check-yes').disabled=true;$('star-status').textContent='星を1つ獲得しました。今日 '+dayCount()+'/3星'+(zodiacMessage?' ／ '+zodiacMessage:'');renderHome();renderConstellations()};
renderHome=function(){$('today-date').textContent=todayKey();$('star-count').textContent=data.stars;$('home-routine-title').textContent='今日の星 '+dayCount()+' / 3';$('home-routine-desc').textContent='各習慣で「はい」を選ぶと1星。選んだ十二星座を育てよう。';$('home-symbol').textContent='✦';document.querySelectorAll('[data-ritual]').forEach(el=>{el.setAttribute('aria-label',ROUTINES[el.dataset.ritual].name+(dayTasks()[el.dataset.ritual]?'：本日の星は獲得済み':''));el.classList.toggle('earned',!!dayTasks()[el.dataset.ritual])})};
renderConstellations=function(){const entries=Object.entries(data.dailyRewards||{}).filter(([,d])=>d.constellation).map(([k,d])=>({...d.constellation,date:k}));const legacy=Object.keys(extra.constellations||{}).map(k=>({name:'夜の星座（旧版）',rarity:'保存済み',date:k+' の週'}));const all=[...entries,...legacy].sort((a,b)=>b.date.localeCompare(a.date));$('constellation-count').textContent=all.length+'個';$('constellation-current').textContent=data.dailyRewards?.[todayKey()]?.constellation?.name||('今日 '+dayCount()+'/3星。あと '+(3-dayCount())+'星で星座が完成します。');const gallery=$('constellation-gallery');gallery.replaceChildren();for(const c of all){const card=document.createElement('div');card.className='constellation-card';for(const [tag,text] of [['span','✦ ─ ✧ ─ ✦'],['b',c.name],['small',c.rarity+' ／ '+c.date]]){const el=document.createElement(tag);el.textContent=text;card.append(el)}gallery.append(card)}};
function loadRecord(){const k=$('record-date').value,r=data.records[k]||{};for(const id of ['bedtime','latency','phone','waketime','note'])$(id).value=r[id]??'';$('feeling').value=r.feeling||3;$('feeling-label').textContent=feelingText(Number($('feeling').value));$('record-status').textContent=r.updatedAt?'保存済みの記録を編集中です。':'';renderCharts()}
$('record-date').max=todayKey();$('record-date').value=todayKey();$('record-date').addEventListener('change',loadRecord);
$('sleep-form').addEventListener('submit',e=>{e.preventDefault();const k=$('record-date').value;if(!/^\d{4}-\d{2}-\d{2}$/.test(k)||k>todayKey()){notify('今日以前の日付を選んでください。');return}const before=data.records[k];data.records[k]={...before,bedtime:$('bedtime').value,latency:val('latency'),phone:val('phone'),waketime:$('waketime').value,feeling:Number($('feeling').value),note:$('note').value.trim(),updatedAt:new Date().toISOString()};if(!commit()){if(before)data.records[k]=before;else delete data.records[k];return}renderCharts();renderInsight();$('record-status').textContent=k+' の記録を保存しました。'});
document.addEventListener('visibilitychange',()=>{if(!document.hidden){if(running)timerTick();$('record-date').max=todayKey();renderHome()}});
window.addEventListener('storage',e=>{if(e.key===KEY){data=load();renderHome();renderConstellations()}});


// 黄道十二星座コレクション。旧星座と既存の星数はそのまま保存する。
const ZODIAC=[
 {id:'aries',name:'おひつじ座',symbol:'♈',need:12},
 {id:'taurus',name:'おうし座',symbol:'♉',need:15},
 {id:'gemini',name:'ふたご座',symbol:'♊',need:16},
 {id:'cancer',name:'かに座',symbol:'♋',need:14},
 {id:'leo',name:'しし座',symbol:'♌',need:20},
 {id:'virgo',name:'おとめ座',symbol:'♍',need:18},
 {id:'libra',name:'てんびん座',symbol:'♎',need:13},
 {id:'scorpio',name:'さそり座',symbol:'♏',need:19},
 {id:'sagittarius',name:'いて座',symbol:'♐',need:17},
 {id:'capricorn',name:'やぎ座',symbol:'♑',need:16},
 {id:'aquarius',name:'みずがめ座',symbol:'♒',need:18},
 {id:'pisces',name:'うお座',symbol:'♓',need:15}
];
function zodiacState(){data.zodiac??={active:null,progress:{},completed:{}};data.zodiac.progress??={};data.zodiac.completed??={};return data.zodiac}
function zodiacInfo(id){return ZODIAC.find(z=>z.id===id)}
function addZodiacStar(k){const z=zodiacState(),item=zodiacInfo(z.active);if(!item)return '星を獲得しました（星座は未選択）';if(z.completed[item.id])return '星座は完成済みです';const count=Math.min(item.need,(z.progress[item.id]||0)+1);z.progress[item.id]=count;if(count===item.need){z.completed[item.id]={date:k,completedAt:new Date().toISOString()};z.active=null;return item.name+'が完成！'}return item.name+' '+count+'/'+item.need+'星'}
function selectZodiac(id){const item=zodiacInfo(id),z=zodiacState();if(!item||z.completed[id])return;if(z.active&&z.active!==id&&!confirm('育成する星座を変更しますか？ 今まで灯した星はそのまま残ります。'))return;const prev=z.active;z.active=id;if(!commit()){z.active=prev;return}renderConstellations();notify(item.name+'を育て始めます ✦')}
// 黄道十二星座の代表的な星の結び方をもとにした模式図。
// 座標は表示用に正規化した図案で、厳密な天球座標・恒星数ではありません。
// 各線分の途中に補助星を加え、ゲーム上の必要星数と一致させています。
const ZODIAC_SHAPES={
 aries:{p:[[42,118],[88,96],[143,87],[190,67]],e:[[0,1],[1,2],[2,3]]},
 taurus:{p:[[35,37],[97,85],[147,113],[191,86],[254,37],[177,151],[127,173],[91,193],[228,164]],e:[[0,1],[1,2],[2,3],[3,4],[2,5],[5,6],[6,7],[5,8]]},
 gemini:{p:[[95,34],[184,41],[104,82],[188,86],[113,128],[191,135],[75,183],[137,184],[169,183],[230,187]],e:[[0,1],[0,2],[1,3],[2,3],[2,4],[3,5],[4,5],[4,6],[4,7],[5,8],[5,9]]},
 cancer:{p:[[62,58],[118,91],[161,115],[215,81],[252,54],[147,165],[104,188],[205,181]],e:[[0,1],[1,2],[2,3],[3,4],[2,5],[5,6],[5,7]]},
 leo:{p:[[65,63],[106,35],[151,45],[178,81],[149,111],[107,104],[76,127],[120,162],[196,158],[245,129],[262,166]],e:[[0,1],[1,2],[2,3],[3,4],[4,5],[5,0],[5,6],[6,7],[7,8],[8,9],[9,10],[4,8]]},
 virgo:{p:[[48,64],[100,82],[145,65],[183,97],[245,90],[202,143],[158,163],[108,146],[71,181],[243,183]],e:[[0,1],[1,2],[2,3],[3,4],[3,5],[5,6],[6,7],[7,8],[5,9],[1,7]]},
 libra:{p:[[85,53],[203,55],[240,124],[174,165],[87,154],[53,111]],e:[[0,1],[1,2],[2,3],[3,4],[4,5],[5,0],[0,4],[1,3]]},
 scorpio:{p:[[59,43],[97,61],[128,93],[151,127],[172,156],[198,174],[230,170],[254,146],[265,112],[243,96]],e:[[0,1],[1,2],[2,3],[3,4],[4,5],[5,6],[6,7],[7,8],[8,9]]},
 sagittarius:{p:[[69,52],[130,51],[174,82],[220,60],[245,109],[187,120],[151,156],[104,134],[67,173],[210,176]],e:[[0,1],[1,2],[2,3],[3,4],[4,5],[5,6],[6,7],[7,8],[1,7],[2,5],[5,9]]},
 capricorn:{p:[[47,74],[94,48],[163,77],[241,68],[263,113],[209,165],[153,185],[99,159]],e:[[0,1],[1,2],[2,3],[3,4],[4,5],[5,6],[6,7],[7,0],[2,6]]},
 aquarius:{p:[[42,71],[84,45],[121,74],[163,50],[204,76],[251,58],[188,115],[146,144],[111,171],[72,154],[224,180]],e:[[0,1],[1,2],[2,3],[3,4],[4,5],[4,6],[6,7],[7,8],[8,9],[6,10]]},
 pisces:{p:[[51,66],[79,39],[118,47],[138,80],[108,111],[73,111],[166,127],[195,101],[229,105],[252,138],[230,171],[195,178],[172,156]],e:[[0,1],[1,2],[2,3],[3,4],[4,5],[5,0],[3,6],[6,7],[7,8],[8,9],[9,10],[10,11],[11,12],[12,7]]}
};
function zodiacGeometry(item){
 const shape=ZODIAC_SHAPES[item.id],points=shape.p.map(p=>[...p]),edges=shape.e.map(e=>[...e]);
 // 線分を分割して進捗用の星を補い、輪郭を崩さない。
 while(points.length<item.need){
  let chosen=0,longest=-1;
  edges.forEach(([a,b],i)=>{const d=(points[a][0]-points[b][0])**2+(points[a][1]-points[b][1])**2;if(d>longest){longest=d;chosen=i}});
  const [a,b]=edges.splice(chosen,1),mid=points.length;
  points.push([(points[a][0]+points[b][0])/2,(points[a][1]+points[b][1])/2]);
  edges.push([a,mid],[mid,b]);
 }
 return {points,edges};
}
function zodiacSky(item,count){
 const ns='http://www.w3.org/2000/svg',svg=document.createElementNS(ns,'svg');
 svg.setAttribute('viewBox','0 0 320 208');svg.setAttribute('class','zodiac-sky');svg.setAttribute('role','img');
 svg.setAttribute('aria-label',item.name+'の星の並び '+count+' / '+item.need+'星（模式図）');
 const {points,edges}=zodiacGeometry(item);
 // 星が順番に灯るように、星の接続関係をたどって順序を決定する。
 const order=[],seen=new Set(),queue=[0];
 while(queue.length){const i=queue.shift();if(seen.has(i))continue;seen.add(i);order.push(i);for(const [a,b] of edges){if(a===i&&!seen.has(b))queue.push(b);if(b===i&&!seen.has(a))queue.push(a)}}
 for(let i=0;i<points.length;i++)if(!seen.has(i))order.push(i);
 const lit=new Set(order.slice(0,count));
 for(const [a,b] of edges){const line=document.createElementNS(ns,'line');line.setAttribute('x1',points[a][0]);line.setAttribute('y1',points[a][1]);line.setAttribute('x2',points[b][0]);line.setAttribute('y2',points[b][1]);line.setAttribute('class',lit.has(a)&&lit.has(b)?'zodiac-line lit':'zodiac-line');svg.appendChild(line)}
 points.forEach(([x,y],i)=>{const c=document.createElementNS(ns,'circle');c.setAttribute('cx',x);c.setAttribute('cy',y);c.setAttribute('r',lit.has(i)?'4.6':'3.1');c.setAttribute('class',lit.has(i)?'zodiac-dot lit':'zodiac-dot');svg.appendChild(c)});
 return svg;
}
renderConstellations=function(){window.YORU_ZODIAC_READY=true;const z=zodiacState(),finished=ZODIAC.filter(item=>z.completed[item.id]).length;$('constellation-count').textContent=finished+' / 12 完成';const current=$('constellation-current');current.replaceChildren();const item=zodiacInfo(z.active);if(item){const count=Math.min(item.need,z.progress[item.id]||0);const title=document.createElement('h2');title.textContent=item.symbol+' '+item.name;const sky=zodiacSky(item,count);const info=document.createElement('p');info.textContent=count+' / '+item.need+' 星が灯りました。あと '+(item.need-count)+' 星で完成！';const track=document.createElement('div');track.className='zodiac-progress';const bar=document.createElement('span');bar.style.width=(100*count/item.need)+'%';track.append(bar);current.append(title,sky,info,track)}else{const p=document.createElement('p');p.textContent=finished===12?'十二星座をすべて完成させました！':'下の十二星座から、最初に育てたい星座を選んでください。';current.append(p)}const gallery=$('constellation-gallery');gallery.replaceChildren();document.querySelectorAll('.zodiac-legacy').forEach(el=>el.remove());ZODIAC.forEach(item=>{const count=Math.min(item.need,z.progress[item.id]||0),complete=!!z.completed[item.id],active=z.active===item.id;const card=document.createElement('button');card.type='button';card.className='constellation-card zodiac-card'+(active?' active':'')+(complete?' finished':'');card.disabled=complete;const mark=document.createElement('span');mark.className='zodiac-symbol';mark.textContent=item.symbol;const name=document.createElement('b');name.textContent=item.name;const info=document.createElement('small');info.textContent=complete?'完成済み ✓':count+' / '+item.need+' 星';const hint=document.createElement('small');hint.textContent=complete?'コレクション済み':active?'育成中':count?'選択して再開':'選んで育てる';card.append(mark,name,info,hint);if(!complete)card.addEventListener('click',()=>selectZodiac(item.id));gallery.append(card)});const old=Object.keys(extra.constellations||{}).length+Object.values(data.dailyRewards||{}).filter(d=>d.constellation).length;if(old){const note=document.createElement('p');note.className='muted zodiac-legacy';note.textContent='旧バージョンで完成した星座 '+old+' 個のデータも端末内に保存されています。';gallery.after(note)}};
$("timer-toggle").addEventListener("click",toggleTimer);
renderHome();renderSettings();renderJournal();renderConstellations();renderInsight();if(data.settings.reminder)startReminderCheck();

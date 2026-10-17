// GIARDINO ZEN dentro i giochi di Natan: suoni e musica, grafica comune, Sudoku e Mahjong (pagina a parte zen.html).
// Le carte, la dama e il biliardo stanno in giochi-carte.js e giochi-dama.js e usano questi suoni.
(function(){
"use strict";
const {E,LSG,register}=window.__G;
const rnd=n=>Math.floor(Math.random()*n);

// ------------------------------------------------------------------ suoni (sintetizzati, nessun file)
const A={ctx:null,out:null,echo:null,nb:null,sfx:LSG.get("natan_zen_sfx",true),
  init(){
    if(this.ctx){if(this.ctx.state==="suspended")try{this.ctx.resume()}catch(e){}return this.ctx}
    const C=window.AudioContext||window.webkitAudioContext;if(!C)return null;
    let ctx;try{ctx=this.ctx=new C()}catch(e){return null}
    this.out=ctx.createGain();this.out.gain.value=.9;this.out.connect(ctx.destination);
    const d=ctx.createDelay(1);d.delayTime.value=.34;const fb=ctx.createGain();fb.gain.value=.38;const lp=ctx.createBiquadFilter();lp.type="lowpass";lp.frequency.value=2200;
    d.connect(lp);lp.connect(fb);fb.connect(d);lp.connect(this.out);this.echo=d;
    const b=ctx.createBuffer(1,ctx.sampleRate,ctx.sampleRate);const ch=b.getChannelData(0);for(let i=0;i<ch.length;i++)ch[i]=Math.random()*2-1;this.nb=b;
    return ctx},
  env(g,t,dur,peak,att,sus){g.gain.setValueAtTime(.0001,t);g.gain.exponentialRampToValueAtTime(peak,t+att);if(sus)g.gain.setValueAtTime(peak,t+dur*sus);g.gain.exponentialRampToValueAtTime(.0001,t+dur)},
  tone(f,t,dur,o={}){
    const ctx=this.ctx,osc=ctx.createOscillator(),g=ctx.createGain();
    osc.type=o.type||"sine";osc.frequency.setValueAtTime(f,t);if(o.to)osc.frequency.exponentialRampToValueAtTime(o.to,t+dur);
    this.env(g,t,dur,o.gain==null?.08:o.gain,o.att==null?.005:o.att,o.sus);
    let n=osc;if(o.lp){const fl=ctx.createBiquadFilter();fl.type="lowpass";fl.frequency.value=o.lp;osc.connect(fl);n=fl}
    n.connect(g);g.connect(this.out);
    if(o.echo){const s=ctx.createGain();s.gain.value=o.echo;g.connect(s);s.connect(this.echo)}
    if(o.vib){const l=ctx.createOscillator(),lg=ctx.createGain();l.frequency.value=5;lg.gain.value=o.vib;l.connect(lg);lg.connect(osc.frequency);l.start(t);l.stop(t+dur+.05)}
    osc.start(t);osc.stop(t+dur+.05)},
  noise(t,dur,o={}){
    const ctx=this.ctx,src=ctx.createBufferSource(),f=ctx.createBiquadFilter(),g=ctx.createGain();
    src.buffer=this.nb;f.type=o.type||"bandpass";f.frequency.setValueAtTime(o.f||2000,t);if(o.to)f.frequency.exponentialRampToValueAtTime(o.to,t+dur);f.Q.value=o.q==null?1:o.q;
    this.env(g,t,dur,o.gain==null?.04:o.gain,o.att==null?.004:o.att,o.sus);
    src.connect(f);f.connect(g);g.connect(this.out);src.start(t,Math.random()*.5);src.stop(t+dur+.02)},
  bell(f,t,gain=.05,echo=.5){this.tone(f,t,2.2,{gain,att:.004,echo});this.tone(f*2.76,t,1,{gain:gain*.35,echo});this.tone(f*5.4,t,.4,{gain:gain*.12})}
};
const SFX={
  card:t=>A.noise(t,.14,{f:3000,to:1200,q:.6,gain:.07}),
  take:t=>{SFX.card(t);A.tone(880,t+.06,.25,{type:"triangle",gain:.05});A.tone(1320,t+.12,.25,{type:"triangle",gain:.035})},
  scopa:t=>[784,988,1175,1568].forEach((f,i)=>A.bell(f,t+i*.11,.05,.4)),
  deal:t=>{for(let i=0;i<5;i++)A.noise(t+i*.09,.1,{f:2800,to:1400,q:.6,gain:.05})},
  win:t=>[523,659,784,1047,1319].forEach((f,i)=>A.bell(f,t+i*.16,.055,.5)),
  lose:t=>[659,587,523,440].forEach((f,i)=>A.tone(f,t+i*.22,.6,{gain:.035,att:.05,echo:.3})),
  piece:t=>{A.tone(330,t,.09,{type:"triangle",gain:.08,to:210});A.noise(t,.03,{f:1600,q:2.5,gain:.03})},
  lift:t=>A.tone(520,t,.05,{type:"triangle",gain:.035,to:420}),
  dcap:t=>{SFX.piece(t);SFX.piece(t+.12);A.tone(880,t+.22,.3,{type:"triangle",gain:.03})},
  king:t=>{A.bell(784,t,.045,.4);A.bell(1175,t+.12,.04,.4)},
  blocked:t=>A.tone(150,t,.14,{gain:.06,to:110,att:.008}),
  hint:t=>{A.tone(1318,t,.35,{type:"triangle",gain:.014,echo:.3});A.tone(1760,t+.08,.4,{type:"triangle",gain:.011,echo:.3})},
  cue:(t,p=.5)=>{A.noise(t,.03,{f:2400,q:1.5,gain:.04+.1*p});A.tone(320,t,.07,{type:"triangle",gain:.04+.06*p,to:180})},
  rack:t=>{for(let i=0;i<7;i++)A.tone(2100+Math.random()*700,t+i*.045,.04,{type:"triangle",gain:.05,to:1700})},
  uno:t=>{A.bell(659,t,.05,.3);A.bell(880,t+.12,.05,.3)},
  pesca:t=>{SFX.card(t);A.noise(t+.07,.1,{f:2400,to:1300,q:.6,gain:.04})},
  stop:t=>{A.tone(300,t,.2,{type:"square",gain:.025,to:150})},
  pop:t=>A.tone(700,t,.08,{type:"triangle",gain:.04,to:1000})
};
function sfx(name,arg){if(!A.sfx)return;const ctx=A.init();if(!ctx)return;try{SFX[name](ctx.currentTime+.01,arg)}catch(e){}}
let sndT=0;
function blSnd(k,v){                                  // suoni del biliardo (urti, sponde, buche)
  const now=performance.now();if(k!=="pocket"&&now-sndT<35)return;sndT=now;if(!A.sfx)return;const ctx=A.init();if(!ctx)return;
  const t=ctx.currentTime+.005,g=Math.min(1,v/1500);
  if(k==="hit"){if(g<.02)return;A.tone(2600,t,.05,{type:"triangle",gain:.02+.12*g,to:1900});A.noise(t,.02,{f:4500,q:2,gain:.02+.06*g})}
  if(k==="rail"){if(g<.03)return;A.tone(110,t,.1,{gain:.03+.08*g,to:80})}
  if(k==="pocket"){A.tone(200,t,.18,{gain:.08,to:90});A.noise(t+.05,.35,{type:"lowpass",f:500,q:.5,gain:.05})}}

// ------------------------------------------------------------------ musica del menu (campane, koto, flauto)
const STYLES=[{id:"campane",name:"Campane"},{id:"koto",name:"Koto"},{id:"flauto",name:"Flauto"},{id:"off",name:"spenta"}];
const Music={idx:Math.max(0,Math.min(STYLES.length-1,+LSG.get("natan_zen_music",0)||0)),timer:null,next:0,
  get style(){return STYLES[this.idx].id},
  start(){return;if(this.style==="off"||document.hidden||this.timer||!document.querySelector(".gm.zmenu"))return;const ctx=A.init();if(!ctx)return;
    this.next=ctx.currentTime+.15;this.timer=setInterval(()=>this.tick(),250);this.tick()},
  stop(){clearInterval(this.timer);this.timer=null},
  tick(){if(!document.querySelector(".gm.zmenu")){this.stop();return}const ctx=A.ctx;if(!ctx)return;while(this.next<ctx.currentTime+1.2)this.next+=this[this.style](this.next)},
  campane(t){const sc=[262,294,330,392,440,523,587];const f=sc[rnd(sc.length)];A.bell(f,t,.032,.6);if(Math.random()<.35)A.bell(f*1.5,t+.7,.018,.6);return 1.8+Math.random()*1.4},
  koto(t){const sc=[293.7,311.1,392,440,466.2,587.3,622.3,784];let i=rnd(5),tt=t;const n=3+rnd(3);
    for(let k=0;k<n;k++){i=Math.max(0,Math.min(sc.length-1,i+(rnd(3)-1||1)));const f=sc[i];A.tone(f,tt,1.2,{type:"triangle",gain:.04,att:.003,echo:.25});A.tone(f*2,tt,.3,{gain:.012});A.noise(tt,.02,{f:f*4,q:2,gain:.008});tt+=.28+Math.random()*.25}
    return (tt-t)+1.4+Math.random()},
  flauto(t){const sc=[392,440,523,587,659,784];const f=sc[rnd(sc.length)];const d=2+Math.random()*1.5;A.tone(f,t,d,{gain:.028,att:.5,sus:.65,vib:4,echo:.25});A.noise(t,d*.8,{f:f*2,q:3,gain:.005,att:.4,sus:.6});return d+.4+Math.random()},
  cycle(){this.idx=(this.idx+1)%STYLES.length;LSG.set("natan_zen_music",this.idx);this.stop();this.start()}
};
document.addEventListener("visibilitychange",()=>{if(document.hidden)Music.stop();else Music.start()});

// ------------------------------------------------------------------ grafica comune dei giochi del Giardino
function css(){if(document.getElementById("gmcssz"))return;const s=E("style");s.id="gmcssz";s.textContent=`
.gm .zhero{display:flex;flex-wrap:wrap;align-items:flex-end;justify-content:space-between;gap:12px;padding:6px 0 14px;border-bottom:1px solid var(--line)}
.gm .zhero h1{font-size:clamp(32px,8vw,50px);font-weight:800;letter-spacing:.02em;line-height:1;margin:0}
.gm .zhero h1 span{color:#d1604d;font-size:.5em;vertical-align:.55em;margin-left:.3em}
.gm .zhero p{margin:6px 0 0;color:var(--muted)}
.gm .zctl{display:flex;gap:8px;flex-wrap:wrap}
.gm .zctl button{border:1px solid var(--line);background:var(--raise);color:var(--text);border-radius:999px;padding:7px 14px;font:inherit;font-size:14px;cursor:pointer}
.gm .zctl button:hover{border-color:var(--acc)}
.gm .cards.zcards{grid-template-columns:repeat(auto-fill,minmax(210px,1fr));gap:14px}
.gm .gcard.zstone{padding:0;overflow:hidden;align-items:stretch;gap:0;text-align:left;border-radius:18px}
.gm .zstone .pic{display:block;width:100%;height:118px}
.gm .zstone .txt{padding:11px 15px 14px;display:flex;flex-direction:column;gap:3px}
.gm .zstone .txt strong{font-size:20px}
.gm .pic-sd{background:#e3dccd}.gm .pic-sc{background:radial-gradient(circle at 50% 40%,#2e5a44,#1f4231)}.gm .pic-mj{background:radial-gradient(circle at 50% 50%,#e6d1a6,#cfae6e)}
.gm .pic-dm{background:#e6dfcf}.gm .pic-bl{background:#4a3324}.gm .pic-un{background:radial-gradient(circle at 50% 40%,#2b2f6e,#14153a)}
.zfloat{position:fixed;inset:0;z-index:60;background:#0e0f13;display:flex;flex-direction:column}
.zfloat iframe{flex:1;border:0;width:100%;background:#e8ebe2}
.zfloat .zbar{display:flex;align-items:center;gap:10px;padding:8px 12px;background:#15161c;color:#ececf1}
.zfloat .zbar button{border:1px solid #2c2f3b;background:#1f2129;color:#ececf1;border-radius:999px;padding:6px 14px;font:inherit;cursor:pointer}
.gm .zchoose[hidden],.gm .zsum[hidden]{display:none}
/* tavolo da Scopa d'Assi */
.gm .zfelt{background:radial-gradient(ellipse at 50% 35%,#2e5a44,#1f4231 75%);color:#eef3ea;border-radius:20px;padding:14px;display:flex;flex-direction:column;gap:12px;--cw:clamp(50px,15vw,74px);box-shadow:0 8px 26px rgba(0,0,0,.35)}
.gm .zrow{display:flex;align-items:center;justify-content:space-between;gap:10px;flex-wrap:wrap}
.gm .zwho{font-size:14px;color:#b9cdbf}.gm .zwho b{color:#eef3ea}
.gm .zscore{display:flex;justify-content:center;align-items:baseline;gap:14px;font-family:"Shippori Mincho",Georgia,serif;font-size:28px;font-variant-numeric:tabular-nums}
.gm .zscore small{font-family:inherit;font-size:12px;color:#b9cdbf;letter-spacing:.06em;text-transform:uppercase;font-family:system-ui,sans-serif}
.gm .zhand{display:flex;justify-content:center;gap:8px;min-height:calc(var(--cw)*1.6)}
.gm .ztable{min-height:calc(var(--cw)*1.6 + 24px);border:1px dashed rgba(238,243,234,.3);border-radius:18px;padding:12px;display:flex;flex-wrap:wrap;gap:8px;justify-content:center;align-content:center}
.gm .zcard{width:var(--cw);aspect-ratio:5/8;border-radius:8px;background:#fbf6e9;color:#2a2620;border:1px solid #d6cbb0;box-shadow:0 2px 6px rgba(0,0,0,.3);position:relative;display:grid;place-items:center;padding:0;flex:none;animation:zcin .28s ease-out;font:inherit}
.gm .zcard .cv{position:absolute;top:4px;left:6px;font-family:"Shippori Mincho",Georgia,serif;font-weight:800;font-size:calc(var(--cw)*.24);line-height:1}
.gm .zcard .cv.b{top:auto;left:auto;bottom:4px;right:6px;transform:rotate(180deg)}
.gm .zcard svg{width:58%;height:auto}
.gm .zcard .fig{position:absolute;bottom:5px;left:0;right:0;text-align:center;font-size:calc(var(--cw)*.13);letter-spacing:.04em;text-transform:uppercase;color:#6d6252}
.gm button.zcard{cursor:pointer;transition:transform .15s}
.gm button.zcard:hover:not([disabled]){transform:translateY(-6px)}
.gm button.zcard[disabled]{cursor:default}
.gm .zcard.back{background:repeating-linear-gradient(45deg,#8e2b20 0 5px,#a33a2c 5px 10px);border:3px solid #fbf6e9;width:calc(var(--cw)*.6)}
.gm .zcard.hot{outline:3px solid #d6a94a;outline-offset:1px}
.gm .zcard.last{box-shadow:0 0 0 3px rgba(214,169,74,.7),0 2px 6px rgba(0,0,0,.3)}
@keyframes zcin{from{transform:translateY(8px);opacity:.2}to{transform:none;opacity:1}}
.gm .zstat{text-align:center;min-height:1.5em;font-size:14.5px}
.gm .zchoose{background:var(--raise);color:var(--text);border-radius:14px;padding:12px;display:flex;flex-direction:column;gap:8px;align-items:center}
.gm .zchoose .opts{display:flex;flex-wrap:wrap;gap:8px;justify-content:center}
.gm .zchoose .opt{display:flex;gap:4px;padding:6px;border:1px solid var(--line);border-radius:10px;background:transparent;cursor:pointer;--cw:44px}
.gm .zsum{background:var(--raise);color:var(--text);border-radius:16px;padding:14px;display:flex;flex-direction:column;gap:8px}
.gm .zsum h3{margin:0;font-size:20px}
.gm .zsum table{border-collapse:collapse;width:100%;font-variant-numeric:tabular-nums}
.gm .zsum td,.gm .zsum th{padding:5px 6px;border-bottom:1px solid var(--line);text-align:right}
.gm .zsum td:first-child,.gm .zsum th:first-child{text-align:left}
.gm .zsum small{color:var(--muted)}
/* dama */
.gm .zsand{background:#e6dfcf;border-radius:20px;padding:14px;display:flex;flex-direction:column;gap:10px;color:#22261f}
.gm .zdb{display:grid;grid-template-columns:repeat(8,1fr);width:min(100%,480px);aspect-ratio:1;margin:0 auto;border:10px solid #5a3e26;border-radius:6px;box-shadow:0 8px 24px rgba(0,0,0,.35);box-sizing:border-box}
.gm .zsq{border:0;padding:0;position:relative;display:grid;place-items:center;border-radius:0;min-width:0;cursor:pointer}
.gm .zsq.l{background:#efe4cc;cursor:default}.gm .zsq.d{background:#8a6a45}
.gm .zsq.lastm::after{content:"";position:absolute;inset:0;background:rgba(184,137,44,.3);pointer-events:none}
.gm .zsq.tgt::before{content:"";position:absolute;width:30%;height:30%;border-radius:50%;background:rgba(207,230,181,.85);z-index:2;pointer-events:none}
.gm .zsq.path,.gm .zsq.hint{box-shadow:inset 0 0 0 3px #b8892c}
.gm .zpc{width:78%;height:78%;border-radius:50%;position:relative;z-index:1;display:grid;place-items:center;font-family:"Shippori Mincho",Georgia,serif;font-weight:800;font-size:clamp(12px,3.6vw,21px);transition:transform .15s}
.gm .zpc.w{background:radial-gradient(circle at 35% 30%,#fffdf6,#e6dcc6 60%,#c9bb9c);box-shadow:0 2px 0 #a8987a,0 3px 6px rgba(0,0,0,.35);color:#9a2a1e}
.gm .zpc.b{background:radial-gradient(circle at 35% 30%,#5b5550,#2a2724 60%,#151311);box-shadow:0 2px 0 #0b0a09,0 3px 6px rgba(0,0,0,.45);color:#e2b85a}
.gm .zpc::after{content:"";position:absolute;inset:16%;border-radius:50%;border:1.5px solid rgba(0,0,0,.16)}
.gm .zpc.b::after{border-color:rgba(255,255,255,.12)}
.gm .zsq.can .zpc{box-shadow:0 0 0 3px rgba(207,230,181,.8),0 3px 6px rgba(0,0,0,.35)}
.gm .zsq.sel .zpc{transform:translateY(-3px) scale(1.06);box-shadow:0 0 0 3px #b8892c,0 6px 10px rgba(0,0,0,.4)}
/* biliardo */
.gm .zhall{background:repeating-linear-gradient(90deg,#4a3324 0 76px,#3a2719 76px 79px);color:#f3e9d8;border-radius:20px;padding:12px;display:flex;flex-direction:column;gap:10px}
.gm .zbp{display:grid;grid-template-columns:1fr 1fr;gap:8px}
.gm .zbp>div{border:1px solid rgba(243,233,216,.25);border-radius:12px;padding:6px 10px;background:rgba(58,39,25,.7);display:flex;flex-direction:column;gap:4px;min-width:0}
.gm .zbp>div.on{border-color:#d6a94a;box-shadow:0 0 0 2px rgba(214,169,74,.6)}
.gm .zbp b{font-size:14px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.gm .zbp small{color:#cdb99c;font-size:12px}
.gm .zdots{display:flex;flex-wrap:wrap;gap:3px;min-height:14px}
.gm .zdot{width:14px;height:14px;border-radius:50%;font-size:8px;display:grid;place-items:center;font-weight:700;color:#111}
.gm .zhall canvas{display:block;margin:0 auto;touch-action:none;cursor:crosshair}
.gm .zhall .zpow{height:6px;border-radius:3px;background:rgba(243,233,216,.15);overflow:hidden;max-width:320px;width:100%;margin:0 auto}
.gm .zhall .zpow i{display:block;height:100%;width:0;background:linear-gradient(90deg,#e9b81f,#c62a20)}
.gm .zhall .zhelp{text-align:center;font-size:12.5px;color:#cdb99c;margin:0}
.gm .zhall .zmsg{text-align:center;min-height:3.2em;font-size:14px}
`;document.head.append(s)}
css();

// ------------------------------------------------------------------ simboli delle carte italiane (usati da Scopa d'Assi)
function simboli(){if(document.getElementById("zuSym"))return;const d=E("div");d.id="zuSym";d.style.cssText="position:absolute;width:0;height:0;overflow:hidden";
  d.innerHTML=`<svg width="0" height="0" aria-hidden="true"><defs>
<symbol id="su-d" viewBox="0 0 40 40"><circle cx="20" cy="20" r="16" fill="#d4a23a" stroke="#7a5a17" stroke-width="2"/><circle cx="20" cy="20" r="10" fill="none" stroke="#7a5a17" stroke-width="1.6"/><circle cx="20" cy="20" r="4" fill="#b0392a"/><g stroke="#7a5a17" stroke-width="1.2"><path d="M20 4v4M20 32v4M4 20h4M32 20h4"/></g></symbol>
<symbol id="su-c" viewBox="0 0 40 40"><path d="M7 6h26c0 11-5 17-13 17S7 17 7 6z" fill="#c0392b" stroke="#6e1d14" stroke-width="1.6"/><path d="M10 9h20" stroke="#e7b84f" stroke-width="2"/><rect x="18" y="22" width="4" height="9" fill="#d4a23a"/><ellipse cx="20" cy="33" rx="10" ry="3.5" fill="#d4a23a" stroke="#7a5a17" stroke-width="1.2"/></symbol>
<symbol id="su-s" viewBox="0 0 40 40"><path d="M20 2l3.5 6v19h-7V8z" fill="#8aa0bb" stroke="#33445a" stroke-width="1.4"/><path d="M20 6v20" stroke="#dbe5f0" stroke-width="1"/><rect x="10" y="27" width="20" height="3.5" rx="1.5" fill="#d4a23a" stroke="#7a5a17" stroke-width="1"/><rect x="18.3" y="30.5" width="3.4" height="6" fill="#5a3a1c"/><circle cx="20" cy="37.6" r="2.2" fill="#d4a23a"/></symbol>
<symbol id="su-b" viewBox="0 0 40 40"><path d="M13 37L27 4" stroke="#7a5130" stroke-width="7" stroke-linecap="round"/><path d="M13 37L27 4" stroke="#9c6c43" stroke-width="3" stroke-linecap="round"/><circle cx="18" cy="25" r="2.6" fill="#5f3b20"/><circle cx="23" cy="14" r="2.4" fill="#5f3b20"/><path d="M24 17c5-1 8 1 9 4-4 1-7 0-9-4zM17 28c-5 0-7 3-7 5 4 0 6-2 7-5z" fill="#4f8a35"/></symbol>
</defs></svg>`;document.body.append(d)}

// ------------------------------------------------------------------ Sudoku e Mahjong: la pagina zen.html del Giardino, dentro Natan
function apriSolo(info){return function(pg,volta){
  document.querySelectorAll(".zfloat").forEach(x=>x.remove());
  const f=E("div","zfloat");const bar=E("div","zbar");const b=E("button","","← Ritorna ai giochi");b.id="zenBack";bar.append(b,E("b","",info.ic+" "+info.nome));
  const fr=document.createElement("iframe");fr.id="zenFrame";fr.title=info.nome;fr.setAttribute("allow","autoplay");
  fr.src="zen.html?v="+(window.NATAN_VERSIONE||"")+"#"+info.id;
  f.append(bar,fr);document.body.append(f);
  const fine=()=>{window.removeEventListener("message",on);f.remove();volta()};
  const on=ev=>{const d=ev.data;if(!d||ev.source!==fr.contentWindow||!d.zen)return;
    if(d.zen==="back")fine();else if(d.zen==="win"&&d.game===info.id){try{window.__G.soloVinto(info.id)}catch(e){}}};
  window.addEventListener("message",on);b.onclick=fine;
}}
const SOLO={
  sudoku:{id:"sudoku",ord:1,nome:"Sudoku",ic:"🔢",sub:"Classico 9×9 o gigante fino a 20×20",min:1,max:1,solo:true},
  mahjong:{id:"mahjong",ord:3,nome:"Mahjong",ic:"🀄",sub:"Cinque mappe: piramide, tartaruga, ragno, granchio, farfalla",min:1,max:1,solo:true}};
Object.values(SOLO).forEach(i=>{i.apri=apriSolo(i);register(i)});

const PIC={"sudoku": "<svg class=\"pic pic-sd\" viewBox=\"0 0 240 120\" preserveAspectRatio=\"xMidYMid slice\" aria-hidden=\"true\"> <g transform=\"rotate(-4 120 60)\"><rect x=\"70\" y=\"14\" width=\"96\" height=\"96\" rx=\"3\" fill=\"#fffdf6\" stroke=\"#22261f\" stroke-width=\"2\"/> <path d=\"M102 14v96M134 14v96M70 46h96M70 78h96\" stroke=\"#22261f\" stroke-width=\"1.6\"/> <g font-family=\"Shippori Mincho,serif\" font-weight=\"700\" font-size=\"20\" fill=\"#22261f\" text-anchor=\"middle\"><text x=\"86\" y=\"37\">5</text><text x=\"150\" y=\"37\">3</text><text x=\"118\" y=\"69\">7</text><text x=\"86\" y=\"101\">9</text></g> <g font-family=\"Shippori Mincho,serif\" font-weight=\"700\" font-size=\"20\" fill=\"#4a6838\" text-anchor=\"middle\"><text x=\"150\" y=\"101\">1</text></g></g> <g transform=\"rotate(32 180 80)\"><rect x=\"160\" y=\"74\" width=\"90\" height=\"12\" rx=\"2\" fill=\"#e8b923\"/><path d=\"M160 74l-16 6 16 6z\" fill=\"#f1d6a8\"/><path d=\"M147 78.8l-3 1.2 3 1.2z\" fill=\"#333\"/><rect x=\"246\" y=\"74\" width=\"10\" height=\"12\" fill=\"#c7c7c7\"/><rect x=\"254\" y=\"74\" width=\"10\" height=\"12\" rx=\"3\" fill=\"#e79aa8\"/></g> </svg>", "scopa": "<svg class=\"pic pic-sc\" viewBox=\"0 0 240 120\" preserveAspectRatio=\"xMidYMid slice\" aria-hidden=\"true\"> <g transform=\"translate(120 128)\"> <g transform=\"rotate(-18)\"><rect x=\"-26\" y=\"-112\" width=\"52\" height=\"82\" rx=\"6\" fill=\"#fbf6e9\" stroke=\"#d6cbb0\"/><use href=\"#su-c\" x=\"-16\" y=\"-92\" width=\"32\" height=\"32\"/><text x=\"-20\" y=\"-96\" font-family=\"Shippori Mincho,serif\" font-weight=\"800\" font-size=\"14\" fill=\"#2a2620\">3</text></g> <g transform=\"rotate(16)\"><rect x=\"-26\" y=\"-112\" width=\"52\" height=\"82\" rx=\"6\" fill=\"#fbf6e9\" stroke=\"#d6cbb0\"/><use href=\"#su-s\" x=\"-16\" y=\"-92\" width=\"32\" height=\"32\"/><text x=\"-20\" y=\"-96\" font-family=\"Shippori Mincho,serif\" font-weight=\"800\" font-size=\"14\" fill=\"#2a2620\">R</text></g> <g><rect x=\"-26\" y=\"-116\" width=\"52\" height=\"82\" rx=\"6\" fill=\"#fbf6e9\" stroke=\"#d6cbb0\"/><use href=\"#su-d\" x=\"-16\" y=\"-96\" width=\"32\" height=\"32\"/><text x=\"-20\" y=\"-100\" font-family=\"Shippori Mincho,serif\" font-weight=\"800\" font-size=\"14\" fill=\"#2a2620\">A</text></g> </g> </svg>", "mahjong": "<svg class=\"pic pic-mj\" viewBox=\"0 0 240 120\" preserveAspectRatio=\"xMidYMid slice\" aria-hidden=\"true\"> <g font-family=\"Shippori Mincho,serif\" font-weight=\"800\" text-anchor=\"middle\"> <g transform=\"translate(62 26)\"><rect x=\"5\" y=\"5\" width=\"44\" height=\"60\" rx=\"5\" fill=\"#c7a464\"/><rect width=\"44\" height=\"60\" rx=\"5\" fill=\"#f8f2e2\" stroke=\"#8a6a36\"/><text x=\"22\" y=\"40\" font-size=\"28\" fill=\"#b3261b\">中</text></g> <g transform=\"translate(108 20)\"><rect x=\"5\" y=\"5\" width=\"44\" height=\"60\" rx=\"5\" fill=\"#c7a464\"/><rect width=\"44\" height=\"60\" rx=\"5\" fill=\"#f8f2e2\" stroke=\"#8a6a36\"/><text x=\"22\" y=\"40\" font-size=\"28\" fill=\"#21703a\">發</text></g> <g transform=\"translate(154 26)\"><rect x=\"5\" y=\"5\" width=\"44\" height=\"60\" rx=\"5\" fill=\"#c7a464\"/><rect width=\"44\" height=\"60\" rx=\"5\" fill=\"#f8f2e2\" stroke=\"#8a6a36\"/><text x=\"22\" y=\"40\" font-size=\"28\" fill=\"#2a2620\">東</text></g> </g> </svg>", "dama": "<svg class=\"pic pic-dm\" viewBox=\"0 0 240 120\" preserveAspectRatio=\"xMidYMid slice\" aria-hidden=\"true\"> <g fill=\"none\" stroke=\"#cdc3ab\" stroke-width=\"2\"><path d=\"M0 14q30-5 60 0t60 0 60 0 60 0M0 106q30-5 60 0t60 0 60 0 60 0\"/></g> <g transform=\"translate(64 12)\"><rect x=\"-6\" y=\"-6\" width=\"124\" height=\"104\" rx=\"4\" fill=\"#5a3e26\"/> <g fill=\"#efe4cc\"><rect width=\"112\" height=\"92\"/></g> <g fill=\"#8a6a45\"><rect x=\"0\" y=\"0\" width=\"23\" height=\"23\"/><rect x=\"46\" y=\"0\" width=\"23\" height=\"23\"/><rect x=\"92\" y=\"0\" width=\"20\" height=\"23\"/><rect x=\"23\" y=\"23\" width=\"23\" height=\"23\"/><rect x=\"69\" y=\"23\" width=\"23\" height=\"23\"/><rect x=\"0\" y=\"46\" width=\"23\" height=\"23\"/><rect x=\"46\" y=\"46\" width=\"23\" height=\"23\"/><rect x=\"92\" y=\"46\" width=\"20\" height=\"23\"/><rect x=\"23\" y=\"69\" width=\"23\" height=\"23\"/><rect x=\"69\" y=\"69\" width=\"23\" height=\"23\"/></g> <circle cx=\"11.5\" cy=\"11.5\" r=\"8.5\" fill=\"#2a2724\"/><circle cx=\"57.5\" cy=\"11.5\" r=\"8.5\" fill=\"#2a2724\"/><circle cx=\"34.5\" cy=\"34.5\" r=\"8.5\" fill=\"#2a2724\"/> <circle cx=\"57.5\" cy=\"57.5\" r=\"8.5\" fill=\"#efe6d2\" stroke=\"#a8987a\"/><circle cx=\"34.5\" cy=\"80.5\" r=\"8.5\" fill=\"#efe6d2\" stroke=\"#a8987a\"/><circle cx=\"80.5\" cy=\"80.5\" r=\"8.5\" fill=\"#efe6d2\" stroke=\"#a8987a\"/> <circle cx=\"80.5\" cy=\"34.5\" r=\"8.5\" fill=\"#efe6d2\" stroke=\"#a8987a\"/><text x=\"80.5\" y=\"39.5\" text-anchor=\"middle\" font-family=\"Shippori Mincho,serif\" font-weight=\"800\" font-size=\"12\" fill=\"#9a2a1e\">王</text></g> </svg>", "biliardo": "<svg class=\"pic pic-bl\" viewBox=\"0 0 240 120\" preserveAspectRatio=\"xMidYMid slice\" aria-hidden=\"true\"> <rect x=\"18\" y=\"14\" width=\"204\" height=\"96\" rx=\"12\" fill=\"#5b3a22\"/><rect x=\"30\" y=\"26\" width=\"180\" height=\"72\" rx=\"3\" fill=\"#1f6b46\"/> <g fill=\"#0d0d0d\"><circle cx=\"31\" cy=\"27\" r=\"7\"/><circle cx=\"120\" cy=\"24\" r=\"6\"/><circle cx=\"209\" cy=\"27\" r=\"7\"/><circle cx=\"31\" cy=\"97\" r=\"7\"/><circle cx=\"120\" cy=\"100\" r=\"6\"/><circle cx=\"209\" cy=\"97\" r=\"7\"/></g> <circle cx=\"150\" cy=\"62\" r=\"6\" fill=\"#e9b81f\"/><circle cx=\"160.5\" cy=\"56\" r=\"6\" fill=\"#c62a20\"/><circle cx=\"160.5\" cy=\"68\" r=\"6\" fill=\"#151515\"/><circle cx=\"171\" cy=\"50\" r=\"6\" fill=\"#1f4fa8\"/><circle cx=\"171\" cy=\"62\" r=\"6\" fill=\"#f4f1e8\"/><rect x=\"165\" y=\"59\" width=\"12\" height=\"6\" fill=\"#1f7a43\"/><circle cx=\"171\" cy=\"74\" r=\"6\" fill=\"#e46e1c\"/> <circle cx=\"80\" cy=\"62\" r=\"6\" fill=\"#f6f3ea\"/> <path d=\"M70 66L8 92\" stroke=\"#d9b98a\" stroke-width=\"4\" stroke-linecap=\"round\"/><path d=\"M40 79L8 92\" stroke=\"#2b1a10\" stroke-width=\"5\" stroke-linecap=\"round\"/> </svg>", "uno": "<svg class=\"pic pic-un\" viewBox=\"0 0 240 120\" preserveAspectRatio=\"xMidYMid slice\" aria-hidden=\"true\"><g transform=\"translate(120 132)\"><g transform=\"rotate(-24)\"><rect x=\"-28\" y=\"-118\" width=\"56\" height=\"84\" rx=\"8\" fill=\"#2f6fd6\" stroke=\"#fff\" stroke-width=\"3\"/><ellipse cx=\"0\" cy=\"-76\" rx=\"21\" ry=\"29\" transform=\"rotate(-24 0 -76)\" fill=\"#fff\"/><text x=\"0\" y=\"-66\" text-anchor=\"middle\" font-family=\"system-ui,sans-serif\" font-weight=\"900\" font-size=\"30\" fill=\"#2f6fd6\">⊘</text></g><g transform=\"rotate(24)\"><rect x=\"-28\" y=\"-118\" width=\"56\" height=\"84\" rx=\"8\" fill=\"#f2c230\" stroke=\"#fff\" stroke-width=\"3\"/><ellipse cx=\"0\" cy=\"-76\" rx=\"21\" ry=\"29\" transform=\"rotate(-24 0 -76)\" fill=\"#fff\"/><text x=\"0\" y=\"-66\" text-anchor=\"middle\" font-family=\"system-ui,sans-serif\" font-weight=\"900\" font-size=\"26\" fill=\"#b98a00\">+2</text></g><g><rect x=\"-28\" y=\"-122\" width=\"56\" height=\"84\" rx=\"8\" fill=\"#e2463c\" stroke=\"#fff\" stroke-width=\"3\"/><ellipse cx=\"0\" cy=\"-80\" rx=\"21\" ry=\"29\" transform=\"rotate(-24 0 -80)\" fill=\"#fff\"/><text x=\"0\" y=\"-69\" text-anchor=\"middle\" font-family=\"system-ui,sans-serif\" font-weight=\"900\" font-size=\"34\" fill=\"#e2463c\">7</text></g></g></svg>"};
window.__G.zen={A,sfx,blSnd,Music,STYLES,simboli,css,SOLO,PIC};
simboli();
})();

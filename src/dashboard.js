export const dashboardHtml = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Affiliate Rewards &middot; IUL.org</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=Inter:wght@400;500;600&family=IBM+Plex+Mono:wght@400;500&display=swap" rel="stylesheet">
<style>
  :root {
    --navy:#0B2C3D; --navy2:#143F54; --navy3:#1D5570;
    --green:#1F9D55; --mint:#7FD4A3; --amber:#C0761F; --gold:#F0B267;
    --paper:#F6F5F1; --card:#FFF; --ink:#16232B; --muted:#6D7F8A;
    --line:#E4E2DA; --line2:#EFEDE6;
    --shadow:0 1px 2px rgba(11,44,61,.05), 0 8px 24px -12px rgba(11,44,61,.14);
  }
  *{box-sizing:border-box}
  html{scroll-behavior:smooth}
  body{
    margin:0;background:var(--paper);color:var(--ink);
    font-family:'Inter',system-ui,sans-serif;font-size:15px;line-height:1.5;
    -webkit-font-smoothing:antialiased;
  }
  .wrap{max-width:1120px;margin:0 auto;padding:0 24px}
  .serif{font-family:'Instrument Serif',Georgia,serif;font-weight:400}

  /* ============ animation ============ */
  @keyframes rise{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:none}}
  @keyframes fade{from{opacity:0}to{opacity:1}}
  @keyframes slideIn{from{opacity:0;transform:translateY(16px) scale(.97)}to{opacity:1;transform:none}}
  @keyframes spin{to{transform:rotate(360deg)}}
  @keyframes pulse{0%,100%{opacity:1}50%{opacity:.35}}
  .rise{animation:rise .5s cubic-bezier(.22,1,.36,1) both}
  .d1{animation-delay:.04s}.d2{animation-delay:.08s}.d3{animation-delay:.12s}
  .d4{animation-delay:.16s}.d5{animation-delay:.2s}.d6{animation-delay:.24s}

  /* ============ masthead ============ */
  .masthead{background:var(--navy);color:#fff}
  .mhtop{display:flex;align-items:center;justify-content:space-between;gap:20px;
    flex-wrap:wrap;padding:20px 0 16px}
  .mark{font-family:'Instrument Serif',Georgia,serif;font-size:25px;letter-spacing:.2px;
    display:flex;align-items:center;gap:10px}
  .mark em{font-style:italic;color:var(--mint)}
  .dot{width:7px;height:7px;border-radius:99px;background:var(--mint);
    box-shadow:0 0 0 4px rgba(127,212,163,.18)}
  .weekstamp{font-family:'IBM Plex Mono',monospace;font-size:11.5px;letter-spacing:.09em;
    text-transform:uppercase;color:#9DB6C2}

  .tabs{display:flex;gap:2px;border-bottom:1px solid rgba(255,255,255,.12)}
  .tab{background:none;border:0;color:#9DB6C2;font:inherit;font-size:14px;font-weight:500;
    padding:11px 16px;cursor:pointer;position:relative;border-radius:3px 3px 0 0;
    transition:color .2s,background .2s}
  .tab:hover{color:#fff;background:rgba(255,255,255,.05)}
  .tab[aria-selected=true]{color:#fff}
  .tab[aria-selected=true]::after{content:'';position:absolute;left:14px;right:14px;bottom:-1px;
    height:2px;background:var(--mint);border-radius:2px;animation:fade .25s both}
  .masthead .tab:focus-visible{outline:2px solid var(--mint);outline-offset:2px}

  /* ============ ledger band ============ */
  .ledger{background:var(--navy2);color:#fff}
  .figs{display:grid;grid-template-columns:repeat(4,1fr)}
  .fig{padding:26px 26px 30px;position:relative}
  .fig+.fig::before{content:'';position:absolute;left:0;top:26px;bottom:26px;width:1px;
    background:rgba(255,255,255,.13)}
  .fig .n{font-family:'Instrument Serif',Georgia,serif;font-size:46px;line-height:1;
    font-variant-numeric:tabular-nums}
  .fig .n.gold{color:var(--gold)} .fig .n.mint{color:var(--mint)}
  .fig .k{margin-top:9px;font-size:10.5px;letter-spacing:.11em;text-transform:uppercase;
    color:#9DB6C2}
  .fig .sub{margin-top:5px;font-size:12px;color:#7593A3;font-family:'IBM Plex Mono',monospace}

  /* ============ panels ============ */
  .panel{padding:36px 0 0}
  .panel[hidden]{display:none}
  .sechead{display:flex;align-items:baseline;justify-content:space-between;gap:16px;
    margin-bottom:16px;flex-wrap:wrap}
  h2{font-family:'Instrument Serif',Georgia,serif;font-weight:400;font-size:26px;margin:0}
  h2 em{font-style:italic}
  .sechead .hint{font-size:13px;color:var(--muted)}

  .card{background:var(--card);border:1px solid var(--line);border-radius:4px;
    box-shadow:var(--shadow)}
  .grid2{display:grid;grid-template-columns:1.55fr 1fr;gap:14px}

  /* ============ trend chart ============ */
  .chart{padding:22px 24px 18px}
  .chart h3,.side h3{font-size:10.5px;letter-spacing:.11em;text-transform:uppercase;
    color:var(--muted);margin:0 0 14px;font-weight:600}
  .bars{display:flex;align-items:flex-end;gap:8px;height:150px}
  .bar{flex:1;display:flex;flex-direction:column;justify-content:flex-end;gap:3px;
    min-width:0;position:relative}
  .bseg{border-radius:2px 2px 0 0;transition:height .6s cubic-bezier(.22,1,.36,1)}
  .bseg.owe{background:#DCE6EA}
  .bseg.got{background:var(--green);border-radius:0 0 2px 2px}
  .blab{margin-top:8px;font-size:10px;color:var(--muted);text-align:center;
    font-family:'IBM Plex Mono',monospace;white-space:nowrap;overflow:hidden;
    text-overflow:ellipsis}
  .bar:hover .bseg.owe{background:#CBD9DF}
  .legend{display:flex;gap:16px;margin-top:14px;padding-top:13px;border-top:1px solid var(--line2);
    font-size:12px;color:var(--muted)}
  .legend i{width:9px;height:9px;border-radius:2px;display:inline-block;margin-right:6px}

  /* ============ side card ============ */
  .side{padding:22px 24px}
  .kv{display:flex;justify-content:space-between;gap:12px;padding:10px 0;
    border-bottom:1px solid var(--line2);font-size:13.5px}
  .kv:last-of-type{border-bottom:0}
  .kv .k{color:var(--muted)}
  .kv .v{font-family:'IBM Plex Mono',monospace;font-variant-numeric:tabular-nums}

  /* ============ rows ============ */
  .row{background:var(--card);border:1px solid var(--line);border-radius:4px;
    padding:20px 22px;margin-bottom:10px;box-shadow:var(--shadow);
    transition:border-color .2s,box-shadow .2s}
  .row:hover{border-color:#CFD8D3}
  .rowtop{display:flex;justify-content:space-between;align-items:flex-start;gap:18px;
    flex-wrap:wrap}
  .code{font-family:'IBM Plex Mono',monospace;font-size:16px;font-weight:500;
    display:flex;align-items:center;gap:9px}
  .facts{margin-top:4px;font-size:13px;color:var(--muted);font-variant-numeric:tabular-nums}
  .facts span+span::before{content:' \\00b7 '}

  .gauge{margin-top:16px}
  .track{height:8px;background:var(--line2);border-radius:99px;overflow:hidden}
  .fill{height:100%;border-radius:99px;background:var(--green);width:0;
    transition:width .75s cubic-bezier(.22,1,.36,1)}
  .fill.short{background:linear-gradient(90deg,var(--amber),var(--gold))}
  .glab{margin-top:8px;font-size:12px;font-family:'IBM Plex Mono',monospace;color:var(--muted);
    display:flex;justify-content:space-between;gap:12px}

  .rowactions{margin-top:16px;padding-top:15px;border-top:1px solid var(--line2);
    display:flex;align-items:center;gap:9px;flex-wrap:wrap}
  .rowactions label{font-size:10.5px;letter-spacing:.09em;text-transform:uppercase;
    color:var(--muted)}
  .spark{margin-left:auto;display:flex;align-items:flex-end;gap:2px;height:22px}
  .spark i{width:4px;background:#CBD9DF;border-radius:1px;display:block}
  .spark i:last-child{background:var(--navy3)}

  /* ============ controls ============ */
  input[type=text],input[type=number],input[type=password],input[type=search]{
    font:inherit;font-family:'IBM Plex Mono',monospace;padding:8px 11px;
    border:1px solid var(--line);border-radius:3px;background:#fff;color:var(--ink);width:112px;
    transition:border-color .18s,box-shadow .18s}
  input:hover{border-color:#CFD8D3}
  input:focus{outline:0;border-color:var(--green);box-shadow:0 0 0 3px rgba(31,157,85,.13)}
  input[type=search]{width:230px}
  input:focus-visible,button:focus-visible{outline:2px solid var(--green);outline-offset:2px}

  button{font:inherit;font-size:14px;font-weight:500;padding:9px 16px;border-radius:3px;
    border:1px solid var(--navy);background:var(--navy);color:#fff;cursor:pointer;
    transition:background .18s,transform .12s,opacity .18s;
    display:inline-flex;align-items:center;gap:8px}
  button:hover{background:var(--navy2)}
  button:active{transform:translateY(1px)}
  button.ghost{background:transparent;color:var(--navy);border-color:var(--line)}
  button.ghost:hover{background:var(--line2);border-color:#CFD8D3}
  button.link{background:none;border:0;color:var(--navy);padding:0;font-size:13px;
    text-decoration:underline;text-underline-offset:3px}
  button.link:hover{background:none;color:var(--green)}
  button[disabled]{opacity:.55;cursor:default;transform:none}
  .spinner{width:13px;height:13px;border:2px solid rgba(255,255,255,.32);
    border-top-color:#fff;border-radius:99px;animation:spin .7s linear infinite;flex:none}

  /* ============ detail ============ */
  .detail{margin-top:15px;padding-top:16px;border-top:1px solid var(--line2);
    animation:rise .35s cubic-bezier(.22,1,.36,1) both}
  .detail h3{font-size:10.5px;letter-spacing:.11em;text-transform:uppercase;color:var(--muted);
    margin:0 0 10px;font-weight:600}
  .detail h3+h3{margin-top:24px}
  table{width:100%;border-collapse:collapse;font-size:13.5px}
  th{text-align:left;font-weight:500;font-size:10.5px;letter-spacing:.08em;text-transform:uppercase;
    color:var(--muted);padding:0 10px 8px 0;border-bottom:1px solid var(--line)}
  td{padding:10px 10px 10px 0;border-bottom:1px solid var(--line2);
    font-variant-numeric:tabular-nums}
  tbody tr{transition:background .15s}
  tbody tr:hover{background:#FAFAF7}
  td.num,th.num{text-align:right;padding-right:0}

  .pill{display:inline-block;font-size:10.5px;font-weight:500;letter-spacing:.06em;
    text-transform:uppercase;padding:3px 9px;border-radius:99px;white-space:nowrap}
  .pill.ok{background:#E3F3E9;color:#14663A}
  .pill.dead{background:#EFEDE6;color:#7A7367}
  .pill.warn{background:#FBEEDC;color:#8A5311}
  .pill.bad{background:#FBE6E2;color:#96291A}

  /* ============ toast ============ */
  .toast{position:fixed;left:50%;bottom:26px;transform:translateX(-50%);z-index:60;
    background:var(--navy);color:#fff;padding:12px 20px;border-radius:4px;font-size:14px;
    box-shadow:0 12px 32px -8px rgba(11,44,61,.42);
    animation:slideIn .3s cubic-bezier(.22,1,.36,1) both;
    display:flex;align-items:center;gap:10px;max-width:calc(100vw - 40px)}
  .toast i{width:7px;height:7px;border-radius:99px;background:var(--mint);flex:none}
  .toast.bad i{background:#F08A78}

  /* ============ misc ============ */
  .note{font-size:13.5px;color:var(--muted);padding:26px;background:var(--card);
    border:1px solid var(--line);border-radius:4px;text-align:center}
  .note strong{display:block;color:var(--ink);font-size:15px;margin-bottom:5px;font-weight:500}
  .err{color:#96291A;font-size:13.5px;margin:24px 0 0;padding:11px 14px;background:#FBE6E2;
    border-radius:3px;animation:rise .3s both}
  .hide{display:none!important}
  .skel{background:linear-gradient(90deg,#EDEBE4,#F5F3EE,#EDEBE4);border-radius:3px;
    animation:pulse 1.4s ease-in-out infinite;height:13px}

  footer{margin-top:46px;padding:18px 0 44px;border-top:1px solid var(--line);
    font-size:12.5px;color:var(--muted);font-family:'IBM Plex Mono',monospace;
    display:flex;justify-content:space-between;gap:16px;flex-wrap:wrap}

  /* ============ gate ============ */
  .gate{min-height:100vh;display:grid;place-items:center;padding:24px;
    background:radial-gradient(1000px 520px at 50% -8%,#12384C 0%,var(--navy) 62%)}
  .gatebox{width:100%;max-width:376px;background:var(--card);border-radius:5px;padding:36px;
    box-shadow:0 24px 64px -20px rgba(0,0,0,.42);
    animation:slideIn .45s cubic-bezier(.22,1,.36,1) both}
  .gatebox .mark{color:var(--navy);margin-bottom:7px}
  .gatebox .mark em{color:var(--green)}
  .gatebox p{color:var(--muted);font-size:14px;margin:0 0 20px}
  .gatebox .err{margin:0 0 14px}
  .gatebox input,.gatebox button{width:100%}
  .gatebox input{margin-bottom:12px}
  .gatebox button{justify-content:center}

  @media(max-width:860px){ .grid2{grid-template-columns:1fr} }
  @media(max-width:720px){
    .figs{grid-template-columns:repeat(2,1fr)}
    .fig+.fig::before{display:none}
    .fig{border-top:1px solid rgba(255,255,255,.13)}
    .fig:nth-child(2n){border-left:1px solid rgba(255,255,255,.13)}
    .fig .n{font-size:35px}
    .tabs{overflow-x:auto}
    input[type=search]{width:100%}
    .spark{display:none}
  }
  @media(prefers-reduced-motion:reduce){
    *,*::after{animation:none!important;transition:none!important}
    html{scroll-behavior:auto}
  }
</style>
</head>
<body>

<div class="gate" id="gate">
  <div class="gatebox">
    <div class="mark serif">Affiliate <em>Rewards</em></div>
    <p>Enter your access key to open the portal.</p>
    <p class="err hide" id="gateErr"></p>
    <input type="password" id="keyInput" placeholder="Access key" autocomplete="off">
    <button id="keyBtn">Open portal</button>
  </div>
</div>

<div id="portal" class="hide">

  <header class="masthead">
    <div class="wrap">
      <div class="mhtop">
        <div class="mark"><span class="dot"></span>Affiliate <em>Rewards</em></div>
        <div class="weekstamp" id="weekStamp">&mdash;</div>
      </div>
      <div class="tabs" role="tablist">
        <button class="tab" role="tab" data-tab="overview" aria-selected="true">Overview</button>
        <button class="tab" role="tab" data-tab="affiliates" aria-selected="false">Affiliates</button>
        <button class="tab" role="tab" data-tab="activity" aria-selected="false">Activity</button>
      </div>
    </div>
  </header>

  <div class="ledger">
    <div class="wrap">
      <div class="figs">
        <div class="fig rise d1">
          <div class="n" id="fOwed">0</div>
          <div class="k">Leads owed this week</div>
          <div class="sub" id="sOwed">&mdash;</div>
        </div>
        <div class="fig rise d2">
          <div class="n mint" id="fDelivered">0</div>
          <div class="k">Delivered</div>
          <div class="sub" id="sDelivered">&mdash;</div>
        </div>
        <div class="fig rise d3">
          <div class="n gold" id="fOutstanding">0</div>
          <div class="k">Still outstanding</div>
          <div class="sub" id="sOutstanding">&mdash;</div>
        </div>
        <div class="fig rise d4">
          <div class="n" id="fActive">0</div>
          <div class="k">Active referrals</div>
          <div class="sub" id="sActive">&mdash;</div>
        </div>
      </div>
    </div>
  </div>

  <div class="wrap">
    <p class="err hide" id="topErr"></p>

    <div class="panel" id="p-overview">
      <div class="sechead">
        <h2>The <em>week</em> in review</h2>
        <div style="display:flex;gap:8px;flex-wrap:wrap">
          <button class="ghost" id="refreshBtn">Refresh</button>
          <button id="syncBtn">Pull latest from GHL</button>
        </div>
      </div>

      <div class="grid2">
        <div class="card chart rise d1">
          <h3>Leads owed vs delivered, by week</h3>
          <div class="bars" id="bars"></div>
          <div class="legend">
            <span><i style="background:#DCE6EA"></i>Owed</span>
            <span><i style="background:#1F9D55"></i>Delivered</span>
          </div>
        </div>

        <div class="card side rise d2">
          <h3>Where things stand</h3>
          <div class="kv"><span class="k">Affiliates</span><span class="v" id="kAff">&mdash;</span></div>
          <div class="kv"><span class="k">Active referrals</span><span class="v" id="kActive">&mdash;</span></div>
          <div class="kv"><span class="k">Cancelled</span><span class="v" id="kCancel">&mdash;</span></div>
          <div class="kv"><span class="k">Other statuses</span><span class="v" id="kOther">&mdash;</span></div>
          <div class="kv"><span class="k">Referred revenue</span><span class="v" id="kRev">&mdash;</span></div>
          <div class="kv"><span class="k">Last pull</span><span class="v" id="kSync">&mdash;</span></div>
        </div>
      </div>

      <div class="sechead" style="margin-top:34px">
        <h2>Largest <em>balances</em></h2>
        <span class="hint">Who is still waiting on leads</span>
      </div>
      <div id="topList"></div>
    </div>

    <div class="panel" id="p-affiliates" hidden>
      <div class="sechead">
        <h2>Every <em>affiliate</em></h2>
        <input type="search" id="search" placeholder="Search by code" autocomplete="off">
      </div>
      <div id="list"></div>
    </div>

    <div class="panel" id="p-activity" hidden>
      <div class="sechead">
        <h2>Sync <em>history</em></h2>
        <span class="hint">Every pull from GHL, newest first</span>
      </div>
      <div class="card" style="padding:20px 22px" id="activity">
        <div class="skel" style="width:60%"></div>
      </div>
    </div>

    <footer>
      <div id="syncInfo">&mdash;</div>
      <div id="revInfo">&mdash;</div>
    </footer>
  </div>
</div>

<script>
var KEY = sessionStorage.getItem('arp_key') || '';
var S = { overview:null, affiliates:[], activity:null, open:null, detail:{}, tab:'overview', q:'' };

function el(id){ return document.getElementById(id); }
function esc(s){ return String(s==null?'':s).replace(/&/g,'&amp;').replace(/</g,'&lt;')
  .replace(/>/g,'&gt;').replace(/"/g,'&quot;'); }
function num(n){ return Number(n||0).toLocaleString('en-US'); }
function money(n){ return '$'+Number(n||0).toLocaleString('en-US'); }

function fmtDate(d){
  if(!d) return '';
  var t=new Date(d); if(isNaN(t)) return String(d);
  return t.toLocaleDateString('en-US',{month:'short',day:'numeric',year:'numeric'});
}
function fmtShort(d){
  if(!d) return '';
  var t=new Date(d); if(isNaN(t)) return String(d);
  return t.toLocaleDateString('en-US',{month:'short',day:'numeric'});
}
function fmtTime(d){
  if(!d) return '';
  var t=new Date(d); if(isNaN(t)) return String(d);
  return t.toLocaleString('en-US',{month:'short',day:'numeric',hour:'numeric',minute:'2-digit'});
}
function ago(d){
  if(!d) return 'never';
  var s=Math.floor((Date.now()-new Date(d).getTime())/1000);
  if(s<60) return s+'s ago';
  if(s<3600) return Math.floor(s/60)+'m ago';
  if(s<86400) return Math.floor(s/3600)+'h ago';
  return Math.floor(s/86400)+'d ago';
}
function took(a,b){
  if(!a||!b) return '\\u2014';
  var s=Math.round((new Date(b)-new Date(a))/1000);
  return s<60 ? s+'s' : Math.floor(s/60)+'m '+(s%60)+'s';
}

function countTo(node,target){
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  target = Number(target)||0;
  if(reduce || target===0){ node.textContent = num(target); return; }
  var start = performance.now(), span = 750;
  function step(now){
    var p = Math.min(1,(now-start)/span);
    var e = 1-Math.pow(1-p,3);
    node.textContent = num(Math.round(target*e));
    if(p<1) requestAnimationFrame(step);
  }
  requestAnimationFrame(step);
}

function toast(msg,bad){
  var old=document.querySelector('.toast'); if(old) old.remove();
  var t=document.createElement('div');
  t.className='toast'+(bad?' bad':'');
  t.innerHTML='<i></i><span>'+esc(msg)+'</span>';
  document.body.appendChild(t);
  setTimeout(function(){ if(t.parentNode) t.remove(); }, 3600);
}

function api(path,opts){
  opts=opts||{};
  var sep = path.indexOf('?')===-1 ? '?' : '&';
  return fetch(path+sep+'secret='+encodeURIComponent(KEY),opts).then(function(r){
    return r.json().then(function(j){
      if(!r.ok || j.success===false) throw new Error(j.error||('Request failed ('+r.status+')'));
      return j;
    });
  });
}

/* ---------- gate ---------- */
function tryKey(){
  var v=el('keyInput').value.trim(); if(!v) return;
  KEY=v;
  var b=el('keyBtn'); b.disabled=true; b.innerHTML='<span class="spinner"></span>Checking';
  api('/api/overview').then(function(){
    sessionStorage.setItem('arp_key',KEY);
    enter();
  }).catch(function(e){
    var n=el('gateErr');
    n.textContent = e.message==='Unauthorized'
      ? 'That key was not accepted. Check it and try again.' : e.message;
    n.classList.remove('hide');
    b.disabled=false; b.textContent='Open portal';
  });
}
el('keyBtn').addEventListener('click',tryKey);
el('keyInput').addEventListener('keydown',function(e){ if(e.key==='Enter') tryKey(); });

function enter(){
  el('gate').classList.add('hide');
  el('portal').classList.remove('hide');
  loadAll();
}

/* ---------- tabs ---------- */
Array.prototype.forEach.call(document.querySelectorAll('.tab'),function(t){
  t.addEventListener('click',function(){
    S.tab=t.getAttribute('data-tab');
    Array.prototype.forEach.call(document.querySelectorAll('.tab'),function(x){
      x.setAttribute('aria-selected', x===t ? 'true':'false');
    });
    ['overview','affiliates','activity'].forEach(function(name){
      var p=el('p-'+name);
      p.hidden = name!==S.tab;
      if(name===S.tab){ p.classList.remove('rise'); void p.offsetWidth; p.classList.add('rise'); }
    });
    if(S.tab==='affiliates') { renderList(); }
    if(S.tab==='activity' && !S.activity) loadActivity();
  });
});

/* ---------- load ---------- */
function loadAll(){
  el('topErr').classList.add('hide');
  return Promise.all([api('/api/overview'),api('/api/affiliates')]).then(function(r){
    S.overview=r[0].data;
    S.affiliates=r[1].data||[];
    renderLedger(); renderChart(); renderSide(); renderTop(); renderList();
  }).catch(showErr);
}
function loadActivity(){
  return api('/api/activity').then(function(r){
    S.activity=r.data||[]; renderActivity();
  }).catch(showErr);
}
function showErr(e){
  var n=el('topErr'); n.textContent=e.message; n.classList.remove('hide');
  toast(e.message,true);
}

/* ---------- ledger ---------- */
function renderLedger(){
  var o=S.overview; if(!o) return;
  var w=o.currentWeek||{};

  el('weekStamp').textContent = w.week_start
    ? 'Week of '+fmtDate(w.week_start)+' \\u2013 '+fmtDate(w.week_end)
    : 'No week calculated yet';

  countTo(el('fOwed'), w.leads_owed);
  countTo(el('fDelivered'), w.leads_delivered);
  countTo(el('fOutstanding'), w.leads_balance);
  countTo(el('fActive'), o.subscriptions ? o.subscriptions.active : 0);

  var owed=w.leads_owed||0, got=w.leads_delivered||0;
  var pct = owed>0 ? Math.round((got/owed)*100) : 0;

  el('sOwed').textContent = num(o.affiliates)+' affiliate'+(o.affiliates===1?'':'s');
  el('sDelivered').textContent = pct+'% of the week settled';
  el('sOutstanding').textContent = (owed>0 && (w.leads_balance||0)===0) ? 'All settled' : 'Awaiting delivery';
  el('sActive').textContent = money(o.activeWeeklyRevenue)+' per week';

  var s=o.lastSync;
  el('syncInfo').textContent = s
    ? 'Last pull '+ago(s.sync_started)+' \\u00b7 '+s.status+' \\u00b7 '+num(s.records_processed)+' scanned'
    : 'No pull recorded yet';
  el('revInfo').textContent = money(o.activeWeeklyRevenue)+'/wk referred revenue';
}

/* ---------- chart ---------- */
function renderChart(){
  var t=(S.overview&&S.overview.trend)||[];
  var host=el('bars');

  if(!t.length){
    host.innerHTML='<div style="color:#6D7F8A;font-size:13.5px;align-self:center;width:100%;text-align:center">No weeks calculated yet.</div>';
    return;
  }

  var max=Math.max.apply(null,t.map(function(w){ return w.leads_owed||0; }));
  if(max<=0) max=1;

  host.innerHTML = t.map(function(w){
    var owed=w.leads_owed||0, got=Math.min(w.leads_delivered||0,owed);
    var hO=Math.max(3,Math.round(((owed-got)/max)*118));
    var hG=Math.round((got/max)*118);
    return '<div class="bar" title="'+fmtShort(w.week_start)+' \\u2014 '+num(got)+' of '+num(owed)+' delivered">'+
      (owed-got>0 ? '<div class="bseg owe" style="height:0" data-h="'+hO+'"></div>' : '')+
      (got>0 ? '<div class="bseg got" style="height:0" data-h="'+hG+'"></div>' : '')+
      '<div class="blab">'+fmtShort(w.week_start)+'</div></div>';
  }).join('');

  requestAnimationFrame(function(){
    Array.prototype.forEach.call(host.querySelectorAll('.bseg'),function(b,i){
      setTimeout(function(){ b.style.height=b.getAttribute('data-h')+'px'; }, 40+i*35);
    });
  });
}

function renderSide(){
  var o=S.overview; if(!o) return;
  var s=o.subscriptions||{};
  el('kAff').textContent=num(o.affiliates);
  el('kActive').textContent=num(s.active);
  el('kCancel').textContent=num(s.canceled);
  el('kOther').textContent=num(s.other);
  el('kRev').textContent=money(o.activeWeeklyRevenue);
  el('kSync').textContent=o.lastSync ? ago(o.lastSync.sync_started) : 'never';
}

/* ---------- rows ---------- */
function rowHtml(a,i){
  var owed=a.leads_owed||0, got=a.leads_delivered||0;
  var pct = owed>0 ? Math.min(100,Math.round((got/owed)*100)) : 0;
  var settled = owed>0 && got>=owed;

  var spark=(a.spark||[]);
  var smax=Math.max.apply(null,spark.concat([1]));
  var sparkHtml = spark.length>1
    ? '<div class="spark" title="Leads owed, recent weeks">'+spark.map(function(v){
        return '<i style="height:'+Math.max(3,Math.round((v/smax)*22))+'px"></i>'; }).join('')+'</div>'
    : '';

  return '<div class="row rise d'+Math.min(6,i+1)+'" data-id="'+esc(a.id)+'">'+
    '<div class="rowtop">'+
      '<div>'+
        '<div class="code">'+esc(a.code)+'</div>'+
        '<div class="facts">'+
          '<span>'+num(a.active_referrals)+' active</span>'+
          '<span>'+num(a.total_referrals)+' lifetime</span>'+
          '<span>'+money(a.weekly_revenue)+'/wk</span>'+
        '</div>'+
      '</div>'+
      '<span class="pill '+(settled?'ok':owed>0?'warn':'dead')+'">'+
        (settled?'Settled':owed>0?num(owed-got)+' outstanding':'Nothing owed')+
      '</span>'+
    '</div>'+
    '<div class="gauge">'+
      '<div class="track"><div class="fill'+(settled?'':' short')+'" data-w="'+pct+'"></div></div>'+
      '<div class="glab"><span>'+num(got)+' of '+num(owed)+' delivered</span><span>'+pct+'%</span></div>'+
    '</div>'+
    '<div class="rowactions">'+
      '<label for="d-'+esc(a.id)+'">Record delivered</label>'+
      '<input type="number" min="0" id="d-'+esc(a.id)+'" value="'+got+'">'+
      '<button class="ghost" data-save="'+esc(a.id)+'">Save</button>'+
      '<button class="link" data-open="'+esc(a.id)+'">'+
        (S.open===a.id?'Hide referrals':'View referrals')+'</button>'+
      sparkHtml+
    '</div>'+
    (S.open===a.id?renderDetail(a.id):'')+
  '</div>';
}

function animateFills(host){
  requestAnimationFrame(function(){
    Array.prototype.forEach.call(host.querySelectorAll('.fill'),function(f,i){
      setTimeout(function(){ f.style.width=f.getAttribute('data-w')+'%'; }, 60+i*60);
    });
  });
}
function bindRows(host){
  Array.prototype.forEach.call(host.querySelectorAll('[data-save]'),function(b){
    b.addEventListener('click',function(){ saveDelivered(b.getAttribute('data-save')); });
  });
  Array.prototype.forEach.call(host.querySelectorAll('[data-open]'),function(b){
    b.addEventListener('click',function(){ toggleDetail(b.getAttribute('data-open')); });
  });
}

function renderTop(){
  var host=el('topList');
  var owing=S.affiliates.filter(function(a){ return (a.leads_balance||0)>0; })
    .sort(function(x,y){ return (y.leads_balance||0)-(x.leads_balance||0); }).slice(0,3);

  if(!owing.length){
    host.innerHTML='<div class="note"><strong>Nothing outstanding</strong>Every affiliate has received their leads for this week.</div>';
    return;
  }
  host.innerHTML=owing.map(rowHtml).join('');
  animateFills(host); bindRows(host);
}

function renderList(){
  var host=el('list');
  var q=S.q.trim().toLowerCase();
  var items = q ? S.affiliates.filter(function(a){
    return String(a.code||'').toLowerCase().indexOf(q)!==-1; }) : S.affiliates;

  if(!S.affiliates.length){
    host.innerHTML='<div class="note"><strong>No affiliates yet</strong>Once someone buys through a referral link, they will appear here after the next pull.</div>';
    return;
  }
  if(!items.length){
    host.innerHTML='<div class="note"><strong>No match</strong>No affiliate code contains that text.</div>';
    return;
  }
  host.innerHTML=items.map(rowHtml).join('');
  animateFills(host); bindRows(host);
}

el('search').addEventListener('input',function(e){ S.q=e.target.value; renderList(); });

/* ---------- detail ---------- */
function renderDetail(id){
  var d=S.detail[id];
  if(!d) return '<div class="detail"><div class="skel" style="width:45%"></div></div>';

  var subs=(d.subscriptions||[]).map(function(s){
    var live=s.status==='active';
    return '<tr><td>'+esc(s.contact_name||s.contact_email||'\\u2014')+'</td>'+
      '<td>'+esc(s.product_name)+'</td>'+
      '<td><span class="pill '+(live?'ok':'dead')+'">'+esc(s.status)+'</span></td>'+
      '<td class="num">'+money(s.amount)+'</td>'+
      '<td class="num">'+fmtDate(s.started_at)+'</td></tr>';
  }).join('');

  var hist=(d.history||[]).map(function(h){
    return '<tr><td>'+fmtDate(h.week_start)+'</td>'+
      '<td class="num">'+num(h.active_subscriptions)+'</td>'+
      '<td class="num">'+num(h.leads_owed)+'</td>'+
      '<td class="num">'+num(h.leads_delivered)+'</td>'+
      '<td class="num">'+num(h.leads_balance)+'</td></tr>';
  }).join('');

  return '<div class="detail">'+
    '<h3>Referred subscriptions</h3>'+
    (subs?'<table><thead><tr><th>Customer</th><th>Plan</th><th>Status</th><th class="num">Price</th><th class="num">Started</th></tr></thead><tbody>'+subs+'</tbody></table>'
        :'<div class="note">No referrals recorded.</div>')+
    '<h3>Weekly history</h3>'+
    (hist?'<table><thead><tr><th>Week</th><th class="num">Active</th><th class="num">Owed</th><th class="num">Delivered</th><th class="num">Balance</th></tr></thead><tbody>'+hist+'</tbody></table>'
        :'<div class="note">No weeks calculated yet.</div>')+
  '</div>';
}

function rerenderRows(){ renderTop(); renderList(); }

function toggleDetail(id){
  if(S.open===id){ S.open=null; rerenderRows(); return; }
  S.open=id; rerenderRows();
  if(S.detail[id]) return;
  api('/api/affiliates/'+encodeURIComponent(id)).then(function(r){
    S.detail[id]=r.data;
    if(S.open===id) rerenderRows();
  }).catch(showErr);
}

/* ---------- record delivery ---------- */
function saveDelivered(id){
  var week = S.overview && S.overview.currentWeek ? S.overview.currentWeek.week_start : null;
  if(!week){ showErr(new Error('No week has been calculated yet, so there is nothing to record against.')); return; }

  var input=el('d-'+id);
  var val=parseInt(input.value,10);
  if(isNaN(val)||val<0){ showErr(new Error('Enter a whole number of leads, zero or more.')); return; }

  el('topErr').classList.add('hide');

  api('/api/rewards/delivered',{
    method:'POST',
    headers:{'Content-Type':'application/json'},
    body:JSON.stringify({week_start:week,affiliate_id:id,leads_delivered:val})
  }).then(function(){
    delete S.detail[id];
    toast('Recorded '+num(val)+' leads delivered');
    return loadAll();
  }).catch(showErr);
}

/* ---------- activity ---------- */
function renderActivity(){
  var host=el('activity'), rows=S.activity||[];
  if(!rows.length){
    host.innerHTML='<div style="color:#6D7F8A;font-size:13.5px">No pulls recorded yet.</div>';
    return;
  }
  host.innerHTML='<table><thead><tr><th>Started</th><th>Result</th>'+
    '<th class="num">Scanned</th><th class="num">Synced</th><th class="num">Took</th></tr></thead><tbody>'+
    rows.map(function(r){
      var cls = r.status==='success'?'ok' : r.status==='failed'?'bad' : 'warn';
      return '<tr><td>'+fmtTime(r.sync_started)+'</td>'+
        '<td><span class="pill '+cls+'">'+esc(r.status)+'</span>'+
        (r.error_message?'<div style="color:#96291A;font-size:12px;margin-top:5px">'+esc(r.error_message)+'</div>':'')+
        '</td>'+
        '<td class="num">'+num(r.records_processed)+'</td>'+
        '<td class="num">'+num(r.records_inserted)+'</td>'+
        '<td class="num">'+took(r.sync_started,r.sync_finished)+'</td></tr>';
    }).join('')+'</tbody></table>';
}

/* ---------- actions ---------- */
el('refreshBtn').addEventListener('click',function(){
  S.detail={}; S.activity=null;
  loadAll().then(function(){ toast('Refreshed'); });
});

el('syncBtn').addEventListener('click',function(){
  var b=el('syncBtn');
  b.disabled=true; b.innerHTML='<span class="spinner"></span>Pulling from GHL';
  el('topErr').classList.add('hide');

  api('/sync').then(function(){
    b.innerHTML='<span class="spinner"></span>Calculating rewards';
    return api('/rewards/calculate');
  }).then(function(){
    S.detail={}; S.activity=null;
    return loadAll();
  }).then(function(){
    toast('Up to date with GHL');
  }).catch(showErr).then(function(){
    b.disabled=false; b.textContent='Pull latest from GHL';
  });
});

/* ---------- resume session ---------- */
if(KEY){
  api('/api/overview').then(enter).catch(function(){
    sessionStorage.removeItem('arp_key'); KEY='';
  });
}
</script>
</body>
</html>`;

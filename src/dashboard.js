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
  :root{
    --navy:#0B2C3D; --navy2:#143F54; --navy3:#1D5570;
    --green:#1F9D55; --mint:#7FD4A3; --amber:#C0761F; --gold:#F0B267;
    --paper:#F6F5F1; --card:#FFF; --ink:#16232B; --muted:#6D7F8A;
    --line:#E4E2DA; --line2:#EFEDE6;
    --shadow:0 1px 2px rgba(11,44,61,.05), 0 8px 24px -12px rgba(11,44,61,.14);
  }
  *{box-sizing:border-box}
  body{margin:0;background:var(--paper);color:var(--ink);
    font-family:'Inter',system-ui,sans-serif;font-size:15px;line-height:1.5;
    -webkit-font-smoothing:antialiased}
  .wrap{max-width:1120px;margin:0 auto;padding:0 24px}
  .serif{font-family:'Instrument Serif',Georgia,serif;font-weight:400}
  .mono{font-family:'IBM Plex Mono',monospace}

  @keyframes rise{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:none}}
  @keyframes fade{from{opacity:0}to{opacity:1}}
  @keyframes slideIn{from{opacity:0;transform:translateY(16px) scale(.97)}to{opacity:1;transform:none}}
  @keyframes spin{to{transform:rotate(360deg)}}
  @keyframes pulse{0%,100%{opacity:1}50%{opacity:.35}}
  .rise{animation:rise .5s cubic-bezier(.22,1,.36,1) both}
  .d1{animation-delay:.04s}.d2{animation-delay:.08s}.d3{animation-delay:.12s}
  .d4{animation-delay:.16s}.d5{animation-delay:.2s}.d6{animation-delay:.24s}

  .masthead{background:var(--navy);color:#fff}
  .mhtop{display:flex;align-items:center;justify-content:space-between;gap:20px;
    flex-wrap:wrap;padding:20px 0 16px}
  .mark{font-family:'Instrument Serif',Georgia,serif;font-size:25px;
    display:flex;align-items:center;gap:10px}
  .mark em{font-style:italic;color:var(--mint)}
  .dot{width:7px;height:7px;border-radius:99px;background:var(--mint);
    box-shadow:0 0 0 4px rgba(127,212,163,.18)}
  .weekstamp{font-family:'IBM Plex Mono',monospace;font-size:11.5px;letter-spacing:.09em;
    text-transform:uppercase;color:#9DB6C2}
  .tabs{display:flex;gap:2px;border-bottom:1px solid rgba(255,255,255,.12)}
  .tab{background:none;border:0;color:#9DB6C2;font:inherit;font-size:14px;font-weight:500;
    padding:11px 16px;cursor:pointer;position:relative;border-radius:3px 3px 0 0;
    transition:color .2s,background .2s;white-space:nowrap}
  .tab:hover{color:#fff;background:rgba(255,255,255,.05)}
  .tab[aria-selected=true]{color:#fff}
  .tab[aria-selected=true]::after{content:'';position:absolute;left:14px;right:14px;bottom:-1px;
    height:2px;background:var(--mint);border-radius:2px;animation:fade .25s both}
  .masthead .tab:focus-visible{outline:2px solid var(--mint);outline-offset:2px}
  .tabdot{display:inline-block;min-width:17px;height:17px;line-height:17px;padding:0 5px;
    border-radius:99px;background:var(--gold);color:var(--navy);font-size:10.5px;
    font-weight:600;text-align:center;margin-left:7px;font-family:'IBM Plex Mono',monospace}

  .ledger{background:var(--navy2);color:#fff}
  .figs{display:grid;grid-template-columns:repeat(4,1fr)}
  .fig{padding:26px 26px 30px;position:relative}
  .fig+.fig::before{content:'';position:absolute;left:0;top:26px;bottom:26px;width:1px;
    background:rgba(255,255,255,.13)}
  .fig.hero{background:rgba(240,178,103,.09)}
  .fig .n{font-family:'Instrument Serif',Georgia,serif;font-size:46px;line-height:1;
    font-variant-numeric:tabular-nums}
  .fig .n.gold{color:var(--gold)} .fig .n.mint{color:var(--mint)}
  .fig .k{margin-top:9px;font-size:10.5px;letter-spacing:.11em;text-transform:uppercase;
    color:#9DB6C2}
  .fig .sub{margin-top:5px;font-size:12px;color:#7593A3;font-family:'IBM Plex Mono',monospace}

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

  .chart{padding:22px 24px 18px}
  .chart h3,.side h3{font-size:10.5px;letter-spacing:.11em;text-transform:uppercase;
    color:var(--muted);margin:0 0 14px;font-weight:600}
  .bars{display:flex;align-items:flex-end;gap:8px;height:150px}
  .bar{flex:1;display:flex;flex-direction:column;justify-content:flex-end;gap:3px;min-width:0}
  .bseg{border-radius:2px 2px 0 0;transition:height .6s cubic-bezier(.22,1,.36,1)}
  .bseg.owe{background:#DCE6EA}
  .bseg.got{background:var(--green);border-radius:0 0 2px 2px}
  .blab{margin-top:8px;font-size:10px;color:var(--muted);text-align:center;
    font-family:'IBM Plex Mono',monospace;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
  .legend{display:flex;gap:16px;margin-top:14px;padding-top:13px;border-top:1px solid var(--line2);
    font-size:12px;color:var(--muted)}
  .legend i{width:9px;height:9px;border-radius:2px;display:inline-block;margin-right:6px}

  .side{padding:22px 24px}
  .kv{display:flex;justify-content:space-between;gap:12px;padding:10px 0;
    border-bottom:1px solid var(--line2);font-size:13.5px}
  .kv:last-of-type{border-bottom:0}
  .kv .k{color:var(--muted)}
  .kv .v{font-family:'IBM Plex Mono',monospace;font-variant-numeric:tabular-nums}

  /* alert banner */
  .alert{background:#FDF6EC;border:1px solid #F0DCC0;border-radius:4px;padding:16px 18px;
    margin-bottom:16px;display:flex;gap:14px;align-items:flex-start;flex-wrap:wrap;
    animation:rise .4s both}
  .alert .txt{flex:1;min-width:240px;font-size:13.5px}
  .alert .txt strong{display:block;margin-bottom:3px;font-weight:500;font-size:14.5px}

  /* rows */
  .row{background:var(--card);border:1px solid var(--line);border-radius:4px;
    padding:20px 22px;margin-bottom:10px;box-shadow:var(--shadow);transition:border-color .2s}
  .row:hover{border-color:#CFD8D3}
  .row.settled{border-left:3px solid var(--green)}
  .row.owing{border-left:3px solid var(--gold)}
  .row.unlinked{border-left:3px solid #C9C4B6}
  .rowtop{display:flex;justify-content:space-between;align-items:flex-start;gap:18px;
    flex-wrap:wrap}
  .who{font-size:17px;font-weight:500;display:flex;align-items:center;gap:9px;flex-wrap:wrap}
  .refcode{font-family:'IBM Plex Mono',monospace;font-size:12px;color:var(--muted);
    background:var(--line2);padding:2px 8px;border-radius:99px}
  .facts{margin-top:5px;font-size:13px;color:var(--muted);font-variant-numeric:tabular-nums}
  .facts span+span::before{content:' \\00b7 '}
  .balbox{text-align:right}
  .balnum{font-family:'Instrument Serif',Georgia,serif;font-size:34px;line-height:1;
    font-variant-numeric:tabular-nums;color:var(--amber)}
  .balnum.zero{color:var(--green)}
  .ballab{font-size:10.5px;letter-spacing:.09em;text-transform:uppercase;color:var(--muted);
    margin-top:5px}

  .gauge{margin-top:16px}
  .track{height:8px;background:var(--line2);border-radius:99px;overflow:hidden}
  .fill{height:100%;border-radius:99px;background:var(--green);width:0;
    transition:width .75s cubic-bezier(.22,1,.36,1)}
  .fill.short{background:linear-gradient(90deg,var(--amber),var(--gold))}
  .glab{margin-top:8px;font-size:12px;font-family:'IBM Plex Mono',monospace;color:var(--muted);
    display:flex;justify-content:space-between;gap:12px}

  .deliver{margin-top:16px;padding-top:15px;border-top:1px solid var(--line2)}
  .dlabel{font-size:10.5px;letter-spacing:.09em;text-transform:uppercase;color:var(--muted);
    margin-bottom:9px}
  .amounts{display:flex;gap:7px;flex-wrap:wrap;align-items:center}
  .amt{font-family:'IBM Plex Mono',monospace;font-size:13.5px;font-weight:500;
    padding:8px 13px;border-radius:3px;border:1px solid var(--line);background:#fff;
    color:var(--ink);cursor:pointer;transition:all .16s}
  .amt:hover{border-color:var(--green);background:#F2FAF5;color:#14663A}
  .amt.all{border-color:var(--navy);background:var(--navy);color:#fff}
  .amt.all:hover{background:var(--navy2);color:#fff}
  .amtwrap{display:flex;align-items:center;gap:6px;margin-left:4px}
  .amtwrap span{font-size:12.5px;color:var(--muted)}

  .confirm{margin-top:14px;padding:14px 16px;background:#FDF6EC;border:1px solid #F0DCC0;
    border-radius:3px;animation:rise .28s both;display:flex;align-items:center;gap:12px;
    flex-wrap:wrap}
  .confirm .q{font-size:14px;flex:1;min-width:200px}
  .confirm .q b{font-family:'IBM Plex Mono',monospace}
  .settledmsg{margin-top:16px;padding-top:15px;border-top:1px solid var(--line2);
    font-size:13px;color:var(--muted)}

  .rowlinks{margin-top:14px;display:flex;gap:14px;align-items:center;flex-wrap:wrap}
  .spark{margin-left:auto;display:flex;align-items:flex-end;gap:2px;height:22px}
  .spark i{width:4px;background:#CBD9DF;border-radius:1px;display:block}
  .spark i:last-child{background:var(--navy3)}

  /* link cards */
  .linkrow{background:var(--card);border:1px solid var(--line);border-radius:4px;
    padding:18px 20px;margin-bottom:10px;box-shadow:var(--shadow);
    border-left:3px solid var(--gold)}
  .linkrow .head{display:flex;justify-content:space-between;gap:16px;flex-wrap:wrap;
    align-items:flex-start}
  .bigcode{font-family:'IBM Plex Mono',monospace;font-size:17px;font-weight:500}
  .linkctl{margin-top:14px;padding-top:14px;border-top:1px solid var(--line2);
    display:flex;gap:9px;align-items:center;flex-wrap:wrap}
  select{font:inherit;font-size:14px;padding:8px 11px;border:1px solid var(--line);
    border-radius:3px;background:#fff;color:var(--ink);max-width:100%}
  select:focus{outline:0;border-color:var(--green);box-shadow:0 0 0 3px rgba(31,157,85,.13)}

  input[type=number],input[type=password],input[type=search],input[type=text]{
    font:inherit;font-family:'IBM Plex Mono',monospace;padding:8px 11px;
    border:1px solid var(--line);border-radius:3px;background:#fff;color:var(--ink);width:104px;
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
  button.go{background:var(--green);border-color:var(--green)}
  button.go:hover{background:#1A8749}
  button.link{background:none;border:0;color:var(--navy);padding:0;font-size:13px;
    text-decoration:underline;text-underline-offset:3px}
  button.link:hover{background:none;color:var(--green)}
  button.link.danger{color:#96291A}
  button[disabled]{opacity:.55;cursor:default;transform:none}
  .spinner{width:13px;height:13px;border:2px solid rgba(255,255,255,.32);
    border-top-color:#fff;border-radius:99px;animation:spin .7s linear infinite;flex:none}

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
  tbody tr:hover{background:#FAFAF7}
  td.num,th.num{text-align:right;padding-right:0}

  .pill{display:inline-block;font-size:10.5px;font-weight:500;letter-spacing:.06em;
    text-transform:uppercase;padding:3px 9px;border-radius:99px;white-space:nowrap}
  .pill.ok{background:#E3F3E9;color:#14663A}
  .pill.dead{background:#EFEDE6;color:#7A7367}
  .pill.warn{background:#FBEEDC;color:#8A5311}
  .pill.bad{background:#FBE6E2;color:#96291A}

  .toast{position:fixed;left:50%;bottom:26px;transform:translateX(-50%);z-index:60;
    background:var(--navy);color:#fff;padding:12px 20px;border-radius:4px;font-size:14px;
    box-shadow:0 12px 32px -8px rgba(11,44,61,.42);
    animation:slideIn .3s cubic-bezier(.22,1,.36,1) both;
    display:flex;align-items:center;gap:10px;max-width:calc(100vw - 40px)}
  .toast i{width:7px;height:7px;border-radius:99px;background:var(--mint);flex:none}
  .toast.bad i{background:#F08A78}

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
    .balbox{text-align:left}
  }
  @media(prefers-reduced-motion:reduce){ *,*::after{animation:none!important;transition:none!important} }
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
        <button class="tab" role="tab" data-tab="linking" aria-selected="false">Linking<span class="tabdot hide" id="linkDot">0</span></button>
        <button class="tab" role="tab" data-tab="deliveries" aria-selected="false">Deliveries</button>
        <button class="tab" role="tab" data-tab="activity" aria-selected="false">Activity</button>
      </div>
    </div>
  </header>

  <div class="ledger">
    <div class="wrap">
      <div class="figs">
        <div class="fig hero rise d1">
          <div class="n gold" id="fBalance">0</div>
          <div class="k">Leads still owed</div>
          <div class="sub" id="sBalance">&mdash;</div>
        </div>
        <div class="fig rise d2">
          <div class="n" id="fOwed">0</div>
          <div class="k">Earned all time</div>
          <div class="sub" id="sOwed">&mdash;</div>
        </div>
        <div class="fig rise d3">
          <div class="n mint" id="fDelivered">0</div>
          <div class="k">Delivered all time</div>
          <div class="sub" id="sDelivered">&mdash;</div>
        </div>
        <div class="fig rise d4">
          <div class="n" id="fRate">0</div>
          <div class="k">Adding per week</div>
          <div class="sub" id="sRate">&mdash;</div>
        </div>
      </div>
    </div>
  </div>

  <div class="wrap">
    <p class="err hide" id="topErr"></p>

    <div class="panel" id="p-overview">
      <div id="alertHost"></div>

      <div class="sechead">
        <h2>The <em>week</em> in review</h2>
        <div style="display:flex;gap:8px;flex-wrap:wrap">
          <button class="ghost" id="refreshBtn">Refresh</button>
          <button id="syncBtn">Pull latest from GHL</button>
        </div>
      </div>

      <div class="grid2">
        <div class="card chart rise d1">
          <h3>Leads earned vs delivered, by week</h3>
          <div class="bars" id="bars"></div>
          <div class="legend">
            <span><i style="background:#DCE6EA"></i>Earned</span>
            <span><i style="background:#1F9D55"></i>Delivered</span>
          </div>
        </div>

        <div class="card side rise d2">
          <h3>Where things stand</h3>
          <div class="kv"><span class="k">Affiliates</span><span class="v" id="kAff">&mdash;</span></div>
          <div class="kv"><span class="k">Active referrals</span><span class="v" id="kActive">&mdash;</span></div>
          <div class="kv"><span class="k">Cancelled</span><span class="v" id="kCancel">&mdash;</span></div>
          <div class="kv"><span class="k">Referred revenue</span><span class="v" id="kRev">&mdash;</span></div>
          <div class="kv"><span class="k">Deliveries logged</span><span class="v" id="kDel">&mdash;</span></div>
          <div class="kv"><span class="k">Last delivery</span><span class="v" id="kLastDel">&mdash;</span></div>
          <div class="kv"><span class="k">Last pull</span><span class="v" id="kSync">&mdash;</span></div>
        </div>
      </div>

      <div class="sechead" style="margin-top:34px">
        <h2>Owed the <em>most</em></h2>
        <span class="hint">Deliver leads, then record the amount here</span>
      </div>
      <div id="topList"></div>
    </div>

    <div class="panel" id="p-affiliates" hidden>
      <div class="sechead">
        <h2>Every <em>affiliate</em></h2>
        <input type="search" id="search" placeholder="Search by name or code" autocomplete="off">
      </div>
      <div id="list"></div>
    </div>

    <div class="panel" id="p-linking" hidden>
      <div class="sechead">
        <h2>Referral <em>codes</em></h2>
        <button class="ghost" id="scanBtn">Scan for new codes</button>
      </div>
      <p style="font-size:13.5px;color:var(--muted);margin:0 0 18px;max-width:640px">
        GHL records each sale against a referral code such as <b>marcus8575</b>, but does not
        publish which affiliate owns it. Link each code once and every future sale attributes
        automatically.
      </p>
      <div id="linking"><div class="skel" style="width:55%"></div></div>
    </div>

    <div class="panel" id="p-deliveries" hidden>
      <div class="sechead">
        <h2>Delivery <em>log</em></h2>
        <span class="hint">Every send, newest first. Remove an entry to correct a mistake.</span>
      </div>
      <div class="card" style="padding:20px 22px" id="deliveries">
        <div class="skel" style="width:60%"></div>
      </div>
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
var S = { overview:null, affiliates:[], activity:null, deliveries:null, unlinked:null,
          open:null, detail:{}, pending:null, tab:'overview', q:'', ignored:null };

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
  var reduce=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  target=Number(target)||0;
  if(reduce||target===0){ node.textContent=num(target); return; }
  var start=performance.now(), span=750;
  function step(now){
    var p=Math.min(1,(now-start)/span);
    node.textContent=num(Math.round(target*(1-Math.pow(1-p,3))));
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
  setTimeout(function(){ if(t.parentNode) t.remove(); },3800);
}

function api(path,opts){
  opts=opts||{};
  var sep=path.indexOf('?')===-1?'?':'&';
  return fetch(path+sep+'secret='+encodeURIComponent(KEY),opts).then(function(r){
    return r.json().then(function(j){
      if(!r.ok||j.success===false) throw new Error(j.error||('Request failed ('+r.status+')'));
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
    sessionStorage.setItem('arp_key',KEY); enter();
  }).catch(function(e){
    var n=el('gateErr');
    n.textContent=e.message==='Unauthorized'
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
function switchTab(name){
  S.tab=name;
  Array.prototype.forEach.call(document.querySelectorAll('.tab'),function(x){
    x.setAttribute('aria-selected', x.getAttribute('data-tab')===name?'true':'false');
  });
  ['overview','affiliates','linking','deliveries','activity'].forEach(function(n){
    var p=el('p-'+n);
    p.hidden=n!==name;
    if(n===name){ p.classList.remove('rise'); void p.offsetWidth; p.classList.add('rise'); }
  });
  if(name==='affiliates') renderList();
  if(name==='linking' && !S.unlinked) loadUnlinked();
  if(name==='deliveries' && !S.deliveries) loadDeliveries();
  if(name==='activity' && !S.activity) loadActivity();
}
Array.prototype.forEach.call(document.querySelectorAll('.tab'),function(t){
  t.addEventListener('click',function(){ switchTab(t.getAttribute('data-tab')); });
});

/* ---------- load ---------- */
function loadAll(){
  el('topErr').classList.add('hide');
  return Promise.all([api('/api/overview'),api('/api/affiliates')]).then(function(r){
    S.overview=r[0].data;
    S.affiliates=r[1].data||[];
    renderLedger(); renderChart(); renderSide(); renderAlert(); renderTop(); renderList();
  }).catch(showErr);
}
function loadActivity(){
  return api('/api/activity').then(function(r){ S.activity=r.data||[]; renderActivity(); })
    .catch(showErr);
}
function loadDeliveries(){
  return api('/api/deliveries').then(function(r){ S.deliveries=r.data||[]; renderDeliveries(); })
    .catch(showErr);
}
function loadUnlinked(){
  el('linking').innerHTML='<div class="skel" style="width:55%"></div>';
  return Promise.all([api('/api/unlinked'), api('/api/ignored')]).then(function(r){
    S.unlinked=r[0].data||[];
    S.ignored=r[1].data||[];
    renderLinking(); renderDot();
  }).catch(function(e){
    el('linking').innerHTML='<div class="note">Could not scan: '+esc(e.message)+'</div>';
  });
}
function showErr(e){
  var n=el('topErr'); n.textContent=e.message; n.classList.remove('hide');
  toast(e.message,true);
}

function renderDot(){
  var n=(S.unlinked||[]).length, d=el('linkDot');
  if(n>0){ d.textContent=n; d.classList.remove('hide'); }
  else d.classList.add('hide');
}

/* ---------- ledger ---------- */
function renderLedger(){
  var o=S.overview; if(!o) return;
  var L=o.lifetime||{}, w=o.currentWeek||{};

  el('weekStamp').textContent = w.week_start
    ? 'Week of '+fmtDate(w.week_start)+' \\u2013 '+fmtDate(w.week_end)
    : 'No week calculated yet';

  countTo(el('fBalance'), Math.max(0,L.balance||0));
  countTo(el('fOwed'), L.leads_owed);
  countTo(el('fDelivered'), L.leads_delivered);
  countTo(el('fRate'), w.leads_owed);

  var bal=L.balance||0;
  el('sBalance').textContent = bal>0 ? 'Across '+num(o.affiliates)+' affiliate'+(o.affiliates===1?'':'s')
    : bal<0 ? num(-bal)+' delivered ahead' : 'Everyone is settled';
  el('sOwed').textContent='Since the programme began';
  el('sDelivered').textContent=num(L.deliveries)+' deliver'+(L.deliveries===1?'y':'ies')+' logged';
  el('sRate').textContent=num(o.subscriptions?o.subscriptions.active:0)+' active referrals';

  var s=o.lastSync;
  el('syncInfo').textContent = s
    ? 'Last pull '+ago(s.sync_started)+' \\u00b7 '+s.status+' \\u00b7 '+num(s.records_processed)+' scanned'
    : 'No pull recorded yet';
  el('revInfo').textContent=money(o.activeWeeklyRevenue)+'/wk referred revenue';
}

function renderAlert(){
  var o=S.overview, host=el('alertHost');
  var n=o&&o.unlinkedAffiliates||0;

  if(!n){ host.innerHTML=''; return; }

  host.innerHTML='<div class="alert"><div class="txt">'+
    '<strong>'+num(n)+' affiliate'+(n===1?' has':'s have')+' no referral code linked</strong>'+
    'Their sales cannot be attributed until a code is linked. Everything else still works.'+
    '</div><button class="ghost" id="goLink">Open linking</button></div>';

  el('goLink').addEventListener('click',function(){ switchTab('linking'); });
}

function renderChart(){
  var t=(S.overview&&S.overview.trend)||[], host=el('bars');
  if(!t.length){
    host.innerHTML='<div style="color:#6D7F8A;font-size:13.5px;align-self:center;width:100%;text-align:center">No weeks calculated yet.</div>';
    return;
  }
  var max=Math.max.apply(null,t.map(function(w){
    return Math.max(w.leads_owed||0,w.leads_delivered||0); }));
  if(max<=0) max=1;

  host.innerHTML=t.map(function(w){
    var o=w.leads_owed||0, g=w.leads_delivered||0;
    var hO=o>0?Math.max(3,Math.round((o/max)*112)):0;
    var hG=g>0?Math.max(3,Math.round((g/max)*112)):0;
    return '<div class="bar" title="'+fmtShort(w.week_start)+' \\u2014 earned '+num(o)+', delivered '+num(g)+'">'+
      (hO?'<div class="bseg owe" style="height:0" data-h="'+hO+'"></div>':'')+
      (hG?'<div class="bseg got" style="height:0" data-h="'+hG+'"></div>':'')+
      '<div class="blab">'+fmtShort(w.week_start)+'</div></div>';
  }).join('');

  requestAnimationFrame(function(){
    Array.prototype.forEach.call(host.querySelectorAll('.bseg'),function(b,i){
      setTimeout(function(){ b.style.height=b.getAttribute('data-h')+'px'; },40+i*35);
    });
  });
}

function renderSide(){
  var o=S.overview; if(!o) return;
  var s=o.subscriptions||{}, L=o.lifetime||{};
  el('kAff').textContent=num(o.affiliates);
  el('kActive').textContent=num(s.active);
  el('kCancel').textContent=num(s.canceled);
  el('kRev').textContent=money(o.activeWeeklyRevenue);
  el('kDel').textContent=num(L.deliveries);
  el('kLastDel').textContent=o.lastDelivery?ago(o.lastDelivery):'never';
  el('kSync').textContent=o.lastSync?ago(o.lastSync.sync_started):'never';
}

/* ---------- delivery controls ---------- */
var QUICK=[40,100,200,500,1000];

function deliverHtml(a){
  var bal=a.balance||0;

  if(!a.linked){
    return '<div class="settledmsg">No referral code linked yet, so no sales are attributed here. '+
      'Link one on the Linking tab.</div>';
  }

  if(S.pending && S.pending.id===a.id){
    return '<div class="confirm">'+
      '<div class="q">Record <b>'+num(S.pending.leads)+'</b> leads delivered to <b>'+esc(a.name)+'</b>? '+
      'Their balance becomes <b>'+num(bal-S.pending.leads)+'</b>.</div>'+
      '<button class="go" data-confirm="'+esc(a.id)+'">Confirm</button>'+
      '<button class="ghost" data-cancel="1">Cancel</button>'+
    '</div>';
  }

  if(bal<=0){
    return '<div class="settledmsg">Nothing outstanding. Leads will accrue again with the next weekly calculation.</div>';
  }

  var picks=QUICK.filter(function(n){ return n<bal; });

  return '<div class="deliver">'+
    '<div class="dlabel">I just delivered</div>'+
    '<div class="amounts">'+
      picks.map(function(n){
        return '<button class="amt" data-amt="'+esc(a.id)+'" data-n="'+n+'">'+num(n)+'</button>';
      }).join('')+
      '<button class="amt all" data-amt="'+esc(a.id)+'" data-n="'+bal+'">All '+num(bal)+'</button>'+
      '<span class="amtwrap"><span>or</span>'+
        '<input type="number" min="1" placeholder="amount" id="c-'+esc(a.id)+'">'+
        '<button class="ghost" data-custom="'+esc(a.id)+'">Record</button>'+
      '</span>'+
    '</div>'+
  '</div>';
}

/* ---------- rows ---------- */
function rowHtml(a,i){
  var owed=a.lifetime_owed||0, got=a.lifetime_delivered||0, bal=a.balance||0;
  var pct=owed>0?Math.min(100,Math.round((got/owed)*100)):0;
  var settled=bal<=0;
  var cls = !a.linked ? 'unlinked' : (settled?'settled':'owing');

  var spark=(a.spark||[]);
  var smax=Math.max.apply(null,spark.concat([1]));
  var sparkHtml=spark.length>1
    ? '<div class="spark" title="Leads earned, recent weeks">'+spark.map(function(v){
        return '<i style="height:'+Math.max(3,Math.round((v/smax)*22))+'px"></i>'; }).join('')+'</div>'
    : '';

  return '<div class="row '+cls+' rise d'+Math.min(6,i+1)+'">'+
    '<div class="rowtop">'+
      '<div>'+
        '<div class="who">'+esc(a.name)+
          (a.linked?'<span class="refcode">'+esc(a.code)+'</span>'
                   :'<span class="pill warn">Not linked</span>')+
          (a.status!=='active'?'<span class="pill dead">'+esc(a.status)+'</span>':'')+
        '</div>'+
        '<div class="facts">'+
          (a.email?'<span>'+esc(a.email)+'</span>':'')+
          '<span>'+num(a.active_referrals)+' active</span>'+
          '<span>'+num(a.weekly_rate)+'/week</span>'+
          '<span>'+money(a.weekly_revenue)+'/wk</span>'+
        '</div>'+
      '</div>'+
      '<div class="balbox">'+
        '<div class="balnum'+(settled?' zero':'')+'">'+num(Math.max(0,bal))+'</div>'+
        '<div class="ballab">'+(settled?'All settled':'Leads owed')+'</div>'+
      '</div>'+
    '</div>'+
    '<div class="gauge">'+
      '<div class="track"><div class="fill'+(settled?'':' short')+'" data-w="'+pct+'"></div></div>'+
      '<div class="glab"><span>'+num(got)+' of '+num(owed)+' delivered</span><span>'+pct+'%</span></div>'+
    '</div>'+
    deliverHtml(a)+
    '<div class="rowlinks">'+
      '<button class="link" data-open="'+esc(a.id)+'">'+
        (S.open===a.id?'Hide details':'View details')+'</button>'+
      (a.linked?'<button class="link danger" data-unlink="'+esc(a.id)+'">Unlink code</button>':'')+
      sparkHtml+
    '</div>'+
    (S.open===a.id?detailHtml(a.id):'')+
  '</div>';
}

function animateFills(host){
  requestAnimationFrame(function(){
    Array.prototype.forEach.call(host.querySelectorAll('.fill'),function(f,i){
      setTimeout(function(){ f.style.width=f.getAttribute('data-w')+'%'; },60+i*60);
    });
  });
}

function bindRows(host){
  Array.prototype.forEach.call(host.querySelectorAll('[data-open]'),function(b){
    b.addEventListener('click',function(){ toggleDetail(b.getAttribute('data-open')); });
  });
  Array.prototype.forEach.call(host.querySelectorAll('[data-amt]'),function(b){
    b.addEventListener('click',function(){
      askConfirm(b.getAttribute('data-amt'), parseInt(b.getAttribute('data-n'),10));
    });
  });
  Array.prototype.forEach.call(host.querySelectorAll('[data-custom]'),function(b){
    b.addEventListener('click',function(){
      var id=b.getAttribute('data-custom');
      var v=parseInt(el('c-'+id).value,10);
      if(isNaN(v)||v<=0){ toast('Enter a whole number greater than zero.',true); return; }
      askConfirm(id,v);
    });
  });
  Array.prototype.forEach.call(host.querySelectorAll('[data-confirm]'),function(b){
    b.addEventListener('click',function(){ doDeliver(b.getAttribute('data-confirm')); });
  });
  Array.prototype.forEach.call(host.querySelectorAll('[data-cancel]'),function(b){
    b.addEventListener('click',function(){ S.pending=null; rerenderRows(); });
  });
  Array.prototype.forEach.call(host.querySelectorAll('[data-undo]'),function(b){
    b.addEventListener('click',function(){ undoDelivery(b.getAttribute('data-undo')); });
  });
  Array.prototype.forEach.call(host.querySelectorAll('[data-unlink]'),function(b){
    b.addEventListener('click',function(){ doUnlink(b.getAttribute('data-unlink')); });
  });
}

function renderTop(){
  var host=el('topList');
  var owing=S.affiliates.filter(function(a){ return (a.balance||0)>0; })
    .sort(function(x,y){ return (y.balance||0)-(x.balance||0); }).slice(0,3);

  if(!owing.length){
    host.innerHTML='<div class="note"><strong>Nothing outstanding</strong>Every affiliate has received the leads they have earned.</div>';
    return;
  }
  host.innerHTML=owing.map(rowHtml).join('');
  animateFills(host); bindRows(host);
}

function renderList(){
  var host=el('list');
  var q=S.q.trim().toLowerCase();
  var items=q?S.affiliates.filter(function(a){
    return String(a.name||'').toLowerCase().indexOf(q)!==-1
        || String(a.code||'').toLowerCase().indexOf(q)!==-1
        || String(a.email||'').toLowerCase().indexOf(q)!==-1;
  }):S.affiliates;

  if(!S.affiliates.length){
    host.innerHTML='<div class="note"><strong>No affiliates yet</strong>Add an affiliate to the Lead Payout Campaign in GHL, then pull the latest data.</div>';
    return;
  }
  if(!items.length){
    host.innerHTML='<div class="note"><strong>No match</strong>Nothing matches that search.</div>';
    return;
  }
  host.innerHTML=items.map(rowHtml).join('');
  animateFills(host); bindRows(host);
}

el('search').addEventListener('input',function(e){ S.q=e.target.value; renderList(); });

/* ---------- linking ---------- */
function ignoredHtml(){
  var rows=S.ignored||[];
  if(!rows.length) return '';

  return '<div style="margin-top:30px">'+
    '<h3 style="font-size:10.5px;letter-spacing:.11em;text-transform:uppercase;'+
    'color:var(--muted);margin:0 0 10px;font-weight:600">Ignored codes</h3>'+
    '<div class="card" style="padding:16px 20px">'+
      '<table><thead><tr><th>Code</th><th>Reason</th><th class="num"></th></tr></thead><tbody>'+
      rows.map(function(r){
        return '<tr><td class="mono">'+esc(r.referral_code)+'</td>'+
          '<td style="color:var(--muted)">'+esc(r.reason||'')+'</td>'+
          '<td class="num"><button class="link" data-unignore="'+esc(r.referral_code)+'">Restore</button></td></tr>';
      }).join('')+
      '</tbody></table>'+
    '</div></div>';
}

function renderLinking(){
  var host=el('linking'), rows=S.unlinked||[];
  var open=S.affiliates.filter(function(a){ return !a.linked; });

  var body;

  if(!rows.length){
    body='<div class="note"><strong>Every code is linked</strong>'+
      (open.length
        ? num(open.length)+' affiliate'+(open.length===1?' has':'s have')+' no code yet, but no unclaimed sales exist either. A code will appear here after their first referral.'
        : 'All sales are attributed correctly.')+'</div>';
  } else {
    body=rows.map(function(r){
      var opts=(r.candidates||[]).map(function(cand){
        var sel = r.suggestion && r.suggestion.id===cand.id ? ' selected' : '';
        return '<option value="'+esc(cand.id)+'"'+sel+'>'+esc(cand.name||cand.email||cand.id)+'</option>';
      }).join('');

      return '<div class="linkrow">'+
        '<div class="head">'+
          '<div>'+
            '<div class="bigcode">'+esc(r.code)+'</div>'+
            '<div class="facts">'+
              '<span>'+num(r.subscriptions)+' sale'+(r.subscriptions===1?'':'s')+'</span>'+
              '<span>'+num(r.active)+' still active</span>'+
            '</div>'+
          '</div>'+
          (r.suggestion
            ? '<span class="pill ok">Looks like '+esc(r.suggestion.name)+'</span>'
            : r.ambiguous
              ? '<span class="pill warn">Several possible matches</span>'
              : '<span class="pill dead">No obvious match</span>')+
        '</div>'+
        '<div class="linkctl">'+
          (opts
            ? '<select id="sel-'+esc(r.code)+'">'+opts+'</select>'+
              '<button class="go" data-link="'+esc(r.code)+'">Link this code</button>'
            : '<span style="font-size:13.5px;color:var(--muted)">Every affiliate already has a code. Add the affiliate in GHL and pull again.</span>')+
          '<button class="link danger" data-ignore="'+esc(r.code)+'" '+
            'title="Hide this code. Use it for sales made while testing.">Ignore this code</button>'+
        '</div>'+
      '</div>';
    }).join('');
  }

  host.innerHTML = body + ignoredHtml();

  Array.prototype.forEach.call(host.querySelectorAll('[data-link]'),function(b){
    b.addEventListener('click',function(){
      var code=b.getAttribute('data-link');
      var sel=el('sel-'+code);
      if(!sel) return;
      doLink(sel.value, code, b);
    });
  });

  Array.prototype.forEach.call(host.querySelectorAll('[data-ignore]'),function(b){
    b.addEventListener('click',function(){ doIgnore(b.getAttribute('data-ignore'), b); });
  });

  Array.prototype.forEach.call(host.querySelectorAll('[data-unignore]'),function(b){
    b.addEventListener('click',function(){ doUnignore(b.getAttribute('data-unignore')); });
  });
}

function doIgnore(code, btn){
  btn.disabled=true; btn.textContent='Ignoring';

  api('/api/ignored',{
    method:'POST',
    headers:{'Content-Type':'application/json'},
    body:JSON.stringify({ referral_code:code, reason:'Dismissed from the portal' })
  }).then(function(){
    toast(code+' will no longer appear here.');
    S.unlinked=null; S.ignored=null;
    return loadUnlinked();
  }).catch(function(e){
    btn.disabled=false; btn.textContent='Ignore this code';
    showErr(e);
  });
}

function doUnignore(code){
  api('/api/ignored/'+encodeURIComponent(code),{ method:'DELETE' }).then(function(){
    toast(code+' restored.');
    S.unlinked=null; S.ignored=null;
    return loadUnlinked();
  }).catch(showErr);
}

function doLink(affiliateId, code, btn){
  btn.disabled=true; btn.innerHTML='<span class="spinner"></span>Linking';

  api('/api/link',{
    method:'POST',
    headers:{'Content-Type':'application/json'},
    body:JSON.stringify({ affiliate_id:affiliateId, referral_code:code })
  }).then(function(r){
    toast('Linked '+code+' to '+(r.data.name||'affiliate')+'. Pull from GHL to attribute their sales.');
    S.unlinked=null; S.detail={};
    return loadAll();
  }).then(function(){ return loadUnlinked(); })
    .catch(function(e){
      btn.disabled=false; btn.textContent='Link this code';
      showErr(e);
    });
}

function doUnlink(id){
  api('/api/link/'+encodeURIComponent(id),{ method:'DELETE' }).then(function(){
    toast('Code unlinked.');
    S.unlinked=null; S.detail={};
    return loadAll();
  }).catch(showErr);
}

el('scanBtn').addEventListener('click',function(){
  var b=el('scanBtn');
  b.disabled=true; b.innerHTML='<span class="spinner"></span>Scanning';
  S.unlinked=null;
  loadUnlinked().then(function(){
    b.disabled=false; b.textContent='Scan for new codes';
  });
});

/* ---------- detail ---------- */
function detailHtml(id){
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

  var dels=(d.deliveries||[]).map(function(x){
    return '<tr><td>'+fmtTime(x.delivered_at)+'</td>'+
      '<td class="num">'+num(x.leads)+'</td>'+
      '<td>'+esc(x.note||'')+'</td>'+
      '<td class="num"><button class="link danger" data-undo="'+esc(x.id)+'">Remove</button></td></tr>';
  }).join('');

  var weeks=(d.weeks||[]).map(function(w){
    return '<tr><td>'+fmtDate(w.week_start)+'</td>'+
      '<td class="num">'+num(w.active_subscriptions)+'</td>'+
      '<td class="num">'+num(w.leads_owed)+'</td></tr>';
  }).join('');

  return '<div class="detail">'+
    '<h3>Deliveries</h3>'+
    (dels?'<table><thead><tr><th>When</th><th class="num">Leads</th><th>Note</th><th class="num"></th></tr></thead><tbody>'+dels+'</tbody></table>'
        :'<div class="note">Nothing delivered yet.</div>')+
    '<h3>Referred subscriptions</h3>'+
    (subs?'<table><thead><tr><th>Customer</th><th>Plan</th><th>Status</th><th class="num">Price</th><th class="num">Started</th></tr></thead><tbody>'+subs+'</tbody></table>'
        :'<div class="note">No referrals recorded.</div>')+
    '<h3>Leads earned each week</h3>'+
    (weeks?'<table><thead><tr><th>Week</th><th class="num">Active referrals</th><th class="num">Leads earned</th></tr></thead><tbody>'+weeks+'</tbody></table>'
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

/* ---------- deliveries ---------- */
function askConfirm(id,leads){ S.pending={ id:id, leads:leads }; rerenderRows(); }

function doDeliver(id){
  if(!S.pending||S.pending.id!==id) return;
  var leads=S.pending.leads;

  api('/api/deliveries',{
    method:'POST',
    headers:{'Content-Type':'application/json'},
    body:JSON.stringify({ affiliate_id:id, leads:leads })
  }).then(function(r){
    S.pending=null; delete S.detail[id]; S.deliveries=null;
    toast('Recorded '+num(leads)+' leads to '+r.data.affiliate_name+'. Balance now '+num(r.data.balance)+'.');
    return loadAll();
  }).catch(function(e){ S.pending=null; rerenderRows(); showErr(e); });
}

function undoDelivery(deliveryId){
  api('/api/deliveries/'+encodeURIComponent(deliveryId),{ method:'DELETE' })
    .then(function(r){
      S.detail={}; S.deliveries=null;
      toast('Removed a delivery of '+num(r.data.removed)+' leads.');
      return loadAll();
    }).then(function(){
      if(S.tab==='deliveries') loadDeliveries();
    }).catch(showErr);
}

function renderDeliveries(){
  var host=el('deliveries'), rows=S.deliveries||[];
  if(!rows.length){
    host.innerHTML='<div style="color:#6D7F8A;font-size:13.5px">No deliveries recorded yet. Send leads in GHL, then record the amount on the affiliate.</div>';
    return;
  }
  host.innerHTML='<table><thead><tr><th>When</th><th>Affiliate</th>'+
    '<th class="num">Leads</th><th>Note</th><th class="num"></th></tr></thead><tbody>'+
    rows.map(function(r){
      return '<tr><td>'+fmtTime(r.delivered_at)+'</td>'+
        '<td>'+esc(r.affiliate_name||'\\u2014')+'</td>'+
        '<td class="num">'+num(r.leads)+'</td>'+
        '<td>'+esc(r.note||'')+'</td>'+
        '<td class="num"><button class="link danger" data-undo="'+esc(r.id)+'">Remove</button></td></tr>';
    }).join('')+'</tbody></table>';
  bindRows(host);
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
      var cls=r.status==='success'?'ok':r.status==='failed'?'bad':'warn';
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
  S.detail={}; S.activity=null; S.deliveries=null; S.pending=null; S.unlinked=null; S.ignored=null;
  loadAll().then(function(){ toast('Refreshed'); });
});

el('syncBtn').addEventListener('click',function(){
  var b=el('syncBtn');
  b.disabled=true; b.innerHTML='<span class="spinner"></span>Pulling from GHL';
  el('topErr').classList.add('hide');

  api('/sync').then(function(r){
    var un=(r.unlinked||[]).length;
    b.innerHTML='<span class="spinner"></span>Calculating rewards';
    return api('/rewards/calculate').then(function(){ return un; });
  }).then(function(un){
    S.detail={}; S.activity=null; S.pending=null; S.unlinked=null;
    return loadAll().then(function(){
      toast(un
        ? 'Up to date. '+un+' referral code'+(un===1?'':'s')+' still need linking.'
        : 'Up to date with GHL');
    });
  }).catch(showErr).then(function(){
    b.disabled=false; b.textContent='Pull latest from GHL';
  });
});

/* ---------- resume ---------- */
if(KEY){
  api('/api/overview').then(enter).catch(function(){
    sessionStorage.removeItem('arp_key'); KEY='';
  });
}
</script>
</body>
</html>`;

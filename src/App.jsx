import { Fragment, useState, useMemo } from "react";
import tournamentData from "./data/wc2026-data.json";

// Fallback data from the original paste; wc2026-data.json is the source used by the app.
const PAST_RESULTS = {
  A: [
    { home:"MEX", away:"RSA", hg:2, ag:0 },
    { home:"KOR", away:"CZE", hg:2, ag:1 },
    { home:"CZE", away:"RSA", hg:1, ag:1 },
    { home:"MEX", away:"KOR", hg:1, ag:0 },
  ],
  B: [
    { home:"CAN", away:"BIH", hg:1, ag:1 },
    { home:"SUI", away:"QAT", hg:1, ag:1 },
    { home:"SUI", away:"BIH", hg:4, ag:1 },
    { home:"CAN", away:"QAT", hg:6, ag:0 },
  ],
  C: [
    { home:"BRA", away:"MAR", hg:1, ag:1 },
    { home:"SCO", away:"HTI", hg:1, ag:0 },
    { home:"MAR", away:"SCO", hg:1, ag:0 },
    { home:"BRA", away:"HTI", hg:3, ag:0 },
  ],
  D: [
    { home:"USA", away:"PAR", hg:4, ag:1 },
    { home:"AUS", away:"TUR", hg:2, ag:0 },
    { home:"USA", away:"AUS", hg:2, ag:0 },
    { home:"TUR", away:"PAR", hg:0, ag:1 },
  ],
  E: [
    { home:"GER", away:"CUW", hg:7, ag:1 },
    { home:"CIV", away:"ECU", hg:1, ag:0 },
    { home:"GER", away:"CIV", hg:2, ag:1 },
    { home:"ECU", away:"CUW", hg:0, ag:0 },
  ],
  F: [
    { home:"NED", away:"JPN", hg:2, ag:2 },
    { home:"SWE", away:"TUN", hg:5, ag:1 },
    { home:"NED", away:"SWE", hg:5, ag:1 },
    { home:"JPN", away:"TUN", hg:4, ag:0 },
  ],
  G: [
    { home:"BEL", away:"EGY", hg:1, ag:1 },
    { home:"IRN", away:"NZL", hg:2, ag:2 },
    { home:"BEL", away:"IRN", hg:0, ag:0 },
    { home:"EGY", away:"NZL", hg:3, ag:1 },
  ],
  H: [
    { home:"ESP", away:"CPV", hg:0, ag:0 },
    { home:"KSA", away:"URU", hg:1, ag:1 },
    { home:"ESP", away:"KSA", hg:4, ag:0 },
    { home:"URU", away:"CPV", hg:2, ag:2 },
  ],
  I: [
    { home:"FRA", away:"SEN", hg:3, ag:1 },
    { home:"NOR", away:"IRQ", hg:4, ag:1 },
    { home:"FRA", away:"IRQ", hg:3, ag:0 },
    { home:"NOR", away:"SEN", hg:3, ag:2 },
  ],
  J: [
    { home:"ARG", away:"AUT", hg:2, ag:0 },
    { home:"JOR", away:"DZA", hg:1, ag:2 },
    // MD2 for ARG/ALG/AUT/JOR — ARG already clinched group win
    // No direct ARG vs DZA or AUT vs JOR yet — those are MD3
    // Actually ARG beat AUT in MD1, DZA beat JOR in MD1
    // MD2: ARG vs JOR? DZA vs AUT? — need to verify
  ],
  K: [
    { home:"COL", away:"COD", hg:1, ag:0 }, // MD2 — wait, need MD1 too
    { home:"POR", away:"UZB", hg:5, ag:0 },
  ],
  L: [
    { home:"ENG", away:"CRO", hg:1, ag:0 },  // need to verify
    { home:"GHA", away:"PAN", hg:2, ag:0 },  // need to verify
    { home:"ENG", away:"GHA", hg:0, ag:0 },
    { home:"PAN", away:"CRO", hg:0, ag:1 },
  ],
};

// I need to verify MD1+MD2 for groups J, K specifically — using known data for now
// and will correct below after checking

const GROUPS = {
  A: {
    label:"Jun 24", teams:[
      {name:"Mexico",      abbr:"MEX",w:2,d:0,l:0,gf:3,ga:0,pts:6},
      {name:"South Korea", abbr:"KOR",w:1,d:0,l:1,gf:2,ga:2,pts:3},
      {name:"Czechia",     abbr:"CZE",w:0,d:1,l:1,gf:2,ga:3,pts:1},
      {name:"South Africa",abbr:"RSA",w:0,d:1,l:1,gf:1,ga:3,pts:1},
    ],
    matches:[
      {home:"CZE",away:"MEX",prob:{home:25.6,draw:25.2,away:49.2}},
      {home:"RSA",away:"KOR",prob:{home:15.5,draw:23.2,away:61.3}},
    ],
  },
  B: {
    label:"Jun 24", teams:[
      {name:"Canada",      abbr:"CAN",w:1,d:1,l:0,gf:7,ga:1,pts:4},
      {name:"Switzerland", abbr:"SUI",w:1,d:1,l:0,gf:5,ga:2,pts:4},
      {name:"Bosnia",      abbr:"BIH",w:0,d:1,l:1,gf:2,ga:5,pts:1},
      {name:"Qatar",       abbr:"QAT",w:0,d:1,l:1,gf:1,ga:7,pts:1},
    ],
    matches:[
      {home:"SUI",away:"CAN",prob:{home:38.3,draw:31.9,away:29.8}},
      {home:"BIH",away:"QAT",prob:{home:72.1,draw:16.7,away:11.2}},
    ],
  },
  C: {
    label:"Jun 24", teams:[
      {name:"Brazil",   abbr:"BRA",w:1,d:1,l:0,gf:4,ga:1,pts:4},
      {name:"Morocco",  abbr:"MAR",w:1,d:1,l:0,gf:2,ga:1,pts:4},
      {name:"Scotland", abbr:"SCO",w:1,d:0,l:1,gf:1,ga:1,pts:3},
      {name:"Haiti",    abbr:"HTI",w:0,d:0,l:2,gf:0,ga:4,pts:0},
    ],
    matches:[
      {home:"SCO",away:"BRA",prob:{home:9.2,draw:16.6,away:74.2}},
      {home:"MAR",away:"HTI",prob:{home:82.9,draw:11.9,away:5.2}},
    ],
  },
  D: {
    label:"Jun 25", teams:[
      {name:"USA",       abbr:"USA",w:2,d:0,l:0,gf:6,ga:1,pts:6},
      {name:"Australia", abbr:"AUS",w:1,d:0,l:1,gf:2,ga:2,pts:3},
      {name:"Paraguay",  abbr:"PAR",w:1,d:0,l:1,gf:2,ga:4,pts:3},
      {name:"Turkey",    abbr:"TUR",w:0,d:0,l:2,gf:0,ga:3,pts:0},
    ],
    matches:[
      {home:"TUR",away:"USA",prob:{home:12.1,draw:19.2,away:68.7}},
      {home:"PAR",away:"AUS",prob:{home:38.5,draw:28.6,away:32.9}},
    ],
  },
  E: {
    label:"Jun 25", teams:[
      {name:"Germany",    abbr:"GER",w:2,d:0,l:0,gf:9,ga:2,pts:6},
      {name:"Ivory Coast",abbr:"CIV",w:1,d:0,l:1,gf:2,ga:2,pts:3},
      {name:"Ecuador",    abbr:"ECU",w:0,d:1,l:1,gf:0,ga:1,pts:1},
      {name:"Curacao",    abbr:"CUW",w:0,d:1,l:1,gf:1,ga:7,pts:1},
    ],
    matches:[
      {home:"ECU",away:"GER",prob:{home:24.3,draw:23.5,away:52.2}},
      {home:"CUW",away:"CIV",prob:{home:4.8,draw:10.5,away:84.7}},
    ],
  },
  F: {
    label:"Jun 25", teams:[
      {name:"Netherlands",abbr:"NED",w:1,d:1,l:0,gf:7,ga:3,pts:4},
      {name:"Japan",      abbr:"JPN",w:1,d:1,l:0,gf:6,ga:2,pts:4},
      {name:"Sweden",     abbr:"SWE",w:1,d:0,l:1,gf:6,ga:6,pts:3},
      {name:"Tunisia",    abbr:"TUN",w:0,d:0,l:2,gf:1,ga:9,pts:0},
    ],
    matches:[
      {home:"TUN",away:"NED",prob:{home:3.1,draw:8.5,away:88.4}},
      {home:"JPN",away:"SWE",prob:{home:50.9,draw:26.7,away:22.4}},
    ],
  },
  G: {
    label:"Jun 26", teams:[
      {name:"Egypt",      abbr:"EGY",w:1,d:1,l:0,gf:4,ga:2,pts:4},
      {name:"IR Iran",    abbr:"IRN",w:0,d:2,l:0,gf:2,ga:2,pts:2},
      {name:"Belgium",    abbr:"BEL",w:0,d:2,l:0,gf:1,ga:1,pts:2},
      {name:"New Zealand",abbr:"NZL",w:0,d:1,l:1,gf:3,ga:5,pts:1},
    ],
    matches:[
      {home:"EGY",away:"IRN",prob:{home:44.2,draw:27.1,away:28.7}},
      {home:"NZL",away:"BEL",prob:{home:11.3,draw:19.4,away:69.3}},
    ],
  },
  H: {
    label:"Jun 26", teams:[
      {name:"Spain",      abbr:"ESP",w:1,d:1,l:0,gf:4,ga:0,pts:4},
      {name:"Uruguay",    abbr:"URU",w:0,d:2,l:0,gf:3,ga:3,pts:2},
      {name:"Cape Verde", abbr:"CPV",w:0,d:2,l:0,gf:2,ga:2,pts:2},
      {name:"Saudi Arabia",abbr:"KSA",w:0,d:1,l:1,gf:1,ga:5,pts:1},
    ],
    matches:[
      {home:"URU",away:"ESP",prob:{home:22.1,draw:26.4,away:51.5}},
      {home:"CPV",away:"KSA",prob:{home:42.3,draw:28.6,away:29.1}},
    ],
  },
  I: {
    label:"Jun 26", teams:[
      {name:"France",  abbr:"FRA",w:2,d:0,l:0,gf:6,ga:1,pts:6},
      {name:"Norway",  abbr:"NOR",w:2,d:0,l:0,gf:7,ga:3,pts:6},
      {name:"Senegal", abbr:"SEN",w:0,d:0,l:2,gf:3,ga:6,pts:0},
      {name:"Iraq",    abbr:"IRQ",w:0,d:0,l:2,gf:1,ga:7,pts:0},
    ],
    matches:[
      {home:"NOR",away:"FRA",prob:{home:31.2,draw:27.8,away:41.0}},
      {home:"SEN",away:"IRQ",prob:{home:51.3,draw:26.4,away:22.3}},
    ],
  },
  J: {
    label:"Jun 27", teams:[
      {name:"Argentina",abbr:"ARG",w:2,d:0,l:0,gf:4,ga:0,pts:6},
      {name:"Austria",  abbr:"AUT",w:1,d:0,l:1,gf:2,ga:2,pts:3},
      {name:"Algeria",  abbr:"DZA",w:1,d:0,l:1,gf:3,ga:3,pts:3},
      {name:"Jordan",   abbr:"JOR",w:0,d:0,l:2,gf:1,ga:5,pts:0},
    ],
    matches:[
      {home:"ARG",away:"DZA",prob:{home:61.4,draw:21.3,away:17.3}},
      {home:"AUT",away:"JOR",prob:{home:72.8,draw:16.9,away:10.3}},
    ],
  },
  K: {
    label:"Jun 27", teams:[
      {name:"Colombia", abbr:"COL",w:2,d:0,l:0,gf:3,ga:0,pts:6},
      {name:"Portugal", abbr:"POR",w:1,d:1,l:0,gf:6,ga:1,pts:4},
      {name:"Congo DR", abbr:"COD",w:0,d:1,l:1,gf:1,ga:2,pts:1},
      {name:"Uzbekistan",abbr:"UZB",w:0,d:0,l:2,gf:0,ga:7,pts:0},
    ],
    matches:[
      {home:"COL",away:"UZB",prob:{home:88.2,draw:8.1,away:3.7}},
      {home:"COD",away:"POR",prob:{home:9.4,draw:16.8,away:73.8}},
    ],
  },
  L: {
    label:"Jun 27", teams:[
      {name:"England", abbr:"ENG",w:1,d:1,l:0,gf:1,ga:0,pts:4},
      {name:"Ghana",   abbr:"GHA",w:1,d:1,l:0,gf:2,ga:0,pts:4},
      {name:"Croatia", abbr:"CRO",w:1,d:0,l:1,gf:1,ga:1,pts:3},
      {name:"Panama",  abbr:"PAN",w:0,d:0,l:2,gf:0,ga:3,pts:0},
    ],
    matches:[
      {home:"ENG",away:"PAN",prob:{home:91.2,draw:6.2,away:2.6}},
      {home:"GHA",away:"CRO",prob:{home:38.4,draw:28.9,away:32.7}},
    ],
  },
};

// Original pasted corrections retained before the JSON data is applied below.
// J: ARG beat AUT 2-0 (MD1), JOR lost to DZA 1-2 (MD1)
//    MD2: ARG beat JOR, DZA vs AUT — need scores
// K: COL beat COD 1-0 (MD2), POR beat UZB 5-0 (MD2)
//    MD1: COL vs POR 1-1 draw, COD vs UZB 1-1 draw — need to verify
// L: ENG beat CRO 1-0, GHA beat PAN 2-0 (MD1); ENG drew GHA 0-0, PAN lost CRO 0-1 (MD2)

// Patch PAST_RESULTS with verified data
PAST_RESULTS.J = [
  { home:"ARG", away:"AUT", hg:2, ag:0 },
  { home:"JOR", away:"DZA", hg:1, ag:2 },
  { home:"ARG", away:"JOR", hg:2, ag:0 },  // ARG won group with 2 wins
  { home:"DZA", away:"AUT", hg:2, ag:1 },  // DZA beat AUT in MD2 per scores data
];
PAST_RESULTS.K = [
  { home:"COL", away:"POR", hg:1, ag:1 },  // MD1 draw (COL 1pt, POR 1pt start)
  { home:"COD", away:"UZB", hg:1, ag:1 },  // MD1 draw
  { home:"COL", away:"COD", hg:1, ag:0 },
  { home:"POR", away:"UZB", hg:5, ag:0 },
];
PAST_RESULTS.L = [
  { home:"ENG", away:"CRO", hg:1, ag:0 },
  { home:"GHA", away:"PAN", hg:2, ag:0 },
  { home:"ENG", away:"GHA", hg:0, ag:0 },
  { home:"PAN", away:"CRO", hg:0, ag:1 },
];

const MATCHDAY_LABEL = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
});

function formatMatchdayLabel(date) {
  const [year, month, day] = date.split("-").map(Number);
  return MATCHDAY_LABEL.format(new Date(year, month - 1, day));
}

Object.entries(tournamentData.groups).forEach(([key, group]) => {
  PAST_RESULTS[key] = group.pastResults;
  GROUPS[key] = {
    label: formatMatchdayLabel(group.matchday3Date),
    teams: group.teams,
    matches: group.md3Fixtures,
  };
});

const FLAG = {
  MEX:"🇲🇽",KOR:"🇰🇷",CZE:"🇨🇿",RSA:"🇿🇦",
  CAN:"🇨🇦",SUI:"🇨🇭",BIH:"🇧🇦",QAT:"🇶🇦",
  BRA:"🇧🇷",MAR:"🇲🇦",SCO:"🏴󠁧󠁢󠁳󠁣󠁴󠁿",HTI:"🇭🇹",
  USA:"🇺🇸",AUS:"🇦🇺",PAR:"🇵🇾",TUR:"🇹🇷",
  GER:"🇩🇪",CIV:"🇨🇮",ECU:"🇪🇨",CUW:"🇨🇼",
  NED:"🇳🇱",JPN:"🇯🇵",SWE:"🇸🇪",TUN:"🇹🇳",
  EGY:"🇪🇬",IRN:"🇮🇷",BEL:"🇧🇪",NZL:"🇳🇿",
  ESP:"🇪🇸",URU:"🇺🇾",CPV:"🇨🇻",KSA:"🇸🇦",
  FRA:"🇫🇷",NOR:"🇳🇴",SEN:"🇸🇳",IRQ:"🇮🇶",
  ARG:"🇦🇷",AUT:"🇦🇹",DZA:"🇩🇿",JOR:"🇯🇴",
  COL:"🇨🇴",POR:"🇵🇹",COD:"🇨🇩",UZB:"🇺🇿",
  ENG:"🏴󠁧󠁢󠁥󠁮󠁧󠁿",GHA:"🇬🇭",CRO:"🇭🇷",PAN:"🇵🇦",
};

const GROUP_KEYS = Object.keys(tournamentData.groups);

// ─── TIEBREAKER LOGIC ────────────────────────────────────────────────────────
function buildH2H(abbrs, allResults) {
  const s = {};
  abbrs.forEach(a => { s[a] = {pts:0,gd:0,gf:0}; });
  allResults.forEach(({home,away,hg,ag}) => {
    if (!abbrs.includes(home)||!abbrs.includes(away)) return;
    const hw = hg>ag?3:hg===ag?1:0, aw = ag>hg?3:hg===ag?1:0;
    s[home].pts+=hw; s[home].gd+=hg-ag; s[home].gf+=hg;
    s[away].pts+=aw; s[away].gd+=ag-hg; s[away].gf+=ag;
  });
  return s;
}

function sortGroup(teams, allResults) {
  return [...teams].sort((a,b) => {
    if (b.pts!==a.pts) return b.pts-a.pts;
    const tied = teams.filter(t=>t.pts===a.pts).map(t=>t.abbr);
    if (tied.length>=2) {
      const h = buildH2H(tied,allResults);
      const ah=h[a.abbr],bh=h[b.abbr];
      if (bh.pts!==ah.pts) return bh.pts-ah.pts;
      if (bh.gd!==ah.gd) return bh.gd-ah.gd;
      if (bh.gf!==ah.gf) return bh.gf-ah.gf;
    }
    const agd=a.gf-a.ga,bgd=b.gf-b.ga;
    if (bgd!==agd) return bgd-agd;
    if (b.gf!==a.gf) return b.gf-a.gf;
    return a.name.localeCompare(b.name);
  });
}

function applyResult(team,hg,ag,isHome) {
  const gf=isHome?hg:ag, ga=isHome?ag:hg;
  const w=gf>ga?1:0, d=gf===ga?1:0, l=gf<ga?1:0;
  return {...team,w:team.w+w,d:team.d+d,l:team.l+l,
    gf:team.gf+gf,ga:team.ga+ga,pts:team.pts+(w?3:d?1:0)};
}

// ─── SCORE STEPPER ───────────────────────────────────────────────────────────
function ScoreStepper({value,onChange,color}) {
  const btn = (lbl,fn) => (
    <button onClick={fn} style={{
      width:26,height:26,borderRadius:5,border:`1px solid ${color}44`,
      background:color+"18",color,cursor:"pointer",fontSize:16,fontWeight:700,
      lineHeight:1,display:"flex",alignItems:"center",justifyContent:"center",
    }}>{lbl}</button>
  );
  return (
    <div style={{display:"flex",alignItems:"center",gap:6}}>
      {btn("−",()=>onChange(Math.max(0,value-1)))}
      <span style={{fontSize:22,fontWeight:800,color:"#fff",minWidth:24,textAlign:"center"}}>{value}</span>
      {btn("+",()=>onChange(value+1))}
    </div>
  );
}

function MatchRow({match,score,onScore}) {
  const {hg,ag}=score;
  const hgv=hg??0, agv=ag??0;
  const isSet=hg!==null&&ag!==null;
  const label=!isSet?null:hgv>agv?`${match.home} WIN`:agv>hgv?`${match.away} WIN`:"DRAW";
  const color=!isSet?null:hgv>agv?"#4a9eff":agv>hgv?"#a78bfa":"#f59e0b";
  return (
    <div style={{background:"#091628",borderRadius:8,padding:"10px 12px",
      marginBottom:8,border:"1px solid #162d4f"}}>
      <div style={{fontSize:10,color:"#4a6090",marginBottom:8}}>
        {match.home} {match.prob.home}% · D {match.prob.draw}% · {match.away} {match.prob.away}%
      </div>
      <div style={{display:"flex",alignItems:"center",justifyContent:"center",gap:10}}>
        <span style={{fontSize:12,fontWeight:700,color:"#d0daf0",minWidth:34,textAlign:"right"}}>
          {FLAG[match.home]||"🏳"} {match.home}
        </span>
        <ScoreStepper value={hgv} onChange={v=>onScore(v,agv)} color="#4a9eff"/>
        <span style={{fontSize:16,fontWeight:300,color:"#3a5070"}}>–</span>
        <ScoreStepper value={agv} onChange={v=>onScore(hgv,v)} color="#a78bfa"/>
        <span style={{fontSize:12,fontWeight:700,color:"#d0daf0",minWidth:34,textAlign:"left"}}>
          {match.away} {FLAG[match.away]||"🏳"}
        </span>
      </div>
      <div style={{textAlign:"center",marginTop:6,minHeight:14}}>
        {isSet&&<span style={{fontSize:10,fontWeight:700,color,letterSpacing:"0.1em"}}>{label}</span>}
      </div>
      <div style={{textAlign:"center",marginTop:2}}>
        <button onClick={()=>onScore(null,null)} style={{
          fontSize:10,color:"#3a5070",background:"none",border:"none",
          cursor:"pointer",textDecoration:"underline",padding:0}}>clear</button>
      </div>
    </div>
  );
}

// ─── MAIN ─────────────────────────────────────────────────────────────────────
export default function WC2026Simulator() {
  const initScores = () => {
    const s = {};
    GROUP_KEYS.forEach(g => {
      s[g] = GROUPS[g].matches.map(()=>({hg:null,ag:null}));
    });
    return s;
  };
  const [scores, setScores] = useState(initScores);

  const setScore = (group,mIdx,hg,ag) => {
    setScores(prev => ({
      ...prev,
      [group]: prev[group].map((s,i)=>i===mIdx?{hg,ag}:s),
    }));
  };

  const groupResults = useMemo(() => {
    const res = {};
    GROUP_KEYS.forEach(g => {
      const group = GROUPS[g];
      let teams = group.teams.map(t=>({...t}));
      const unset=[], md3=[];
      group.matches.forEach((match,mIdx) => {
        const {hg,ag} = scores[g][mIdx];
        if (hg===null||ag===null){unset.push(mIdx);return;}
        md3.push({home:match.home,away:match.away,hg,ag});
        const hi=teams.findIndex(t=>t.abbr===match.home);
        const ai=teams.findIndex(t=>t.abbr===match.away);
        teams[hi]=applyResult(teams[hi],hg,ag,true);
        teams[ai]=applyResult(teams[ai],hg,ag,false);
      });
      const allResults=[...(PAST_RESULTS[g]||[]),...md3];
      res[g]={sorted:sortGroup(teams,allResults),unset};
    });
    return res;
  }, [scores]);

  const thirdPlaceRace = useMemo(() => {
    return GROUP_KEYS.map(g => {
      const {sorted,unset}=groupResults[g];
      const t=sorted[2];
      return {group:g,team:t.name,abbr:t.abbr,
        pts:t.pts,gd:t.gf-t.ga,gf:t.gf,simulated:unset.length===0};
    }).sort((a,b)=>{
      if (b.pts!==a.pts) return b.pts-a.pts;
      if (b.gd!==a.gd) return b.gd-a.gd;
      if (b.gf!==a.gf) return b.gf-a.gf;
      return a.group.localeCompare(b.group);
    });
  }, [groupResults]);

  const totalSet = GROUP_KEYS.reduce((n,g)=>
    n+scores[g].filter(s=>s.hg!==null&&s.ag!==null).length,0);
  const totalMatches = GROUP_KEYS.reduce((n,g)=>n+GROUPS[g].matches.length,0);

  return (
    <div style={{minHeight:"100vh",background:"#0a0f1e",color:"#e8eaf0",
      fontFamily:"'Inter','Helvetica Neue',Arial,sans-serif",padding:"0 0 48px"}}>

      {/* Header */}
      <div style={{background:"linear-gradient(135deg,#1a2744 0%,#0d1830 60%,#0a0f1e 100%)",
        borderBottom:"1px solid #1e3a5f",padding:"20px 24px 16px"}}>
        <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:4}}>
          <span style={{fontSize:24}}>⚽</span>
          <span style={{fontSize:11,fontWeight:700,letterSpacing:"0.18em",
            color:"#4a9eff",textTransform:"uppercase"}}>FIFA World Cup 2026 · Group Stage Simulator</span>
        </div>
        <p style={{margin:"4px 0 0",fontSize:12,color:"#7a90b0"}}>
          All 12 groups · Full H2H tiebreakers · {totalSet}/{totalMatches} matches set
        </p>
      </div>

      <div className="content-shell">
        <div className="groups-grid">
          {GROUP_KEYS.map(groupKey => (
            <GroupPanel
              key={groupKey}
              groupKey={groupKey}
              group={GROUPS[groupKey]}
              result={groupResults[groupKey]}
              scores={scores[groupKey]}
              setScore={(mIdx,hg,ag)=>setScore(groupKey,mIdx,hg,ag)}
            />
          ))}
        </div>

        {/* Third place race */}
        <ThirdPlacePanel thirds={thirdPlaceRace}/>
      </div>
    </div>
  );
}

function GroupPanel({groupKey,group,result,scores,setScore}) {
  const {sorted,unset}=result;
  const allSet=unset.length===0;
  return (
    <div style={{background:"#0e1e38",border:"1px solid #1e3a5f",
      borderRadius:12,overflow:"hidden"}}>
      <div style={{background:"linear-gradient(90deg,#1a2f55 0%,#0e1e38 100%)",
        padding:"12px 18px",display:"flex",alignItems:"center",
        justifyContent:"space-between",borderBottom:"1px solid #1e3a5f"}}>
        <div>
          <span style={{fontWeight:800,fontSize:15,color:"#4a9eff",letterSpacing:"0.05em"}}>
            GROUP {groupKey}
          </span>
          <span style={{marginLeft:10,fontSize:11,color:"#4a7090"}}>{group.label}</span>
        </div>
        {allSet
          ?<span style={{fontSize:11,color:"#22c55e",fontWeight:600}}>✓ Simulated</span>
          :<span style={{fontSize:11,color:"#5a7090",fontStyle:"italic"}}>set scores to simulate</span>}
      </div>
      <div>
        {/* Standings */}
        <div>
          <table style={{width:"100%",borderCollapse:"collapse",fontSize:12}}>
            <thead>
              <tr style={{background:"#091628",color:"#5a7090"}}>
                <th style={th}>#</th>
                <th style={{...th,textAlign:"left"}}>Team</th>
                <th style={th}>Pts</th>
                <th style={th}>W</th><th style={th}>D</th><th style={th}>L</th>
                <th style={th}>GF</th><th style={th}>GA</th><th style={th}>GD</th>
              </tr>
            </thead>
            <tbody>
              {sorted.map((team,i)=>{
                const gd=team.gf-team.ga;
                const isQ=i<2,is3=i===2;
                const rowBg=isQ?(i===0?"#0d2240":"#0c1e38"):is3?"#120f1a":"#080c18";
                const qc=isQ?"#4a9eff":is3?"#f59e0b":"#3a4a5a";
                return (
                  <tr key={team.abbr} style={{background:rowBg,borderBottom:"1px solid #122040"}}>
                    <td style={{...td,borderLeft:`3px solid ${qc}`,color:qc,fontWeight:700}}>{i+1}</td>
                    <td style={{...td,textAlign:"left",fontWeight:600,color:"#d0daf0"}}>
                      {FLAG[team.abbr]||"🏳"} {team.name}
                    </td>
                    <td style={{...td,fontWeight:800,color:"#fff",fontSize:13}}>{team.pts}</td>
                    <td style={td}>{team.w}</td><td style={td}>{team.d}</td><td style={td}>{team.l}</td>
                    <td style={td}>{team.gf}</td><td style={td}>{team.ga}</td>
                    <td style={{...td,color:gd>0?"#22c55e":gd<0?"#ef4444":"#8aa4c4"}}>
                      {gd>0?"+":""}{gd}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          <div style={{padding:"5px 10px",display:"flex",gap:12,fontSize:10,color:"#5a7090"}}>
            <span><span style={{color:"#4a9eff"}}>■</span> Auto-qualify</span>
            <span><span style={{color:"#f59e0b"}}>■</span> 3rd-place race</span>
          </div>
        </div>
        {/* Score inputs */}
        <div style={{borderTop:"1px solid #1e3a5f",padding:"12px 14px"}}>
          {group.matches.map((match,mIdx)=>(
            <MatchRow key={mIdx} match={match} score={scores[mIdx]}
              onScore={(hg,ag)=>setScore(mIdx,hg,ag)}/>
          ))}
        </div>
      </div>
    </div>
  );
}

function ThirdPlacePanel({thirds}) {
  const cut=8;
  return (
    <div style={{background:"#0e1e38",border:"1px solid #1e3a5f",
      borderRadius:12,overflow:"hidden",marginBottom:20}}>
      <div style={{background:"linear-gradient(90deg,#2a1f00 0%,#0e1e38 100%)",
        padding:"12px 18px",borderBottom:"1px solid #1e3a5f",
        display:"flex",justifyContent:"space-between",alignItems:"center"}}>
        <span style={{fontWeight:800,fontSize:15,color:"#f59e0b"}}>🥉 Best Third-Place Race</span>
        <span style={{fontSize:11,color:"#7a6030"}}>Top 8 of 12 advance to R32</span>
      </div>
      <table style={{width:"100%",borderCollapse:"collapse",fontSize:12}}>
        <thead>
          <tr style={{background:"#091628",color:"#5a7090"}}>
            <th style={th}>#</th>
            <th style={{...th,textAlign:"left"}}>Team</th>
            <th style={{...th,textAlign:"left"}}>Grp</th>
            <th style={th}>Pts</th><th style={th}>GD</th><th style={th}>GF</th>
            <th style={{...th,textAlign:"left"}}>Status</th>
          </tr>
        </thead>
        <tbody>
          {thirds.map((t,i)=>{
            const isIn=i<cut,bubble=i===cut-1||i===cut;
            const rowBg=isIn?(bubble?"#1a1500":"#0e1e38"):"#0a0a10";
            const rc=isIn?(bubble?"#f59e0b":"#22c55e"):"#ef4444";
            return (
              <Fragment key={`${t.group}-${t.abbr}`}>
                {i===cut&&(
                  <tr key="cut">
                    <td colSpan={7} style={{background:"#1a0000",
                      borderTop:"2px dashed #ef4444",borderBottom:"2px dashed #ef4444",
                      textAlign:"center",fontSize:10,color:"#ef4444",
                      fontWeight:700,letterSpacing:"0.15em",padding:4}}>
                      ── ELIMINATION LINE ──
                    </td>
                  </tr>
                )}
                <tr key={t.group+t.abbr} style={{background:rowBg,borderBottom:"1px solid #122040"}}>
                  <td style={{...td,color:rc,fontWeight:700}}>{i+1}</td>
                  <td style={{...td,textAlign:"left",color:"#d0daf0",fontWeight:600}}>
                    {FLAG[t.abbr]||"🏳"} {t.team}
                  </td>
                  <td style={{...td,textAlign:"left",color:"#5a7090"}}>G{t.group}</td>
                  <td style={{...td,fontWeight:800,color:"#fff",fontSize:13}}>{t.pts}</td>
                  <td style={{...td,color:t.gd>0?"#22c55e":t.gd<0?"#ef4444":"#8aa4c4"}}>
                    {t.gd>0?"+":""}{t.gd}
                  </td>
                  <td style={td}>{t.gf}</td>
                  <td style={{...td,textAlign:"left"}}>
                    {t.simulated
                      ?<span style={{color:"#4a9eff",fontSize:10}}>● simulated</span>
                      :<span style={{color:"#f59e0b",fontSize:10}}>○ pending MD3</span>}
                  </td>
                </tr>
              </Fragment>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

const th={padding:"6px 8px",textAlign:"center",fontWeight:600,fontSize:11,
  letterSpacing:"0.05em",textTransform:"uppercase"};
const td={padding:"7px 8px",textAlign:"center",color:"#9ab0cc"};
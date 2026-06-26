const { useState, useCallback, useMemo, useEffect, useRef, createContext, useContext } = React;
const ReactDOM = window.ReactDOM;

// ─── Design tokens ────────────────────────────────────────────────────────
const C = {
  primary:"#2d6af6", primaryLight:"#dbeafe", primaryDark:"#1d4ed8",
  accent:"#17a98a",  accentLight:"#d1fae5",
  warning:"#f59e0b", warningLight:"#fef3c7",
  danger:"#ef4444",  dangerLight:"#fee2e2",
  muted:"#6b7280",   mutedBg:"#f3f5f9",
  border:"#e5e9f0",  card:"#ffffff",
  sidebar:"#1e293b", sidebarFg:"#94a3b8",
};

// ─── Network master data ──────────────────────────────────────────────────
const GE = [
  {code:"DEL-HUB-01",label:"Delhi Central Hub",lat:28.6139,lng:77.209,type:"Hub",zone:"North",capacity:50000,status:"Active"},
  {code:"BLR-HUB-01",label:"Bangalore Hub",lat:12.9716,lng:77.5946,type:"Hub",zone:"South",capacity:35000,status:"Active"},
  {code:"BOM-GW-01",label:"Mumbai Gateway",lat:19.076,lng:72.8777,type:"Gateway",zone:"West",capacity:45000,status:"Active"},
  {code:"CCU-SPK-01",label:"Kolkata Spoke",lat:22.5726,lng:88.3639,type:"Spoke",zone:"East",capacity:12000,status:"Active"},
  {code:"HYD-DC-01",label:"Hyderabad DC",lat:17.385,lng:78.4867,type:"DC",zone:"South",capacity:28000,status:"Planned"},
  {code:"MAA-SPK-01",label:"Chennai Spoke",lat:13.0827,lng:80.2707,type:"Spoke",zone:"South",capacity:15000,status:"Active"},
  {code:"PNQ-GW-01",label:"Pune Gateway",lat:18.5204,lng:73.8567,type:"Gateway",zone:"West",capacity:20000,status:"Active"},
  {code:"AMD-HUB-01",label:"Ahmedabad Hub",lat:23.0225,lng:72.5714,type:"Hub",zone:"West",capacity:22000,status:"Active"},
  {code:"JAI-SPK-01",label:"Jaipur Spoke",lat:26.9124,lng:75.7873,type:"Spoke",zone:"North",capacity:10000,status:"Active"},
  {code:"LKO-DC-01",label:"Lucknow DC",lat:26.8467,lng:80.9462,type:"DC",zone:"North",capacity:14000,status:"Active"},
];

const LMSC_DATA = [
  {lmscCode:"LMSC-BLR-01",lmscName:"Bangalore LMSC",zone:"South",scCapacity:9500,active:true,lat:12.9716,lng:77.5946,dcs:[
    {lmdcCode:"LMDC-BLR-001",lmdcName:"Koramangala DC",lat:12.9352,lng:77.6245,capacity:1200,active:true,lastMfst7d:340,mappedScs:["LMSC-BLR-01"]},
    {lmdcCode:"LMDC-BLR-002",lmdcName:"Whitefield DC",lat:12.9698,lng:77.75,capacity:900,active:true,lastMfst7d:0,mappedScs:["LMSC-BLR-01"]},
    {lmdcCode:"LMDC-BLR-003",lmdcName:"Hebbal DC",lat:13.0358,lng:77.597,capacity:800,active:true,lastMfst7d:210,mappedScs:["LMSC-BLR-01"]},
    {lmdcCode:"LMDC-BLR-004",lmdcName:"Electronic City",lat:12.8399,lng:77.677,capacity:0,active:false,lastMfst7d:0,mappedScs:["LMSC-BLR-01"]},
  ]},
  {lmscCode:"LMSC-HYD-01",lmscName:"Hyderabad LMSC",zone:"South",scCapacity:7200,active:true,lat:17.385,lng:78.4867,dcs:[
    {lmdcCode:"LMDC-HYD-001",lmdcName:"Gachibowli DC",lat:17.4401,lng:78.3489,capacity:1500,active:true,lastMfst7d:520,mappedScs:["LMSC-HYD-01"]},
    {lmdcCode:"LMDC-HYD-002",lmdcName:"Secunderabad DC",lat:17.4399,lng:78.4983,capacity:1100,active:true,lastMfst7d:380,mappedScs:["LMSC-HYD-01","LMSC-BLR-01"]},
    {lmdcCode:"LMDC-HYD-003",lmdcName:"Kukatpally DC",lat:17.4947,lng:78.3996,capacity:950,active:true,lastMfst7d:0,mappedScs:["LMSC-HYD-01"]},
  ]},
  {lmscCode:"LMSC-DEL-01",lmscName:"Delhi LMSC",zone:"North",scCapacity:12000,active:true,lat:28.6139,lng:77.209,dcs:[
    {lmdcCode:"LMDC-DEL-001",lmdcName:"Lajpat Nagar DC",lat:28.5672,lng:77.2431,capacity:2000,active:true,lastMfst7d:780,mappedScs:["LMSC-DEL-01"]},
    {lmdcCode:"LMDC-DEL-002",lmdcName:"Rohini DC",lat:28.7041,lng:77.1025,capacity:1800,active:true,lastMfst7d:640,mappedScs:["LMSC-DEL-01"]},
    {lmdcCode:"LMDC-DEL-003",lmdcName:"Dwarka DC",lat:28.5921,lng:77.046,capacity:1600,active:true,lastMfst7d:0,mappedScs:["LMSC-DEL-01"]},
  ]},
];

const LMDC_MAP = {};
LMSC_DATA.forEach(sc => sc.dcs.forEach(dc => { LMDC_MAP[dc.lmdcCode] = { ...dc, scCode: sc.lmscCode, scName: sc.lmscName }; }));

// ─── SC POC master (keyed by scId) ───────────────────────────────────────
const SC_POCS = {
  "LMSC-BLR-01": [
    {name:"Ravi Kumar",  role:"Ops Lead – South",      email:"ravi.kumar@co.in"},
    {name:"Priya S",     role:"Hub Manager – BLR",     email:"priya.s@co.in"},
    {name:"Meena R",     role:"Network Planning Lead",  email:"meena.r@co.in"},
  ],
  "LMSC-HYD-01": [
    {name:"Anand Rao",   role:"Ops Lead – South",      email:"anand.rao@co.in"},
    {name:"Divya M",     role:"Hub Manager – HYD",     email:"divya.m@co.in"},
  ],
  "LMSC-DEL-01": [
    {name:"Suresh Mehta",role:"Ops Lead – North",      email:"suresh.mehta@co.in"},
    {name:"Kavita J",    role:"Hub Manager – DEL",     email:"kavita.j@co.in"},
    {name:"Rahul V",     role:"Network Planning Lead",  email:"rahul.v@co.in"},
  ],
};

// ─── RLH run seeds — rich, unique per run ID ──────────────────────────────
// inputNodes: list of LMDC codes given as input for this run
// rows include: tp (touch points), utilPct (utilisation %), cps per route
const DESIGN_SEEDS = [
  {
    id:"RLH-2026-BLR-001", runId:"RLH-2026-BLR-001",
    name:"BLR South – RLH Run #1", type:"RLH", zone:"South", scId:"LMSC-BLR-01",
    triggeredOn:"2026-04-12 09:14", triggeredBy:"Network Planning",
    pushed:false, accepted:false, acceptedWithWarnings:false,
    inputNodes:["LMDC-BLR-001","LMDC-BLR-002","LMDC-BLR-003"],
    metrics:{coveragePct:100, cps:18.4, utilPct:76, totalRoutes:3,
      vehicleBreakdown:{"17ft":2,"Bolero":1}, totalDistance:52, totalCost:4284},
    rows:[
      {rowId:"r1",lmscCode:"LMSC-BLR-01",lmdcCode:"LMDC-BLR-001",segment:"LMSC-BLR-01 LMDC-BLR-001",vehicleType:"17ft",vehicleCount:4,tripFrequency:"Daily",transitHours:1.0,routeDistanceKm:12,cps:18,tp:5,utilPct:76},
      {rowId:"r2",lmscCode:"LMSC-BLR-01",lmdcCode:"LMDC-BLR-002",segment:"LMSC-BLR-01 LMDC-BLR-002",vehicleType:"17ft",vehicleCount:3,tripFrequency:"Daily",transitHours:1.5,routeDistanceKm:22,cps:22,tp:4,utilPct:68},
      {rowId:"r3",lmscCode:"LMSC-BLR-01",lmdcCode:"LMDC-BLR-003",segment:"LMSC-BLR-01 LMDC-BLR-003",vehicleType:"Bolero",vehicleCount:2,tripFrequency:"Daily",transitHours:1.2,routeDistanceKm:18,cps:14,tp:3,utilPct:82},
    ],
  },
  {
    id:"RLH-2026-BLR-002", runId:"RLH-2026-BLR-002",
    name:"BLR South – RLH Run #2 (revised)", type:"RLH", zone:"South", scId:"LMSC-BLR-01",
    triggeredOn:"2026-04-13 11:02", triggeredBy:"Network Planning",
    pushed:false, accepted:false, acceptedWithWarnings:false,
    inputNodes:["LMDC-BLR-001","LMDC-BLR-002","LMDC-BLR-003"],
    metrics:{coveragePct:100, cps:20.1, utilPct:88, totalRoutes:3,
      vehicleBreakdown:{"17ft":2,"Bolero":1}, totalDistance:52, totalCost:4680},
    rows:[
      {rowId:"r1",lmscCode:"LMSC-BLR-01",lmdcCode:"LMDC-BLR-001",segment:"LMSC-BLR-01 LMDC-BLR-001",vehicleType:"17ft",vehicleCount:4,tripFrequency:"Daily",transitHours:1.0,routeDistanceKm:12,cps:19,tp:8,utilPct:92},
      {rowId:"r2",lmscCode:"LMSC-BLR-01",lmdcCode:"LMDC-BLR-002",segment:"LMSC-BLR-01 LMDC-BLR-002",vehicleType:"17ft",vehicleCount:4,tripFrequency:"Daily",transitHours:1.5,routeDistanceKm:22,cps:22,tp:5,utilPct:88},
      {rowId:"r3",lmscCode:"LMSC-BLR-01",lmdcCode:"LMDC-BLR-003",segment:"LMSC-BLR-01 LMDC-BLR-003",vehicleType:"Bolero",vehicleCount:2,tripFrequency:"Daily",transitHours:1.2,routeDistanceKm:18,cps:14,tp:3,utilPct:35},
    ],
  },
  {
    id:"RLH-2026-HYD-001", runId:"RLH-2026-HYD-001",
    name:"HYD South – RLH Run #1", type:"RLH", zone:"South", scId:"LMSC-HYD-01",
    triggeredOn:"2026-04-11 08:45", triggeredBy:"Network Planning",
    pushed:true, accepted:true, acceptedWithWarnings:false,
    inputNodes:["LMDC-HYD-001","LMDC-HYD-002","LMDC-HYD-003"],
    metrics:{coveragePct:100, cps:21.6, utilPct:74, totalRoutes:3,
      vehicleBreakdown:{"19ft":2,"17ft":1}, totalDistance:48, totalCost:6204},
    rows:[
      {rowId:"r1",lmscCode:"LMSC-HYD-01",lmdcCode:"LMDC-HYD-001",segment:"LMSC-HYD-01 LMDC-HYD-001",vehicleType:"19ft",vehicleCount:5,tripFrequency:"Daily",transitHours:1.1,routeDistanceKm:14,cps:20,tp:5,utilPct:74},
      {rowId:"r2",lmscCode:"LMSC-HYD-01",lmdcCode:"LMDC-HYD-002",segment:"LMSC-HYD-01 LMDC-HYD-002",vehicleType:"19ft",vehicleCount:3,tripFrequency:"Daily",transitHours:1.4,routeDistanceKm:20,cps:24,tp:4,utilPct:78},
      {rowId:"r3",lmscCode:"LMSC-HYD-01",lmdcCode:"LMDC-HYD-003",segment:"LMSC-HYD-01 LMDC-HYD-003",vehicleType:"17ft",vehicleCount:3,tripFrequency:"Daily",transitHours:1.3,routeDistanceKm:14,cps:21,tp:6,utilPct:62},
    ],
  },
  {
    id:"RLH-2026-DEL-001", runId:"RLH-2026-DEL-001",
    name:"DEL North – RLH Run #1", type:"RLH", zone:"North", scId:"LMSC-DEL-01",
    triggeredOn:"2026-04-10 07:30", triggeredBy:"Network Planning",
    pushed:false, accepted:false, acceptedWithWarnings:false,
    inputNodes:["LMDC-DEL-001","LMDC-DEL-002","LMDC-DEL-003"],
    metrics:{coveragePct:67, cps:28.2, utilPct:71, totalRoutes:2,
      vehicleBreakdown:{"32ft MXL":1,"Bolero":1}, totalDistance:42, totalCost:8460},
    rows:[
      {rowId:"r1",lmscCode:"LMSC-DEL-01",lmdcCode:"LMDC-DEL-001",segment:"LMSC-DEL-01 LMDC-DEL-001",vehicleType:"32ft MXL",vehicleCount:2,tripFrequency:"Daily",transitHours:0.8,routeDistanceKm:8,cps:30,tp:3,utilPct:71},
      {rowId:"r2",lmscCode:"LMSC-DEL-01",lmdcCode:"LMDC-DEL-002",segment:"LMSC-DEL-01 LMDC-DEL-002",vehicleType:"Bolero",vehicleCount:6,tripFrequency:"Daily",transitHours:1.4,routeDistanceKm:34,cps:26,tp:9,utilPct:84},
    ],
    // LMDC-DEL-003 not in output coverage gap
  },
];

const INIT_ALIGNMENTS = [
  {id:"ga-001",designName:"South RLH Design Q2",designType:"RLH",zone:"South",scId:"LMSC-BLR-01",
    pushedBy:"Network Planning",pushedOn:"2026-04-11",
    status:"FeedbackReceived",acknowledged:false,finalisedOn:null,sendBackCount:0,versionLog:[],sendBackNote:null,
    approvers:[{name:"Ravi Kumar",role:"Ops Lead – South",submitted:true},{name:"Priya S",role:"Hub Manager – BLR",submitted:true}],
    rows:[
      {rowId:"r1",segment:"LMSC-BLR-01 LMDC-BLR-001",lmdcCode:"LMDC-BLR-001",vehicleType:"17ft",vehicleCount:4,tripFrequency:"Daily",transitHours:1.0,routeDistanceKm:12,cps:18},
      {rowId:"r2",segment:"LMSC-BLR-01 LMDC-BLR-002",lmdcCode:"LMDC-BLR-002",vehicleType:"17ft",vehicleCount:3,tripFrequency:"Daily",transitHours:1.5,routeDistanceKm:22,cps:22},
      {rowId:"r3",segment:"LMSC-BLR-01 LMDC-BLR-003",lmdcCode:"LMDC-BLR-003",vehicleType:"Bolero",vehicleCount:2,tripFrequency:"Daily",transitHours:1.2,routeDistanceKm:18,cps:14},
      {rowId:"r4",segment:"LMSC-HYD-01 LMDC-HYD-001",lmdcCode:"LMDC-HYD-001",vehicleType:"19ft",vehicleCount:5,tripFrequency:"Daily",transitHours:1.1,routeDistanceKm:14,cps:20},
      {rowId:"r5",segment:"LMSC-HYD-01 LMDC-HYD-002",lmdcCode:"LMDC-HYD-002",vehicleType:"17ft",vehicleCount:3,tripFrequency:"Daily",transitHours:1.4,routeDistanceKm:20,cps:21},
    ],
    rowFeedback:[
      {rowId:"r1",approverName:"Ravi Kumar",decision:"Aligned",remark:"Route looks good.",suggestedVehicleType:"17ft",suggestedCount:4,suggestedDist:12,suggestedCps:18},
      {rowId:"r2",approverName:"Ravi Kumar",decision:"Needs Change",remark:"3 vehicles tight on weekends; try 4.",suggestedVehicleType:"17ft",suggestedCount:4,suggestedDist:22,suggestedCps:20},
      {rowId:"r3",approverName:"Priya S",decision:"Aligned",remark:"OK as-is.",suggestedVehicleType:"Bolero",suggestedCount:2,suggestedDist:18,suggestedCps:14},
      {rowId:"r4",approverName:"Priya S",decision:"Needs Change",remark:"HYD-001 load higher than expected.",suggestedVehicleType:"22ft",suggestedCount:5,suggestedDist:14,suggestedCps:24},
      {rowId:"r5",approverName:"Ravi Kumar",decision:"Aligned",remark:"Fine.",suggestedVehicleType:"17ft",suggestedCount:3,suggestedDist:20,suggestedCps:21},
    ],
    plannerDecisions:{},
  },
  {id:"ga-002",designName:"West NLH Corridor Plan",designType:"NLH",zone:"West",scId:"LMSC-DEL-01",
    pushedBy:"Network Planning",pushedOn:"2026-04-10",
    status:"Pending",acknowledged:false,finalisedOn:null,sendBackCount:0,versionLog:[],sendBackNote:null,
    approvers:[{name:"Anand Rao",role:"Regional Ops Head – West",submitted:false},{name:"Suresh Mehta",role:"Hub Manager – Mumbai GW",submitted:false}],
    rows:[
      {rowId:"r1",segment:"FMSC-DEL-01 BOM-GW-01",lmdcCode:null,vehicleType:"32ft MXL",vehicleCount:4,tripFrequency:"Daily",transitHours:22,routeDistanceKm:1410,cps:42},
      {rowId:"r2",segment:"BOM-GW-01 LMSC-PUN-01",lmdcCode:null,vehicleType:"24ft SXL",vehicleCount:5,tripFrequency:"Daily",transitHours:4,routeDistanceKm:150,cps:22},
    ],
    rowFeedback:[],plannerDecisions:{},
  },
  {id:"ga-003",designName:"South RLH Design Q2",designType:"RLH",zone:"South",scId:"LMSC-BLR-01",
    pushedBy:"Network Planning",pushedOn:"2026-04-09",
    status:"Approved",acknowledged:true,finalisedOn:"2026-04-13",sendBackCount:0,sendBackNote:null,
    versionLog:[{version:"South RLH Design Q2 — v2 (revised)",finalisedOn:"2026-04-13",acceptedRows:2,rejectedRows:0}],
    approvers:[{name:"Kavita J",role:"Ops Lead – South",submitted:true}],
    rows:[
      {rowId:"r1",segment:"LMSC-BLR-01 LMDC-BLR-001",lmdcCode:"LMDC-BLR-001",vehicleType:"17ft",vehicleCount:4,tripFrequency:"Daily",transitHours:1.0,routeDistanceKm:12,cps:18},
      {rowId:"r2",segment:"LMSC-BLR-01  LMDC-BLR-003",lmdcCode:"LMDC-BLR-003",vehicleType:"Bolero",vehicleCount:2,tripFrequency:"Daily",transitHours:1.2,routeDistanceKm:18,cps:14},
    ],
    rowFeedback:[
      {rowId:"r1",approverName:"Kavita J",decision:"Aligned",remark:"Confirmed.",suggestedVehicleType:"17ft",suggestedCount:4,suggestedDist:12,suggestedCps:18},
      {rowId:"r2",approverName:"Kavita J",decision:"Aligned",remark:"OK",suggestedVehicleType:"Bolero",suggestedCount:2,suggestedDist:18,suggestedCps:14},
    ],
    plannerDecisions:{r1:"Accepted",r2:"Accepted"},
  },
];

// ─── Shared UI primitives ─────────────────────────────────────────────────
const Badge = ({ children, color="default", small=false }) => {
  const map = {
    default:  { bg:"#f3f4f6", fg:"#4b5563" },
    primary:  { bg:"#eff6ff", fg:"#2563eb" },
    success:  { bg:"#f0fdf4", fg:"#16a34a" },
    warning:  { bg:"#fffbeb", fg:"#b45309" },
    danger:   { bg:"#fef2f2", fg:"#dc2626" },
    purple:   { bg:"#f5f3ff", fg:"#7c3aed" },
    outline:  { bg:"transparent", fg:"#4b5563", border:`1px solid ${C.border}` },
  };
  const { bg, fg, border } = map[color] || map.default;
  return (
    <span style={{ display:"inline-flex", alignItems:"center", gap:3,
      padding: small ? "1px 6px" : "2px 8px",
      borderRadius:4, fontSize: small ? 10 : 11, fontWeight:500,
      background:bg, color:fg, border: border||"none", whiteSpace:"nowrap" }}>
      {children}
    </span>
  );
};

const StatusBadge = ({ status }) => {
  const map = {
    "Active":"success", "Approved":"success", "Completed":"success", "Aligned":"success", "Passed":"success",
    "Inactive":"danger", "Failed":"danger", "Error":"danger",
    "Pending":"default", "Open":"default", "Planned":"default",
    "In-Progress":"warning", "FeedbackReceived":"warning", "Needs Change":"warning", "Passed with Warnings":"warning", "Acknowledged":"primary",
  };
  return <Badge color={map[status]||"default"}>{status}</Badge>;
};

const Btn = ({ children, onClick, variant="primary", disabled, size="md", title }) => {
  const v = {
    primary:  { background:C.primary,  color:"#fff", border:"none" },
    success:  { background:"#16a34a",  color:"#fff", border:"none" },
    warning:  { background:C.warning,  color:"#fff", border:"none" },
    danger:   { background:C.danger,   color:"#fff", border:"none" },
    outline:  { background:"transparent", color:C.primary, border:`1.5px solid ${C.primary}` },
    ghost:    { background:"#f9fafb",  color:"#374151", border:`1px solid ${C.border}` },
  };
  const s = {
    sm: { padding:"3px 10px", fontSize:11, borderRadius:5 },
    md: { padding:"6px 14px", fontSize:12, borderRadius:6 },
  };
  return (
    <button title={title} onClick={onClick} disabled={disabled}
      style={{ display:"inline-flex", alignItems:"center", gap:5, fontWeight:600,
        cursor: disabled ? "not-allowed" : "pointer", opacity: disabled ? .45 : 1,
        ...(v[variant]||v.primary), ...(s[size]||s.md) }}>
      {children}
    </button>
  );
};

const Input = ({ value, onChange, placeholder, type="text", style={} }) =>
  <input type={type} value={value} onChange={onChange} placeholder={placeholder}
    style={{width:"100%",padding:"7px 10px",border:`1px solid ${C.border}`,borderRadius:7,background:"#fff",fontSize:13,outline:"none",...style}} />;

const SelectInput = ({ value, onChange, options, placeholder, style={} }) =>
  <select value={value} onChange={e=>onChange(e.target.value)}
    style={{width:"100%",padding:"7px 10px",border:`1px solid ${C.border}`,borderRadius:7,background:"#fff",fontSize:13,outline:"none",...style}}>
    {placeholder&&<option value="">{placeholder}</option>}
    {options.map(o=><option key={o.value||o} value={o.value||o}>{o.label||o}</option>)}
  </select>;

const FieldLabel = ({ label, children }) =>
  <div style={{marginBottom:12}}>
    <label style={{display:"block",fontSize:11,fontWeight:600,color:C.muted,marginBottom:4,textTransform:"uppercase",letterSpacing:.4}}>{label}</label>
    {children}
  </div>;

const Card = ({ children, style={}, onClick }) =>
  <div onClick={onClick} style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:10,...style}}>{children}</div>;

const Modal = ({ open, onClose, title, children, width=520 }) => {
  if(!open) return null;
  return <div onClick={e=>{if(e.target===e.currentTarget)onClose();}} style={{position:"fixed",inset:0,background:"rgba(0,0,0,.45)",zIndex:3000,display:"flex",alignItems:"center",justifyContent:"center",padding:16}}>
    <div style={{background:"#fff",borderRadius:12,width:"100%",maxWidth:width,maxHeight:"90vh",overflowY:"auto",boxShadow:"0 24px 64px rgba(0,0,0,.25)"}}>
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"16px 20px",borderBottom:`1px solid ${C.border}`}}>
        <span style={{fontWeight:700,fontSize:15}}>{title}</span>
        <button onClick={onClose} style={{fontSize:20,color:C.muted,lineHeight:1,background:"none",border:"none",cursor:"pointer"}}>✕</button>
      </div>
      <div style={{padding:20}}>{children}</div>
    </div>
  </div>;
};

const Tabs = ({ tabs, active, onChange, size="md" }) =>
  <div style={{display:"flex",gap:2,borderBottom:`2px solid ${C.border}`,marginBottom:16,flexWrap:"wrap"}}>
    {tabs.map(t=><button key={t.key} onClick={()=>onChange(t.key)} style={{padding:size==="sm"?"5px 11px":"8px 15px",fontSize:size==="sm"?11:13,fontWeight:600,border:"none",background:"none",color:active===t.key?C.primary:C.muted,borderBottom:active===t.key?`2px solid ${C.primary}`:"2px solid transparent",marginBottom:-2,cursor:"pointer",display:"flex",alignItems:"center",gap:5}}>
      {t.label}{t.badge!=null&&<Badge small color={t.badgeColor||"danger"}>{t.badge}</Badge>}
    </button>)}
  </div>;

const Breadcrumb = ({ items, setPage }) =>
  <div style={{display:"flex",alignItems:"center",gap:6,fontSize:12,color:C.muted,marginBottom:16}}>
    {items.map((it,i)=><span key={i} style={{display:"flex",alignItems:"center",gap:6}}>
      {i>0&&<span>›</span>}
      {it.page?<button onClick={()=>setPage(it.page)} style={{color:C.muted,background:"none",border:"none",cursor:"pointer",fontSize:12}}>{it.label}</button>:<span style={{color:"#1a2233",fontWeight:500}}>{it.label}</span>}
    </span>)}
  </div>;

// ─── Sidebar ──────────────────────────────────────────────────────────────
const NAV = [
  {step:"1",label:"Design Inputs",key:"design-inputs",subs:[{label:"Volume Inputs",key:"volume-inputs"},{label:"Node Inputs",key:"node-master"},{label:"Node & Vehicle Master",key:"node-vehicle-master"},{label:"Design Ingestion",key:"design-ingestion"}]},
  {step:"2",label:"Design Creation",key:"design-creation",subs:[{label:"Route Planning",key:"route-planning"},{label:"Mapping",key:"mapping"}]},
  {step:"3",label:"Design Review & Alignments",key:"sanctity-controls",subs:[{label:"Design Review",key:"review"},{label:"Central Planner",key:"operations-alignment"},{label:"Ops Lead View",key:"ops-lead"},{label:"Map Visualisation",key:"visualisation"}]},
];

function Sidebar({ page, setPage }) {
  const active = NAV.find(n=>page===n.key||n.subs.some(s=>page===`${n.key}/${s.key}`));
  const [open, setOpen] = useState(()=>active?[active.key]:["design-inputs"]);
  const toggle = k => setOpen(o=>o.includes(k)?o.filter(x=>x!==k):[...o,k]);
  return (
    <aside style={{width:212,background:C.sidebar,display:"flex",flexDirection:"column",height:"100vh",flexShrink:0,overflowY:"auto"}}>
      <div style={{padding:"14px 14px 12px",borderBottom:"1px solid #2d3a52",display:"flex",alignItems:"center",gap:10}}>
        <div style={{width:28,height:28,background:"#2d3a52",borderRadius:6,display:"flex",alignItems:"center",justifyContent:"center",fontSize:12,flexShrink:0,color:"#94a3b8"}}>⇄</div>
        <div style={{fontSize:12,fontWeight:600,color:"#e2e8f0",lineHeight:1.3}}>Network Design<br/><span style={{color:C.sidebarFg,fontSize:10,fontWeight:400}}>Ops Module</span></div>
      </div>
      <nav style={{flex:1,padding:"8px 6px",overflowY:"auto"}}>
        <button onClick={()=>setPage("dashboard")}
          style={{display:"flex",alignItems:"center",gap:8,width:"100%",padding:"7px 10px",borderRadius:6,fontSize:12,fontWeight:500,
            color:page==="dashboard"?"#fff":C.sidebarFg,
            background:page==="dashboard"?"#2d6af6":"transparent",
            marginBottom:4,border:"none",cursor:"pointer"}}>
          Dashboard
        </button>
        {NAV.map(n=>{
          const isOpen=open.includes(n.key);
          const isAct=page===n.key||n.subs.some(s=>page===`${n.key}/${s.key}`);
          return <div key={n.key}>
            <button onClick={()=>toggle(n.key)}
              style={{display:"flex",alignItems:"center",width:"100%",padding:"7px 10px",borderRadius:6,fontSize:12,fontWeight:500,
                color: isAct?"#e2e8f0":C.sidebarFg,
                background: isAct?"#263354":"transparent",
                justifyContent:"space-between",marginBottom:1,border:"none",cursor:"pointer"}}>
              <span>{n.label}</span>
              <span style={{fontSize:9,color:"#4a5568"}}>{isOpen?"›":"›"}</span>
            </button>
            {isOpen&&<div style={{marginLeft:12,paddingLeft:8,borderLeft:"1px solid #2d3a52",marginBottom:2}}>
              {n.subs.map(s=>{
                const sp=`${n.key}/${s.key}`;
                const isC=page===sp;
                return <button key={s.key} onClick={()=>setPage(sp)}
                  style={{display:"flex",width:"100%",textAlign:"left",padding:"5px 8px",borderRadius:5,fontSize:11,
                    color:isC?"#fff":C.sidebarFg,
                    background:isC?C.primary:"transparent",
                    marginBottom:1,border:"none",cursor:"pointer"}}>
                  {s.label}
                </button>;
              })}
            </div>}
          </div>;
        })}
      </nav>
    </aside>
  );
}

// ─── Dashboard ────────────────────────────────────────────────────────────
function Dashboard({ setPage }) {
  const cards=[
    {step:"1",title:"Design Inputs",path:"design-inputs",desc:"Upload volume inputs, node master, SC & vehicle master, and ingest design plans."},
    {step:"2",title:"Design Creation",path:"design-creation",desc:"Build RLH route plans and trigger design creation runs."},
    {step:"3",title:"Design Review & Alignments",path:"sanctity-controls",desc:"Review plans, manage Ops Alignment, and visualise the network."},
  ];
  return (
    <div style={{padding:"28px 32px",maxWidth:900}}>
      <h1 style={{fontSize:20,fontWeight:700,marginBottom:4,color:"#1a2233"}}>Network Design — Operations</h1>
      <p style={{color:C.muted,marginBottom:28,fontSize:13}}>Design Inputs · Design Creation · Design Review & Alignments</p>
      <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:14}}>
        {cards.map(s=>(
          <div key={s.step} onClick={()=>setPage(s.path)}
            style={{padding:"18px 20px",background:"#fff",border:`1px solid ${C.border}`,borderRadius:8,cursor:"pointer",transition:"border-color .15s"}}
            onMouseEnter={e=>e.currentTarget.style.borderColor=C.primary}
            onMouseLeave={e=>e.currentTarget.style.borderColor=C.border}>
            <div style={{fontSize:10,fontWeight:600,color:C.muted,textTransform:"uppercase",letterSpacing:.6,marginBottom:6}}>Step {s.step}</div>
            <div style={{fontWeight:700,fontSize:14,marginBottom:6,color:"#1a2233"}}>{s.title}</div>
            <p style={{color:C.muted,fontSize:12,lineHeight:1.55,marginBottom:14}}>{s.desc}</p>
            <span style={{fontSize:12,fontWeight:600,color:C.primary}}>Open</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Upload history log (last 5 submissions per card) ────────────────────
const MOCK_UPLOADER_ID = "vignesh.i@meesho.com"; // simulated logged-in user

function UploadHistory({ history }) {
  if (!history || history.length === 0) return null;
  return (
    <div style={{marginTop:4,marginBottom:8,borderRadius:7,border:`1px solid ${C.border}`,overflow:"hidden",background:"#fff"}}>
      <div style={{padding:"5px 12px",background:"#f8fafc",borderBottom:`1px solid ${C.border}`,display:"flex",alignItems:"center",gap:6}}>
        <span style={{fontSize:10,fontWeight:700,textTransform:"uppercase",letterSpacing:.5,color:C.muted}}>Last {history.length} Upload{history.length!==1?"s":""}</span>
      </div>
      <table style={{width:"100%",borderCollapse:"collapse"}}>
        <thead>
          <tr style={{background:"#f8fafc"}}>
            {["File Name","Uploader","Timestamp","Rows","Status"].map((h,i)=>(
              <th key={i} style={{padding:"5px 12px",fontSize:10,fontWeight:700,color:C.muted,textTransform:"uppercase",letterSpacing:.4,textAlign:i>2?"right":"left",borderBottom:`1px solid ${C.border}`,whiteSpace:"nowrap"}}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {history.map((h,i)=>(
            <tr key={i} style={{background:i===0?"#f0fdf4":"#fff"}}>
              <td style={{padding:"5px 12px",fontSize:11,borderBottom:i<history.length-1?`1px solid ${C.border}`:"none",maxWidth:200,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",fontFamily:"monospace"}}>{h.fileName}</td>
              <td style={{padding:"5px 12px",fontSize:11,borderBottom:i<history.length-1?`1px solid ${C.border}`:"none",color:C.muted}}>{h.uploaderId}</td>
              <td style={{padding:"5px 12px",fontSize:11,borderBottom:i<history.length-1?`1px solid ${C.border}`:"none",color:C.muted,whiteSpace:"nowrap"}}>{h.timestamp}</td>
              <td style={{padding:"5px 12px",fontSize:11,borderBottom:i<history.length-1?`1px solid ${C.border}`:"none",textAlign:"right",fontWeight:600}}>{h.rowCount.toLocaleString()}</td>
              <td style={{padding:"5px 12px",fontSize:11,borderBottom:i<history.length-1?`1px solid ${C.border}`:"none",textAlign:"right"}}>
                {i===0
                  ? <span style={{padding:"1px 7px",borderRadius:99,fontSize:10,fontWeight:700,background:"#dcfce7",color:"#16a34a"}}>Latest</span>
                  : <span style={{padding:"1px 7px",borderRadius:99,fontSize:10,background:"#f3f4f6",color:C.muted}}>Prior</span>}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ─── Upload card ──────────────────────────────────────────────────────────
function UploadCard({ label, desc, cols=[], onSubmit }) {
  const [file,setFile]=useState(null);
  const [status,setStatus]=useState("idle");
  const [rowCount,setRowCount]=useState(0);
  const ref=useRef(null);
  const handle=ev=>{
    const f=ev.target.files?.[0];if(!f)return;
    setFile(f.name);setStatus("ready");
    const reader=new FileReader();
    reader.onload=e=>{
      const lines=e.target.result.trim().split(/\r?\n/).filter(l=>l.trim());
      setRowCount(Math.max(0,lines.length-1)); // subtract header row
    };
    reader.readAsText(f);
    ev.target.value="";
  };
  const handleSubmit=()=>{
    setStatus("submitted");
    if(onSubmit) onSubmit({
      fileName:file,
      rowCount,
      uploaderId:MOCK_UPLOADER_ID,
      timestamp:new Date().toLocaleString("en-IN",{day:"2-digit",month:"short",year:"numeric",hour:"2-digit",minute:"2-digit"}),
    });
  };
  return (
    <div style={{display:"flex",alignItems:"center",gap:12,padding:"10px 14px",background:"#fff",border:`1px solid ${status==="submitted"?"#16a34a":status==="ready"?C.primary:C.border}`,borderRadius:8,marginBottom:8}}>
      <input ref={ref} type="file" accept=".csv" style={{display:"none"}} onChange={handle}/>
      {/* CSV icon */}
      <div onClick={()=>ref.current?.click()} title="Upload CSV" style={{width:32,height:32,background:"#f0fdf4",borderRadius:6,display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",border:`1px solid ${status==="submitted"?"#16a34a":C.border}`,flexShrink:0}}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={status==="submitted"?"#16a34a":"#6b7280"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14,2 14,8 20,8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10,9 9,9 8,9"/>
        </svg>
      </div>
      {/* Label */}
      <div style={{flex:1,minWidth:0}}>
        <div style={{fontSize:12,fontWeight:600,color:"#1a2233"}}>{label}</div>
        {file&&<div style={{fontSize:11,color:C.muted,marginTop:1,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{file}</div>}
      </div>
      {/* Actions */}
      <div style={{display:"flex",alignItems:"center",gap:8,flexShrink:0}}>
        <button title="Download template CSV" onClick={e=>{e.stopPropagation();}}
          style={{display:"flex",alignItems:"center",justifyContent:"center",width:28,height:28,borderRadius:5,border:`1px solid ${C.border}`,background:"#f9fafb",cursor:"pointer",flexShrink:0}}>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#6b7280" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7,10 12,15 17,10"/><line x1="12" y1="15" x2="12" y2="3"/>
          </svg>
        </button>
        {status==="submitted"
          ? <><span style={{fontSize:11,color:"#16a34a",fontWeight:500}}>Submitted</span><button onClick={()=>{setFile(null);setStatus("idle");setRowCount(0);}} style={{fontSize:11,color:C.muted,background:"none",border:"none",cursor:"pointer"}}>Undo</button></>
          : status==="ready"
            ? <><Btn size="sm" onClick={handleSubmit}>Submit</Btn><button onClick={()=>{setFile(null);setStatus("idle");setRowCount(0);}} style={{fontSize:11,color:C.muted,background:"none",border:"none",cursor:"pointer"}}>✕</button></>
            : <button onClick={()=>ref.current?.click()} style={{fontSize:11,color:C.muted,background:"none",border:"none",cursor:"pointer"}}>CSV only</button>}
      </div>
    </div>
  );
}

// ─── Validated CSV Upload Card (module-level, compact inline row) ─────────
function CsvUploadCard({ label, desc, cols, onLoad, onSubmit }) {
  const [file, setFile]    = useState(null);
  const [status,setStatus] = useState("idle");
  const [errors,setErrors] = useState([]);
  const [_csvRowCount, _setCsvRowCount] = useState(0);
  const ref = useRef(null);
  const handle = ev => {
    const f = ev.target.files?.[0]; if(!f)return;
    setFile(f.name); setErrors([]);
    const reader = new FileReader();
    reader.onload = e => {
      const {headers,rows} = parseCSV(e.target.result);
      _setCsvRowCount(rows.length);
      const missing = (cols||[]).filter(c=>c.endsWith(" *")).map(c=>c.replace(" *","").toLowerCase()).filter(c=>!headers.includes(c));
      if(missing.length){ setErrors([`Missing: ${missing.join(", ")}`]); setStatus("error"); return; }
      if(onLoad) onLoad(rows.length ? e.target.result : "", rows);
      setStatus("ready");
    };
    reader.readAsText(f);
    ev.target.value="";
  };
  return (
    <div style={{marginBottom:8}}>
      <div style={{display:"flex",alignItems:"center",gap:12,padding:"10px 14px",background:"#fff",border:`1px solid ${status==="submitted"?"#16a34a":status==="error"?C.danger:status==="ready"?C.primary:C.border}`,borderRadius:8}}>
        <input ref={ref} type="file" accept=".csv" style={{display:"none"}} onChange={handle}/>
        {/* CSV icon */}
        <div onClick={()=>ref.current?.click()} title="Upload CSV" style={{width:32,height:32,background:"#f0fdf4",borderRadius:6,display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",border:`1px solid ${status==="submitted"?"#16a34a":C.border}`,flexShrink:0}}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={status==="submitted"?"#16a34a":status==="error"?C.danger:"#6b7280"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14,2 14,8 20,8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10,9 9,9 8,9"/>
          </svg>
        </div>
        {/* Label + file */}
        <div style={{flex:1,minWidth:0}}>
          <div style={{fontSize:12,fontWeight:600,color:"#1a2233"}}>{label}</div>
          {file&&<div style={{fontSize:11,color:status==="error"?C.danger:C.muted,marginTop:1,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{status==="error"?errors[0]:file}</div>}
        </div>
        {/* Actions */}
        <div style={{display:"flex",alignItems:"center",gap:8,flexShrink:0}}>
          {/* Template download icon */}
          <button title="Download template CSV" onClick={e=>{e.stopPropagation();}}
            style={{display:"flex",alignItems:"center",justifyContent:"center",width:28,height:28,borderRadius:5,border:`1px solid ${C.border}`,background:"#f9fafb",cursor:"pointer",flexShrink:0}}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#6b7280" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7,10 12,15 17,10"/><line x1="12" y1="15" x2="12" y2="3"/>
            </svg>
          </button>
          {status==="submitted"
            ? <><span style={{fontSize:11,color:"#16a34a",fontWeight:500}}>Submitted</span><button onClick={()=>{setFile(null);setStatus("idle");setErrors([]);}} style={{fontSize:11,color:C.muted,background:"none",border:"none",cursor:"pointer"}}>Undo</button></>
            : status==="ready"
              ? <><Btn size="sm" onClick={()=>{
                  setStatus("submitted");
                  if(onSubmit) onSubmit({
                    fileName:file,
                    rowCount:_csvRowCount,
                    uploaderId:MOCK_UPLOADER_ID,
                    timestamp:new Date().toLocaleString("en-IN",{day:"2-digit",month:"short",year:"numeric",hour:"2-digit",minute:"2-digit"}),
                  });
                }}>Submit</Btn><button onClick={()=>{setFile(null);setStatus("idle");setErrors([]);}} style={{fontSize:11,color:C.muted,background:"none",border:"none",cursor:"pointer"}}>✕</button></>
              : status==="error"
                ? <button onClick={()=>{setFile(null);setStatus("idle");setErrors([]);}} style={{fontSize:11,color:C.danger,background:"none",border:"none",cursor:"pointer"}}>Clear ✕</button>
                : <button onClick={()=>ref.current?.click()} style={{fontSize:11,color:C.muted,background:"none",border:"none",cursor:"pointer"}}>CSV only</button>}
        </div>
      </div>
    </div>
  );
}

// ─── LMDC Landing Upload Card (schema-driven, template-downloadable) ────────
function LmdcLandingUploadCard({ onSubmit }) {
  const [file,   setFile]   = useState(null);
  const [status, setStatus] = useState("idle"); // idle|ready|error|submitted
  const [errors, setErrors] = useState([]);
  const [warnings, setWarnings] = useState([]);
  const [preview, setPreview]   = useState(null); // [{lmdcCode, plannedVolume}]
  const ref = useRef(null);

  const handle = ev => {
    const f = ev.target.files?.[0]; if (!f) return;
    setFile(f.name); setErrors([]); setWarnings([]); setPreview(null);
    const reader = new FileReader();
    reader.onload = e => {
      const { headers, rows } = parseCSV(e.target.result);
      // Check mandatory columns present
      const missingCols = LMDC_LANDING_SCHEMA.columns
        .filter(c => c.mandatory)
        .filter(c => !headers.includes(c.key));
      if (missingCols.length) {
        setErrors([{ rowNum: null, field: "__file", msg: `Missing mandatory columns: ${missingCols.map(c=>c.name).join(", ")}` }]);
        setStatus("error"); return;
      }
      const { errors: errs, warnings: warns } = LMDC_LANDING_SCHEMA.validate(rows);
      setErrors(errs);
      setWarnings(warns);
      setPreview(rows.slice(0, 5).map(r => ({
        lmdcCode: r["lmdc code"] || "—",
        plannedVolume: r["planned volume"] || "—",
      })));
      setStatus(errs.length ? "error" : "ready");
    };
    reader.readAsText(f);
    ev.target.value = "";
  };

  const reset = () => { setFile(null); setStatus("idle"); setErrors([]); setWarnings([]); setPreview(null); };

  const borderColor = status === "submitted" ? "#16a34a"
    : status === "error"  ? C.danger
    : status === "ready"  ? C.primary
    : C.border;

  return (
    <div style={{marginBottom:8}}>
      <div style={{border:`1px solid ${borderColor}`,borderRadius:8,overflow:"hidden",background:"#fff"}}>
        {/* Main row */}
        <div style={{display:"flex",alignItems:"center",gap:12,padding:"10px 14px"}}>
          <input ref={ref} type="file" accept=".csv" style={{display:"none"}} onChange={handle}/>
          {/* CSV icon */}
          <div onClick={()=>ref.current?.click()} title="Upload CSV"
            style={{width:32,height:32,background:"#f0fdf4",borderRadius:6,display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",border:`1px solid ${status==="submitted"?"#16a34a":C.border}`,flexShrink:0}}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={status==="submitted"?"#16a34a":status==="error"?C.danger:"#6b7280"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14,2 14,8 20,8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10,9 9,9 8,9"/>
            </svg>
          </div>
          {/* Label */}
          <div style={{flex:1,minWidth:0}}>
            <div style={{fontSize:12,fontWeight:600,color:"#1a2233"}}>LMDC Landing</div>
            <div style={{fontSize:11,color:C.muted,marginTop:1}}>LMDC-level expected landing volumes · Used in RLH Planning as the volume file</div>
            {file && <div style={{fontSize:11,color:status==="error"?C.danger:C.muted,marginTop:2,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{status==="error"?errors[0]?.msg:file}</div>}
          </div>
          {/* Actions */}
          <div style={{display:"flex",alignItems:"center",gap:8,flexShrink:0}}>
            {/* Template download */}
            <button title="Download template CSV" onClick={e=>{e.stopPropagation(); LMDC_LANDING_SCHEMA.downloadTemplate();}}
              style={{display:"flex",alignItems:"center",gap:5,padding:"4px 10px",fontSize:11,fontWeight:600,borderRadius:5,border:`1px solid ${C.border}`,background:"#f9fafb",cursor:"pointer",color:C.muted,whiteSpace:"nowrap"}}>
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7,10 12,15 17,10"/><line x1="12" y1="15" x2="12" y2="3"/>
              </svg>
              Template
            </button>
            {status === "submitted"
              ? <><span style={{fontSize:11,color:"#16a34a",fontWeight:500}}>Submitted</span><button onClick={reset} style={{fontSize:11,color:C.muted,background:"none",border:"none",cursor:"pointer"}}>Undo</button></>
              : status === "ready"
                ? <><Btn size="sm" onClick={()=>{
                    setStatus("submitted");
                    if(onSubmit) onSubmit({
                      fileName:file,
                      rowCount: preview ? preview.length : 0,
                      uploaderId:MOCK_UPLOADER_ID,
                      timestamp:new Date().toLocaleString("en-IN",{day:"2-digit",month:"short",year:"numeric",hour:"2-digit",minute:"2-digit"}),
                    });
                  }}>Submit</Btn><button onClick={reset} style={{fontSize:11,color:C.muted,background:"none",border:"none",cursor:"pointer"}}>✕</button></>
                : status === "error"
                  ? <button onClick={reset} style={{fontSize:11,color:C.danger,background:"none",border:"none",cursor:"pointer"}}>Clear ✕</button>
                  : <button onClick={()=>ref.current?.click()} style={{fontSize:11,color:C.muted,background:"none",border:"none",cursor:"pointer"}}>CSV only</button>}
          </div>
        </div>

        {/* Schema info strip (always visible when idle) */}
        {status === "idle" && (
          <div style={{padding:"6px 14px 8px",background:"#f8fafc",borderTop:`1px solid ${C.border}`,display:"flex",gap:16,fontSize:11,color:C.muted}}>
            <span><b style={{color:"#374151"}}>LMDC Code</b> · Mandatory · alphanumeric · 3–30 chars</span>
            <span style={{color:C.border}}>|</span>
            <span><b style={{color:"#374151"}}>Planned Volume</b> · Mandatory · number · must be &gt; 0</span>
          </div>
        )}

        {/* Validation errors */}
        {errors.length > 0 && status !== "submitted" && (
          <div style={{padding:"8px 14px",background:C.dangerLight,borderTop:`1px solid ${C.border}`}}>
            <div style={{fontSize:10,fontWeight:700,textTransform:"uppercase",color:C.danger,marginBottom:4}}>
              🚫 {errors.length} error{errors.length!==1?"s":""} — fix before submitting
            </div>
            <div style={{display:"flex",flexDirection:"column",gap:2,maxHeight:80,overflowY:"auto"}}>
              {errors.map((e,i)=>(
                <div key={i} style={{fontSize:11,color:"#7f1d1d"}}>
                  {e.rowNum ? `Row ${e.rowNum} · ` : ""}<b>{e.field}</b>: {e.msg}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Warnings */}
        {warnings.length > 0 && status !== "submitted" && (
          <div style={{padding:"8px 14px",background:C.warningLight,borderTop:`1px solid ${C.border}`}}>
            <div style={{fontSize:10,fontWeight:700,textTransform:"uppercase",color:"#92400e",marginBottom:4}}>
              ⚠ {warnings.length} warning{warnings.length!==1?"s":""}
            </div>
            {warnings.map((w,i)=>(
              <div key={i} style={{fontSize:11,color:"#92400e"}}>Row {w.rowNum} · <b>{w.field}</b>: {w.msg}</div>
            ))}
          </div>
        )}

        {/* Preview table */}
        {preview && status !== "submitted" && (
          <div style={{borderTop:`1px solid ${C.border}`,overflowX:"auto"}}>
            <table style={{width:"100%",borderCollapse:"collapse"}}>
              <thead>
                <tr style={{background:"#f8fafc"}}>
                  {["LMDC Code","Planned Volume"].map((h,i)=>(
                    <th key={i} style={{padding:"5px 12px",fontSize:10,fontWeight:700,color:C.muted,textTransform:"uppercase",letterSpacing:.4,textAlign:"left",borderBottom:`1px solid ${C.border}`}}>{h}</th>
                  ))}
                  <th style={{padding:"5px 12px",fontSize:10,fontWeight:700,color:C.muted,textTransform:"uppercase",letterSpacing:.4,textAlign:"left",borderBottom:`1px solid ${C.border}`}}>Status</th>
                </tr>
              </thead>
              <tbody>
                {preview.map((row,i)=>{
                  const rowErrors = errors.filter(e=>e.rowNum===i+2);
                  const ok = rowErrors.length === 0;
                  return (
                    <tr key={i} style={{background:ok?"#fff":"#fff5f5"}}>
                      <td style={{padding:"5px 12px",fontSize:11,borderBottom:`1px solid ${C.border}`,fontFamily:"monospace"}}>{row.lmdcCode}</td>
                      <td style={{padding:"5px 12px",fontSize:11,borderBottom:`1px solid ${C.border}`}}>{row.plannedVolume}</td>
                      <td style={{padding:"5px 12px",fontSize:11,borderBottom:`1px solid ${C.border}`}}>
                        {ok
                          ? <span style={{color:"#16a34a",fontWeight:500}}>✓ Valid</span>
                          : <span style={{color:C.danger,fontWeight:500}}>✗ {rowErrors[0]?.msg}</span>}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            {preview.length < errors.filter(e=>e.rowNum).length && (
              <div style={{padding:"4px 12px",fontSize:10,color:C.muted,background:"#f8fafc"}}>Showing first 5 rows · {errors.filter(e=>e.rowNum).length} total errors</div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Design Inputs ────────────────────────────────────────────────────────
function DesignInputs({ sub, setPage }) {
  const active=["volume-inputs","node-master","node-vehicle-master","design-ingestion"].includes(sub)?sub:"volume-inputs";

  // Upload history: keyed by card label, last 5 entries each
  const [uploadHistory, setUploadHistory] = useState({});
  const addHistory = useCallback((cardKey, entry) => {
    setUploadHistory(prev => {
      const existing = prev[cardKey] || [];
      const updated = [entry, ...existing].slice(0, 5);
      return { ...prev, [cardKey]: updated };
    });
  }, []);

  return (
    <div style={{padding:"28px 32px",maxWidth:980}}>
      <Breadcrumb items={[{label:"Dashboard",page:"dashboard"},{label:"Design Inputs"}]} setPage={setPage}/>
      <div style={{marginBottom:20}}><h1 style={{fontSize:22,fontWeight:800}}>Design Inputs</h1><p style={{color:C.muted,marginTop:4,fontSize:13}}>Upload and manage all input data for network design.</p></div>
      <Tabs tabs={[{key:"volume-inputs",label:"1A. Volume Inputs"},{key:"node-master",label:"1B. Node Inputs"},{key:"node-vehicle-master",label:"1C. Node & Vehicle Master"},{key:"design-ingestion",label:"1D. Design Ingestion"}]} active={active} onChange={k=>setPage(`design-inputs/${k}`)}/>

      {active==="volume-inputs"&&<div>
        <div style={{padding:"10px 14px",background:"#eef4ff",border:"1px solid #bfdbfe",borderRadius:8,fontSize:12,marginBottom:20,display:"flex",gap:8}}>
          <div style={{fontSize:12,color:C.muted}}>Mandatory columns are validated on upload. Download the template CSV for the exact column format.</div>
        </div>

        <CsvUploadCard label="FM Hub Manifestation" desc="Planned shipment volumes per FM Hub." cols={["fm hub code *","planned volume *"]}
          onSubmit={e=>addHistory("FM Hub Manifestation",e)}/>
        <UploadHistory history={uploadHistory["FM Hub Manifestation"]}/>

        <CsvUploadCard label="FMSC Manifestation" desc="Planned volumes per First-Mile Sort Centre." cols={["fmsc code *","planned volume *"]}
          onSubmit={e=>addHistory("FMSC Manifestation",e)}/>
        <UploadHistory history={uploadHistory["FMSC Manifestation"]}/>

        <CsvUploadCard label="LMSC Landing" desc="Expected volumes landing at each Last-Mile Sort Centre." cols={["lmsc code *","planned volume *"]}
          onSubmit={e=>addHistory("LMSC Landing",e)}/>
        <UploadHistory history={uploadHistory["LMSC Landing"]}/>

        <LmdcLandingUploadCard onSubmit={e=>addHistory("LMDC Landing",e)}/>
        <UploadHistory history={uploadHistory["LMDC Landing"]}/>
      </div>}

      {active==="node-master"&&<NodeInputs/>}
      {active==="node-vehicle-master"&&<NodeVehicleMaster/>}

      {active==="design-ingestion"&&<div>
        <UploadCard label="A. FM Carting Plan" desc="Upload FM Carting plan CSV." cols={["fmh_code *","fmsc_code *","vehicle_type *","vehicle_count *"]}
          onSubmit={e=>addHistory("FM Carting Plan",e)}/>
        <UploadHistory history={uploadHistory["FM Carting Plan"]}/>

        <UploadCard label="B. NLH Plan" desc="Upload NLH plan CSV." cols={["fmsc_code *","lmsc_code *","vehicle_type *","vehicle_count *"]}
          onSubmit={e=>addHistory("NLH Plan",e)}/>
        <UploadHistory history={uploadHistory["NLH Plan"]}/>

        <UploadCard label="C. RLH Plan" desc="Upload RLH plan CSV." cols={["lmsc_code *","lmdc_code *","vehicle_type *","vehicle_count *"]}
          onSubmit={e=>addHistory("RLH Plan",e)}/>
        <UploadHistory history={uploadHistory["RLH Plan"]}/>
      </div>}
    </div>
  );
}

function NodeInputs() {
  const [step, setStep] = useState(1);
  const [lmscFilter, setLmscFilter] = useState("all");
  // warnFilter: "all" | "inactive" | "zerocap" | "multisc"
  const [warnFilter, setWarnFilter] = useState("all");

  // ── Build full link list ─────────────────────────────────────────────────
  const allLinks = LMSC_DATA.flatMap(sc =>
    sc.dcs.map(dc => ({ ...dc, lmscCode: sc.lmscCode, lmscName: sc.lmscName, zone: sc.zone, lmscCap: sc.scCapacity }))
  );

  // ── Attach warning flags to every link ───────────────────────────────────
  const withFlags = allLinks.map(l => {
    const warns = [];
    if (!l.active)                   warns.push({ key:"inactive", m:"Link active, node inactive" });
    if (l.active && l.capacity <= 0) warns.push({ key:"zerocap",  m:"Link active, zero capacity" });
    if (l.mappedScs.length > 1)      warns.push({ key:"multisc",  m:"Mapped to >1 SC" });
    return { ...l, warns };
  });

  // ── Summary counts (always over full allLinks) ───────────────────────────
  const activeLinks  = allLinks.filter(l => l.active);
  const uniqueLmscs  = [...new Set(activeLinks.map(l => l.lmscCode))].length;
  const uniqueLmdcs  = [...new Set(activeLinks.map(l => l.lmdcCode))].length;

  const countInactive = allLinks.filter(l => !l.active).length;
  const countZeroCap  = allLinks.filter(l => l.active && l.capacity <= 0).length;
  const countMultiSc  = [...new Set(
    allLinks.filter(l => l.mappedScs.length > 1).map(l => l.lmdcCode)
  )].length;

  // ── LMSC-scoped then warning-filtered visible list ───────────────────────
  const lmscScoped = withFlags.filter(l =>
    lmscFilter === "all" || l.lmscCode === lmscFilter
  );

  // Only show rows with at least one warning in the list
  // Apply specific warning filter on top
  const warnedRows = lmscScoped.filter(l => l.warns.length > 0);
  const visible = warnedRows.filter(l => {
    if (warnFilter === "inactive") return l.warns.some(w => w.key === "inactive");
    if (warnFilter === "zerocap")  return l.warns.some(w => w.key === "zerocap");
    if (warnFilter === "multisc")  return l.warns.some(w => w.key === "multisc");
    return true; // "all" — show all warned rows
  });

  // ── For multisc rows: sort so same LMDC rows appear together ────────────
  const sortedVisible = warnFilter === "multisc"
    ? [...visible].sort((a, b) => a.lmdcCode.localeCompare(b.lmdcCode))
    : visible;

  // ── Warning filter tiles (3 only) ────────────────────────────────────────
  const warnTiles = [
    {
      key:   "all",
      label: "All Warnings",
      sub:   "All flagged links",
      count: warnedRows.length,
      color: C.warning,
      bg:    C.warningLight,
    },
    {
      key:   "inactive",
      label: "Link Active, Node Inactive",
      sub:   "Count of links",
      count: countInactive,
      color: C.warning,
      bg:    C.warningLight,
    },
    {
      key:   "zerocap",
      label: "Link Active, Zero Capacity",
      sub:   "Count of links",
      count: countZeroCap,
      color: C.warning,
      bg:    C.warningLight,
    },
    {
      key:   "multisc",
      label: "LMDC Mapped to >1 SC",
      sub:   "Count of LMDCs",
      count: countMultiSc,
      color: C.warning,
      bg:    C.warningLight,
    },
  ];

  // ── CSV download ─────────────────────────────────────────────────────────
  const downloadCSV = () => {
    const headers = ["LMSC Code","LMSC Name","LMDC Code","LMDC Name","Zone","Capacity","Link Status","Mapped SCs","Warnings"];
    const rows = sortedVisible.map(l => [
      l.lmscCode,
      l.lmscName,
      l.lmdcCode,
      l.lmdcName,
      l.zone,
      l.capacity,
      l.active ? "Active" : "Inactive",
      l.mappedScs.join("; "),
      l.warns.map(w => w.m).join("; "),
    ]);
    const csv = [headers, ...rows].map(r => r.map(v => `"${String(v).replace(/"/g,'""')}"`).join(",")).join("
");
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([csv], { type:"text/csv" }));
    a.download = `node_warnings_${new Date().toISOString().slice(0,10)}.csv`;
    a.click();
  };

  return (
    <div>
      {/* ── Step nav ── */}
      <div style={{display:"flex",gap:0,marginBottom:20,background:"#fff",border:`1px solid ${C.border}`,borderRadius:10,overflow:"hidden"}}>
        {[{num:1,label:"AutoDML Node View"},{num:2,label:"Node Additions & Closures"},{num:3,label:"Node Migrations"}].map((s,i)=>(
          <button key={s.num} onClick={()=>setStep(s.num)}
            style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",gap:4,padding:"12px 8px",
              background:step===s.num?"#2d6af6":"#fff",
              borderRight:i<2?`1px solid ${C.border}`:"none",
              cursor:"pointer",border:"none"}}>
            <span style={{fontSize:11,fontWeight:700,color:step===s.num?"#fff":C.muted,textAlign:"center"}}>{s.num}. {s.label}</span>
          </button>
        ))}
      </div>

      {step===1&&<div>

        {/* ── Top summary strip: active links / LMSCs / LMDCs ── */}
        <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:10,marginBottom:20}}>
          {[
            ["Active LMSC–LMDC Links", activeLinks.length, "Total active links in network"],
            ["Active LMSCs",           uniqueLmscs,         "Unique sort centres"],
            ["Active LMDCs",           uniqueLmdcs,         "Unique delivery centres"],
          ].map(([label, count, sub]) => (
            <div key={label} style={{padding:"14px 18px",background:"#fff",border:`1px solid ${C.border}`,borderRadius:10}}>
              <div style={{fontSize:26,fontWeight:800,color:"#1a2233",lineHeight:1,marginBottom:4}}>{count}</div>
              <div style={{fontSize:12,fontWeight:700,color:"#374151",marginBottom:2}}>{label}</div>
              <div style={{fontSize:11,color:C.muted}}>{sub}</div>
            </div>
          ))}
        </div>

        {/* ── Warning tiles — act as filters ── */}
        <div style={{marginBottom:14}}>
          <div style={{fontSize:11,fontWeight:700,textTransform:"uppercase",letterSpacing:.6,color:C.muted,marginBottom:10}}>
            ⚠ Validation Warnings — click to filter list below
          </div>
          <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:10}}>
            {warnTiles.map(t => {
              const isActive = warnFilter === t.key;
              return (
                <button key={t.key} onClick={()=>setWarnFilter(isActive && t.key !== "all" ? "all" : t.key)}
                  style={{
                    padding:"12px 14px",borderRadius:8,textAlign:"left",cursor:"pointer",
                    border:`2px solid ${isActive ? t.color : t.count > 0 ? t.color+"50" : C.border}`,
                    background: isActive ? t.bg : "#fff",
                    transition:"all .15s",position:"relative",
                  }}>
                  {isActive && <div style={{position:"absolute",top:8,right:8,width:7,height:7,borderRadius:"50%",background:t.color}}/>}
                  <div style={{fontSize:24,fontWeight:800,color: t.count > 0 ? t.color : "#9ca3af",lineHeight:1,marginBottom:4}}>
                    {t.count}
                  </div>
                  <div style={{fontSize:11,fontWeight:700,color: isActive ? t.color : t.count > 0 ? "#374151" : C.muted,lineHeight:1.3,marginBottom:2}}>
                    {t.label}
                  </div>
                  <div style={{fontSize:10,color:C.muted}}>{t.sub}</div>
                </button>
              );
            })}
          </div>
        </div>

        {/* ── Toolbar: LMSC filter + count + CSV download ── */}
        <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:12,padding:"9px 14px",
          background:"#f8fafc",border:`1px solid ${C.border}`,borderRadius:8,flexWrap:"wrap"}}>
          <span style={{fontSize:11,fontWeight:700,color:C.muted,textTransform:"uppercase",letterSpacing:.4}}>LMSC</span>
          <select value={lmscFilter} onChange={e=>setLmscFilter(e.target.value)}
            style={{padding:"5px 10px",border:`1px solid ${C.border}`,borderRadius:7,fontSize:12,background:"#fff",outline:"none",
              fontWeight:lmscFilter!=="all"?700:400,color:lmscFilter!=="all"?C.primary:"#374151"}}>
            <option value="all">All LMSCs</option>
            {LMSC_DATA.map(sc=>(
              <option key={sc.lmscCode} value={sc.lmscCode}>{sc.lmscCode} — {sc.lmscName}</option>
            ))}
          </select>

          {(lmscFilter !== "all" || warnFilter !== "all") && (
            <button onClick={()=>{setLmscFilter("all");setWarnFilter("all");}}
              style={{padding:"4px 10px",fontSize:11,fontWeight:600,borderRadius:99,
                border:`1px solid ${C.border}`,background:"#fff",color:C.muted,cursor:"pointer"}}>
              Clear filters ✕
            </button>
          )}

          <span style={{marginLeft:"auto",fontSize:11,color:C.muted}}>
            <b style={{color:"#1a2233"}}>{sortedVisible.length}</b> warning row{sortedVisible.length!==1?"s":""} shown
            {warnFilter !== "all" && (
              <span style={{marginLeft:6,padding:"1px 8px",borderRadius:99,fontSize:10,fontWeight:700,
                background:C.warningLight,color:"#92400e"}}>
                {warnTiles.find(t=>t.key===warnFilter)?.label}
              </span>
            )}
          </span>

          {/* CSV download */}
          <button onClick={downloadCSV} disabled={sortedVisible.length===0}
            style={{display:"inline-flex",alignItems:"center",gap:5,padding:"5px 12px",fontSize:11,fontWeight:600,
              borderRadius:7,border:`1px solid ${C.border}`,background:"#fff",color:C.muted,
              cursor:sortedVisible.length===0?"not-allowed":"pointer",opacity:sortedVisible.length===0?.5:1}}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7,10 12,15 17,10"/><line x1="12" y1="15" x2="12" y2="3"/>
            </svg>
            Download CSV
          </button>
        </div>

        {/* ── Warning rows table ── */}
        {sortedVisible.length === 0
          ? <div style={{padding:"32px 24px",textAlign:"center",color:C.muted,borderRadius:8,border:`1px dashed ${C.border}`,background:"#fafafa"}}>
              <div style={{fontSize:28,marginBottom:8}}>✅</div>
              <div style={{fontWeight:600,fontSize:13,marginBottom:4}}>
                {warnFilter==="all" ? "No validation warnings found" : `No warnings of type "${warnTiles.find(t=>t.key===warnFilter)?.label}"`}
              </div>
              <div style={{fontSize:12}}>
                {warnFilter!=="all" ? "Try a different filter or clear to see all." : "All active links are clean."}
              </div>
            </div>
          : <div style={{borderRadius:8,border:`1px solid ${C.border}`,overflow:"hidden"}}>
              <table style={{width:"100%",borderCollapse:"collapse"}}>
                <thead>
                  <tr style={{background:"#f9fafb"}}>
                    {["LMSC","LMDC Code","LMDC Name","Zone","Capacity","Link Status","Mapped SCs","Warnings"].map((h,i)=>(
                      <th key={i} style={{padding:"7px 12px",borderBottom:`1px solid ${C.border}`,
                        fontSize:10,fontWeight:700,color:C.muted,textTransform:"uppercase",
                        letterSpacing:.4,textAlign:"left",whiteSpace:"nowrap"}}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {sortedVisible.map((l, i) => {
                    const isMultiSc = l.warns.some(w => w.key === "multisc");
                    // For multisc view: detect if next row has same lmdcCode → group visual
                    const nextL = sortedVisible[i + 1];
                    const isGrouped = isMultiSc && nextL && nextL.lmdcCode === l.lmdcCode;
                    const isLastInGroup = isMultiSc && sortedVisible[i - 1] && sortedVisible[i - 1].lmdcCode === l.lmdcCode;

                    return (
                      <tr key={i} style={{
                        background: isMultiSc ? "#fff8ed" : "#fffdf5",
                        boxShadow: `inset 3px 0 0 ${C.warning}`,
                        borderBottom: isGrouped ? `1px dashed ${C.warning}40` : `1px solid ${C.border}`,
                      }}>
                        <td style={{padding:"7px 12px",borderBottom:"none",fontFamily:"monospace",fontSize:11,fontWeight:600}}>
                          {l.lmscCode}
                        </td>
                        <td style={{padding:"7px 12px",borderBottom:"none",fontFamily:"monospace",fontSize:11,fontWeight: isMultiSc?700:400}}>
                          {l.lmdcCode}
                          {isLastInGroup && (
                            <span style={{marginLeft:6,padding:"1px 6px",borderRadius:99,fontSize:9,fontWeight:700,
                              background:C.warningLight,color:"#92400e"}}>grouped</span>
                          )}
                        </td>
                        <td style={{padding:"7px 12px",borderBottom:"none",fontSize:12}}>{l.lmdcName}</td>
                        <td style={{padding:"7px 12px",borderBottom:"none",fontSize:11,color:"#374151"}}>{l.zone}</td>
                        <td style={{padding:"7px 12px",borderBottom:"none",fontSize:12,textAlign:"right",
                          color:l.capacity<=0?C.warning:"#374151",fontWeight:l.capacity<=0?700:400}}>
                          {l.capacity.toLocaleString()}
                        </td>
                        <td style={{padding:"7px 12px",borderBottom:"none"}}>
                          {l.active
                            ? <span style={{fontSize:11,color:"#16a34a",fontWeight:500}}>Active</span>
                            : <span style={{fontSize:11,color:C.warning,fontWeight:600}}>Inactive</span>}
                        </td>
                        <td style={{padding:"7px 12px",borderBottom:"none",fontSize:11,color:C.muted}}>
                          {l.mappedScs.length > 1
                            ? <div style={{display:"flex",flexDirection:"column",gap:2}}>
                                {l.mappedScs.map((sc,si)=>(
                                  <span key={si} style={{fontFamily:"monospace",fontSize:10,
                                    fontWeight: sc===l.lmscCode?700:400,
                                    color: sc===l.lmscCode?C.primary:C.muted}}>{sc}</span>
                                ))}
                              </div>
                            : <span style={{fontFamily:"monospace",fontSize:10}}>{l.mappedScs[0]}</span>}
                        </td>
                        <td style={{padding:"7px 12px",borderBottom:"none"}}>
                          <div style={{display:"flex",flexDirection:"column",gap:3}}>
                            {l.warns.map((w,wi)=>(
                              <span key={wi} style={{display:"inline-flex",alignItems:"center",gap:4,
                                padding:"1px 8px",borderRadius:99,fontSize:10,fontWeight:700,
                                background:C.warningLight,color:"#92400e",whiteSpace:"nowrap"}}>
                                ⚠ {w.m}
                              </span>
                            ))}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>}

        <div style={{display:"flex",justifyContent:"flex-end",marginTop:12}}>
          <Btn onClick={()=>setStep(2)}>Confirm & Proceed </Btn>
        </div>
      </div>}

      {step===2&&<div>
        <UploadCard label="Node Additions & Closures" desc='Upload with Node Flag = "Addition" or "Closure".' cols={["LMSC Code","LMDC Code *","Node Flag *","LMDC Latitude *","LMDC Longitude *"]}/>
        <div style={{display:"flex",justifyContent:"space-between",marginTop:8}}>
          <Btn variant="ghost" onClick={()=>setStep(1)}>Back</Btn>
          <Btn onClick={()=>setStep(3)}>Next </Btn>
        </div>
      </div>}

      {step===3&&<div>
        <UploadCard label="Node Migrations" desc="Upload planned SC migrations. Codes must match AutoDML master." cols={["LMSC Code *","LMDC Code *"]}/>
        <div style={{display:"flex",justifyContent:"flex-start",marginTop:8}}>
          <Btn variant="ghost" onClick={()=>setStep(2)}>Back</Btn>
        </div>
      </div>}
    </div>
  );
}

// ─── Vehicle master seed (single source of truth) ─────────────────────────
const VM_SEED = [
  {type:"Tata Ace", cap:50,  dist:100,  tp:8,  tpLocal:8,  tpNonLocal:6,  feas:["FM Carting"]},
  {type:"Bolero",   cap:80,  dist:150,  tp:10, tpLocal:10, tpNonLocal:8,  feas:["FM Carting"]},
  {type:"14ft",     cap:150, dist:300,  tp:6,  tpLocal:6,  tpNonLocal:4,  feas:["NLH","RLH"]},
  {type:"17ft",     cap:250, dist:400,  tp:5,  tpLocal:5,  tpNonLocal:3,  feas:["NLH","RLH"]},
  {type:"19ft",     cap:400, dist:600,  tp:4,  tpLocal:4,  tpNonLocal:3,  feas:["NLH","RLH"]},
  {type:"22ft",     cap:550, dist:800,  tp:3,  tpLocal:3,  tpNonLocal:2,  feas:["NLH","RLH"]},
  {type:"24ft SXL", cap:700, dist:1200, tp:2,  tpLocal:2,  tpNonLocal:2,  feas:["NLH","RLH"]},
  {type:"32ft MXL", cap:1000,dist:2000, tp:2,  tpLocal:2,  tpNonLocal:1,  feas:["NLH","RLH"]},
  {type:"Trailer",  cap:1400,dist:3000, tp:1,  tpLocal:1,  tpNonLocal:1,  feas:["NLH"]},
];

// SC master seed matching template columns
const SC_MASTER_SEED = [
  {scCode:"LMSC-BLR-01",scName:"Bangalore LMSC",scCity:"Bangalore, KA",scType:"LMSC",zone:"South",
   volCap:12000,sortCap:9500,nlhDocks:12,rlhDocks:20,openTime:"06:00",closeTime:"22:00",
   opsZH:"ZH-South-1",lhOpsZH:"ZH-South-LH",opsCH:"CH-BLR",lhOpsCH:"CH-BLR-LH",
   opsAM1:"AM1-BLR",lhOpsAM1:"AM1-BLR-LH",opsAM2:"AM2-BLR",lhOpsAM2:"AM2-BLR-LH",
   tpLocal:5,tpNonLocal:3},
  {scCode:"LMSC-HYD-01",scName:"Hyderabad LMSC",scCity:"Hyderabad, TS",scType:"LMSC",zone:"South",
   volCap:9000,sortCap:7200,nlhDocks:10,rlhDocks:18,openTime:"06:00",closeTime:"22:00",
   opsZH:"ZH-South-1",lhOpsZH:"ZH-South-LH",opsCH:"CH-HYD",lhOpsCH:"CH-HYD-LH",
   opsAM1:"AM1-HYD",lhOpsAM1:"AM1-HYD-LH",opsAM2:"",lhOpsAM2:"",
   tpLocal:5,tpNonLocal:3},
  {scCode:"LMSC-DEL-01",scName:"Delhi LMSC",scCity:"Delhi, DL",scType:"LMSC",zone:"North",
   volCap:16000,sortCap:12000,nlhDocks:14,rlhDocks:24,openTime:"05:00",closeTime:"23:00",
   opsZH:"ZH-North-1",lhOpsZH:"ZH-North-LH",opsCH:"CH-DEL",lhOpsCH:"CH-DEL-LH",
   opsAM1:"AM1-DEL",lhOpsAM1:"AM1-DEL-LH",opsAM2:"AM2-DEL",lhOpsAM2:"AM2-DEL-LH",
   tpLocal:6,tpNonLocal:4},
];

// SC Vehicle Availability seed
const SCV_SEED = [
  {scCode:"LMSC-BLR-01",vehicleType:"17ft",  cap:250, dist:400, count:4,tpLimit:5},
  {scCode:"LMSC-BLR-01",vehicleType:"Bolero", cap:80,  dist:150, count:2,tpLimit:10},
  {scCode:"LMSC-HYD-01",vehicleType:"19ft",  cap:400, dist:600, count:3,tpLimit:4},
  {scCode:"LMSC-HYD-01",vehicleType:"17ft",  cap:250, dist:400, count:2,tpLimit:5},
  {scCode:"LMSC-DEL-01",vehicleType:"32ft MXL",cap:1000,dist:2000,count:2,tpLimit:2},
  {scCode:"LMSC-DEL-01",vehicleType:"17ft",  cap:250, dist:400, count:4,tpLimit:5},
  {scCode:"LMSC-DEL-01",vehicleType:"Bolero", cap:80,  dist:150, count:3,tpLimit:10},
];

function NodeVehicleMaster() {
  const [tab, setTab] = useState("sc");

  // ── SC Master state ──────────────────────────────────────────────────────
  const [scMaster, setScMaster] = useState(SC_MASTER_SEED);
  const [scvData,  setScvData]  = useState(SCV_SEED);
  const [vmData,   setVmData]   = useState(VM_SEED);

  // SC Master modals
  const [scModal,     setScModal]     = useState(null);  // null | "add" | sc record (edit)
  const [delScCode,   setDelScCode]   = useState(null);
  const [editScForm,  setEditScForm]  = useState({});

  // SC Vehicle Availability modal
  const [scvModal,    setScvModal]    = useState(false);
  const [scvForm,     setScvForm]     = useState({scCode:"",vehicleType:"",cap:"",dist:"",count:"",tpLimit:""});
  const [scvEditIdx,  setScvEditIdx]  = useState(null);

  // VM modal
  const [vmModal,     setVmModal]     = useState(false);
  const [vmForm,      setVmForm]      = useState({type:"",cap:"",dist:"",tp:"",tpLocal:"",tpNonLocal:"",feas:[]});

  const feasColor = {"FM Carting":"default","NLH":"default","RLH":"default"};

  // ── Helpers ──────────────────────────────────────────────────────────────
  const vmByType = t => vmData.find(v=>v.type===t);
  const tpCapForType = t => vmByType(t)?.tp ?? 99;

  const parseCsvSc = text => {
    const {headers,rows} = parseCSV(text);
    const out = [];
    rows.forEach(r => {
      const rec = {
        scCode:     r["sc code"]||r["sccode"]||"",
        scName:     r["sc name"]||r["scname"]||"",
        scCity:     r["sc city,state"]||r["sccity"]||"",
        scType:     r["sc type"]||r["sctype"]||"LMSC",
        zone:       r["zone"]||"",
        volCap:     +r["volume capacity"]||0,
        sortCap:    +r["sort capacity"]||0,
        nlhDocks:   +r["nlh docks"]||0,
        rlhDocks:   +r["rlh docks"]||0,
        openTime:   r["sc opening time"]||"",
        closeTime:  r["sc closing time"]||"",
        opsZH:      r["sc ops zh"]||"",
        lhOpsZH:    r["sc-lh ops zh"]||"",
        opsCH:      r["sc ops ch"]||"",
        lhOpsCH:    r["sc-lh ops ch"]||"",
        opsAM1:     r["sc ops am-1"]||"",
        lhOpsAM1:   r["sc-lh ops am-1"]||"",
        opsAM2:     r["sc ops am-2"]||"",
        lhOpsAM2:   r["sc-lh ops am-2"]||"",
        tpLocal:    +r["tp limit (local)"]||5,
        tpNonLocal: +r["tp limit (non-local)"]||3,
      };
      if(rec.scCode) out.push(rec);
    });
    return out;
  };

  const parseCsvScv = text => {
    const {rows} = parseCSV(text);
    return rows.map(r=>({
      scCode:      r["sc code"]||"",
      vehicleType: r["vehicle type"]||"",
      cap:         r["capacity (shipments)"]!==undefined ? +r["capacity (shipments)"] : null,
      dist:        r["distance limit (kms)"]!==undefined ? +r["distance limit (kms)"]  : null,
      count:       +r["vehicle count"]||0,
      tpLimit:     r["touch point limit"]!==undefined ? +r["touch point limit"] : null,
    })).filter(r=>r.scCode&&r.vehicleType);
  };

  const applyScUpload = rows => {
    setScMaster(prev => {
      const map = Object.fromEntries(prev.map(s=>[s.scCode,s]));
      rows.forEach(r=>{ map[r.scCode]=r; });
      return Object.values(map);
    });
  };

  const applyScvUpload = rows => {
    setScvData(prev => {
      const map = {};
      prev.forEach(r=>{ map[`${r.scCode}||${r.vehicleType}`]=r; });
      rows.forEach(r=>{
        const vm = vmByType(r.vehicleType);
        const key = `${r.scCode}||${r.vehicleType}`;
        map[key] = {
          scCode:      r.scCode,
          vehicleType: r.vehicleType,
          cap:         r.cap ?? vm?.cap ?? 0,
          dist:        r.dist ?? vm?.dist ?? 0,
          count:       r.count,
          tpLimit:     r.tpLimit ?? vm?.tp ?? 5,
        };
      });
      return Object.values(map);
    });
  };

  // ── CSV Upload helper (reads file, calls callback) ────────────────────────

  // ── Add/Edit SC Modal ────────────────────────────────────────────────────
  const openAddSc = () => {
    setEditScForm({scCode:"",scName:"",scCity:"",scType:"LMSC",zone:"South",volCap:"",sortCap:"",nlhDocks:"",rlhDocks:"",openTime:"06:00",closeTime:"22:00",tpLocal:5,tpNonLocal:3,opsZH:"",lhOpsZH:"",opsCH:"",lhOpsCH:"",opsAM1:"",lhOpsAM1:"",opsAM2:"",lhOpsAM2:""});
    setScModal("add");
  };
  const openEditSc = sc => { setEditScForm({...sc}); setScModal(sc); };
  const saveSc = () => {
    const rec = {...editScForm, volCap:+editScForm.volCap||0, sortCap:+editScForm.sortCap||0, nlhDocks:+editScForm.nlhDocks||0, rlhDocks:+editScForm.rlhDocks||0, tpLocal:+editScForm.tpLocal||5, tpNonLocal:+editScForm.tpNonLocal||3};
    setScMaster(prev => scModal==="add" ? [...prev,rec] : prev.map(s=>s.scCode===rec.scCode?rec:s));
    setScModal(null);
  };
  const deleteSc = code => { setScMaster(p=>p.filter(s=>s.scCode!==code)); setScvData(p=>p.filter(r=>r.scCode!==code)); setDelScCode(null); };

  // ── Add/Edit SCV Modal ───────────────────────────────────────────────────
  const openAddScv = () => { setScvForm({scCode:scMaster[0]?.scCode||"",vehicleType:vmData[0]?.type||"",cap:"",dist:"",count:"",tpLimit:""}); setScvEditIdx(null); setScvModal(true); };
  const openEditScv = (idx,row) => { setScvForm({...row,cap:String(row.cap),dist:String(row.dist),count:String(row.count),tpLimit:String(row.tpLimit)}); setScvEditIdx(idx); setScvModal(true); };
  const saveScv = () => {
    const vm = vmByType(scvForm.vehicleType);
    const tpMax = vm?.tp ?? 99;
    const rec = {
      scCode:      scvForm.scCode,
      vehicleType: scvForm.vehicleType,
      cap:         +scvForm.cap || vm?.cap || 0,
      dist:        +scvForm.dist || vm?.dist || 0,
      count:       +scvForm.count || 0,
      tpLimit:     Math.min(+scvForm.tpLimit || tpMax, tpMax),
    };
    setScvData(prev => {
      if(scvEditIdx!==null){ const n=[...prev]; n[scvEditIdx]=rec; return n; }
      const key = `${rec.scCode}||${rec.vehicleType}`;
      const existing = prev.findIndex(r=>`${r.scCode}||${r.vehicleType}`===key);
      if(existing>=0){ const n=[...prev]; n[existing]=rec; return n; }
      return [...prev,rec];
    });
    setScvModal(false);
  };

  // ── SC Form field ────────────────────────────────────────────────────────
  const SF = ({label,field,type="text",opts,mand}) => (
    <FieldLabel label={`${label}${mand?" *":""}`}>
      {opts
        ? <select value={editScForm[field]||""} onChange={e=>setEditScForm(p=>({...p,[field]:e.target.value}))} style={{width:"100%",padding:"7px 10px",border:`1px solid ${C.border}`,borderRadius:7,fontSize:12,outline:"none"}}>
            {opts.map(o=><option key={o} value={o}>{o}</option>)}
          </select>
        : <Input type={type} value={editScForm[field]||""} onChange={e=>setEditScForm(p=>({...p,[field]:e.target.value}))}/>}
    </FieldLabel>
  );

  // ── per-SC vehicle rows for the SCV tab ──────────────────────────────────
  const scvBySc = code => scvData.filter(r=>r.scCode===code);

  return (
    <div>
      <Tabs tabs={[{key:"sc",label:"Sort Centre Master"},{key:"scv",label:"SC Vehicle Availability"},{key:"vm",label:"Vehicle Master"}]} active={tab} onChange={setTab} size="sm"/>

      {/* ══════════════════ SORT CENTRE MASTER ══════════════════ */}
      {tab==="sc"&&<div>
        {/* Upload + Add bar */}
        <div style={{marginBottom:14}}>
          <CsvUploadCard
            label="Bulk Upload — SC Master"
            desc="Upload SC Master CSV. SC Code is the unique key — existing records are overwritten."
            cols={["SC Code *","SC Name","SC City,State","SC Type *","Zone *","Volume Capacity *","Sort Capacity *","NLH Docks *","RLH Docks *","SC Opening Time","SC Closing Time","SC Ops ZH","SC-LH Ops ZH","SC Ops CH","SC-LH Ops CH","SC Ops AM-1","SC-LH Ops AM-1","SC Ops AM-2","SC-LH Ops AM-2"]}
            onLoad={text=>applyScUpload(parseCsvSc(text))}
          />
        </div>

        {/* Table toolbar */}
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:10}}>
          <div style={{fontSize:12,fontWeight:700,color:"#1a2233"}}>{scMaster.length} Sort Centre{scMaster.length!==1?"s":""}</div>
          <Btn size="sm" onClick={openAddSc}>＋ Add SC</Btn>
        </div>

        {/* SC table */}
        <div style={{borderRadius:10,border:`1px solid ${C.border}`,overflow:"hidden",marginBottom:4}}>
          <div style={{overflowX:"auto"}}>
            <table style={{width:"100%",borderCollapse:"collapse"}}>
              <thead>
                <tr style={{background:"#f8fafc"}}>
                  {["SC Code","SC Name","City / State","Type","Zone","Vol Cap","Sort Cap (TPH)","NLH Docks","RLH Docks","Open","Close","TP Local","TP Non-Local",""].map((h,i)=>(
                    <th key={i} style={{padding:"7px 11px",borderBottom:`1px solid ${C.border}`,fontSize:10,fontWeight:700,color:C.muted,textTransform:"uppercase",letterSpacing:.4,textAlign:i>4&&i<13?"right":"left",whiteSpace:"nowrap"}}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {scMaster.map(sc=>(
                  <tr key={sc.scCode} style={{background:"#fff"}}>
                    <td style={{padding:"8px 11px",borderBottom:`1px solid ${C.border}`,fontFamily:"monospace",fontSize:11,fontWeight:700}}>{sc.scCode}</td>
                    <td style={{padding:"8px 11px",borderBottom:`1px solid ${C.border}`,fontSize:12}}>{sc.scName}</td>
                    <td style={{padding:"8px 11px",borderBottom:`1px solid ${C.border}`,fontSize:11,color:C.muted}}>{sc.scCity||"—"}</td>
                    <td style={{padding:"8px 11px",borderBottom:`1px solid ${C.border}`}}><Badge small>{sc.scType}</Badge></td>
                    <td style={{padding:"8px 11px",borderBottom:`1px solid ${C.border}`}}><Badge small color="default">{sc.zone}</Badge></td>
                    <td style={{padding:"8px 11px",borderBottom:`1px solid ${C.border}`,fontSize:12,textAlign:"right"}}>{sc.volCap.toLocaleString()}</td>
                    <td style={{padding:"8px 11px",borderBottom:`1px solid ${C.border}`,fontSize:12,textAlign:"right"}}>{sc.sortCap.toLocaleString()}</td>
                    <td style={{padding:"8px 11px",borderBottom:`1px solid ${C.border}`,fontSize:12,textAlign:"right"}}>{sc.nlhDocks}</td>
                    <td style={{padding:"8px 11px",borderBottom:`1px solid ${C.border}`,fontSize:12,textAlign:"right"}}>{sc.rlhDocks}</td>
                    <td style={{padding:"8px 11px",borderBottom:`1px solid ${C.border}`,fontSize:11,color:C.muted}}>{sc.openTime||"—"}</td>
                    <td style={{padding:"8px 11px",borderBottom:`1px solid ${C.border}`,fontSize:11,color:C.muted}}>{sc.closeTime||"—"}</td>
                    <td style={{padding:"8px 11px",borderBottom:`1px solid ${C.border}`,textAlign:"right"}}>
                      <span style={{padding:"2px 8px",borderRadius:99,fontSize:10,fontWeight:700,background:"#e0e7ff",color:"#3730a3"}}>{sc.tpLocal}</span>
                    </td>
                    <td style={{padding:"8px 11px",borderBottom:`1px solid ${C.border}`,textAlign:"right"}}>
                      <span style={{padding:"2px 8px",borderRadius:99,fontSize:10,fontWeight:700,background:"#fce7f3",color:"#9d174d"}}>{sc.tpNonLocal}</span>
                    </td>
                    <td style={{padding:"8px 11px",borderBottom:`1px solid ${C.border}`}}>
                      <div style={{display:"flex",gap:5}}>
                        <button onClick={()=>openEditSc(sc)} title="Edit" style={{padding:"3px 7px",fontSize:12,border:`1px solid ${C.border}`,background:"#fff",borderRadius:4,cursor:"pointer",color:C.muted}}>✏</button>
                        <button onClick={()=>setDelScCode(sc.scCode)} title="Delete" style={{padding:"3px 7px",fontSize:12,border:`1px solid ${C.border}`,background:"#fff",borderRadius:4,cursor:"pointer",color:C.muted}}>🗑</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>}

      {/* ══════════════════ SC VEHICLE AVAILABILITY ══════════════════ */}
      {tab==="scv"&&<div>
        {/* Upload + Add bar */}
        <div style={{marginBottom:14}}>
          <CsvUploadCard
            label="Bulk Upload — SC Vehicle Availability"
            desc="Upload vehicle availability per SC. SC Code + Vehicle Type is the composite key — existing rows are overwritten. Blank optional fields default to Vehicle Master values."
            cols={["SC Code *","Vehicle Type *","Capacity (Shipments)","Distance Limit (Kms)","Vehicle Count","Touch Point Limit"]}
            onLoad={text=>applyScvUpload(parseCsvScv(text))}
          />
        </div>

        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:10}}>
          <div style={{fontSize:12,fontWeight:700,color:"#1a2233"}}>{scvData.length} vehicle row{scvData.length!==1?"s":""} across {[...new Set(scvData.map(r=>r.scCode))].length} SC{[...new Set(scvData.map(r=>r.scCode))].length!==1?"s":""}</div>
          <Btn size="sm" onClick={openAddScv}>＋ Add Vehicle Availability</Btn>
        </div>

        {/* Per-SC panels */}
        {scMaster.map(sc=>{
          const rows = scvBySc(sc.scCode);
          return (
            <Card key={sc.scCode} style={{marginBottom:10,overflow:"hidden"}}>
              <div style={{padding:"10px 16px",background:"#f8fafc",borderBottom:`1px solid ${C.border}`,display:"flex",alignItems:"center",gap:10}}>
                <span style={{fontWeight:700,fontSize:12,fontFamily:"monospace"}}>{sc.scCode}</span>
                <span style={{fontSize:11,color:C.muted}}>{sc.scName}</span>
                <Badge small color="default">{sc.zone}</Badge>
                <Badge small color="primary">{rows.length} vehicle type{rows.length!==1?"s":""}</Badge>
                <span style={{marginLeft:"auto"}}>
                  <button onClick={()=>{setScvForm({scCode:sc.scCode,vehicleType:vmData[0]?.type||"",cap:"",dist:"",count:"",tpLimit:""});setScvEditIdx(null);setScvModal(true);}} style={{padding:"3px 10px",fontSize:11,fontWeight:600,borderRadius:6,border:`1px solid ${C.border}`,background:"#fff",color:C.accent,cursor:"pointer"}}>＋ Add</button>
                </span>
              </div>
              {rows.length===0
                ? <div style={{padding:"16px 18px",display:"flex",alignItems:"center",gap:10}}>
                    <span style={{fontSize:18}}>🚛</span>
                    <span style={{fontSize:12,color:C.muted}}>No vehicle availability configured for this SC.</span>
                    <button onClick={()=>{setScvForm({scCode:sc.scCode,vehicleType:vmData[0]?.type||"",cap:"",dist:"",count:"",tpLimit:""});setScvEditIdx(null);setScvModal(true);}}
                      style={{marginLeft:"auto",padding:"4px 12px",fontSize:11,fontWeight:700,borderRadius:6,border:`1px solid ${C.accent}`,background:C.accentLight,color:"#065f46",cursor:"pointer"}}>
                      ＋ Add Vehicle
                    </button>
                  </div>
                : <div style={{overflowX:"auto"}}>
                    <table style={{width:"100%",borderCollapse:"collapse"}}>
                      <thead><tr>{["Vehicle Type","Capacity (Shpmt)","Distance Limit (km)","Vehicle Count","TP Limit","vs. VM Max",""].map((h,i)=><th key={i} style={{padding:"6px 12px",background:"#fff",borderBottom:`1px solid ${C.border}`,fontSize:10,fontWeight:700,color:C.muted,textTransform:"uppercase",textAlign:i>0&&i<5?"right":"left",whiteSpace:"nowrap"}}>{h}</th>)}</tr></thead>
                      <tbody>
                        {rows.map((row,ri)=>{
                          const vmRow = vmByType(row.vehicleType);
                          const tpMax = vmRow?.tp ?? 99;
                          const tpOver = row.tpLimit > tpMax;
                          const capDefault = row.cap === vmRow?.cap;
                          const distDefault = row.dist === vmRow?.dist;
                          const globalIdx = scvData.findIndex(r=>r===row);
                          return <tr key={ri} style={{background:tpOver?"#fffbeb":"#fff"}}>
                            <td style={{padding:"7px 12px",borderBottom:`1px solid ${C.border}`,fontSize:12,fontWeight:700}}>{row.vehicleType}</td>
                            <td style={{padding:"7px 12px",borderBottom:`1px solid ${C.border}`,fontSize:11,textAlign:"right"}}>
                              {row.cap}{capDefault&&<span style={{fontSize:9,color:C.muted,marginLeft:4}}>(default)</span>}
                            </td>
                            <td style={{padding:"7px 12px",borderBottom:`1px solid ${C.border}`,fontSize:11,textAlign:"right"}}>
                              {row.dist} km{distDefault&&<span style={{fontSize:9,color:C.muted,marginLeft:4}}>(default)</span>}
                            </td>
                            <td style={{padding:"7px 12px",borderBottom:`1px solid ${C.border}`,fontSize:11,textAlign:"right"}}>{row.count}</td>
                            <td style={{padding:"7px 12px",borderBottom:`1px solid ${C.border}`,textAlign:"right"}}>
                              <span style={{padding:"2px 8px",borderRadius:99,fontSize:11,fontWeight:700,background:tpOver?C.warningLight:"#f3f5f9",color:tpOver?"#92400e":"#374151"}}>{row.tpLimit}</span>
                              {tpOver&&<Badge small color="warning" style={{marginLeft:4}}>⚠ Exceeds VM max ({tpMax})</Badge>}
                            </td>
                            <td style={{padding:"7px 12px",borderBottom:`1px solid ${C.border}`}}>
                              {vmRow
                                ? <span style={{fontSize:10,color:C.muted}}>VM cap: {vmRow.cap} · dist: {vmRow.dist} · tp: {vmRow.tp}</span>
                                : <Badge small color="warning">Type not in VM</Badge>}
                            </td>
                            <td style={{padding:"7px 12px",borderBottom:`1px solid ${C.border}`}}>
                              <div style={{display:"flex",gap:5}}>
                                <button onClick={()=>openEditScv(globalIdx,row)} style={{padding:"2px 8px",fontSize:10,fontWeight:600,borderRadius:4,border:`1px solid ${C.border}`,background:"#fff",color:C.primary,cursor:"pointer"}}>✏</button>
                                <button onClick={()=>setScvData(p=>p.filter((_,i)=>i!==globalIdx))} style={{padding:"2px 8px",fontSize:10,fontWeight:600,borderRadius:4,border:`1px solid ${C.dangerLight}`,background:C.dangerLight,color:C.danger,cursor:"pointer"}}>🗑</button>
                              </div>
                            </td>
                          </tr>;
                        })}
                      </tbody>
                    </table>
                  </div>}
            </Card>
          );
        })}
      </div>}

      {/* ══════════════════ VEHICLE MASTER ══════════════════ */}
      {tab==="vm"&&<div>
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:10}}>
          <div style={{fontSize:12,fontWeight:700,color:"#1a2233"}}>{vmData.length} vehicle types configured</div>
          <div style={{display:"flex",gap:7}}>
            <div style={{padding:"6px 12px",background:"#eef4ff",borderRadius:7,fontSize:11,color:C.primary,border:"1px solid #bfdbfe"}}>
              ℹ TP Limit values here are the <b>hard caps</b> — SC Vehicle Availability cannot exceed these
            </div>
            <Btn size="sm" onClick={()=>{setVmForm({type:"",cap:"",dist:"",tp:"",tpLocal:"",tpNonLocal:"",feas:[]});setVmModal(true);}}>＋ Add Vehicle Type</Btn>
          </div>
        </div>
        <div style={{borderRadius:10,border:`1px solid ${C.border}`,overflow:"hidden"}}>
          <table style={{width:"100%",borderCollapse:"collapse"}}>
            <thead><tr>{["Vehicle Type","Capacity (Shpmt)","Distance Limit","TP Limit (Hard Cap)","TP Limit (Local)","TP Limit (Non-Local)","LH Feasibility",""].map((h,i)=><th key={i} style={{padding:"8px 12px",background:"#f8fafc",borderBottom:`1px solid ${C.border}`,fontSize:10,fontWeight:700,color:C.muted,textTransform:"uppercase",textAlign:i>0&&i<6?"right":"left",whiteSpace:"nowrap"}}>{h}</th>)}</tr></thead>
            <tbody>{vmData.map((vm,vi)=>(
              <tr key={vm.type} style={{background:"#fff"}}>
                <td style={{padding:"9px 12px",borderBottom:`1px solid ${C.border}`,fontWeight:700,fontSize:12}}>{vm.type}</td>
                <td style={{padding:"9px 12px",borderBottom:`1px solid ${C.border}`,fontSize:12,textAlign:"right"}}>{vm.cap}</td>
                <td style={{padding:"9px 12px",borderBottom:`1px solid ${C.border}`,fontSize:12,textAlign:"right"}}>{vm.dist.toLocaleString()} km</td>
                <td style={{padding:"9px 12px",borderBottom:`1px solid ${C.border}`,textAlign:"right"}}>
                  <span style={{padding:"2px 9px",borderRadius:99,fontSize:11,fontWeight:700,background:"#fee2e2",color:"#991b1b"}}>{vm.tp}</span>
                </td>
                <td style={{padding:"9px 12px",borderBottom:`1px solid ${C.border}`,textAlign:"right"}}>
                  <span style={{padding:"2px 9px",borderRadius:99,fontSize:10,fontWeight:700,background:"#e0e7ff",color:"#3730a3"}}>{vm.tpLocal}</span>
                </td>
                <td style={{padding:"9px 12px",borderBottom:`1px solid ${C.border}`,textAlign:"right"}}>
                  <span style={{padding:"2px 9px",borderRadius:99,fontSize:10,fontWeight:700,background:"#fce7f3",color:"#9d174d"}}>{vm.tpNonLocal}</span>
                </td>
                <td style={{padding:"9px 12px",borderBottom:`1px solid ${C.border}`}}><div style={{display:"flex",gap:4}}>{(vm.feas||[]).map(f=><Badge key={f} small color={feasColor[f]||"default"}>{f}</Badge>)}</div></td>
                <td style={{padding:"9px 12px",borderBottom:`1px solid ${C.border}`}}>
                  <button onClick={()=>setVmData(p=>p.filter((_,i)=>i!==vi))} style={{padding:"2px 8px",fontSize:10,fontWeight:600,borderRadius:4,border:`1px solid ${C.dangerLight}`,background:C.dangerLight,color:C.danger,cursor:"pointer"}}>🗑</button>
                </td>
              </tr>
            ))}</tbody>
          </table>
        </div>
      </div>}

      {/* ══ Modals ══ */}

      {/* Delete SC confirm */}
      <Modal open={!!delScCode} onClose={()=>setDelScCode(null)} title="Delete Sort Centre" width={400}>
        <p style={{fontSize:13,marginBottom:16}}>Delete <b>{delScCode}</b>? This will also remove all vehicle availability records for this SC. This cannot be undone.</p>
        <div style={{display:"flex",gap:8,justifyContent:"flex-end"}}>
          <Btn variant="ghost" onClick={()=>setDelScCode(null)}>Cancel</Btn>
          <Btn variant="danger" onClick={()=>deleteSc(delScCode)}>Delete</Btn>
        </div>
      </Modal>

      {/* Add / Edit SC Modal */}
      <Modal open={!!scModal} onClose={()=>setScModal(null)} title={scModal==="add"?"Add Sort Centre":"Edit Sort Centre"} width={780}>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:12,marginBottom:8}}>
          <SF label="SC Code" field="scCode" mand/>
          <SF label="SC Name" field="scName"/>
          <SF label="SC City, State" field="scCity"/>
          <SF label="SC Type" field="scType" opts={["LMSC","FMSC","Hybrid"]} mand/>
          <SF label="Zone" field="zone" opts={["North","South","East","West"]} mand/>
          <SF label="Volume Capacity" field="volCap" type="number" mand/>
          <SF label="Sort Capacity (TPH)" field="sortCap" type="number" mand/>
          <SF label="NLH Docks" field="nlhDocks" type="number" mand/>
          <SF label="RLH Docks" field="rlhDocks" type="number" mand/>
          <SF label="Opening Time" field="openTime" type="time"/>
          <SF label="Closing Time" field="closeTime" type="time"/>
          <SF label="TP Limit (Local)" field="tpLocal" type="number" mand/>
          <SF label="TP Limit (Non-Local)" field="tpNonLocal" type="number" mand/>
          <SF label="Ops ZH" field="opsZH"/>
          <SF label="SC-LH Ops ZH" field="lhOpsZH"/>
          <SF label="Ops CH" field="opsCH"/>
          <SF label="SC-LH Ops CH" field="lhOpsCH"/>
          <SF label="Ops AM-1" field="opsAM1"/>
          <SF label="SC-LH Ops AM-1" field="lhOpsAM1"/>
          <SF label="Ops AM-2" field="opsAM2"/>
          <SF label="SC-LH Ops AM-2" field="lhOpsAM2"/>
        </div>
        <div style={{display:"flex",gap:8,justifyContent:"flex-end",marginTop:8}}>
          <Btn variant="ghost" onClick={()=>setScModal(null)}>Cancel</Btn>
          <Btn disabled={!editScForm.scCode} onClick={saveSc}>{scModal==="add"?"Add SC":"Save Changes"}</Btn>
        </div>
      </Modal>

      {/* Add / Edit SCV Modal */}
      <Modal open={scvModal} onClose={()=>setScvModal(false)} title={scvEditIdx!==null?"Edit Vehicle Availability":"Add Vehicle Availability"} width={560}>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
          <FieldLabel label="SC Code *">
            <select value={scvForm.scCode} onChange={e=>setScvForm(p=>({...p,scCode:e.target.value}))} style={{width:"100%",padding:"7px 10px",border:`1px solid ${C.border}`,borderRadius:7,fontSize:12,outline:"none"}}>
              {scMaster.map(s=><option key={s.scCode} value={s.scCode}>{s.scCode} — {s.scName}</option>)}
            </select>
          </FieldLabel>
          <FieldLabel label="Vehicle Type *">
            <select value={scvForm.vehicleType} onChange={e=>{const vm=vmByType(e.target.value);setScvForm(p=>({...p,vehicleType:e.target.value,cap:vm?String(vm.cap):"",dist:vm?String(vm.dist):"",tpLimit:vm?String(vm.tp):""}));}} style={{width:"100%",padding:"7px 10px",border:`1px solid ${C.border}`,borderRadius:7,fontSize:12,outline:"none"}}>
              <option value="">— select —</option>
              {vmData.map(v=><option key={v.type} value={v.type}>{v.type}</option>)}
            </select>
          </FieldLabel>
          <FieldLabel label="Capacity (Shipments)">
            <Input type="number" value={scvForm.cap} onChange={e=>setScvForm(p=>({...p,cap:e.target.value}))} placeholder={`Default: ${vmByType(scvForm.vehicleType)?.cap||"—"}`}/>
          </FieldLabel>
          <FieldLabel label="Distance Limit (km)">
            <Input type="number" value={scvForm.dist} onChange={e=>setScvForm(p=>({...p,dist:e.target.value}))} placeholder={`Default: ${vmByType(scvForm.vehicleType)?.dist||"—"}`}/>
          </FieldLabel>
          <FieldLabel label="Vehicle Count"><Input type="number" value={scvForm.count} onChange={e=>setScvForm(p=>({...p,count:e.target.value}))}/></FieldLabel>
          <FieldLabel label={`Touch Point Limit (VM max: ${vmByType(scvForm.vehicleType)?.tp||"—"})`}>
            <Input type="number" value={scvForm.tpLimit} onChange={e=>setScvForm(p=>({...p,tpLimit:e.target.value}))} placeholder={`Default: ${vmByType(scvForm.vehicleType)?.tp||"—"}`}/>
            {scvForm.vehicleType&&+scvForm.tpLimit>tpCapForType(scvForm.vehicleType)&&
              <div style={{marginTop:4,padding:"3px 8px",background:C.warningLight,borderRadius:5,fontSize:10,color:"#92400e"}}>⚠ Exceeds VM hard cap of {tpCapForType(scvForm.vehicleType)} — will be capped on save</div>}
          </FieldLabel>
        </div>
        {scvForm.vehicleType&&vmByType(scvForm.vehicleType)&&<div style={{marginTop:12,padding:"8px 12px",background:"#eef4ff",borderRadius:8,fontSize:11,color:C.primary,border:"1px solid #bfdbfe"}}>
          Vehicle Master defaults for <b>{scvForm.vehicleType}</b>: cap={vmByType(scvForm.vehicleType).cap} · dist={vmByType(scvForm.vehicleType).dist} km · tp={vmByType(scvForm.vehicleType).tp} · local={vmByType(scvForm.vehicleType).tpLocal} · non-local={vmByType(scvForm.vehicleType).tpNonLocal}
        </div>}
        <div style={{display:"flex",gap:8,justifyContent:"flex-end",marginTop:14}}>
          <Btn variant="ghost" onClick={()=>setScvModal(false)}>Cancel</Btn>
          <Btn disabled={!scvForm.scCode||!scvForm.vehicleType} onClick={saveScv}>{scvEditIdx!==null?"Save Changes":"Add"}</Btn>
        </div>
      </Modal>

      {/* Add Vehicle Type Modal */}
      <Modal open={vmModal} onClose={()=>setVmModal(false)} title="Add Vehicle Type" width={520}>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
          <FieldLabel label="Vehicle Type *"><Input value={vmForm.type} onChange={e=>setVmForm(p=>({...p,type:e.target.value}))}/></FieldLabel>
          <FieldLabel label="Capacity (Shipments)"><Input type="number" value={vmForm.cap} onChange={e=>setVmForm(p=>({...p,cap:e.target.value}))}/></FieldLabel>
          <FieldLabel label="Distance Limit (km)"><Input type="number" value={vmForm.dist} onChange={e=>setVmForm(p=>({...p,dist:e.target.value}))}/></FieldLabel>
          <FieldLabel label="TP Limit (Hard Cap) *"><Input type="number" value={vmForm.tp} onChange={e=>setVmForm(p=>({...p,tp:e.target.value}))}/></FieldLabel>
          <FieldLabel label="TP Limit (Local)"><Input type="number" value={vmForm.tpLocal} onChange={e=>setVmForm(p=>({...p,tpLocal:e.target.value}))}/></FieldLabel>
          <FieldLabel label="TP Limit (Non-Local)"><Input type="number" value={vmForm.tpNonLocal} onChange={e=>setVmForm(p=>({...p,tpNonLocal:e.target.value}))}/></FieldLabel>
          <FieldLabel label="LH Feasibility">
            <div style={{display:"flex",gap:6,flexWrap:"wrap",paddingTop:4}}>
              {["FM Carting","NLH","RLH"].map(f=>{const has=vmForm.feas.includes(f);return <button key={f} onClick={()=>setVmForm(p=>({...p,feas:has?p.feas.filter(x=>x!==f):[...p.feas,f]}))} style={{padding:"4px 12px",fontSize:11,fontWeight:600,borderRadius:99,border:`1.5px solid ${has?C.primary:C.border}`,background:has?C.primaryLight:"#fff",color:has?C.primary:C.muted,cursor:"pointer"}}>{f}</button>;})}
            </div>
          </FieldLabel>
        </div>
        <div style={{display:"flex",gap:8,justifyContent:"flex-end",marginTop:14}}>
          <Btn variant="ghost" onClick={()=>setVmModal(false)}>Cancel</Btn>
          <Btn disabled={!vmForm.type||!vmForm.tp} onClick={()=>{setVmData(p=>[...p,{type:vmForm.type,cap:+vmForm.cap||0,dist:+vmForm.dist||0,tp:+vmForm.tp,tpLocal:+vmForm.tpLocal||+vmForm.tp,tpNonLocal:+vmForm.tpNonLocal||+vmForm.tp,feas:vmForm.feas}]);setVmModal(false);}}>Add Vehicle Type</Btn>
        </div>
      </Modal>
    </div>
  );
}

// ─── Design Creation ──────────────────────────────────────────────────────
function DesignCreation({ sub, setPage, addDesign }) {
  const active=["route-planning","mapping"].includes(sub)?sub:"route-planning";
  return (
    <div style={{padding:"28px 32px",maxWidth:1100}}>
      <Breadcrumb items={[{label:"Dashboard",page:"dashboard"},{label:"Design Creation"}]} setPage={setPage}/>
      <div style={{marginBottom:20}}><h1 style={{fontSize:22,fontWeight:800}}>Design Creation</h1><p style={{color:C.muted,marginTop:4,fontSize:13}}>Build RLH route plans, node mapping, and visualise the network.</p></div>
      <Tabs tabs={[{key:"route-planning",label:"Route Planning"},{key:"mapping",label:"Mapping"}]} active={active} onChange={k=>setPage(`design-creation/${k}`)}/>
      {active==="route-planning"&&<RLHPlanning setPage={setPage} addDesign={addDesign}/>}
      {active==="mapping"&&<Card style={{padding:"40px 24px",textAlign:"center",borderStyle:"dashed"}}><div style={{fontSize:28,marginBottom:8}}>🚧</div><div style={{fontWeight:700,fontSize:14,marginBottom:4}}>SC-DC Mapping</div><div style={{fontSize:12,color:C.muted}}>Mapping algorithm configuration — coming soon.</div></Card>}
    </div>
  );
}


// ─── Vehicle types master ─────────────────────────────────────────────────
const VEHICLE_TYPES = ["Tata Ace","Bolero","14ft","17ft","19ft","22ft","24ft SXL","32ft MXL","Trailer"];
const TP_LIMITS = {"Tata Ace":8,"Bolero":10,"14ft":6,"17ft":5,"19ft":4,"22ft":3,"24ft SXL":2,"32ft MXL":2,"Trailer":1};
const LMDC_LANDING_FILES = ["LMDC Landing (Apr 2026)","LMDC Landing (Mar 2026)","LMDC Landing (Q1 2026)"];

// ─── LMDC Landing schema (from template: _Template__LMDC_Landing.xlsx) ────
const LMDC_LANDING_SCHEMA = {
  columns: [
    {
      name: "LMDC Code",
      key:  "lmdc code",
      mandatory: true,
      format: "alphanumeric",
      rule: v => {
        if (!v || !v.trim()) return "LMDC Code is mandatory";
        if (!/^[a-zA-Z0-9_-]+$/.test(v.trim())) return "LMDC Code must be alphanumeric";
        if (v.trim().length < 3 || v.trim().length > 30) return "LMDC Code must be between 3 and 30 characters";
        return null;
      },
    },
    {
      name: "Planned Volume",
      key:  "planned volume",
      mandatory: true,
      format: "number",
      rule: v => {
        if (v === undefined || v === null || v === "") return "Planned Volume is mandatory";
        if (isNaN(Number(v))) return "Planned Volume must be a number";
        if (Number(v) <= 0) return "Planned Volume cannot be ≤ 0";
        return null;
      },
    },
  ],
  downloadTemplate: () => {
    const rows = [
      ["Mandatory/Optional:", "Mandatory",   "Mandatory"],
      ["Input Format:",       "alphanumeric","number"],
      ["Validation Rule",     "3-30 characters, alphanumeric", "Cannot be <=0"],
      ["Column Name:",        "LMDC Code",   "Planned Volume"],
      // example data row
      ["",                   "LMDC-BLR-001", "1200"],
    ];
    const csv = rows.map(r => r.join(",")).join("\n");
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
    a.download = "_Template__LMDC_Landing.csv";
    a.click();
  },
  validate: (rows) => {
    const errors = [], warnings = [];
    const schema = LMDC_LANDING_SCHEMA.columns;
    const seenCodes = {};
    rows.forEach((row, i) => {
      const rowNum = i + 2; // +2 because row 1 is header
      schema.forEach(col => {
        const val = row[col.key];
        const msg = col.rule(val);
        if (msg) {
          if (col.mandatory) errors.push({ rowNum, field: col.name, msg });
          else               warnings.push({ rowNum, field: col.name, msg });
        }
      });
      // Duplicate LMDC Code check
      const code = (row["lmdc code"] || "").trim().toLowerCase();
      if (code) {
        if (seenCodes[code]) errors.push({ rowNum, field: "LMDC Code", msg: `Duplicate LMDC Code: ${row["lmdc code"]}` });
        seenCodes[code] = true;
      }
    });
    return { errors, warnings };
  },
};

function RLHPlanning({ setPage, addDesign }) {
  const [step, setStep]               = useState(1);
  const [selScs, setSelScs]           = useState([]);
  const [volumeFile, setVolumeFile]   = useState("");
  const [expandedSc, setExpandedSc]   = useState(null);
  const [deletedRows, setDeletedRows] = useState({});
  const [newNodesBySc, setNewNodesBySc] = useState({});
  const [addingNode, setAddingNode]   = useState(null);
  const [newNodeForm, setNewNodeForm] = useState({lmdcCode:"",lmdcName:"",capacity:""});
  // B1 fix: scSearch lifted out of IIFE into proper component state
  const [scSearch, setScSearch]       = useState("");

  // Step 2 – vehicles
  const [vehiclesBySc, setVehiclesBySc] = useState({});
  const [addVehSc, setAddVehSc]         = useState(null);
  const [vehForm, setVehForm]           = useState({type:"17ft",count:1,maxTp:"",serveType:"Both"});

  // Step 3 – run config
  const [runName, setRunName]       = useState("");
  const [hwGlobal, setHwGlobal]     = useState("0");
  const [hwBySc, setHwBySc]         = useState({});
  const [newNodeAdd, setNewNodeAdd] = useState(false);
  const [refPlanBySc, setRefPlanBySc] = useState({});
  const [violAck, setViolAck]       = useState({});
  const [runs, setRuns]             = useState([]);
  const [running, setRunning]       = useState(false);
  const [selScsTrigger, setSelScsTrigger] = useState([]);

  const toggle = sc => setSelScs(p => p.includes(sc) ? p.filter(x=>x!==sc) : [...p, sc]);

  // U1 fix: keep trigger selection in sync when user modifies SC list on step 1/2
  useEffect(() => {
    setSelScsTrigger(prev => prev.filter(sc => selScs.includes(sc)));
  }, [selScs]);

  const effectiveNodes = sc => {
    const scObj = LMSC_DATA.find(s=>s.lmscCode===sc);
    if (!scObj) return [];
    const del = deletedRows[sc] || new Set();
    const base = scObj.dcs.filter(d=>d.active&&d.capacity>0&&!del.has(d.lmdcCode));
    const added = (newNodesBySc[sc]||[]);
    return [...base, ...added];
  };

  const scFlags = sc => {
    const scObj = LMSC_DATA.find(s=>s.lmscCode===sc);
    if (!scObj) return [];
    const nodes = effectiveNodes(sc);
    const flags = [];
    const totalCap = nodes.reduce((a,n)=>a+(n.capacity||0),0);
    if (totalCap > scObj.scCapacity) flags.push({type:"warning",msg:`Node capacity (${totalCap.toLocaleString()}) exceeds SC sort cap (${scObj.scCapacity.toLocaleString()})`});
    if (volumeFile) nodes.filter(n=>(n.lastMfst7d||0)===0&&!n._isNew).forEach(n=>flags.push({type:"error",msg:`${n.lmdcCode}: volume = 0`}));
    return flags;
  };

  const scVehicles = sc => vehiclesBySc[sc] || [{type:"17ft",count:4,maxTp:5,serveType:"Both"},{type:"Bolero",count:2,maxTp:10,serveType:"Both"}];

  const addVehicle = sc => {
    const tpLimit = TP_LIMITS[vehForm.type] || 5;
    const finalTp = Math.min(+vehForm.maxTp || tpLimit, tpLimit);
    setVehiclesBySc(p => ({...p, [sc]: [...scVehicles(sc), {type:vehForm.type, count:+vehForm.count, maxTp:finalTp, serveType:vehForm.serveType||"Both"}]}));
    setAddVehSc(null);
    setVehForm({type:"17ft",count:1,maxTp:"",serveType:"Both"});
  };
  const removeVehicle = (sc, idx) => setVehiclesBySc(p => ({...p, [sc]: scVehicles(sc).filter((_,i)=>i!==idx)}));

  const trigger = () => {
    const eligible = selScsTrigger.filter(sc => scFlags(sc).filter(f=>f.type==="error").length===0 || violAck[sc]);
    if (!eligible.length) return;
    setRunning(true);
    const now = new Date();
    const nr = eligible.map(sc => ({
      id:`rlh-${Date.now()}-${sc}`, runName:`${sc}${runName?"-"+runName:""}-${now.toISOString().slice(0,10)}`,
      scCode:sc, status:"Planned", progress:0, triggeredAt:now.toISOString(),
      hw:hwBySc[sc]||hwGlobal, newNodeAdd, refPlan:refPlanBySc[sc]||null,
    }));
    setRuns(p => [...nr,...p]);
    nr.forEach((r,i) => {
      setTimeout(()=>setRuns(p=>p.map(x=>x.id===r.id?{...x,status:"In-Progress",progress:40}:x)), 900+i*200);
      setTimeout(()=>setRuns(p=>p.map(x=>x.id===r.id?{...x,progress:80}:x)), 2200+i*200);
      setTimeout(()=>{
        setRuns(p=>p.map(x=>x.id===r.id?{...x,status:"Completed",progress:100}:x));
        // B2 fix: bridge completed run into App-level designs state
        if (addDesign) {
          const scObj = LMSC_DATA.find(s=>s.lmscCode===r.scCode);
          const nodes = effectiveNodes(r.scCode);
          const vehs = scVehicles(r.scCode);
          const rows = nodes.filter(n=>n.lmdcCode).map((n,ri) => ({
            rowId:`r${ri+1}`,
            lmscCode: r.scCode,
            lmdcCode: n.lmdcCode,
            segment: `${r.scCode}  ${n.lmdcCode}`,
            vehicleType: vehs[ri%vehs.length]?.type||"17ft",
            vehicleCount: vehs[ri%vehs.length]?.count||2,
            tripFrequency:"Daily",
            transitHours: Math.round((1+Math.random()*1.5)*10)/10,
            routeDistanceKm: Math.round(8+Math.random()*30),
            cps: Math.round(14+Math.random()*12),
            tp: Math.round(2+Math.random()*4),
            utilPct: Math.round(55+Math.random()*35),
          }));
          const newDesign = {
            id: r.id, runId: r.runName,
            name: r.runName, type:"RLH",
            zone: scObj?.zone||"",
            scId: r.scCode,
            triggeredOn: new Date(r.triggeredAt).toLocaleString(),
            triggeredBy:"Current User",
            pushed:false, accepted:false, acceptedWithWarnings:false,
            inputNodes: nodes.map(n=>n.lmdcCode).filter(Boolean),
            metrics:{
              coveragePct:100,
              cps:rows.length?Math.round(rows.reduce((a,rr)=>a+rr.cps,0)/rows.length*10)/10:0,
              utilPct:rows.length?Math.round(rows.reduce((a,rr)=>a+rr.utilPct,0)/rows.length):0,
              totalRoutes:rows.length,
              vehicleBreakdown: Object.fromEntries([...new Set(vehs.map(v=>v.type))].map(t=>[t,vehs.filter(v=>v.type===t).reduce((a,v)=>a+v.count,0)])),
              totalDistance:rows.reduce((a,rr)=>a+rr.routeDistanceKm,0),
              totalCost:rows.reduce((a,rr)=>a+rr.cps*rr.vehicleCount*30,0),
            },
            rows,
          };
          addDesign(newDesign);
        }
      }, 3600+i*200);
    });
    setTimeout(()=>setRunning(false), 4000+nr.length*200);
  };

  const stepNav = [{num:1,label:"Node Selection"},{num:2,label:"Vehicle Selection"},{num:3,label:"Preview & Trigger"}];

  return (
    <div>
      {/* Step progress bar */}
      <div style={{display:"flex",gap:0,marginBottom:20,background:"#fff",border:`1px solid ${C.border}`,borderRadius:10,overflow:"hidden"}}>
        {stepNav.map((s,i) => (
          <button key={s.num} onClick={()=>(s.num<=1||selScs.length>0)&&setStep(s.num)} style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",gap:4,padding:"12px 8px",background:step===s.num?"#2d6af6":"#fff",borderRight:i<2?`1px solid ${C.border}`:"none",cursor:"pointer",border:"none",opacity:s.num>1&&!selScs.length?.5:1}}>
            <span style={{fontSize:11,fontWeight:700,color:step===s.num?"#fff":C.muted,textAlign:"center"}}>{s.num}. {s.label}</span>
          </button>
        ))}
      </div>

      {/* ── STEP 1: NODE SELECTION ── */}
      {step===1&&<div>
        {/* Volume file */}
        <Card style={{padding:"14px 16px",marginBottom:16,background:volumeFile?"#f0fdf4":"#fff",border:`2px solid ${volumeFile?C.accent:C.border}`}}>
          <div style={{fontWeight:700,fontSize:13,marginBottom:4}}>📊 Plan Volume File (LMDC Landing)</div>
          <div style={{fontSize:11,color:C.muted,marginBottom:8}}>Select the volume file for this plan run. Nodes with volume = 0 will be flagged.</div>
          <div style={{display:"flex",gap:8,alignItems:"center",flexWrap:"wrap"}}>
            <select value={volumeFile} onChange={e=>setVolumeFile(e.target.value)} style={{fontSize:12,padding:"6px 10px",border:`1px solid ${C.border}`,borderRadius:7,background:"#fff",minWidth:260,outline:"none"}}>
              <option value="">— Select LMDC Landing file —</option>
              {LMDC_LANDING_FILES.map(f=><option key={f} value={f}>{f}</option>)}
            </select>
            {volumeFile&&<Badge small color="success">✓ {volumeFile}</Badge>}
          </div>
        </Card>

        {/* SC selector — searchable multi-select bar */}
        {(()=>{
          const ZONES=[{key:"North"},{key:"South"},{key:"East"},{key:"West"}];
          // scSearch is now lifted state — no hooks inside IIFE
          const searchFiltered=LMSC_DATA.filter(sc=>
            sc.lmscCode.toLowerCase().includes(scSearch.toLowerCase())||
            sc.lmscName.toLowerCase().includes(scSearch.toLowerCase())||
            sc.zone.toLowerCase().includes(scSearch.toLowerCase())
          );
          const toggleZone=zone=>{
            const zoneCs=LMSC_DATA.filter(s=>s.zone===zone).map(s=>s.lmscCode);
            const allIn=zoneCs.every(c=>selScs.includes(c));
            if(allIn) setSelScs(p=>p.filter(c=>!zoneCs.includes(c)));
            else setSelScs(p=>[...new Set([...p,...zoneCs])]);
          };

          // CSV download — consolidated node list for all selected SCs
          const downloadNodeCsv=()=>{
            const rows=[["LMSC Code","LMSC Name","Zone","LMDC Code","LMDC Name","Capacity","Active","Last Mfst 7d"]];
            selScs.forEach(sc=>{
              const scObj=LMSC_DATA.find(s=>s.lmscCode===sc);
              if(!scObj)return;
              const del=deletedRows[sc]||new Set();
              scObj.dcs.filter(d=>!del.has(d.lmdcCode)).forEach(d=>{
                rows.push([sc,scObj.lmscName,scObj.zone,d.lmdcCode,d.lmdcName,d.capacity,d.active?"Yes":"No",d.lastMfst7d]);
              });
              (newNodesBySc[sc]||[]).forEach(d=>{
                rows.push([sc,scObj.lmscName,scObj.zone,d.lmdcCode,d.lmdcName,d.capacity||"","Yes (new)","—"]);
              });
            });
            const csv=rows.map(r=>r.join(",")).join("\n");
            const a=document.createElement("a");
            a.href=URL.createObjectURL(new Blob([csv],{type:"text/csv"}));
            a.download=`node_list_${new Date().toISOString().slice(0,10)}.csv`;
            a.click();
          };

          return <>
            {/* Single bar: search + zone shortcuts + select-all */}
            <div style={{marginBottom:12}}>
              <div style={{fontSize:11,fontWeight:700,textTransform:"uppercase",letterSpacing:.5,color:C.muted,marginBottom:8}}>Select Sort Centres (LMSCs)</div>
              <div style={{display:"flex",gap:8,alignItems:"center",padding:"8px 12px",background:"#fff",border:`1.5px solid ${C.border}`,borderRadius:10,flexWrap:"wrap"}}>
                {/* Search + multi-select dropdown */}
                <div style={{position:"relative",flex:"0 0 260px"}}>
                  <span style={{position:"absolute",left:9,top:"50%",transform:"translateY(-50%)",fontSize:13,color:C.muted,pointerEvents:"none"}}>🔍</span>
                  <input value={scSearch} onChange={e=>setScSearch(e.target.value)}
                    placeholder="Search & select LMSC…"
                    style={{width:"100%",padding:"6px 10px 6px 30px",border:`1px solid ${C.border}`,borderRadius:7,fontSize:12,outline:"none",background:"#f8fafc"}}/>
                  {scSearch&&<div style={{position:"absolute",top:"100%",left:0,right:0,background:"#fff",border:`1px solid ${C.border}`,borderRadius:8,boxShadow:"0 4px 16px rgba(0,0,0,.12)",zIndex:200,maxHeight:180,overflowY:"auto",marginTop:2}}>
                    {searchFiltered.length===0
                      ? <div style={{padding:"10px 14px",fontSize:12,color:C.muted}}>No SCs match</div>
                      : searchFiltered.map(sc=>{
                          const isSel=selScs.includes(sc.lmscCode);
                          return <div key={sc.lmscCode} onClick={()=>{toggle(sc.lmscCode);setScSearch("");}}
                            style={{padding:"8px 14px",cursor:"pointer",display:"flex",alignItems:"center",gap:8,background:isSel?"#eff6ff":"#fff",borderBottom:`1px solid ${C.border}`}}>
                            <div style={{width:15,height:15,borderRadius:3,border:`2px solid ${isSel?C.primary:C.border}`,background:isSel?C.primary:"#fff",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>{isSel&&<span style={{color:"#fff",fontSize:8,fontWeight:900}}>✓</span>}</div>
                            <div><div style={{fontSize:12,fontWeight:700,fontFamily:"monospace"}}>{sc.lmscCode}</div><div style={{fontSize:10,color:C.muted}}>{sc.lmscName} · {sc.zone}</div></div>
                          </div>;
                        })}
                  </div>}
                </div>

                <div style={{width:1,height:24,background:C.border,flexShrink:0}}/>

                {/* Zone icon buttons */}
                {ZONES.map(z=>{
                  const zCs=LMSC_DATA.filter(s=>s.zone===z.key).map(s=>s.lmscCode);
                  const allIn=zCs.length>0&&zCs.every(c=>selScs.includes(c));
                  const someIn=zCs.some(c=>selScs.includes(c))&&!allIn;
                  return <button key={z.key} onClick={()=>toggleZone(z.key)} title={`${z.key} Zone`}
                    style={{padding:"4px 10px",fontSize:11,fontWeight:500,borderRadius:4,border:`1px solid ${allIn?C.primary:someIn?"#bfdbfe":C.border}`,background:allIn?"#eff6ff":"#fff",color:allIn?C.primary:someIn?"#1d4ed8":C.muted,cursor:"pointer"}}>
                    {z.key}
                    {(allIn||someIn)&&<span style={{fontSize:10,background:C.primary,color:"#fff",borderRadius:99,padding:"0 5px",minWidth:14,textAlign:"center"}}>{zCs.filter(c=>selScs.includes(c)).length}</span>}
                  </button>;
                })}

                <div style={{width:1,height:24,background:C.border,flexShrink:0}}/>

                {/* Select all / clear */}
                <button onClick={()=>setSelScs(LMSC_DATA.map(x=>x.lmscCode))}
                  style={{padding:"5px 12px",fontSize:11,fontWeight:700,borderRadius:7,border:`1px solid ${C.border}`,background:"#fff",color:C.muted,cursor:"pointer"}}>
                  Select All
                </button>
                {selScs.length>0&&<button onClick={()=>setSelScs([])}
                  style={{padding:"5px 12px",fontSize:11,fontWeight:600,borderRadius:7,border:`1px solid ${C.border}`,background:"#fff",color:C.danger,cursor:"pointer"}}>
                  Clear ✕
                </button>}

                {/* Selection count + CSV download */}
                {selScs.length>0&&<>
                  <span style={{fontSize:11,fontWeight:700,color:C.primary,marginLeft:"auto"}}>{selScs.length} SC{selScs.length!==1?"s":""} selected</span>
                  <button onClick={downloadNodeCsv}
                    style={{display:"inline-flex",alignItems:"center",gap:5,padding:"5px 12px",fontSize:11,fontWeight:600,borderRadius:7,border:`1px solid ${C.border}`,background:"#fff",color:C.muted,cursor:"pointer",whiteSpace:"nowrap"}}>
                    ⬇ Node List CSV
                  </button>
                </>}
              </div>
            </div>

            {/* Expandable SC cards */}
            {selScs.map(sc=>{
              const scObj=LMSC_DATA.find(s=>s.lmscCode===sc);
              if(!scObj)return null;
              const nodes=effectiveNodes(sc);
              const flags=scFlags(sc);
              const isExp=expandedSc===sc;
              return <Card key={sc} style={{marginBottom:10,overflow:"hidden"}}>
                {/* Card header with tick deselect */}
                <div style={{display:"flex",alignItems:"center",gap:12,padding:"11px 16px",background:isExp?"#f0f7ff":"#fff"}}>
                  {/* Tick to deselect */}
                  <div onClick={()=>toggle(sc)} title="De-select SC"
                    style={{width:18,height:18,borderRadius:4,border:`2px solid ${C.primary}`,background:C.primary,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,cursor:"pointer"}}>
                    <span style={{color:"#fff",fontSize:9,fontWeight:900}}>✓</span>
                  </div>
                  {/* Expand toggle on rest of header */}
                  <div onClick={()=>setExpandedSc(isExp?null:sc)} style={{flex:1,cursor:"pointer"}}>
                    <div style={{display:"flex",alignItems:"center",gap:8,flexWrap:"wrap"}}>
                      <span style={{fontWeight:700,fontSize:13,fontFamily:"monospace"}}>{sc}</span>
                      <span style={{fontSize:11,color:C.muted}}>{scObj.lmscName}</span>
                      <Badge small color="default">{scObj.zone}</Badge>
                      <Badge small color="primary">{nodes.length} nodes</Badge>
                      {flags.map((f,fi)=><span key={fi} style={{padding:"1px 7px",borderRadius:99,fontSize:10,fontWeight:600,background:f.type==="error"?C.dangerLight:C.warningLight,color:f.type==="error"?C.danger:"#92400e"}}>{f.type==="error"?"🚫":"⚠"} {f.msg}</span>)}
                    </div>
                  </div>
                  <span onClick={()=>setExpandedSc(isExp?null:sc)} style={{fontSize:11,color:C.muted,flexShrink:0,cursor:"pointer"}}>{isExp?"▲ Collapse":"▼ Expand"}</span>
                </div>
                {isExp&&<div style={{borderTop:`1px solid ${C.border}`}}>
                  <div style={{overflowX:"auto"}}>
                    <table style={{width:"100%",borderCollapse:"collapse"}}>
                      <thead><tr>{["LMDC Code","LMDC Name","Source","Capacity","Vol (7d)","Vol Flag","Remove"].map((h,i)=><th key={i} style={{padding:"6px 12px",background:"#f8fafc",borderBottom:`1px solid ${C.border}`,fontSize:10,fontWeight:700,color:C.muted,textTransform:"uppercase",textAlign:i>2?"right":"left",whiteSpace:"nowrap"}}>{h}</th>)}</tr></thead>
                      <tbody>
                        {scObj.dcs.filter(d=>d.active&&d.capacity>0&&!(deletedRows[sc]||new Set()).has(d.lmdcCode)).map(d=>{
                          const zeroVol=volumeFile&&d.lastMfst7d===0;
                          return <tr key={d.lmdcCode} style={{background:zeroVol?"#fff5f5":"#fff"}}>
                            <td style={{padding:"7px 12px",borderBottom:`1px solid ${C.border}`,fontFamily:"monospace",fontSize:11,fontWeight:600}}>{d.lmdcCode}</td>
                            <td style={{padding:"7px 12px",borderBottom:`1px solid ${C.border}`,fontSize:12}}>{d.lmdcName}</td>
                            <td style={{padding:"7px 12px",borderBottom:`1px solid ${C.border}`}}><Badge small color="default">AutoDML</Badge></td>
                            <td style={{padding:"7px 12px",borderBottom:`1px solid ${C.border}`,fontSize:12,textAlign:"right"}}>{d.capacity.toLocaleString()}</td>
                            <td style={{padding:"7px 12px",borderBottom:`1px solid ${C.border}`,fontSize:12,textAlign:"right",color:zeroVol?C.danger:"inherit",fontWeight:zeroVol?700:"normal"}}>{volumeFile?d.lastMfst7d.toLocaleString():"—"}</td>
                            <td style={{padding:"7px 12px",borderBottom:`1px solid ${C.border}`}}>{zeroVol?<Badge small color="danger">Vol=0</Badge>:<span style={{fontSize:11,color:C.accent}}>✓</span>}</td>
                            <td style={{padding:"7px 12px",borderBottom:`1px solid ${C.border}`}}><button onClick={()=>setDeletedRows(p=>({...p,[sc]:new Set([...(p[sc]||[]),d.lmdcCode])}))} style={{padding:"2px 8px",fontSize:10,color:C.danger,border:`1px solid ${C.dangerLight}`,borderRadius:4,background:"#fff",cursor:"pointer"}}>🗑</button></td>
                          </tr>;
                        })}
                        {(newNodesBySc[sc]||[]).map((d,ni)=><tr key={`new-${ni}`} style={{background:"#f0fdf4"}}>
                          <td style={{padding:"7px 12px",borderBottom:`1px solid ${C.border}`,fontFamily:"monospace",fontSize:11,fontWeight:600}}>{d.lmdcCode}</td>
                          <td style={{padding:"7px 12px",borderBottom:`1px solid ${C.border}`,fontSize:12}}>{d.lmdcName}</td>
                          <td style={{padding:"7px 12px",borderBottom:`1px solid ${C.border}`}}><Badge small color="success">New</Badge></td>
                          <td style={{padding:"7px 12px",borderBottom:`1px solid ${C.border}`,fontSize:12,textAlign:"right"}}>{d.capacity||"—"}</td>
                          <td style={{padding:"7px 12px",borderBottom:`1px solid ${C.border}`,fontSize:12,textAlign:"right"}}>—</td>
                          <td style={{padding:"7px 12px",borderBottom:`1px solid ${C.border}`}}><Badge small color="primary">New</Badge></td>
                          <td style={{padding:"7px 12px",borderBottom:`1px solid ${C.border}`}}><button onClick={()=>setNewNodesBySc(p=>({...p,[sc]:(p[sc]||[]).filter((_,i)=>i!==ni)}))} style={{padding:"2px 8px",fontSize:10,color:C.danger,border:`1px solid ${C.dangerLight}`,borderRadius:4,background:"#fff",cursor:"pointer"}}>🗑</button></td>
                        </tr>)}
                      </tbody>
                    </table>
                  </div>
                  {addingNode===sc
                    ? <div style={{padding:"10px 14px",background:"#f0fdf4",borderTop:`1px solid ${C.border}`,display:"grid",gridTemplateColumns:"1fr 1fr 1fr auto",gap:8,alignItems:"end"}}>
                        <FieldLabel label="LMDC Code *"><Input value={newNodeForm.lmdcCode} onChange={e=>setNewNodeForm(p=>({...p,lmdcCode:e.target.value}))} placeholder="LMDC-XXX-001"/></FieldLabel>
                        <FieldLabel label="LMDC Name *"><Input value={newNodeForm.lmdcName} onChange={e=>setNewNodeForm(p=>({...p,lmdcName:e.target.value}))} placeholder="DC Name"/></FieldLabel>
                        <FieldLabel label="Capacity"><Input type="number" value={newNodeForm.capacity} onChange={e=>setNewNodeForm(p=>({...p,capacity:e.target.value}))} placeholder="e.g. 1000"/></FieldLabel>
                        <div style={{marginBottom:12,display:"flex",gap:4}}>
                          <Btn size="sm" disabled={!newNodeForm.lmdcCode||!newNodeForm.lmdcName} onClick={()=>{setNewNodesBySc(p=>({...p,[sc]:[...(p[sc]||[]),{...newNodeForm,_isNew:true}]}));setAddingNode(null);setNewNodeForm({lmdcCode:"",lmdcName:"",capacity:""});}}>Add</Btn>
                          <Btn size="sm" variant="ghost" onClick={()=>setAddingNode(null)}>Cancel</Btn>
                        </div>
                      </div>
                    : <div style={{padding:"8px 14px",borderTop:`1px solid ${C.border}`,background:"#f8fafc"}}>
                        <button onClick={()=>setAddingNode(sc)} style={{fontSize:11,fontWeight:600,color:C.accent,background:"none",border:"none",cursor:"pointer"}}>＋ Add New Node / Migration</button>
                      </div>}
                  <div style={{padding:"6px 14px",background:"#f8fafc",borderTop:`1px solid ${C.border}`,display:"flex",gap:16,fontSize:11,color:C.muted}}>
                    <span>Sort Cap: <b style={{color:"#1a2233"}}>{scObj.scCapacity.toLocaleString()}</b></span>
                    <span>Nodes: <b style={{color:"#1a2233"}}>{nodes.length}</b></span>
                    {volumeFile&&<span>Total vol: <b style={{color:C.primary}}>{scObj.dcs.filter(d=>d.active&&!(deletedRows[sc]||new Set()).has(d.lmdcCode)).reduce((a,n)=>a+(n.lastMfst7d||0),0).toLocaleString()}</b></span>}
                  </div>
                </div>}
              </Card>;
            })}
          </>;
        })()}

        {selScs.length===0&&<Card style={{padding:"36px 24px",textAlign:"center",borderStyle:"dashed"}}><div style={{fontSize:28,marginBottom:8}}>📍</div><div style={{fontWeight:600,fontSize:13,marginBottom:4}}>No SCs selected</div><div style={{fontSize:12,color:C.muted}}>Select one or more Sort Centres above.</div></Card>}
        <div style={{display:"flex",justifyContent:"flex-end",marginTop:14}}>
          <Btn disabled={!selScs.length} onClick={()=>setStep(2)}>Next: Vehicle Selection </Btn>
        </div>
      </div>}

      {/* ── STEP 2: VEHICLE SELECTION ── */}
      {step===2&&<div>
        {selScs.map(sc=>{
          const scObj=LMSC_DATA.find(s=>s.lmscCode===sc);
          const vehs=scVehicles(sc);
          return <Card key={sc} style={{marginBottom:12,overflow:"hidden"}}>
            <div style={{padding:"12px 16px",background:"#f8fafc",borderBottom:`1px solid ${C.border}`,display:"flex",alignItems:"center",justifyContent:"space-between"}}>
              <div style={{display:"flex",alignItems:"center",gap:8}}>
                <span style={{fontWeight:700,fontSize:13,fontFamily:"monospace"}}>{sc}</span>
                <span style={{fontSize:11,color:C.muted}}>{scObj?.lmscName}</span>
                <Badge small color="default">{scObj?.zone}</Badge>
              </div>
              <Btn size="sm" variant="outline" onClick={()=>setAddVehSc(addVehSc===sc?null:sc)}>+ Add Vehicle</Btn>
            </div>
            {addVehSc===sc&&<div style={{padding:"12px 16px",background:"#eef4ff",borderBottom:`1px solid ${C.border}`,display:"grid",gridTemplateColumns:"1fr 1fr 1fr 1fr auto",gap:8,alignItems:"end"}}>
              <FieldLabel label="Vehicle Type">
                <select value={vehForm.type} onChange={e=>setVehForm(p=>({...p,type:e.target.value,maxTp:String(TP_LIMITS[e.target.value]||5)}))} style={{width:"100%",padding:"7px 10px",border:`1px solid ${C.border}`,borderRadius:7,fontSize:13,outline:"none"}}>
                  {VEHICLE_TYPES.map(v=><option key={v} value={v}>{v}</option>)}
                </select>
              </FieldLabel>
              <FieldLabel label="Count *"><Input type="number" value={vehForm.count} onChange={e=>setVehForm(p=>({...p,count:e.target.value}))}/></FieldLabel>
              <FieldLabel label={`Max TPs (limit: ${TP_LIMITS[vehForm.type]||5})`}><Input type="number" value={vehForm.maxTp} onChange={e=>setVehForm(p=>({...p,maxTp:e.target.value}))} placeholder={String(TP_LIMITS[vehForm.type]||5)}/></FieldLabel>
              <FieldLabel label="Serve Type">
                <select value={vehForm.serveType||"Both"} onChange={e=>setVehForm(p=>({...p,serveType:e.target.value}))} style={{width:"100%",padding:"7px 10px",border:`1px solid ${C.border}`,borderRadius:7,fontSize:13,outline:"none"}}>
                  <option value="Both">Both</option>
                  <option value="Local">Local</option>
                  <option value="Non-Local">Non-Local</option>
                </select>
              </FieldLabel>
              <div style={{marginBottom:12,display:"flex",gap:4}}>
                <Btn size="sm" onClick={()=>addVehicle(sc)}>Add</Btn>
                <Btn size="sm" variant="ghost" onClick={()=>setAddVehSc(null)}>Cancel</Btn>
              </div>
            </div>}
            <div style={{padding:"12px 16px"}}>
              <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:8,marginBottom:12}}>
                {[["Sort Cap",scObj?.scCapacity?.toLocaleString()+" TPH"],["Active Nodes",effectiveNodes(sc).length],["Zone",scObj?.zone]].map(([l,v])=><div key={l} style={{padding:"8px 12px",background:"#f8fafc",borderRadius:7}}><div style={{fontSize:10,color:C.muted,textTransform:"uppercase",fontWeight:700,marginBottom:2}}>{l}</div><div style={{fontSize:13,fontWeight:800}}>{v}</div></div>)}
              </div>
              {vehs.length===0
                ? <div style={{fontSize:12,color:C.muted,fontStyle:"italic"}}>No vehicles configured. Add above.</div>
                : <table style={{width:"100%",borderCollapse:"collapse"}}>
                    <thead><tr>{["Type","Count","Max TPs","Serve Type","Status",""].map((h,i)=><th key={i} style={{padding:"5px 10px",background:"#f8fafc",borderBottom:`1px solid ${C.border}`,fontSize:10,fontWeight:700,color:C.muted,textTransform:"uppercase",textAlign:i>1&&i<4?"right":i===4?"left":"left"}}>{h}</th>)}</tr></thead>
                    <tbody>{vehs.map((v,vi)=>{const tpOver=v.maxTp>(TP_LIMITS[v.type]||99);const sType=v.serveType||"Both";return <tr key={vi} style={{background:tpOver?"#fffbeb":"#fff"}}>
                      <td style={{padding:"6px 10px",borderBottom:`1px solid ${C.border}`,fontSize:11,fontWeight:600}}>{v.type}</td>
                      <td style={{padding:"6px 10px",borderBottom:`1px solid ${C.border}`,fontSize:11,textAlign:"right"}}>{v.count}</td>
                      <td style={{padding:"6px 10px",borderBottom:`1px solid ${C.border}`,fontSize:11,textAlign:"right",color:tpOver?C.warning:"inherit",fontWeight:tpOver?700:"normal"}}>{v.maxTp} <span style={{color:C.muted,fontWeight:400}}>/ {TP_LIMITS[v.type]||"—"} max</span></td>
                      <td style={{padding:"6px 10px",borderBottom:`1px solid ${C.border}`}}>
                        <span style={{padding:"2px 9px",borderRadius:99,fontSize:10,fontWeight:700,background:sType==="Local"?"#e0e7ff":sType==="Non-Local"?"#fce7f3":"#f3f5f9",color:sType==="Local"?"#3730a3":sType==="Non-Local"?"#9d174d":"#374151"}}>{sType}</span>
                      </td>
                      <td style={{padding:"6px 10px",borderBottom:`1px solid ${C.border}`}}>{tpOver?<Badge small color="warning">⚠ TP exceeded</Badge>:<Badge small color="success">✓ OK</Badge>}</td>
                      <td style={{padding:"6px 10px",borderBottom:`1px solid ${C.border}`}}><button onClick={()=>removeVehicle(sc,vi)} style={{padding:"2px 6px",fontSize:10,color:C.danger,border:`1px solid ${C.dangerLight}`,borderRadius:4,background:"#fff",cursor:"pointer"}}>🗑</button></td>
                    </tr>;})}
                    </tbody>
                  </table>}
            </div>
          </Card>;
        })}
        <div style={{display:"flex",gap:8,justifyContent:"space-between",marginTop:8}}>
          <Btn variant="ghost" onClick={()=>setStep(1)}>Back</Btn>
          <Btn onClick={()=>{setSelScsTrigger([...selScs]);setViolAck({});setStep(3);}}>Next: Preview & Trigger </Btn>
        </div>
      </div>}

      {/* ── STEP 3: PREVIEW & TRIGGER ── */}
      {step===3&&<div>
        <Card style={{padding:"16px 18px",marginBottom:16}}>
          <div style={{fontWeight:700,fontSize:13,marginBottom:14}}>Run Configuration</div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,marginBottom:16}}>
            <FieldLabel label="Run Name (optional)"><Input value={runName} onChange={e=>setRunName(e.target.value)} placeholder="e.g. Q2-South-Run1"/></FieldLabel>
            <div style={{padding:"10px 12px",background:"#f8fafc",borderRadius:7,fontSize:11,color:C.muted,border:`1px solid ${C.border}`,display:"flex",alignItems:"center"}}>Naming: <code style={{marginLeft:6,fontSize:11}}>[SC]-[Name]-[Date]</code></div>
          </div>

          {/* HW global */}
          <div style={{padding:"12px 14px",background:"#f8fafc",borderRadius:8,border:`1px solid ${C.border}`,marginBottom:12}}>
            <div style={{fontSize:11,fontWeight:700,color:C.muted,textTransform:"uppercase",letterSpacing:.5,marginBottom:6}}>Historical Weight (HW) — Global Default</div>
            <div style={{fontSize:11,color:C.muted,marginBottom:10}}>Weight given to historical plan data in design creation. Per-SC overrides available below.</div>
            <div style={{display:"flex",gap:8}}>
              {[["0","HW = 0","No history"],["0.5","HW = 0.5","Blended"],["1","HW = 1","Full history"]].map(([val,label,sub])=>(
                <button key={val} onClick={()=>setHwGlobal(val)} style={{padding:"8px 16px",fontSize:11,fontWeight:700,borderRadius:8,border:`2px solid ${hwGlobal===val?C.primary:C.border}`,background:hwGlobal===val?C.primaryLight:"#fff",color:hwGlobal===val?C.primary:C.muted,cursor:"pointer",textAlign:"center",minWidth:90}}>
                  <div style={{fontSize:13,fontWeight:800}}>{label}</div>
                  <div style={{fontSize:10,fontWeight:400,marginTop:2}}>{sub}</div>
                </button>
              ))}
            </div>
          </div>

          {/* New node add */}
          <label style={{display:"flex",alignItems:"center",gap:10,cursor:"pointer",padding:"10px 14px",borderRadius:8,border:`1px solid ${newNodeAdd?C.primary:C.border}`,background:newNodeAdd?C.primaryLight:"#fff",width:"fit-content",marginBottom:12}}>
            <input type="checkbox" checked={newNodeAdd} onChange={e=>setNewNodeAdd(e.target.checked)} style={{width:16,height:16,cursor:"pointer"}}/>
            <div>
              <div style={{fontWeight:700,fontSize:12,color:newNodeAdd?C.primary:"#1a2233"}}>Include New Node Additions</div>
              <div style={{fontSize:11,color:C.muted,marginTop:2}}>New nodes from Node Inputs will be factored into the plan</div>
            </div>
          </label>

          {/* Reference plan */}
          {(hwGlobal!=="0"||newNodeAdd)&&<div style={{padding:"12px 14px",background:"#eef4ff",borderRadius:8,border:"1px solid #bfdbfe"}}>
            <div style={{fontSize:11,fontWeight:700,color:C.primary,marginBottom:8}}>Reference Plan Selection <span style={{fontWeight:400,color:C.muted}}>(required when HW &gt; 0 or New Node Add is checked)</span></div>
            {selScs.map(sc=><div key={sc} style={{display:"grid",gridTemplateColumns:"140px 1fr",gap:10,alignItems:"center",marginBottom:8}}>
              <span style={{fontWeight:700,fontSize:11,fontFamily:"monospace"}}>{sc}</span>
              <select value={refPlanBySc[sc]||""} onChange={e=>setRefPlanBySc(p=>({...p,[sc]:e.target.value}))} style={{fontSize:11,padding:"5px 8px",border:`1px solid ${C.border}`,borderRadius:6,background:"#fff",outline:"none"}}>
                <option value="">— Select reference plan —</option>
                {DESIGN_SEEDS.filter(d=>d.type==="RLH"&&d.scId===sc).map(d=><option key={d.id} value={d.id}>{d.name} ({d.triggeredOn?.slice(0,10)||""})</option>)}
              </select>
            </div>)}
          </div>}
        </Card>

        {/* SC summary cards */}
        <div style={{fontSize:11,fontWeight:700,textTransform:"uppercase",letterSpacing:.8,color:C.muted,marginBottom:10}}>Design Summary — {selScs.length} SC{selScs.length!==1?"s":""}</div>
        {selScs.map(sc=>{
          const scObj=LMSC_DATA.find(s=>s.lmscCode===sc);
          const flags=scFlags(sc);
          const hasErr=flags.some(f=>f.type==="error");
          const ackd=violAck[sc];
          const inTrigger=selScsTrigger.includes(sc);
          return <div key={sc} style={{marginBottom:10,border:`1.5px solid ${hasErr&&!ackd?C.danger:C.primary}`,borderRadius:10,overflow:"hidden",background:"#fff"}}>
            <div style={{display:"flex",alignItems:"center",gap:10,padding:"10px 16px",background:C.primaryLight,borderBottom:`1px solid ${C.border}`}}>
              <div onClick={()=>setSelScsTrigger(p=>p.includes(sc)?p.filter(x=>x!==sc):[...p,sc])} style={{width:18,height:18,borderRadius:4,border:`2px solid ${inTrigger?C.primary:C.border}`,background:inTrigger?C.primary:"#fff",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,cursor:"pointer"}}>{inTrigger&&<span style={{color:"#fff",fontSize:9,fontWeight:900}}>✓</span>}</div>
              <span style={{fontWeight:700,fontSize:12,fontFamily:"monospace"}}>{sc}</span>
              <span style={{fontSize:11,color:C.muted}}>{scObj?.lmscName}</span>
              <Badge small color="default">{scObj?.zone}</Badge>
              <div style={{marginLeft:"auto",display:"flex",gap:4}}>
                {flags.length===0&&<Badge small color="success">✓ No flags</Badge>}
                {flags.map((f,fi)=><span key={fi} style={{padding:"1px 7px",borderRadius:99,fontSize:10,fontWeight:600,background:f.type==="error"?C.dangerLight:C.warningLight,color:f.type==="error"?C.danger:"#92400e"}}>{f.msg}</span>)}
              </div>
            </div>
            <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)"}}>
              {[["Active Nodes",effectiveNodes(sc).length],["Vehicles",scVehicles(sc).length],["Vol File",volumeFile||"Not set"],["Sort Cap",scObj?.scCapacity?.toLocaleString()||"—"]].map(([l,v],i)=><div key={l} style={{padding:"8px 12px",textAlign:"center",borderRight:i<3?`1px solid ${C.border}`:"none"}}><div style={{fontSize:13,fontWeight:800,color:l==="Vol File"&&v==="Not set"?C.muted:"#1a2233"}}>{v}</div><div style={{color:C.muted,fontSize:10,marginTop:2}}>{l}</div></div>)}
            </div>
            {/* HW override per SC */}
            <div style={{padding:"10px 16px",borderTop:`1px solid ${C.border}`,background:"#fafafa",display:"flex",alignItems:"center",gap:10,flexWrap:"wrap"}}>
              <span style={{fontSize:11,fontWeight:600,color:C.muted}}>↳ LMSC HW Override</span>
              <span style={{fontSize:11,color:C.muted}}>{hwBySc[sc]?`Overriding global (HW=${hwGlobal})`:`Using global default (HW=${hwGlobal})`}</span>
              <div style={{display:"flex",gap:5}}>
                {["0","0.5","1"].map(val=>{const active=(hwBySc[sc]||hwGlobal)===val;return <button key={val} onClick={()=>setHwBySc(p=>({...p,[sc]:val}))} style={{padding:"3px 10px",fontSize:11,fontWeight:700,borderRadius:6,border:`1.5px solid ${active?C.primary:C.border}`,background:active?C.primaryLight:"#fff",color:active?C.primary:C.muted,cursor:"pointer"}}>HW={val}</button>;})}
                {hwBySc[sc]&&<button onClick={()=>setHwBySc(p=>{const n={...p};delete n[sc];return n;})} style={{padding:"3px 8px",fontSize:10,borderRadius:5,border:`1px solid ${C.border}`,background:"#fff",color:C.muted,cursor:"pointer"}}>↺ Reset</button>}
              </div>
            </div>
            {/* Violation ack */}
            {flags.length>0&&<div style={{padding:"10px 16px",background:hasErr?C.dangerLight:C.warningLight,borderTop:`1px solid ${C.border}`,display:"flex",alignItems:"center",gap:10,flexWrap:"wrap"}}>
              <div style={{flex:1,fontSize:11,color:hasErr?C.danger:"#92400e"}}>{hasErr?"🚫 Validation errors detected. Acknowledge to proceed or remove affected nodes.":"⚠ Warnings detected. Acknowledge to proceed."}</div>
              {!ackd&&<button onClick={()=>setViolAck(p=>({...p,[sc]:true}))} style={{padding:"4px 12px",fontSize:11,fontWeight:700,borderRadius:6,border:"none",background:hasErr?C.danger:C.warning,color:"#fff",cursor:"pointer"}}>✓ Acknowledge & Proceed</button>}
              {ackd&&<span style={{fontSize:11,fontWeight:700,color:"#065f46"}}>✅ Acknowledged — will be logged</span>}
            </div>}
          </div>;
        })}

        {/* Trigger panel */}
        <div style={{display:"flex",alignItems:"center",gap:12,marginTop:16,padding:"12px 16px",background:C.primaryLight,borderRadius:10,border:"1px solid #bfdbfe",flexWrap:"wrap"}}>
          <div style={{flex:1}}>
            <div style={{fontSize:13,fontWeight:700,color:C.primary,marginBottom:2}}>
              {selScsTrigger.length===0?"Select SCs to trigger":selScsTrigger.length===selScs.length?`Trigger all ${selScs.length} SCs`:`Trigger ${selScsTrigger.length} of ${selScs.length} SCs`}
            </div>
            <div style={{fontSize:11,color:C.muted}}>SCs with unacknowledged errors will be excluded.</div>
          </div>
          <div style={{display:"flex",gap:8}}>
            <Btn variant="ghost" onClick={()=>setStep(2)}>Back</Btn>
            <Btn disabled={selScsTrigger.length===0||running} onClick={trigger}>{running?"⟳ Triggering…":`▶ Trigger Design (${selScsTrigger.length} SC${selScsTrigger.length!==1?"s":""})`}</Btn>
          </div>
        </div>

        {/* Run queue */}
        {runs.length>0&&<Card style={{overflow:"hidden",marginTop:16}}>
          <div style={{padding:"8px 14px",borderBottom:`1px solid ${C.border}`,background:"#f8fafc",display:"flex",alignItems:"center",justifyContent:"space-between"}}>
            <span style={{fontSize:12,fontWeight:700}}>Design Run Queue</span>
            <div style={{display:"flex",gap:6}}>
              {["Planned","In-Progress","Completed"].map(s=><Badge key={s} small color={s==="Completed"?"success":s==="In-Progress"?"warning":"default"}>{runs.filter(r=>r.status===s).length} {s}</Badge>)}
            </div>
          </div>
          <div style={{overflowX:"auto"}}>
            <table style={{width:"100%",borderCollapse:"collapse"}}>
              <thead><tr>{["Run Name","SC","HW","New Node","Ref Plan","Status","Progress","Triggered"].map((h,i)=><th key={i} style={{padding:"7px 10px",background:"#f8fafc",borderBottom:`1px solid ${C.border}`,fontSize:10,fontWeight:700,color:C.muted,textTransform:"uppercase",textAlign:"left",whiteSpace:"nowrap"}}>{h}</th>)}</tr></thead>
              <tbody>{runs.map(r=><tr key={r.id} style={{background:"#fff"}}>
                <td style={{padding:"8px 10px",borderBottom:`1px solid ${C.border}`,fontSize:11,fontWeight:600}}>{r.runName}</td>
                <td style={{padding:"8px 10px",borderBottom:`1px solid ${C.border}`,fontFamily:"monospace",fontSize:11}}>{r.scCode}</td>
                <td style={{padding:"8px 10px",borderBottom:`1px solid ${C.border}`,fontSize:11,textAlign:"center"}}>{r.hw}</td>
                <td style={{padding:"8px 10px",borderBottom:`1px solid ${C.border}`,fontSize:11,textAlign:"center"}}>{r.newNodeAdd?"✓":"—"}</td>
                <td style={{padding:"8px 10px",borderBottom:`1px solid ${C.border}`,fontSize:11,color:C.muted}}>{r.refPlan||"—"}</td>
                <td style={{padding:"8px 10px",borderBottom:`1px solid ${C.border}`}}><span style={{padding:"2px 8px",borderRadius:99,fontSize:11,fontWeight:700,background:r.status==="Completed"?C.accentLight:r.status==="In-Progress"?C.warningLight:"#ede9fe",color:r.status==="Completed"?C.accent:r.status==="In-Progress"?C.warning:"#7c3aed"}}>{r.status}</span></td>
                <td style={{padding:"8px 10px",borderBottom:`1px solid ${C.border}`}}>
                  <div style={{display:"flex",alignItems:"center",gap:8}}>
                    <div style={{width:80,height:5,background:"#e5e9f0",borderRadius:99,overflow:"hidden"}}><div style={{height:"100%",width:`${r.progress}%`,background:r.status==="Completed"?C.accent:C.primary,borderRadius:99,transition:"width .5s"}}/></div>
                    <span style={{fontSize:11,color:C.muted}}>{r.progress}%</span>
                  </div>
                </td>
                <td style={{padding:"8px 10px",borderBottom:`1px solid ${C.border}`,fontSize:11,color:C.muted}}>{new Date(r.triggeredAt).toLocaleTimeString()}</td>
              </tr>)}</tbody>
            </table>
          </div>
          {runs.some(r=>r.status==="Completed")&&<div style={{padding:"10px 16px",background:C.accentLight,borderTop:`1px solid ${C.border}`,display:"flex",alignItems:"center",justifyContent:"space-between"}}>
            <span style={{fontSize:12,fontWeight:600,color:"#065f46"}}>✅ {runs.filter(r=>r.status==="Completed").length} run{runs.filter(r=>r.status==="Completed").length!==1?"s":""} completed</span>
            <Btn size="sm" variant="success" onClick={()=>setPage("sanctity-controls/review")}>Open Design Review </Btn>
          </div>}
        </Card>}
      </div>}
    </div>
  );
}

// ─── Validation engine for RLH plans ─────────────────────────────────────
function validateRLHPlan(plan) {
  const rows = plan.rows || [];
  const inputNodes = plan.inputNodes || [];
  const outputNodes = rows.map(r => r.lmdcCode).filter(Boolean);
  const missingNodes = inputNodes.filter(n => !outputNodes.includes(n));

  const planWarnings = [];
  if (missingNodes.length > 0) {
    const scObj = LMSC_DATA.find(s => s.lmscCode === plan.scId);
    const names = missingNodes.map(c => scObj?.dcs.find(d => d.lmdcCode === c)?.lmdcName || c);
    planWarnings.push({ code:"COVERAGE", msg:`Coverage gap: ${missingNodes.length} node${missingNodes.length!==1?"s":""} missing from output — ${names.join(", ")}` });
  }

  const rowFlags = rows.map(row => {
    const flags = [];
    if (row.tp > 7) flags.push({ code:"TP", msg:`Touch points ${row.tp} exceeds max of 7` });
    if (row.utilPct > 90) flags.push({ code:"UTIL_HIGH", msg:`Utilisation ${row.utilPct}% is above 90% (over-loaded)` });
    if (row.utilPct < 40) flags.push({ code:"UTIL_LOW", msg:`Utilisation ${row.utilPct}% is below 40% (under-utilised)` });
    return { rowId: row.rowId, flags };
  });

  const hasRowWarnings = rowFlags.some(r => r.flags.length > 0);
  const coveragePct = inputNodes.length > 0
    ? Math.round(((inputNodes.length - missingNodes.length) / inputNodes.length) * 100)
    : plan.metrics?.coveragePct ?? 100;

  return { planWarnings, rowFlags, hasWarnings: planWarnings.length > 0 || hasRowWarnings, coveragePct };
}

// ─── POC selection modal ──────────────────────────────────────────────────
function PocModal({ open, onClose, scId, onPush, hasWarnings }) {
  const scPocs = SC_POCS[scId] || [];
  const [selected, setSelected] = useState(() => scPocs.map((_, i) => i));
  const [manualName, setManualName] = useState("");
  const [manualEmail, setManualEmail] = useState("");
  const [extras, setExtras] = useState([]);

  // reset on open
  useEffect(() => {
    if (open) { setSelected(scPocs.map((_,i) => i)); setExtras([]); setManualName(""); setManualEmail(""); }
  }, [open, scId]);

  const togglePoc = i => setSelected(p => p.includes(i) ? p.filter(x => x !== i) : [...p, i]);
  const addExtra = () => {
    if (!manualName.trim() || !manualEmail.trim()) return;
    setExtras(p => [...p, { name: manualName.trim(), email: manualEmail.trim(), role: "Additional Reviewer" }]);
    setManualName(""); setManualEmail("");
  };
  const removeExtra = i => setExtras(p => p.filter((_,j) => j !== i));

  const finalList = [
    ...scPocs.filter((_,i) => selected.includes(i)),
    ...extras,
  ];

  return (
    <Modal open={open} onClose={onClose} title="Select Reviewers & Push to Alignment" width={580}>
      {/* SC POC block */}
      <div style={{marginBottom:20}}>
        <div style={{fontSize:11,fontWeight:700,textTransform:"uppercase",letterSpacing:.5,color:C.muted,marginBottom:8}}>
          SC POCs — {scId} <span style={{fontWeight:400,color:C.muted}}>({scPocs.length} on record)</span>
        </div>
        {scPocs.length === 0 && <div style={{fontSize:12,color:C.muted,fontStyle:"italic"}}>No POCs found for this SC. Add reviewers manually below.</div>}
        <div style={{display:"flex",flexDirection:"column",gap:6}}>
          {scPocs.map((poc, i) => {
            const isSel = selected.includes(i);
            return (
              <div key={i} onClick={() => togglePoc(i)} style={{display:"flex",alignItems:"center",gap:10,padding:"9px 14px",borderRadius:8,border:`1.5px solid ${isSel?C.primary:C.border}`,background:isSel?C.primaryLight:"#fff",cursor:"pointer",transition:"all .1s"}}>
                <div style={{width:18,height:18,borderRadius:4,border:`2px solid ${isSel?C.primary:C.border}`,background:isSel?C.primary:"#fff",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
                  {isSel && <span style={{color:"#fff",fontSize:9,fontWeight:900}}>✓</span>}
                </div>
                <div style={{flex:1}}>
                  <div style={{fontSize:12,fontWeight:700}}>{poc.name}</div>
                  <div style={{fontSize:11,color:C.muted}}>{poc.role} · {poc.email}</div>
                </div>
                <Badge small color={isSel?"primary":"default"}>{isSel?"Selected":"Deselected"}</Badge>
              </div>
            );
          })}
        </div>
      </div>

      {/* Manual add */}
      <div style={{marginBottom:16}}>
        <div style={{fontSize:11,fontWeight:700,textTransform:"uppercase",letterSpacing:.5,color:C.muted,marginBottom:8}}>Add Additional Reviewer</div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr auto",gap:8,alignItems:"end"}}>
          <FieldLabel label="Name">
            <Input value={manualName} onChange={e=>setManualName(e.target.value)} placeholder="Full name"/>
          </FieldLabel>
          <FieldLabel label="Email">
            <Input value={manualEmail} onChange={e=>setManualEmail(e.target.value)} placeholder="email@co.in" type="email"/>
          </FieldLabel>
          <div style={{marginBottom:12}}>
            <Btn size="sm" variant="outline" disabled={!manualName.trim()||!manualEmail.trim()} onClick={addExtra}>+ Add</Btn>
          </div>
        </div>
        {extras.map((ex,i)=>(
          <div key={i} style={{display:"flex",alignItems:"center",gap:8,padding:"7px 12px",background:"#f0fdf4",borderRadius:7,border:`1px solid ${C.accent}30`,marginBottom:5}}>
            <span style={{fontSize:12,flex:1}}><b>{ex.name}</b> · <span style={{color:C.muted}}>{ex.email}</span></span>
            <Badge small color="success">Added</Badge>
            <button onClick={()=>removeExtra(i)} style={{fontSize:12,color:C.muted,background:"none",border:"none",cursor:"pointer"}}>✕</button>
          </div>
        ))}
      </div>

      {/* Warning note if plan has warnings */}
      {hasWarnings && (
        <div style={{padding:"9px 12px",background:C.warningLight,border:`1px solid ${C.warning}40`,borderRadius:8,fontSize:11,color:"#92400e",marginBottom:16,display:"flex",alignItems:"center",gap:8}}>
          <span style={{fontSize:15}}>⚠️</span>
          <span>This plan has validation warnings. Pushing will flag it as <b>"Accepted with Warnings"</b> for reviewers.</span>
        </div>
      )}

      {/* Summary */}
      <div style={{padding:"8px 12px",background:"#f8fafc",borderRadius:7,fontSize:11,color:C.muted,marginBottom:16}}>
        <b style={{color:"#1a2233"}}>{finalList.length}</b> reviewer{finalList.length!==1?"s":""} selected: {finalList.map(r=>r.name).join(", ")||"none"}
      </div>

      <div style={{display:"flex",gap:8,justifyContent:"flex-end"}}>
        <Btn variant="ghost" onClick={onClose}>Cancel</Btn>
        <Btn disabled={finalList.length===0} onClick={()=>onPush(finalList)}>
          {hasWarnings?"⚠ Push (Accepted with Warnings)":" Push to Alignment"}
        </Btn>
      </div>
    </Modal>
  );
}

// ─── PlanCard metrics sub-component ────────────────────────────────────────
function PlanCardMetrics({ coveragePct, m, vehicleStr }) {
  const [showAll, setShowAll] = useState(false);
  const headline = [
    ["Coverage", `${coveragePct}%`, coveragePct === 100 ? "#16a34a" : C.danger],
    ["CPS", `₹${m.cps ?? "—"}`, "#374151"],
    ["Utilisation", `${m.utilPct ?? "—"}%`, (m.utilPct > 90 || m.utilPct < 40) ? C.warning : "#374151"],
  ];
  const extra = [
    ["Routes", m.totalRoutes ?? "—"],
    ["Vehicles", vehicleStr],
    ["Distance", `${(m.totalDistance ?? 0).toLocaleString()} km`],
    ["Total Cost", `₹${(m.totalCost ?? 0).toLocaleString()}`],
  ];
  return (
    <div style={{borderBottom:`1px solid ${C.border}`}}>
      <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr) auto",borderBottom:showAll?`1px solid ${C.border}`:"none"}}>
        {headline.map(([label,value,col])=>(
          <div key={label} style={{padding:"10px 14px",borderRight:`1px solid ${C.border}`}}>
            <div style={{fontSize:15,fontWeight:700,color:col}}>{value}</div>
            <div style={{fontSize:10,color:C.muted,marginTop:2,textTransform:"uppercase",letterSpacing:.4}}>{label}</div>
          </div>
        ))}
        <button onClick={()=>setShowAll(s=>!s)}
          style={{padding:"10px 14px",border:"none",background:"none",cursor:"pointer",fontSize:11,color:C.muted,whiteSpace:"nowrap"}}>
          {showAll?"Less":"More metrics"}
        </button>
      </div>
      {showAll&&<div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",background:"#f9fafb"}}>
        {extra.map(([label,value],i)=>(
          <div key={label} style={{padding:"8px 14px",borderRight:i<3?`1px solid ${C.border}`:"none"}}>
            <div style={{fontSize:12,fontWeight:600,color:"#374151"}}>{value}</div>
            <div style={{fontSize:10,color:C.muted,marginTop:1,textTransform:"uppercase",letterSpacing:.4}}>{label}</div>
          </div>
        ))}
      </div>}
    </div>
  );
}

// ─── Single plan card ─────────────────────────────────────────────────────
function PlanCard({ plan, setDesigns, setAlignments, setPage, setMapPlanId }) {
  const [expanded, setExpanded] = useState(false);
  const [pushing, setPushing] = useState(false);

  const { planWarnings, rowFlags, hasWarnings, coveragePct } = useMemo(() => validateRLHPlan(plan), [plan]);

  const getRowFlags = rowId => rowFlags.find(r => r.rowId === rowId)?.flags || [];

  // Metrics
  const m = plan.metrics || {};
  const vehicleStr = Object.entries(m.vehicleBreakdown || {}).map(([t,n])=>`${t}: ${n}`).join(" · ") || "—";

  // Coverage colour
  const covColor = coveragePct === 100 ? C.accent : C.danger;
  const covBg    = coveragePct === 100 ? C.accentLight : C.dangerLight;

  // Util colour
  const utilColor = m.utilPct >= 40 && m.utilPct <= 90 ? C.accent : C.warning;

  // CSV download
  const downloadCSV = () => {
    const headers = ["LMSC Code","LMDC Code","Segment","Vehicle Type","Vehicle Count","Trip Frequency","Transit Hours","Distance (km)","CPS (₹)","Touch Points","Utilisation (%)"];
    const rows = (plan.rows||[]).map(r => [r.lmscCode,r.lmdcCode,r.segment,r.vehicleType,r.vehicleCount,r.tripFrequency,r.transitHours,r.routeDistanceKm,r.cps,r.tp,r.utilPct]);
    const csv = [headers,...rows].map(r=>r.join(",")).join("\n");
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([csv],{type:"text/csv"}));
    a.download = `${plan.runId}_plan.csv`;
    a.click();
  };

  const handlePush = reviewers => {
    const al = {
      id: `ga-${plan.id}-${Date.now()}`,
      designName: plan.name, designType: plan.type, zone: plan.zone, scId: plan.scId,
      pushedBy: "Current User", pushedOn: new Date().toISOString().split("T")[0],
      status: "Pending", acknowledged: false, finalisedOn: null,
      sendBackCount: 0, versionLog: [], sendBackNote: null,
      approvers: reviewers.map(r => ({ name: r.name, role: r.role, email: r.email, submitted: false })),
      rows: (plan.rows||[]).map(r => ({
        rowId: r.rowId, segment: r.segment, lmdcCode: r.lmdcCode,
        vehicleType: r.vehicleType, vehicleCount: r.vehicleCount,
        tripFrequency: r.tripFrequency, transitHours: r.transitHours,
        routeDistanceKm: r.routeDistanceKm, cps: r.cps,
      })),
      rowFeedback: [], plannerDecisions: {},
      hasWarnings,
    };
    setAlignments(p => [al, ...p]);
    setDesigns(p => p.map(x => x.id === plan.id ? { ...x, pushed: true, acceptedWithWarnings: hasWarnings } : x));
    setPushing(false);
    setPage("sanctity-controls/operations-alignment");
  };

  // Flag chip helper
  const FlagChip = ({ icon, label, color, bg }) => (
    <span style={{ display:"inline-flex", alignItems:"center", gap:4, padding:"2px 9px", borderRadius:99, fontSize:10, fontWeight:700, background:bg, color, whiteSpace:"nowrap" }}>
      {icon} {label}
    </span>
  );

  return (
    <div style={{ border:`1.5px solid ${hasWarnings&&!plan.pushed?C.warning:plan.pushed?C.accent:C.border}`, borderRadius:12, background:"#fff", marginBottom:14, overflow:"hidden", transition:"border-color .2s" }}>

      {/* ── Card header ── */}
      <div style={{ padding:"14px 18px", background: plan.pushed?"#f0fdf4":hasWarnings?"#fffbeb":"#fff", borderBottom:`1px solid ${C.border}` }}>
        <div style={{ display:"flex", alignItems:"flex-start", justifyContent:"space-between", gap:12, flexWrap:"wrap" }}>
          <div style={{ flex:1, minWidth:0 }}>
            <div style={{ display:"flex", alignItems:"center", gap:8, flexWrap:"wrap", marginBottom:4 }}>
              <span style={{ fontWeight:800, fontSize:14, color:"#1a2233" }}>{plan.name}</span>
              <span style={{ fontFamily:"monospace", fontSize:10, color:C.muted, background:"#f3f5f9", padding:"1px 7px", borderRadius:4 }}>{plan.runId}</span>
              {plan.pushed && <Badge small color="success">📤 Pushed to Alignment{plan.acceptedWithWarnings?" (with warnings)":""}</Badge>}
            </div>
            <div style={{ display:"flex", gap:6, flexWrap:"wrap", alignItems:"center" }}>
              <Badge small>{plan.type}</Badge>
              <Badge small color="default">{plan.zone}</Badge>
              {plan.scId && <Badge small color="primary">{plan.scId}</Badge>}
              <span style={{ fontSize:11, color:C.muted }}>Triggered {plan.triggeredOn} · {plan.triggeredBy}</span>
            </div>
          </div>
          {/* Actions */}
          <div style={{ display:"flex", gap:8, flexShrink:0, flexWrap:"wrap" }}>
            <button onClick={() => { if(setMapPlanId) setMapPlanId(plan.id); setPage("sanctity-controls/visualisation"); }}
              title="View on Map"
              style={{ display:"inline-flex", alignItems:"center", gap:5, padding:"5px 12px", fontSize:11, fontWeight:600, borderRadius:7, border:`1px solid ${C.border}`, background:"#fff", color:C.muted, cursor:"pointer" }}>
              🗺️ Map
            </button>
            <button onClick={downloadCSV}
              style={{ display:"inline-flex", alignItems:"center", gap:5, padding:"5px 12px", fontSize:11, fontWeight:600, borderRadius:7, border:`1px solid ${C.border}`, background:"#fff", color:C.muted, cursor:"pointer" }}>
              ⬇ CSV
            </button>
            {!plan.pushed && (
              <Btn onClick={() => setPushing(true)}>
                {hasWarnings ? "⚠ Accept & Push" : " Push to Alignment"}
              </Btn>
            )}
          </div>
        </div>

        {/* Plan-level warnings */}
        {planWarnings.length > 0 && (
          <div style={{ display:"flex", gap:6, flexWrap:"wrap", marginTop:10 }}>
            {planWarnings.map((w,i) => (
              <FlagChip key={i} icon="⚠️" label={w.msg} color="#92400e" bg={C.warningLight}/>
            ))}
          </div>
        )}
      </div>

      {/* ── 3 headline metrics + expandable ── */}
      <PlanCardMetrics coveragePct={coveragePct} m={m} vehicleStr={vehicleStr}/>

      {/* ── Expand toggle ── */}
      <button onClick={() => setExpanded(e => !e)}
        style={{ width:"100%", padding:"8px 18px", display:"flex", alignItems:"center", justifyContent:"space-between", border:"none", background:"#fafafa", cursor:"pointer", fontSize:12, fontWeight:600, color:C.primary, borderBottom: expanded?`1px solid ${C.border}`:"none" }}>
        <span>📋 Route Details — {(plan.rows||[]).length} routes{hasWarnings ? ` · ⚠ ${rowFlags.reduce((a,r)=>a+r.flags.length,0) + planWarnings.length} validation flag${rowFlags.reduce((a,r)=>a+r.flags.length,0)+planWarnings.length!==1?"s":""}` : ""}</span>
        <span style={{ fontSize:14, color:C.muted }}>{expanded ? "▲ Collapse" : "▼ Expand"}</span>
      </button>

      {/* ── Route table ── */}
      {expanded && (
        <div style={{ overflowX:"auto" }}>
          <table style={{ width:"100%", borderCollapse:"collapse" }}>
            <thead>
              <tr>
                {["LMDC","Segment","Vehicle Type","Count","Frequency","Dist (km)","TAT (hrs)","CPS (₹)","TPs","Util %","Flags"].map((h,i) => (
                  <th key={i} style={{ padding:"7px 10px", background:"#f8fafc", borderBottom:`1px solid ${C.border}`, fontSize:10, fontWeight:700, color:C.muted, textTransform:"uppercase", letterSpacing:.4, textAlign:i>2?"right":"left", whiteSpace:"nowrap" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {(plan.rows||[]).map(row => {
                const flags = getRowFlags(row.rowId);
                const hasFlag = flags.length > 0;
                const tpFlag   = flags.find(f=>f.code==="TP");
                const utilHigh = flags.find(f=>f.code==="UTIL_HIGH");
                const utilLow  = flags.find(f=>f.code==="UTIL_LOW");
                const rowBg    = hasFlag ? (tpFlag ? "#fff5f5" : "#fffbeb") : "#fff";
                const lmdc = LMDC_MAP[row.lmdcCode];
                return (
                  <tr key={row.rowId} style={{ background: rowBg }}>
                    <td style={{ padding:"8px 10px", borderBottom:`1px solid ${C.border}`, fontSize:11 }}>
                      <div style={{ fontFamily:"monospace", fontSize:10, fontWeight:600 }}>{row.lmdcCode||"—"}</div>
                      <div style={{ fontSize:10, color:C.muted }}>{lmdc?.lmdcName||""}</div>
                    </td>
                    <td style={{ padding:"8px 10px", borderBottom:`1px solid ${C.border}`, fontSize:11, fontWeight:500, minWidth:180 }}>{row.segment}</td>
                    <td style={{ padding:"8px 10px", borderBottom:`1px solid ${C.border}`, fontSize:11 }}>{row.vehicleType}</td>
                    <td style={{ padding:"8px 10px", borderBottom:`1px solid ${C.border}`, fontSize:11, textAlign:"right" }}>{row.vehicleCount}</td>
                    <td style={{ padding:"8px 10px", borderBottom:`1px solid ${C.border}`, fontSize:11, textAlign:"right" }}>{row.tripFrequency}</td>
                    <td style={{ padding:"8px 10px", borderBottom:`1px solid ${C.border}`, fontSize:11, textAlign:"right" }}>{row.routeDistanceKm}</td>
                    <td style={{ padding:"8px 10px", borderBottom:`1px solid ${C.border}`, fontSize:11, textAlign:"right" }}>{row.transitHours}</td>
                    <td style={{ padding:"8px 10px", borderBottom:`1px solid ${C.border}`, fontSize:12, textAlign:"right", fontWeight:700 }}>₹{row.cps}</td>
                    {/* TPs */}
                    <td style={{ padding:"8px 10px", borderBottom:`1px solid ${C.border}`, fontSize:11, textAlign:"right", color:tpFlag?C.danger:"inherit", fontWeight:tpFlag?700:"normal" }}>
                      {row.tp}
                      {tpFlag && <span title={tpFlag.msg} style={{ marginLeft:4, cursor:"help" }}>🔴</span>}
                    </td>
                    {/* Util */}
                    <td style={{ padding:"8px 10px", borderBottom:`1px solid ${C.border}`, fontSize:11, textAlign:"right" }}>
                      <span style={{ padding:"1px 7px", borderRadius:99, fontSize:10, fontWeight:700,
                        background: utilHigh?C.dangerLight : utilLow?C.warningLight : C.accentLight,
                        color:       utilHigh?C.danger      : utilLow?"#92400e"     : "#065f46" }}>
                        {row.utilPct}%
                      </span>
                      {(utilHigh||utilLow) && <span title={(utilHigh||utilLow).msg} style={{ marginLeft:4, cursor:"help" }}>⚠️</span>}
                    </td>
                    {/* Flags */}
                    <td style={{ padding:"8px 10px", borderBottom:`1px solid ${C.border}`, minWidth:160 }}>
                      {flags.length === 0
                        ? <span style={{ fontSize:11, color:C.accent }}>✓ Clean</span>
                        : <div style={{ display:"flex", flexDirection:"column", gap:3 }}>
                            {flags.map((f,fi) => (
                              <span key={fi} style={{ display:"inline-flex", alignItems:"center", gap:4, padding:"1px 7px", borderRadius:99, fontSize:9, fontWeight:700,
                                background: f.code==="TP"||f.code==="UTIL_HIGH" ? C.dangerLight : C.warningLight,
                                color:       f.code==="TP"||f.code==="UTIL_HIGH" ? C.danger      : "#92400e",
                                whiteSpace:"nowrap" }}>
                                {f.code==="TP"?"⛔ TP":f.code==="UTIL_HIGH"?"🔴 Over-loaded":"⚠️ Under-utilised"}
                              </span>
                            ))}
                          </div>}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {/* Table footer actions */}
          <div style={{ padding:"8px 14px", background:"#f8fafc", borderTop:`1px solid ${C.border}`, display:"flex", alignItems:"center", justifyContent:"space-between", gap:8 }}>
            <span style={{ fontSize:11, color:C.muted }}>{(plan.rows||[]).length} routes · {plan.scId}</span>
            <div style={{ display:"flex", gap:8 }}>
              <button onClick={() => { if(setMapPlanId) setMapPlanId(plan.id); setPage("sanctity-controls/visualisation"); }}
                style={{ fontSize:11, color:C.muted, background:"none", border:"none", cursor:"pointer" }}>
                Open in Map
              </button>
              <button onClick={downloadCSV}
                style={{ fontSize:11, color:C.muted, background:"none", border:"none", cursor:"pointer" }}>
                Download CSV
              </button>
            </div>
          </div>
        </div>
      )}

      <PocModal open={pushing} onClose={()=>setPushing(false)} scId={plan.scId} onPush={handlePush} hasWarnings={hasWarnings}/>
    </div>
  );
}

// ─── Design Review ────────────────────────────────────────────────────────
function DesignReview({ designs, setDesigns, setAlignments, setPage, setMapPlanId }) {
  const [search, setSearch] = useState("");

  const rlhPlans = useMemo(() =>
    designs.filter(d => d.type === "RLH")
      .filter(d => !search.trim() || d.name.toLowerCase().includes(search.toLowerCase()) || d.runId?.toLowerCase().includes(search.toLowerCase()) || d.scId?.toLowerCase().includes(search.toLowerCase()))
  , [designs, search]);

  return (
    <div>
      {/* Header + search */}
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", gap:12, marginBottom:16, flexWrap:"wrap" }}>
        <div>
          <div style={{ fontSize:13, fontWeight:700, color:"#1a2233" }}>RLH Design Plans — {rlhPlans.length} run{rlhPlans.length!==1?"s":""}</div>
          <div style={{ fontSize:12, color:C.muted, marginTop:2 }}>Each card represents a unique design run. Plans are listed by run ID.</div>
        </div>
        <div style={{ position:"relative" }}>
          <span style={{ position:"absolute", left:10, top:"50%", transform:"translateY(-50%)", fontSize:14, pointerEvents:"none" }}>🔍</span>
          <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search by plan name, run ID or SC…"
            style={{ padding:"7px 12px 7px 32px", border:`1px solid ${C.border}`, borderRadius:8, fontSize:12, width:280, outline:"none", background:"#fff" }}/>
          {search && <button onClick={()=>setSearch("")} style={{ position:"absolute", right:10, top:"50%", transform:"translateY(-50%)", background:"none", border:"none", cursor:"pointer", fontSize:14, color:C.muted }}>✕</button>}
        </div>
      </div>

      {/* Validation legend */}
      <div style={{ display:"flex", gap:8, flexWrap:"wrap", marginBottom:16, padding:"9px 14px", background:"#f8fafc", borderRadius:8, border:`1px solid ${C.border}`, fontSize:11, alignItems:"center" }}>
        <span style={{ fontWeight:700, color:C.muted }}>Validation flags:</span>
        {[["⛔ TP","Touch points > 7",C.danger,C.dangerLight],["🔴 Over-loaded","Utilisation > 90%",C.danger,C.dangerLight],["⚠️ Under-utilised","Utilisation < 40%","#92400e",C.warningLight],["⚠️ Coverage gap","Input ≠ Output nodes","#92400e",C.warningLight]].map(([label,desc,col,bg])=>(
          <span key={label} style={{ display:"inline-flex", alignItems:"center", gap:5 }}>
            <span style={{ padding:"1px 8px", borderRadius:99, fontSize:10, fontWeight:700, background:bg, color:col }}>{label}</span>
            <span style={{ color:C.muted }}>{desc}</span>
          </span>
        ))}
      </div>

      {/* Plan cards */}
      {rlhPlans.length === 0 && (
        <div style={{ padding:"48px 24px", textAlign:"center", color:C.muted, borderRadius:12, border:`1px dashed ${C.border}`, background:"#fafafa" }}>
          <div style={{ fontSize:36, marginBottom:10 }}>📭</div>
          <div style={{ fontWeight:600, fontSize:14, marginBottom:4 }}>No RLH plans found</div>
          <div style={{ fontSize:12 }}>{search ? "Try a different search term." : "Trigger a design run from Route Planning to see plans here."}</div>
        </div>
      )}
      {rlhPlans.map(plan => (
        <PlanCard key={plan.id} plan={plan} setDesigns={setDesigns} setAlignments={setAlignments} setPage={setPage} setMapPlanId={setMapPlanId}/>
      ))}
    </div>
  );
}

// ─── OpsLead Simulate sub-panels ───────────────────────────────────────────
function OpsLeadSimPanelOrig({ rows }) {
  const [f, setF] = useState({ lmdcSearch:"", route:"all", vehicleType:"all", zone:"all" });
  return <><MapFilterBar rows={rows} filters={f} setFilters={setF}/><RouteMapSVG rows={rows} filters={f}/></>;
}
function OpsLeadSimPanelFb({ rows, planId, getRow }) {
  const [f, setF] = useState({ lmdcSearch:"", route:"all", vehicleType:"all", zone:"all" });
  const fbRows = rows.map(r => { const fb = getRow(planId, r.rowId); return { ...r, routeDistanceKm: fb.distance ? +fb.distance : r.routeDistanceKm }; });
  return <><MapFilterBar rows={fbRows} filters={f} setFilters={setF}/><RouteMapSVG rows={fbRows} filters={f}/></>;
}

// ─── Ops Lead Alignment — full rebuild ────────────────────────────────────
function OpsLeadAlignment({ alignments, setAlignments, setPage, setMapPlanId }) {
  const currentUser = "Ravi Kumar";

  // All plans visible to this user
  const allVisible = alignments.filter(p => p.approvers.some(a => a.name === currentUser));

  // Summary counts
  const countPending     = allVisible.filter(p => !p.approvers.find(a=>a.name===currentUser)?.submitted).length;
  const countAcknowledged= allVisible.filter(p => p.acknowledged && p.approvers.find(a=>a.name===currentUser)?.submitted).length;
  const countFinalised   = allVisible.filter(p => p.status === "Approved").length;

  const [activeFilter, setActiveFilter] = useState("all"); // all | pending | acknowledged | finalised
  const [selId, setSelId] = useState(null);

  const filtered = allVisible.filter(p => {
    const me = p.approvers.find(a=>a.name===currentUser);
    if (activeFilter==="pending")      return !me?.submitted;
    if (activeFilter==="acknowledged") return me?.submitted && p.acknowledged;
    if (activeFilter==="finalised")    return p.status==="Approved";
    return true;
  });

  const plan = allVisible.find(p=>p.id===selId) || filtered[0] || null;
  const me = plan?.approvers.find(a=>a.name===currentUser);
  const isLocked = !!(me?.submitted && plan?.acknowledged);

  // ── Per-plan feedback state ──────────────────────────────────────────────
  // rowFbState: { [rowId]: { status:"Pending"|"Aligned"|"Needs Change", scLat, scLng, dcLat, dcLng, dcTp, routeCode, distance, remarks } }
  const [rowFbState, setRowFbState] = useState({});
  const [expandedPlan, setExpandedPlan] = useState(null); // plan id with expanded route table
  const [showMetricsAll, setShowMetricsAll] = useState({});
  const [validationResults, setValidationResults] = useState({}); // { [planId]: [{rowId, type, msg}] }
  const [simulateOpen, setSimulateOpen] = useState(false);
  const [submitted, setSubmitted] = useState({});

  // Available routes for dropdown
  const planRoutes = plan ? [...new Set((plan.rows||[]).map(r=>r.segment))] : [];

  // Init row state when plan changes
  useEffect(() => {
    if (!plan) return;
    const existing = {};
    (plan.rows||[]).forEach(r => {
      const prev = rowFbState[`${plan.id}:${r.rowId}`];
      if (!prev) {
        existing[`${plan.id}:${r.rowId}`] = {
          status:"Pending", scLat:"", scLng:"", dcLat:"", dcLng:"",
          dcTp:String(r.tp||""), routeCode:r.segment, distance:String(r.routeDistanceKm||""), remarks:""
        };
      }
    });
    if (Object.keys(existing).length) setRowFbState(p=>({...p,...existing}));
  }, [plan?.id]);

  const getRow = (planId, rowId) => rowFbState[`${planId}:${rowId}`] || { status:"Pending" };
  const setRow = (planId, rowId, field, val) =>
    setRowFbState(p=>({...p,[`${planId}:${rowId}`]:{...p[`${planId}:${rowId}`],[field]:val}}));

  // ── Validate ──────────────────────────────────────────────────────────────
  const runValidation = (p) => {
    const issues = [];
    const rows = p.rows||[];

    // Count DC appearances (for DC >1 route check)
    const dcRouteCount = {};
    rows.forEach(r=>{ dcRouteCount[r.lmdcCode]=(dcRouteCount[r.lmdcCode]||0)+1; });

    rows.forEach(r => {
      const fb = getRow(p.id, r.rowId);
      const tp = fb.dcTp ? +fb.dcTp : (r.tp||0);
      const dist = fb.distance ? +fb.distance : (r.routeDistanceKm||0);

      // Rule 1: TP > 7 warning
      if (tp > 7) issues.push({ rowId:r.rowId, type:"warning", msg:`TP ${tp} exceeds 7 (route: ${r.segment})` });

      // Rule 2: DC mapped to >1 route — failure
      if ((dcRouteCount[r.lmdcCode]||0) > 1) issues.push({ rowId:r.rowId, type:"failure", msg:`${r.lmdcCode} is assigned to more than one route` });

      // Rule 3: TP sequence — warn if TP set but no distance change (potential mismatch)
      if (fb.dcTp && !fb.distance && fb.status==="Needs Change") issues.push({ rowId:r.rowId, type:"warning", msg:`TP changed without distance update on ${r.segment}` });

      // Rule 4: Distance vs vehicle limit
      const vmLimits = {"Tata Ace":100,"Bolero":150,"14ft":300,"17ft":400,"19ft":600,"22ft":800,"24ft SXL":1200,"32ft MXL":2000,"Trailer":3000};
      const limit = vmLimits[r.vehicleType];
      if (limit && dist > limit) issues.push({ rowId:r.rowId, type:"warning", msg:`Distance ${dist}km exceeds ${r.vehicleType} limit of ${limit}km` });
    });

    setValidationResults(prev=>({...prev,[p.id]:issues}));
    return issues;
  };

  // ── Submit ────────────────────────────────────────────────────────────────
  const submitFeedback = () => {
    if (!plan) return;
    const valRes = validationResults[plan.id]||[];
    const hasFailures = valRes.some(v=>v.type==="failure");
    if (hasFailures) return; // blocked

    const newFb = (plan.rows||[]).map(r => {
      const fb = getRow(plan.id, r.rowId);
      return {
        rowId: r.rowId,
        approverName: currentUser,
        decision: fb.status==="Needs Change"?"Needs Change":"Aligned",
        remark: fb.remarks||"",
        suggestedVehicleType: r.vehicleType,
        suggestedCount: r.vehicleCount,
        suggestedDist: fb.distance ? +fb.distance : r.routeDistanceKm,
        suggestedCps: r.cps,
        suggestedTp: fb.dcTp ? +fb.dcTp : r.tp,
        suggestedRouteCode: fb.routeCode||r.segment,
        suggestedScLat: fb.scLat||null, suggestedScLng: fb.scLng||null,
        suggestedDcLat: fb.dcLat||null, suggestedDcLng: fb.dcLng||null,
      };
    });

    setAlignments(prev=>prev.map(p=>{
      if (p.id !== plan.id) return p;
      const otherFb = (p.rowFeedback||[]).filter(f=>f.approverName!==currentUser);
      const newApprovers = p.approvers.map(a=>a.name===currentUser?{...a,submitted:true}:a);
      const anySubmitted = newApprovers.some(a=>a.submitted);
      return { ...p, rowFeedback:[...otherFb,...newFb], approvers:newApprovers,
        status: anySubmitted&&p.status==="Pending"?"FeedbackReceived":p.status };
    }));
    setSubmitted(p=>({...p,[plan.id]:true}));
  };

  // ── Accept All / Reset ────────────────────────────────────────────────────
  const acceptAll = (p) => {
    const updates = {};
    (p.rows||[]).forEach(r => {
      const key = `${p.id}:${r.rowId}`;
      updates[key] = {...(rowFbState[key]||{}), status:"Aligned"};
    });
    setRowFbState(prev=>({...prev,...updates}));
  };
  const resetAll = (p) => {
    const updates = {};
    (p.rows||[]).forEach(r => {
      const key = `${p.id}:${r.rowId}`;
      updates[key] = {...(rowFbState[key]||{}), status:"Pending"};
    });
    setRowFbState(prev=>({...prev,...updates}));
    setValidationResults(prev=>({...prev,[p.id]:[]}));
  };

  // ── Metric helpers ────────────────────────────────────────────────────────
  const getBadgeRow = (p) => {
    const rows = p.rows||[];
    const fb = rowFbState;
    const pending   = rows.filter(r=>getRow(p.id,r.rowId).status==="Pending").length;
    const aligned   = rows.filter(r=>getRow(p.id,r.rowId).status==="Aligned").length;
    const needsChg  = rows.filter(r=>getRow(p.id,r.rowId).status==="Needs Change").length;
    return {pending, aligned, needsChg};
  };

  const summaryTabs = [
    {key:"all",        label:"All Plans",              count:allVisible.length},
    {key:"pending",    label:"Pending Feedback",        count:countPending,    desc:"Awaiting your review"},
    {key:"acknowledged",label:"Feedback Acknowledged",  count:countAcknowledged,desc:"Accepted by Central Planner"},
    {key:"finalised",  label:"Finalised",               count:countFinalised,  desc:"Plan closed"},
  ];

  return (
    <div>
      {/* User banner */}
      <div style={{display:"flex",alignItems:"center",gap:10,padding:"9px 14px",background:"#f9fafb",border:`1px solid ${C.border}`,borderRadius:8,marginBottom:16}}>
        <div style={{fontSize:12,fontWeight:600,color:"#374151"}}>Ops Lead View — <span style={{color:C.primary}}>{currentUser}</span></div>
        <div style={{fontSize:11,color:C.muted,marginLeft:4}}>Plans assigned to you: {allVisible.length}</div>
      </div>

      {/* Summary strip / filter tabs */}
      <div style={{display:"flex",gap:0,background:"#fff",border:`1px solid ${C.border}`,borderRadius:8,overflow:"hidden",marginBottom:16}}>
        {summaryTabs.map((t,i)=>{
          const isActive = activeFilter===t.key;
          return (
            <button key={t.key} onClick={()=>setActiveFilter(t.key)}
              style={{flex:"1 1 0",padding:"12px 14px",textAlign:"left",border:"none",
                borderRight:i<summaryTabs.length-1?`1px solid ${C.border}`:"none",
                background:"#fff",cursor:"pointer",
                borderBottom:isActive?`2px solid ${C.primary}`:"2px solid transparent"}}>
              <div style={{fontSize:18,fontWeight:700,color:"#1a2233"}}>{t.count}</div>
              <div style={{fontSize:11,fontWeight:isActive?600:400,color:isActive?C.primary:C.muted,marginTop:1}}>{t.label}</div>
              {t.desc&&<div style={{fontSize:10,color:"#9ca3af",marginTop:1}}>{t.desc}</div>}
            </button>
          );
        })}
      </div>

      {/* Main grid */}
      <div style={{display:"grid",gridTemplateColumns:"220px 1fr",gap:14,alignItems:"start"}}>

        {/* Plan list */}
        <div>
          {filtered.length===0&&<div style={{padding:"20px 12px",textAlign:"center",color:C.muted,fontSize:12,border:`1px dashed ${C.border}`,borderRadius:8}}>No plans in this category.</div>}
          {filtered.map(p=>{
            const meP = p.approvers.find(a=>a.name===currentUser);
            const isSel = plan?.id===p.id;
            const lockedP = !!(meP?.submitted && p.acknowledged);
            return (
              <div key={p.id} onClick={()=>setSelId(p.id)}
                style={{padding:"10px 12px",borderRadius:8,marginBottom:6,cursor:"pointer",
                  border:`1px solid ${isSel?C.primary:C.border}`,
                  background:isSel?"#eff6ff":"#fff"}}>
                <div style={{fontWeight:600,fontSize:12,marginBottom:4,color:isSel?C.primary:"#1a2233"}}>{p.designName}</div>
                <div style={{display:"flex",gap:4,flexWrap:"wrap",marginBottom:4}}>
                  <Badge small>{p.designType}</Badge>
                  <Badge small>{p.zone}</Badge>
                </div>
                <div style={{fontSize:10,color:C.muted}}>{p.pushedOn}</div>
                <div style={{marginTop:4,display:"flex",gap:4,flexWrap:"wrap"}}>
                  {meP?.submitted
                    ? <span style={{fontSize:10,color:"#16a34a",fontWeight:500}}>Submitted</span>
                    : <span style={{fontSize:10,color:C.warning,fontWeight:500}}>Pending your input</span>}
                  {lockedP&&<span style={{fontSize:10,color:C.muted}}>· Locked</span>}
                  {p.status==="Approved"&&<span style={{fontSize:10,color:"#16a34a"}}>· Finalised</span>}
                </div>
              </div>
            );
          })}
        </div>

        {/* Plan detail */}
        {!plan&&<div style={{padding:"48px 24px",textAlign:"center",color:C.muted}}>
          <div style={{fontWeight:600,fontSize:14,marginBottom:4}}>Select a plan to review</div>
          <div style={{fontSize:12}}>Choose a plan from the list on the left.</div>
        </div>}

        {plan&&(()=>{
          const rows = plan.rows||[];
          const m = plan.metrics||{};
          const vSplit = Object.entries(m.vehicleBreakdown||{}).map(([t,n])=>`${t}×${n}`).join(" ");
          const valRes = validationResults[plan.id]||[];
          const hasFailures = valRes.some(v=>v.type==="failure");
          const validationRan = plan.id in validationResults;
          const counts = getBadgeRow(plan);
          const isExpanded = expandedPlan===plan.id;
          const showAllM = showMetricsAll[plan.id];

          return (
            <div>
              {/* Plan header */}
              <div style={{padding:"12px 16px",background:"#fff",border:`1px solid ${C.border}`,borderRadius:8,marginBottom:12}}>
                <div style={{display:"flex",alignItems:"flex-start",justifyContent:"space-between",gap:12,flexWrap:"wrap"}}>
                  <div>
                    <div style={{fontWeight:700,fontSize:15,marginBottom:4}}>{plan.designName}</div>
                    <div style={{display:"flex",gap:6,flexWrap:"wrap",alignItems:"center"}}>
                      <Badge>{plan.designType}</Badge>
                      <Badge>{plan.zone}</Badge>
                      {plan.scId&&<Badge>{plan.scId}</Badge>}
                      {isLocked&&<span style={{fontSize:11,color:C.muted,fontStyle:"italic"}}>Locked — acknowledged by Central Planner</span>}
                    </div>
                    {plan.hasWarnings&&<div style={{marginTop:6,fontSize:11,color:"#b45309"}}>This plan was accepted with validation warnings.</div>}
                  </div>
                  <div style={{display:"flex",gap:8,flexShrink:0,flexWrap:"wrap"}}>
                    <button onClick={()=>{if(setMapPlanId)setMapPlanId(plan.id);if(setPage)setPage("sanctity-controls/visualisation");}}
                      style={{fontSize:11,color:C.muted,background:"none",border:"none",cursor:"pointer"}}>Map</button>
                    {!isLocked&&<><Btn variant="ghost" size="sm" onClick={()=>acceptAll(plan)}>Accept All</Btn><Btn variant="ghost" size="sm" onClick={()=>resetAll(plan)}>Reset</Btn></>}
                  </div>
                </div>
              </div>

              {/* 6 metrics */}
              <div style={{background:"#fff",border:`1px solid ${C.border}`,borderRadius:8,marginBottom:12,overflow:"hidden"}}>
                <div style={{display:"grid",gridTemplateColumns:"repeat(6,1fr) auto",borderBottom:showAllM?`1px solid ${C.border}`:"none"}}>
                  {[["CPS",`₹${m.cps??"—"}`],["Utilisation",`${m.utilPct??"—"}%`],["Routes",m.totalRoutes??"—"],["Vehicles",vSplit||"—"],["Distance",`${(m.totalDistance??0).toLocaleString()} km`],["Total Cost",`₹${(m.totalCost??0).toLocaleString()}`]].map(([label,value],i)=>(
                    <div key={label} style={{padding:"10px 12px",borderRight:`1px solid ${C.border}`}}>
                      <div style={{fontSize:14,fontWeight:700,color:"#1a2233"}}>{value}</div>
                      <div style={{fontSize:9,color:C.muted,marginTop:2,textTransform:"uppercase",letterSpacing:.4}}>{label}</div>
                    </div>
                  ))}
                  <button onClick={()=>setShowMetricsAll(p=>({...p,[plan.id]:!p[plan.id]}))}
                    style={{padding:"10px 12px",border:"none",background:"none",cursor:"pointer",fontSize:10,color:C.muted}}>{showAllM?"Less":"Detail"}</button>
                </div>
                {showAllM&&<div style={{padding:"10px 14px",background:"#f9fafb",fontSize:11,color:C.muted,display:"flex",gap:16}}>
                  <span>Coverage: <b style={{color:"#1a2233"}}>{m.coveragePct??100}%</b></span>
                  <span>Triggered: <b style={{color:"#1a2233"}}>{plan.triggeredOn}</b></span>
                  <span>By: <b style={{color:"#1a2233"}}>{plan.triggeredBy}</b></span>
                </div>}
              </div>

              {/* Row status summary */}
              <div style={{display:"flex",gap:8,marginBottom:10,alignItems:"center"}}>
                <span style={{fontSize:11,color:C.muted}}>Row status:</span>
                <span style={{fontSize:11,color:"#9ca3af"}}>Pending <b style={{color:"#374151"}}>{counts.pending}</b></span>
                <span style={{fontSize:11,color:"#16a34a"}}>Aligned <b>{counts.aligned}</b></span>
                <span style={{fontSize:11,color:"#b45309"}}>Needs Change <b>{counts.needsChg}</b></span>
                <button onClick={()=>setExpandedPlan(isExpanded?null:plan.id)}
                  style={{marginLeft:"auto",fontSize:11,color:C.primary,background:"none",border:"none",cursor:"pointer"}}>
                  {isExpanded?"Collapse routes":"Expand routes"} ({rows.length})
                </button>
              </div>

              {/* Route table */}
              {isExpanded&&<div style={{border:`1px solid ${C.border}`,borderRadius:8,overflow:"hidden",marginBottom:12}}>
                <div style={{overflowX:"auto"}}>
                  <table style={{width:"100%",borderCollapse:"collapse"}}>
                    <thead>
                      <tr style={{background:"#f9fafb"}}>
                        {["Segment","Vehicle","Count","Dist (km)","CPS","TP","Status","Action"].map((h,i)=>(
                          <th key={i} style={{padding:"7px 10px",borderBottom:`1px solid ${C.border}`,fontSize:10,fontWeight:600,color:C.muted,textTransform:"uppercase",textAlign:"left",whiteSpace:"nowrap"}}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {rows.map(r=>{
                        const fb = getRow(plan.id, r.rowId);
                        const status = fb.status||"Pending";
                        const isNC = status==="Needs Change";
                        const valIssues = valRes.filter(v=>v.rowId===r.rowId);
                        return (
                          <>
                          <tr key={r.rowId} style={{background:isNC?"#fffbeb":"#fff", boxShadow:valIssues.some(v=>v.type==="failure")?`inset 3px 0 0 ${C.danger}`:valIssues.length?`inset 3px 0 0 ${C.warning}`:"none"}}>
                            <td style={{padding:"8px 10px",borderBottom:isNC?`none`:`1px solid ${C.border}`,fontSize:11,fontWeight:500}}>{r.segment}</td>
                            <td style={{padding:"8px 10px",borderBottom:isNC?`none`:`1px solid ${C.border}`,fontSize:11}}>{r.vehicleType}</td>
                            <td style={{padding:"8px 10px",borderBottom:isNC?`none`:`1px solid ${C.border}`,fontSize:11}}>{r.vehicleCount}</td>
                            <td style={{padding:"8px 10px",borderBottom:isNC?`none`:`1px solid ${C.border}`,fontSize:11}}>{r.routeDistanceKm}</td>
                            <td style={{padding:"8px 10px",borderBottom:isNC?`none`:`1px solid ${C.border}`,fontSize:11}}>₹{r.cps}</td>
                            <td style={{padding:"8px 10px",borderBottom:isNC?`none`:`1px solid ${C.border}`,fontSize:11}}>{r.tp||"—"}</td>
                            <td style={{padding:"8px 10px",borderBottom:isNC?`none`:`1px solid ${C.border}`}}>
                              <span style={{fontSize:10,color:status==="Aligned"?"#16a34a":status==="Needs Change"?"#b45309":"#9ca3af",fontWeight:500}}>{status}</span>
                            </td>
                            <td style={{padding:"8px 10px",borderBottom:isNC?`none`:`1px solid ${C.border}`}}>
                              {isLocked
                                ? <span style={{fontSize:11,color:C.muted}}>Locked</span>
                                : <div style={{display:"flex",gap:4}}>
                                    {["Pending","Aligned","Needs Change"].map(s=>(
                                      <button key={s} onClick={()=>setRow(plan.id,r.rowId,"status",s)}
                                        style={{padding:"2px 7px",fontSize:10,borderRadius:4,cursor:"pointer",
                                          border:`1px solid ${status===s?(s==="Aligned"?"#16a34a":s==="Needs Change"?C.warning:C.border):C.border}`,
                                          background:status===s?(s==="Aligned"?"#f0fdf4":s==="Needs Change"?"#fffbeb":"#f9fafb"):"#fff",
                                          color:status===s?(s==="Aligned"?"#16a34a":s==="Needs Change"?"#b45309":"#374151"):C.muted,
                                          fontWeight:status===s?600:400}}>
                                        {s}
                                      </button>
                                    ))}
                                  </div>}
                            </td>
                          </tr>
                          {/* Needs Change expanded edit fields */}
                          {isNC&&!isLocked&&(
                            <tr key={`${r.rowId}-edit`}>
                              <td colSpan={8} style={{padding:"10px 14px",background:"#fffbeb",borderBottom:`1px solid ${C.border}`,borderLeft:`3px solid ${C.warning}`}}>
                                <div style={{display:"grid",gridTemplateColumns:"repeat(6,1fr) 1fr",gap:8,alignItems:"end"}}>
                                  {[["SC Lat",    "scLat",     "number","e.g. 12.97"],
                                    ["SC Lng",    "scLng",     "number","e.g. 77.59"],
                                    ["DC Lat",    "dcLat",     "number","e.g. 12.93"],
                                    ["DC Lng",    "dcLng",     "number","e.g. 77.62"],
                                    ["DC TP",     "dcTp",      "number",`Current: ${r.tp||"—"}`],
                                    ["Distance (km)","distance","number",`Current: ${r.routeDistanceKm}`],
                                  ].map(([label,field,type,ph])=>(
                                    <div key={field}>
                                      <div style={{fontSize:9,color:C.muted,fontWeight:600,textTransform:"uppercase",letterSpacing:.4,marginBottom:3}}>{label}</div>
                                      <input type={type} value={fb[field]||""} onChange={e=>setRow(plan.id,r.rowId,field,e.target.value)}
                                        placeholder={ph}
                                        style={{width:"100%",padding:"4px 7px",border:`1px solid ${C.border}`,borderRadius:4,fontSize:11,outline:"none",background:"#fff"}}/>
                                    </div>
                                  ))}
                                  <div>
                                    <div style={{fontSize:9,color:C.muted,fontWeight:600,textTransform:"uppercase",letterSpacing:.4,marginBottom:3}}>Route Code</div>
                                    <select value={fb.routeCode||r.segment} onChange={e=>setRow(plan.id,r.rowId,"routeCode",e.target.value)}
                                      style={{width:"100%",padding:"4px 7px",border:`1px solid ${C.border}`,borderRadius:4,fontSize:11,outline:"none",background:"#fff"}}>
                                      {planRoutes.map(rt=><option key={rt} value={rt}>{rt}</option>)}
                                      <option value="__new__">+ New route code…</option>
                                    </select>
                                    {fb.routeCode==="__new__"&&<input value={fb.newRouteCode||""} onChange={e=>setRow(plan.id,r.rowId,"newRouteCode",e.target.value)}
                                      placeholder="Enter route code"
                                      style={{width:"100%",marginTop:4,padding:"4px 7px",border:`1px solid ${C.border}`,borderRadius:4,fontSize:11,outline:"none"}}/>}
                                  </div>
                                </div>
                                <div style={{marginTop:8}}>
                                  <div style={{fontSize:9,color:C.muted,fontWeight:600,textTransform:"uppercase",letterSpacing:.4,marginBottom:3}}>Remarks (optional)</div>
                                  <input value={fb.remarks||""} onChange={e=>setRow(plan.id,r.rowId,"remarks",e.target.value)}
                                    placeholder="Add remarks…"
                                    style={{width:"100%",padding:"5px 8px",border:`1px solid ${C.border}`,borderRadius:4,fontSize:11,outline:"none"}}/>
                                </div>
                                {valIssues.length>0&&<div style={{marginTop:6,display:"flex",flexDirection:"column",gap:3}}>
                                  {valIssues.map((v,vi)=><div key={vi} style={{fontSize:10,color:v.type==="failure"?C.danger:"#b45309",fontWeight:500}}>{v.type==="failure"?"✕":"⚠"} {v.msg}</div>)}
                                </div>}
                              </td>
                            </tr>
                          )}
                          </>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>}

              {/* Validate + Simulate + Submit bar */}
              {!isLocked&&<div style={{padding:"12px 16px",background:"#fff",border:`1px solid ${C.border}`,borderRadius:8}}>
                <div style={{display:"flex",alignItems:"center",gap:10,flexWrap:"wrap"}}>

                  {/* Validate */}
                  <Btn onClick={()=>runValidation(plan)}>Validate Changes</Btn>

                  {/* Validation results */}
                  {validationRan&&(
                    valRes.length===0
                      ? <span style={{fontSize:11,color:"#16a34a",fontWeight:500}}>All checks passed</span>
                      : <span style={{fontSize:11,color:hasFailures?C.danger:"#b45309",fontWeight:500}}>
                          {valRes.filter(v=>v.type==="failure").length} failure{valRes.filter(v=>v.type==="failure").length!==1?"s":""}, {valRes.filter(v=>v.type==="warning").length} warning{valRes.filter(v=>v.type==="warning").length!==1?"s":""}
                        </span>
                  )}

                  {/* Simulate */}
                  {validationRan&&<Btn variant="ghost" size="sm" onClick={()=>setSimulateOpen(true)}>Simulate</Btn>}

                  {/* Submit — locked when failures remain */}
                  <Btn
                    disabled={hasFailures||!validationRan}
                    onClick={submitFeedback}
                    title={!validationRan?"Run validation first":hasFailures?"Resolve failures before submitting":""}
                    style={{marginLeft:"auto"}}>
                    Submit Feedback
                  </Btn>

                  {(submitted[plan.id])&&<span style={{fontSize:11,color:"#16a34a",fontWeight:500}}>Submitted</span>}
                </div>

                {/* Validation issues list */}
                {validationRan&&valRes.length>0&&<div style={{marginTop:10,display:"flex",flexDirection:"column",gap:4}}>
                  {valRes.map((v,vi)=>(
                    <div key={vi} style={{fontSize:11,color:v.type==="failure"?C.danger:"#b45309",display:"flex",gap:6,alignItems:"flex-start"}}>
                      <span style={{flexShrink:0}}>{v.type==="failure"?"✕ Failure":"⚠ Warning"}</span>
                      <span>{v.msg}</span>
                    </div>
                  ))}
                </div>}
              </div>}

              {isLocked&&<div style={{padding:"10px 14px",background:"#f9fafb",border:`1px solid ${C.border}`,borderRadius:8,fontSize:11,color:C.muted}}>
                Feedback has been acknowledged by the Central Planner. Editing is disabled.
              </div>}

              {/* Simulate modal: side-by-side maps + CPS comparison */}
              <Modal open={simulateOpen} onClose={()=>setSimulateOpen(false)} title="Simulate — Original vs Feedback Plan" width={1100}>
                {/* CPS comparison */}
                <div style={{marginBottom:20}}>
                  <div style={{fontSize:11,fontWeight:700,textTransform:"uppercase",letterSpacing:.5,color:C.muted,marginBottom:10}}>SC CPS Comparison per route</div>
                  <div style={{borderRadius:8,border:`1px solid ${C.border}`,overflow:"hidden"}}>
                    <table style={{width:"100%",borderCollapse:"collapse"}}>
                      <thead><tr style={{background:"#f9fafb"}}>{["Route","Original CPS","Feedback CPS","Change","Status"].map((h,i)=><th key={i} style={{padding:"7px 10px",borderBottom:`1px solid ${C.border}`,fontSize:10,fontWeight:600,color:C.muted,textTransform:"uppercase",textAlign:i>1?"right":"left"}}>{h}</th>)}</tr></thead>
                      <tbody>{rows.map(r=>{
                        const fb = getRow(plan.id, r.rowId);
                        const origCps = r.cps;
                        const fbCps = r.cps; // CPS stays same unless feedback changes it
                        const fbStatus = fb.status||"Pending";
                        const changed = fbStatus==="Needs Change"&&Object.values({scLat:fb.scLat,scLng:fb.scLng,dcLat:fb.dcLat,dcLng:fb.dcLng,dcTp:fb.dcTp,distance:fb.distance}).some(v=>v&&v!=="");
                        return <tr key={r.rowId} style={{background:changed?"#fffbeb":"#fff"}}>
                          <td style={{padding:"7px 10px",borderBottom:`1px solid ${C.border}`,fontSize:11}}>{r.segment}</td>
                          <td style={{padding:"7px 10px",borderBottom:`1px solid ${C.border}`,fontSize:11,textAlign:"right"}}>₹{origCps}</td>
                          <td style={{padding:"7px 10px",borderBottom:`1px solid ${C.border}`,fontSize:11,textAlign:"right",color:changed?C.warning:"inherit"}}>₹{fbCps}{changed&&fb.distance&&r.routeDistanceKm?` (dist: ${r.routeDistanceKm}→${fb.distance}km)`:""}</td>
                          <td style={{padding:"7px 10px",borderBottom:`1px solid ${C.border}`,textAlign:"right"}}>{changed?<span style={{fontSize:10,color:C.warning}}>Modified</span>:<span style={{fontSize:10,color:"#9ca3af"}}>—</span>}</td>
                          <td style={{padding:"7px 10px",borderBottom:`1px solid ${C.border}`}}><span style={{fontSize:10,color:fbStatus==="Aligned"?"#16a34a":fbStatus==="Needs Change"?"#b45309":"#9ca3af",fontWeight:500}}>{fbStatus}</span></td>
                        </tr>;
                      })}</tbody>
                    </table>
                  </div>
                </div>
                {/* Side-by-side maps */}
                <div style={{fontSize:11,fontWeight:700,textTransform:"uppercase",letterSpacing:.5,color:C.muted,marginBottom:10}}>Route visualisation — Original vs Feedback</div>
                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16}}>
                  <div>
                    <div style={{fontSize:11,fontWeight:600,color:"#374151",marginBottom:6}}>Original Plan</div>
                    <OpsLeadSimPanelOrig rows={rows}/>
                  </div>
                  <div>
                    <div style={{fontSize:11,fontWeight:600,color:"#374151",marginBottom:6}}>Feedback Plan <span style={{color:C.warning,fontWeight:400}}>(changes highlighted)</span></div>
                    <OpsLeadSimPanelFb rows={rows} planId={plan.id} getRow={getRow}/>
                  </div>
                </div>
                <div style={{display:"flex",justifyContent:"flex-end",marginTop:16}}>
                  <Btn variant="ghost" onClick={()=>setSimulateOpen(false)}>Close</Btn>
                </div>
              </Modal>

            </div>
          );
        })()}
      </div>
    </div>
  );
}
// ─── Central Planner Alignment ────────────────────────────────────────────
// MiniMapSVG removed — replaced by standard RouteMapSVG + MapFilterBar + MapLegend everywhere.

function SimulateModal({ plan, open, onClose }) {
  if(!plan||!open)return null;
  const rows=plan.rows||[];
  const fb=plan.rowFeedback||[];

  // Build "feedback rows" — rows adjusted by ops lead suggestions
  const feedbackRows = rows.map(row => {
    const fbRow = fb.find(f => f.rowId === row.rowId);
    const changed = fbRow?.decision === "Needs Change";
    return {
      ...row,
      fbRow, changed,
      // For the feedback map: override segment label and cps with suggested values
      vehicleType:   changed ? fbRow.suggestedVehicleType : row.vehicleType,
      vehicleCount:  changed ? fbRow.suggestedCount       : row.vehicleCount,
      routeDistanceKm: changed ? fbRow.suggestedDist      : row.routeDistanceKm,
      cps:           changed ? fbRow.suggestedCps         : row.cps,
    };
  });

  const cmp=rows.map(row=>{const fbRow=fb.find(f=>f.rowId===row.rowId);const changed=fbRow?.decision==="Needs Change";return{...row,fbRow,changed,sugVehicle:changed?fbRow.suggestedVehicleType:row.vehicleType,sugCount:changed?fbRow.suggestedCount:row.vehicleCount,sugDist:changed?fbRow.suggestedDist:row.routeDistanceKm,sugCps:changed?fbRow.suggestedCps:row.cps};});
  const orig={vehicles:rows.reduce((a,r)=>a+r.vehicleCount,0),dist:rows.reduce((a,r)=>a+r.routeDistanceKm,0),avgCps:rows.length?(rows.reduce((a,r)=>a+r.cps,0)/rows.length).toFixed(1):"—"};
  const sugg={vehicles:cmp.reduce((a,r)=>a+r.sugCount,0),dist:cmp.reduce((a,r)=>a+r.sugDist,0),avgCps:cmp.length?(cmp.reduce((a,r)=>a+r.sugCps,0)/cmp.length).toFixed(1):"—"};
  const MK=({label,o,s})=>{const ch=String(o)!==String(s);return <div style={{padding:"12px 14px",borderRadius:8,border:`1.5px solid ${ch?C.warning:C.border}`,background:ch?"#fffbeb":"#f8fafc"}}><div style={{fontSize:10,fontWeight:700,textTransform:"uppercase",letterSpacing:.5,color:C.muted,marginBottom:6}}>{label}</div><div style={{display:"flex",alignItems:"center",gap:8}}><span style={{fontSize:18,fontWeight:800}}>{o}</span>{ch&&<><span style={{fontSize:14,color:C.muted}}></span><span style={{fontSize:18,fontWeight:800,color:C.warning}}>{s}</span></>}</div>{ch&&<div style={{fontSize:9,color:"#92400e",marginTop:3,fontWeight:700}}>SUGGESTED CHANGE</div>}</div>;};

  // Independent filter state per panel
  const [filtersOrig, setFiltersOrig] = useState({ lmdcSearch:"", route:"all", vehicleType:"all", zone:"all" });
  const [filtersFb,   setFiltersFb]   = useState({ lmdcSearch:"", route:"all", vehicleType:"all", zone:"all" });

  const mappableOrig = rows.filter(r => LMDC_MAP[r.lmdcCode]);
  const mappableFb   = feedbackRows.filter(r => LMDC_MAP[r.lmdcCode]);

  return (
    <Modal open={open} onClose={onClose} title="Simulate Changes" width={1100}>
      {/* ── KPI comparison ── */}
      <div style={{marginBottom:20}}>
        <div style={{fontSize:11,fontWeight:700,textTransform:"uppercase",letterSpacing:.6,color:C.muted,marginBottom:10}}>Plan-level comparison</div>
        <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:10}}>
          <MK label="Total Vehicles" o={orig.vehicles} s={sugg.vehicles}/>
          <MK label="Total Distance (km)" o={orig.dist} s={sugg.dist}/>
          <MK label="Avg CPS (₹)" o={orig.avgCps} s={sugg.avgCps}/>
        </div>
      </div>

      {/* ── Route-level CPS table ── */}
      <div style={{marginBottom:20}}>
        <div style={{fontSize:11,fontWeight:700,textTransform:"uppercase",letterSpacing:.6,color:C.muted,marginBottom:10}}>Route-level CPS comparison</div>
        <div style={{borderRadius:10,border:`1px solid ${C.border}`,overflow:"hidden"}}>
          <table style={{width:"100%",borderCollapse:"collapse"}}>
            <thead><tr>{["Route","Vehicle","Count","Dist","CPS (₹)","Ops Lead Note","Status"].map((h,i)=><th key={i} style={{padding:"7px 10px",background:"#f8fafc",borderBottom:`1px solid ${C.border}`,fontSize:10,fontWeight:700,color:C.muted,textTransform:"uppercase",textAlign:i>1&&i<5?"right":"left",whiteSpace:"nowrap"}}>{h}</th>)}</tr></thead>
            <tbody>{cmp.map(r=><tr key={r.rowId} style={{background:r.changed?"#fffbeb":"#fff"}}>
              <td style={{padding:"8px 10px",borderBottom:`1px solid ${C.border}`,fontSize:11,fontWeight:500}}>{r.segment}</td>
              <td style={{padding:"8px 10px",borderBottom:`1px solid ${C.border}`,fontSize:11}}>{r.changed&&r.sugVehicle!==r.vehicleType?<><span style={{textDecoration:"line-through",color:C.muted}}>{r.vehicleType}</span><span style={{fontWeight:700,color:C.warning,marginLeft:4}}> {r.sugVehicle}</span></>:r.vehicleType}</td>
              <td style={{padding:"8px 10px",borderBottom:`1px solid ${C.border}`,fontSize:11,textAlign:"right"}}>{r.changed&&r.sugCount!==r.vehicleCount?<><span style={{textDecoration:"line-through",color:C.muted}}>{r.vehicleCount}</span><span style={{fontWeight:700,color:C.warning,marginLeft:4}}>{r.sugCount}</span></>:r.vehicleCount}</td>
              <td style={{padding:"8px 10px",borderBottom:`1px solid ${C.border}`,fontSize:11,textAlign:"right"}}>{r.sugDist}</td>
              <td style={{padding:"8px 10px",borderBottom:`1px solid ${C.border}`,fontSize:12,textAlign:"right",fontWeight:700}}>{r.changed&&r.sugCps!==r.cps?<><span style={{textDecoration:"line-through",color:C.muted,fontWeight:400}}>₹{r.cps}</span><span style={{color:C.warning,marginLeft:4}}>₹{r.sugCps}</span></>:<span>₹{r.cps}</span>}</td>
              <td style={{padding:"8px 10px",borderBottom:`1px solid ${C.border}`,fontSize:11,color:C.muted,maxWidth:140}}>{r.fbRow?.remark||"—"}</td>
              <td style={{padding:"8px 10px",borderBottom:`1px solid ${C.border}`}}>{r.changed?<Badge color="warning">⚠ Changed</Badge>:<Badge color="success">✓ No change</Badge>}</td>
            </tr>)}</tbody>
          </table>
        </div>
      </div>

      {/* ── Side-by-side standard map panels ── */}
      <div style={{marginBottom:8}}>
        <div style={{fontSize:11,fontWeight:700,textTransform:"uppercase",letterSpacing:.6,color:C.muted,marginBottom:12}}>
          SC-level route visualisation — standard map view
        </div>

        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16}}>
          {/* ── Original plan ── */}
          <div>
            <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:8}}>
              <span style={{width:10,height:10,borderRadius:2,background:C.primary,display:"inline-block"}}/>
              <span style={{fontSize:12,fontWeight:700,color:"#1a2233"}}>Original Plan</span>
              <Badge small color="default">{mappableOrig.length} routes</Badge>
            </div>
            <MapFilterBar rows={mappableOrig} filters={filtersOrig} setFilters={setFiltersOrig}/>
            <div style={{display:"grid",gridTemplateColumns:"1fr auto",gap:10,alignItems:"start"}}>
              <RouteMapSVG rows={mappableOrig} filters={filtersOrig}/>
              <MapLegend rows={mappableOrig}/>
            </div>
          </div>

          {/* ── Feedback plan ── */}
          <div>
            <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:8}}>
              <span style={{width:10,height:10,borderRadius:2,background:C.warning,display:"inline-block"}}/>
              <span style={{fontSize:12,fontWeight:700,color:"#1a2233"}}>Feedback Plan</span>
              <Badge small color="warning">{cmp.filter(r=>r.changed).length} route{cmp.filter(r=>r.changed).length!==1?"s":""} changed</Badge>
            </div>
            <MapFilterBar rows={mappableFb} filters={filtersFb} setFilters={setFiltersFb}/>
            <div style={{display:"grid",gridTemplateColumns:"1fr auto",gap:10,alignItems:"start"}}>
              <RouteMapSVG rows={mappableFb} filters={filtersFb}/>
              <MapLegend rows={mappableFb}/>
            </div>
          </div>
        </div>

        <div style={{marginTop:10,padding:"8px 12px",background:C.warningLight,borderRadius:7,fontSize:11,color:"#92400e",display:"flex",alignItems:"center",gap:6}}>
          <span>💡</span>
          <span>Amber arcs on the feedback map indicate routes with suggested changes. Use the filters in each panel independently to focus on specific nodes, vehicle types, or zones.</span>
        </div>
      </div>

      <div style={{display:"flex",justifyContent:"flex-end",marginTop:16}}><Btn variant="ghost" onClick={onClose}>Close</Btn></div>
    </Modal>
  );
}

function FinaliseModal({ plan, open, onClose, onConfirm }) {
  if(!plan||!open)return null;
  const decs=plan.plannerDecisions||{};
  const accepted=Object.values(decs).filter(d=>d==="Accepted").length;
  const rejected=Object.values(decs).filter(d=>d==="Rejected").length;
  const existingVersions=(plan.versionLog||[]).length;
  const versionName=`${plan.designName} — v${existingVersions+2} (revised)`;
  return (
    <Modal open={open} onClose={onClose} title="Finalise Plan" width={480}>
      <div style={{padding:"12px 14px",background:"#f8fafc",borderRadius:8,marginBottom:16}}><div style={{fontWeight:700,fontSize:13,marginBottom:2}}>{plan.designName}</div><div style={{color:C.muted,fontSize:11}}>{plan.designType} · {plan.zone} Zone</div></div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:16}}>
        <div style={{padding:"14px 16px",borderRadius:8,background:C.accentLight,textAlign:"center"}}><div style={{fontSize:28,fontWeight:800,color:C.accent}}>{accepted}</div><div style={{fontSize:12,color:"#065f46",fontWeight:600}}>Rows Accepted</div></div>
        <div style={{padding:"14px 16px",borderRadius:8,background:C.dangerLight,textAlign:"center"}}><div style={{fontSize:28,fontWeight:800,color:C.danger}}>{rejected}</div><div style={{fontSize:12,color:"#991b1b",fontWeight:600}}>Rows Rejected</div></div>
      </div>
      <div style={{padding:"10px 14px",background:"#eef4ff",borderRadius:8,border:"1px solid #bfdbfe",marginBottom:16}}>
        <div style={{fontWeight:700,color:C.primary,marginBottom:4,fontSize:12}}>📋 This will be logged as:</div>
        <div style={{fontFamily:"monospace",fontSize:12,color:"#1a2233",fontWeight:600}}>{versionName}</div>
        <div style={{fontSize:11,color:C.muted,marginTop:4}}>Versioned at LMSC level · {accepted} accepted · {rejected} rejected · {new Date().toISOString().split("T")[0]}</div>
      </div>
      {rejected>0&&<div style={{padding:"8px 12px",background:C.warningLight,border:`1px solid ${C.warning}40`,borderRadius:8,fontSize:11,color:"#92400e",marginBottom:16}}>⚠ {rejected} rejected row{rejected!==1?"s":""} will be flagged for redesign.</div>}
      <p style={{fontSize:12,color:C.muted,marginBottom:20}}>Finalising marks this alignment complete and logs the versioned design. This cannot be undone.</p>
      <div style={{display:"flex",gap:8,justifyContent:"flex-end"}}>
        <Btn variant="ghost" onClick={onClose}>Cancel</Btn>
        <Btn variant="success" onClick={()=>onConfirm(versionName,accepted,rejected)}>✓ Finalise & Log Version</Btn>
      </div>
    </Modal>
  );
}

function SendBackModal({ plan, open, onClose, onConfirm }) {
  const [note,setNote]=useState("");
  if(!plan||!open)return null;
  return (
    <Modal open={open} onClose={onClose} title="Send Back for Re-review" width={460}>
      <div style={{padding:"10px 14px",background:"#f8fafc",borderRadius:8,marginBottom:14}}><div style={{fontWeight:700}}>{plan.designName}</div><div style={{color:C.muted,fontSize:11}}>{plan.designType} · {plan.zone}</div></div>
      <FieldLabel label="Note to Ops Leads *">
        <textarea value={note} onChange={e=>setNote(e.target.value)} rows={4} placeholder="Explain what needs to be re-reviewed…" style={{width:"100%",padding:"8px 10px",border:`1px solid ${C.border}`,borderRadius:7,fontSize:12,resize:"vertical",fontFamily:"inherit",outline:"none"}}/>
      </FieldLabel>
      <div style={{padding:"8px 12px",background:C.warningLight,borderRadius:7,fontSize:11,color:"#92400e",marginBottom:16}}>⚠ This resets all Ops Lead feedback and re-opens editing.</div>
      <div style={{display:"flex",gap:8,justifyContent:"flex-end"}}>
        <Btn variant="ghost" onClick={onClose}>Cancel</Btn>
        <Btn variant="warning" disabled={!note.trim()} onClick={()=>{onConfirm(note);setNote("");}}>↩ Send Back</Btn>
      </div>
    </Modal>
  );
}

function RowReviewTable({ plan, onUpdate, locked }) {
  const rows=plan.rows||[];
  const fb=plan.rowFeedback||[];
  const decs=plan.plannerDecisions||{};
  const getBestFb=rowId=>{const m=fb.filter(f=>f.rowId===rowId);if(!m.length)return null;return m.find(f=>f.decision==="Needs Change")||m[0];};
  return (
    <div style={{borderRadius:10,border:`1px solid ${C.border}`,overflow:"hidden"}}>
      <div style={{padding:"8px 14px",background:"#f8fafc",borderBottom:`1px solid ${C.border}`,display:"flex",alignItems:"center",gap:8}}>
        <span style={{fontSize:12,fontWeight:700}}>Route-level Review</span>
        <span style={{marginLeft:"auto",display:"flex",gap:6}}>
          <Badge small color="success">{Object.values(decs).filter(d=>d==="Accepted").length} accepted</Badge>
          <Badge small color="danger">{Object.values(decs).filter(d=>d==="Rejected").length} rejected</Badge>
          {!locked&&<Badge small color="warning">{rows.length-Object.keys(decs).length} pending</Badge>}
        </span>
      </div>
      <div style={{overflowX:"auto"}}>
        <table style={{width:"100%",borderCollapse:"collapse"}}>
          <thead><tr>{["Route","Vehicle","Count","Dist","CPS","Ops Lead Feedback","Decision","Remark","Action"].map((h,i)=><th key={i} style={{padding:"7px 10px",background:"#f8fafc",borderBottom:`1px solid ${C.border}`,fontSize:10,fontWeight:700,color:C.muted,textTransform:"uppercase",textAlign:i>1&&i<5?"right":"left",whiteSpace:"nowrap"}}>{h}</th>)}</tr></thead>
          <tbody>{rows.map(row=>{
            const best=getBestFb(row.rowId);
            const dec=decs[row.rowId];
            const isChg=best?.decision==="Needs Change";
            const rowBg=dec==="Accepted"?"#f0fdf4":dec==="Rejected"?"#fff5f5":isChg?"#fffbeb":"#fff";
            return <tr key={row.rowId} style={{background:rowBg}}>
              <td style={{padding:"8px 10px",borderBottom:`1px solid ${C.border}`,fontSize:11,fontWeight:500,maxWidth:180}}>{row.segment}</td>
              <td style={{padding:"8px 10px",borderBottom:`1px solid ${C.border}`,fontSize:11}}>
                {isChg&&best.suggestedVehicleType!==row.vehicleType?<><span style={{color:C.muted,textDecoration:"line-through"}}>{row.vehicleType}</span><span style={{color:C.warning,fontWeight:700,marginLeft:4}}>{best.suggestedVehicleType}</span></>:row.vehicleType}
              </td>
              <td style={{padding:"8px 10px",borderBottom:`1px solid ${C.border}`,fontSize:11,textAlign:"right"}}>
                {isChg&&best.suggestedCount!==row.vehicleCount?<><span style={{color:C.muted,textDecoration:"line-through"}}>{row.vehicleCount}</span><span style={{color:C.warning,fontWeight:700,marginLeft:4}}>{best.suggestedCount}</span></>:row.vehicleCount}
              </td>
              <td style={{padding:"8px 10px",borderBottom:`1px solid ${C.border}`,fontSize:11,textAlign:"right"}}>{row.routeDistanceKm}</td>
              <td style={{padding:"8px 10px",borderBottom:`1px solid ${C.border}`,fontSize:12,textAlign:"right",fontWeight:700}}>
                {isChg&&best.suggestedCps!==row.cps?<><span style={{color:C.muted,fontWeight:400,textDecoration:"line-through"}}>₹{row.cps}</span><span style={{color:C.warning,marginLeft:4}}>₹{best.suggestedCps}</span></>:<span>₹{row.cps}</span>}
              </td>
              <td style={{padding:"8px 10px",borderBottom:`1px solid ${C.border}`}}>
                {best?<span style={{padding:"2px 8px",borderRadius:99,fontSize:10,fontWeight:700,background:isChg?C.warningLight:C.accentLight,color:isChg?"#92400e":"#065f46"}}>{best.approverName} · {best.decision}</span>:<span style={{color:C.muted,fontSize:11}}>No feedback</span>}
              </td>
              <td style={{padding:"8px 10px",borderBottom:`1px solid ${C.border}`}}>
                {dec?<Badge color={dec==="Accepted"?"success":"danger"}>{dec==="Accepted"?"✓ Accepted":"✕ Rejected"}</Badge>:<span style={{fontSize:11,color:C.muted,fontStyle:"italic"}}>Pending</span>}
              </td>
              <td style={{padding:"8px 10px",borderBottom:`1px solid ${C.border}`,fontSize:11,color:C.muted,maxWidth:120}}>{best?.remark||"—"}</td>
              <td style={{padding:"8px 10px",borderBottom:`1px solid ${C.border}`}}>
                {locked?<span style={{fontSize:11,color:C.muted}}>🔒</span>:<div style={{display:"flex",gap:4}}>
                  <button onClick={()=>onUpdate(row.rowId,"Accepted")} style={{padding:"3px 9px",fontSize:10,fontWeight:700,borderRadius:5,cursor:"pointer",border:`1.5px solid ${dec==="Accepted"?C.accent:C.border}`,background:dec==="Accepted"?C.accentLight:"#fff",color:dec==="Accepted"?C.accent:C.muted}}>✓</button>
                  <button onClick={()=>onUpdate(row.rowId,"Rejected")} style={{padding:"3px 9px",fontSize:10,fontWeight:700,borderRadius:5,cursor:"pointer",border:`1.5px solid ${dec==="Rejected"?C.danger:C.border}`,background:dec==="Rejected"?C.dangerLight:"#fff",color:dec==="Rejected"?C.danger:C.muted}}>✕</button>
                </div>}
              </td>
            </tr>;
          })}</tbody>
        </table>
      </div>
    </div>
  );
}

function CentralPlannerAlignment({ alignments, setAlignments }) {
  const [selId,setSelId]=useState(alignments[0]?.id||null);
  const [activeFilter,setActiveFilter]=useState("all");
  const [simulateOpen,setSimulateOpen]=useState(false);
  const [finaliseOpen,setFinaliseOpen]=useState(false);
  const [sendBackOpen,setSendBackOpen]=useState(false);

  const plan=alignments.find(p=>p.id===selId)||alignments[0];
  const isLocked=plan?.status==="Approved";

  const counts=useMemo(()=>({
    all:alignments.length,
    Pending:alignments.filter(p=>p.status==="Pending").length,
    FeedbackReceived:alignments.filter(p=>p.status==="FeedbackReceived").length,
    Acknowledged:alignments.filter(p=>p.status==="Acknowledged").length,
    Approved:alignments.filter(p=>p.status==="Approved").length,
  }),[alignments]);

  const filtered=useMemo(()=>activeFilter==="all"?alignments:alignments.filter(p=>p.status===activeFilter),[alignments,activeFilter]);

  const statusLabel=s=>({Pending:"Plans Sent",FeedbackReceived:"Feedback Received",Acknowledged:"Under Review",Approved:"Finalised"})[s]||s;
  const statusColor=s=>({Pending:C.muted,FeedbackReceived:C.warning,Acknowledged:C.primary,Approved:C.accent})[s]||C.muted;
  const statusBg=s=>({Pending:"#f3f5f9",FeedbackReceived:C.warningLight,Acknowledged:C.primaryLight,Approved:C.accentLight})[s]||"#f3f5f9";
  const feedbackGateMet=p=>(p.rowFeedback||[]).length>0&&p.approvers.some(a=>a.submitted);

  const acknowledge=()=>setAlignments(prev=>prev.map(p=>p.id===selId?{...p,acknowledged:true,status:"Acknowledged"}:p));

  const updateDecision=useCallback((rowId,decision)=>setAlignments(prev=>prev.map(p=>p.id!==selId?p:{...p,plannerDecisions:{...p.plannerDecisions,[rowId]:decision}})),[selId]);

  const allDecided=useMemo(()=>{
    if(!plan)return false;
    const rows=plan.rows||[];
    const decs=plan.plannerDecisions||{};
    return rows.length>0&&rows.every(r=>decs[r.rowId]);
  },[plan]);

  const finalise=(versionName,accepted,rejected)=>{
    setAlignments(prev=>prev.map(p=>p.id!==selId?p:{...p,status:"Approved",finalisedOn:new Date().toISOString().split("T")[0],versionLog:[...(p.versionLog||[]),{version:versionName,finalisedOn:new Date().toISOString().split("T")[0],acceptedRows:accepted,rejectedRows:rejected}]}));
    setFinaliseOpen(false);
  };

  const sendBack=note=>{
    setAlignments(prev=>prev.map(p=>p.id!==selId?p:{...p,status:"Pending",acknowledged:false,plannerDecisions:{},rowFeedback:[],sendBackCount:(p.sendBackCount||0)+1,approvers:p.approvers.map(a=>({...a,submitted:false})),sendBackNote:note}));
    setSendBackOpen(false);
  };

  const summaryTabs=[
    {key:"all",label:"All Plans",count:counts.all},
    {key:"Pending",label:"Plans Sent",count:counts.Pending},
    {key:"FeedbackReceived",label:"Feedback Received",count:counts.FeedbackReceived},
    {key:"Acknowledged",label:"Under Review",count:counts.Acknowledged},
    {key:"Approved",label:"Finalised",count:counts.Approved},
  ];

  return (
    <div>
      {/* Summary strip: neutral by default, active tab gets blue underline only */}
      <div style={{display:"flex",gap:0,background:"#fff",border:`1px solid ${C.border}`,borderRadius:8,overflow:"hidden",marginBottom:20}}>
        {summaryTabs.map((t,i)=>{
          const isActive=activeFilter===t.key;
          return <button key={t.key} onClick={()=>{setActiveFilter(t.key);}} style={{flex:"1 1 0",minWidth:90,padding:"12px 14px",textAlign:"left",border:"none",borderRight:i<summaryTabs.length-1?`1px solid ${C.border}`:"none",background:"#fff",cursor:"pointer",borderBottom:isActive?`2px solid ${C.primary}`:"2px solid transparent",transition:"border-color .15s"}}>
            <div style={{fontSize:18,fontWeight:700,color:"#1a2233",marginBottom:2}}>{t.count}</div>
            <div style={{fontSize:11,fontWeight:isActive?600:400,color:isActive?C.primary:C.muted}}>{t.label}</div>
          </button>;
        })}
      </div>

      {/* Body */}
      <div style={{display:"grid",gridTemplateColumns:"260px 1fr",gap:16,alignItems:"start"}}>
        {/* Plan list */}
        <div>
          <div style={{fontSize:10,fontWeight:700,textTransform:"uppercase",letterSpacing:.8,color:C.muted,marginBottom:8}}>
            {activeFilter==="all"?"All Plans":summaryTabs.find(t=>t.key===activeFilter)?.label} ({filtered.length})
          </div>
          {filtered.length===0&&<div style={{padding:"24px 12px",textAlign:"center",color:C.muted,fontSize:12}}>No plans in this category.</div>}
          {filtered.map(p=>{
            const isSelected=selId===p.id;
            const hasFb=p.status==="FeedbackReceived";
            return <div key={p.id} onClick={()=>setSelId(p.id)} style={{padding:"10px 12px",borderRadius:8,marginBottom:6,cursor:"pointer",border:`1.5px solid ${isSelected?C.primary:C.border}`,background:isSelected?C.primaryLight:"#fff",transition:"all .1s"}}>
              <div style={{fontWeight:700,fontSize:12,marginBottom:3,color:isSelected?C.primary:"#1a2233"}}>{p.designName}</div>
              <div style={{display:"flex",gap:4,flexWrap:"wrap",marginBottom:5}}><Badge small>{p.designType}</Badge><Badge small color="default">{p.zone}</Badge></div>
              <div style={{display:"flex",alignItems:"center",gap:5,marginBottom:4}}><span style={{padding:"2px 8px",borderRadius:99,fontSize:10,fontWeight:700,background:statusBg(p.status),color:statusColor(p.status)}}>{statusLabel(p.status)}</span></div>
              <div style={{fontSize:10,color:C.muted}}>{p.approvers.filter(a=>a.submitted).length}/{p.approvers.length} submitted · {p.pushedOn}</div>
              {hasFb&&<div style={{marginTop:5,padding:"2px 8px",background:C.warningLight,borderRadius:4,fontSize:10,fontWeight:700,color:"#92400e",display:"inline-block"}}>💬 Acknowledge feedback</div>}
              {p.finalisedOn&&<div style={{marginTop:4,fontSize:10,color:C.accent,fontWeight:600}}>✅ Finalised {p.finalisedOn}</div>}
              {p.sendBackCount>0&&<div style={{fontSize:10,color:C.muted,marginTop:2}}>↩ Sent back {p.sendBackCount}×</div>}
              {(p.versionLog||[]).length>0&&<div style={{fontSize:10,color:C.primary,marginTop:2}}>📋 {p.versionLog[p.versionLog.length-1].version}</div>}
            </div>;
          })}
        </div>

        {/* Detail */}
        <div>
          {!plan&&<div style={{padding:"48px 24px",textAlign:"center",color:C.muted}}><div style={{fontSize:36,marginBottom:8}}>📬</div><div style={{fontWeight:600,fontSize:14}}>Select a plan to review</div></div>}
          {plan&&<>
            {/* Header card */}
            <Card style={{padding:"16px 20px",marginBottom:16}}>
              <div style={{display:"flex",alignItems:"flex-start",justifyContent:"space-between",gap:12,flexWrap:"wrap"}}>
                <div>
                  <div style={{fontWeight:800,fontSize:18,marginBottom:6}}>{plan.designName}</div>
                  <div style={{display:"flex",gap:6,flexWrap:"wrap",alignItems:"center"}}>
                    <Badge>{plan.designType}</Badge><Badge color="default">{plan.zone} Zone</Badge>
                    {plan.scId&&<Badge color="primary" small>SC: {plan.scId}</Badge>}
                    <span style={{padding:"2px 9px",borderRadius:99,fontSize:11,fontWeight:700,background:statusBg(plan.status),color:statusColor(plan.status)}}>{statusLabel(plan.status)}</span>
                    <span style={{fontSize:11,color:C.muted}}>Pushed: {plan.pushedOn}</span>
                  </div>
                  <div style={{display:"flex",gap:6,flexWrap:"wrap",marginTop:10,alignItems:"center"}}>
                    <span style={{fontSize:11,color:C.muted}}>Ops Leads:</span>
                    {plan.approvers.map((a,i)=><span key={i} style={{display:"inline-flex",alignItems:"center",gap:4,padding:"2px 9px",borderRadius:99,fontSize:11,fontWeight:600,background:a.submitted?C.accentLight:"#f3f5f9",color:a.submitted?"#065f46":C.muted,border:`1px solid ${a.submitted?C.accent:C.border}`}}>{a.submitted?"✓":"⏳"} {a.name}</span>)}
                  </div>
                </div>
                <div style={{display:"flex",gap:8,flexWrap:"wrap",flexShrink:0}}>
                  {feedbackGateMet(plan)&&!plan.acknowledged&&plan.status!=="Approved"&&<Btn variant="warning" onClick={acknowledge}>👁 Acknowledge Feedback</Btn>}
                  {plan.acknowledged&&plan.status!=="Approved"&&<>
                    <Btn variant="ghost" onClick={()=>setSimulateOpen(true)}>Simulate</Btn>
                    <Btn variant="ghost" onClick={()=>setSendBackOpen(true)}>↩ Send Back</Btn>
                    <Btn variant="success" disabled={!allDecided} onClick={()=>setFinaliseOpen(true)}>✓ Finalise Plan</Btn>
                  </>}
                  {plan.status==="Approved"&&<Badge color="success">✅ Finalised {plan.finalisedOn}</Badge>}
                </div>
              </div>
              {plan.sendBackNote&&<div style={{marginTop:10,padding:"8px 12px",background:"#f8fafc",borderRadius:7,fontSize:11,color:C.muted,borderLeft:`3px solid ${C.warning}`}}><b style={{color:"#92400e"}}>Last send-back note:</b> {plan.sendBackNote}</div>}
              {plan.hasWarnings&&<div style={{marginTop:10,padding:"8px 12px",background:C.warningLight,borderRadius:7,fontSize:11,fontWeight:700,color:"#92400e",display:"flex",alignItems:"center",gap:6,borderLeft:`3px solid ${C.warning}`}}>⚠️ This plan was accepted with validation warnings by the Network Planner. Review carefully before finalising.</div>}
              {(plan.versionLog||[]).length>0&&<div style={{marginTop:10,padding:"8px 12px",background:"#eef4ff",borderRadius:7,fontSize:11,border:"1px solid #bfdbfe"}}><b style={{color:C.primary}}>📋 Version log: </b>{plan.versionLog.map((v,i)=><span key={i} style={{marginLeft:6,color:"#1a2233"}}>{v.version} · {v.finalisedOn} · {v.acceptedRows}A/{v.rejectedRows}R</span>)}</div>}
            </Card>

            {/* Waiting state */}
            {!feedbackGateMet(plan)&&plan.status==="Pending"&&<Card style={{padding:"36px 24px",textAlign:"center",borderStyle:"dashed",marginBottom:16}}>
              <div style={{fontSize:36,marginBottom:10}}>⏳</div>
              <div style={{fontWeight:700,fontSize:14,marginBottom:6}}>Awaiting Ops Lead Feedback</div>
              <div style={{fontSize:12,color:C.muted,marginBottom:14}}>Feedback becomes visible once at least one Ops Lead submits their review.</div>
              <div style={{display:"flex",gap:6,justifyContent:"center",flexWrap:"wrap"}}>{plan.approvers.map((a,i)=><span key={i} style={{padding:"4px 12px",borderRadius:99,fontSize:11,background:"#f3f5f9",color:C.muted}}>⏳ {a.name}</span>)}</div>
            </Card>}

            {/* Acknowledge CTA banner */}
            {plan.status==="FeedbackReceived"&&!plan.acknowledged&&<div style={{background:C.warningLight,borderRadius:12,border:`1px solid ${C.warning}40`,padding:"14px 18px",marginBottom:16,display:"flex",alignItems:"center",gap:14,flexWrap:"wrap"}}>
              <span style={{fontSize:24}}>💬</span>
              <div style={{flex:1}}>
                <div style={{fontWeight:700,fontSize:13,color:"#92400e",marginBottom:2}}>Feedback received from {plan.approvers.filter(a=>a.submitted).length} Ops Lead{plan.approvers.filter(a=>a.submitted).length!==1?"s":""}</div>
                <div style={{fontSize:11,color:"#92400e"}}>Click <b>Acknowledge Feedback</b> to review row-level input and lock Ops Lead editing.</div>
              </div>
              <Btn variant="warning" onClick={acknowledge}>👁 Acknowledge Feedback</Btn>
            </div>}

            {/* Row review table */}
            {plan.acknowledged&&<>
              {!allDecided&&!isLocked&&<div style={{padding:"10px 14px",background:"#eef4ff",border:"1px solid #bfdbfe",borderRadius:8,fontSize:12,marginBottom:12,display:"flex",alignItems:"center",gap:8}}><span>ℹ</span><span>Accept or Reject each row to enable <b>Finalise Plan</b>.</span></div>}
              <RowReviewTable plan={plan} onUpdate={updateDecision} locked={isLocked}/>
            </>}
          </>}
        </div>
      </div>

      <SimulateModal plan={plan} open={simulateOpen} onClose={()=>setSimulateOpen(false)}/>
      <FinaliseModal plan={plan} open={finaliseOpen} onClose={()=>setFinaliseOpen(false)} onConfirm={finalise}/>
      <SendBackModal plan={plan} open={sendBackOpen} onClose={()=>setSendBackOpen(false)} onConfirm={sendBack}/>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// MAP VISUALISATION TAB
// ═══════════════════════════════════════════════════════════════════════════

// ── Colour palette – unique per route ID (10 colours, loops) ───────────────
const ROUTE_COLORS = [
  "#2d6af6","#17a98a","#f59e0b","#e11d48","#7c3aed",
  "#0891b2","#ea580c","#65a30d","#db2777","#0284c7",
];
const routeColor = (idx) => ROUTE_COLORS[idx % ROUTE_COLORS.length];

// Node type colours & shapes (for legend)
const NODE_TYPE_META = {
  LMSC:  { color:"#2d6af6", shape:"square",  label:"LMSC (origin SC)" },
  LMDC:  { color:"#17a98a", shape:"circle",  label:"LMDC (delivery DC)" },
};

// ── Ingestion template schema ──────────────────────────────────────────────
const INGEST_TEMPLATE = {
  headers:["lmsc_code","lmdc_code","segment","vehicle_type","vehicle_count",
           "trip_frequency","transit_hours","route_distance_km","cps"],
  required:["lmsc_code","lmdc_code","vehicle_type"],
  rules:{
    lmsc_code:  v => !v?.trim() ? "lmsc_code is mandatory" : null,
    lmdc_code:  v => !v?.trim() ? "lmdc_code is mandatory" : null,
    vehicle_type: v => !v?.trim() ? "vehicle_type is mandatory" : null,
    vehicle_count: v => v && (isNaN(+v)||+v<=0) ? "vehicle_count must be a positive number" : null,
    route_distance_km: v => v && (isNaN(+v)||+v<0) ? "route_distance_km must be ≥ 0" : null,
    transit_hours: v => v && (isNaN(+v)||+v<0) ? "transit_hours must be ≥ 0" : null,
    cps: v => v && isNaN(+v) ? "cps must be numeric" : null,
  },
};

function parseCSV(text) {
  const lines = text.trim().split(/\r?\n/).filter(l => l.trim());
  if (lines.length < 2) return { headers:[], rows:[] };
  const headers = lines[0].split(",").map(h => h.trim().replace(/^"|"$/g,"").toLowerCase());
  const rows = lines.slice(1).map(line => {
    const vals = line.split(",").map(v => v.trim().replace(/^"|"$/g,""));
    const obj = {};
    headers.forEach((h,i) => { obj[h] = vals[i] || ""; });
    return obj;
  });
  return { headers, rows };
}

function validateIngestRow(row) {
  const errors = [];
  Object.entries(INGEST_TEMPLATE.rules).forEach(([field, rule]) => {
    const msg = rule(row[field]);
    if (msg) errors.push({ field, msg });
  });
  return errors;
}

// ── Big SVG map with full interactivity ────────────────────────────────────
function RouteMapSVG({ rows, filters }) {
  const [tooltip, setTooltip] = useState(null);
  const [hoverRoute, setHoverRoute] = useState(null);

  const W = 860, H = 540, PAD = 48;

  // Build node registry
  const nodeRegistry = useMemo(() => {
    const reg = {};
    // Seed from LMSC_DATA
    LMSC_DATA.forEach(sc => {
      reg[sc.lmscCode] = { code:sc.lmscCode, name:sc.lmscName, lat:sc.lat, lng:sc.lng, type:"LMSC", zone:sc.zone };
      sc.dcs.forEach(dc => {
        reg[dc.lmdcCode] = { code:dc.lmdcCode, name:dc.lmdcName, lat:dc.lat, lng:dc.lng, type:"LMDC", zone:sc.zone };
      });
    });
    return reg;
  }, []);

  // Apply filters to rows
  const filtered = useMemo(() => {
    return rows.filter(r => {
      const lmdcNode = nodeRegistry[r.lmdcCode];
      if (filters.lmdcSearch && !(r.lmdcCode?.toLowerCase().includes(filters.lmdcSearch.toLowerCase()) || lmdcNode?.name?.toLowerCase().includes(filters.lmdcSearch.toLowerCase()))) return false;
      if (filters.route && filters.route !== "all" && r.segment !== filters.route) return false;
      if (filters.vehicleType && filters.vehicleType !== "all" && r.vehicleType !== filters.vehicleType) return false;
      if (filters.zone && filters.zone !== "all") {
        const sc = LMSC_DATA.find(s => s.lmscCode === r.lmscCode);
        if (sc && sc.zone !== filters.zone) return false;
      }
      return true;
    });
  }, [rows, filters, nodeRegistry]);

  // Collect unique nodes in filtered set
  const usedNodes = useMemo(() => {
    const set = {};
    filtered.forEach(r => {
      if (r.lmscCode && nodeRegistry[r.lmscCode]) set[r.lmscCode] = nodeRegistry[r.lmscCode];
      if (r.lmdcCode && nodeRegistry[r.lmdcCode]) set[r.lmdcCode] = nodeRegistry[r.lmdcCode];
    });
    return Object.values(set);
  }, [filtered, nodeRegistry]);

  if (usedNodes.length < 1) {
    return (
      <div style={{ display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center",
        height:400, background:"#f0f4ff", borderRadius:12, border:`1px dashed ${C.border}`, color:C.muted }}>
        <span style={{ fontSize:40, marginBottom:12 }}>🗺️</span>
        <div style={{ fontWeight:600, fontSize:14, marginBottom:6 }}>No routes to display</div>
        <div style={{ fontSize:12 }}>Adjust filters or select a plan with mappable nodes.</div>
      </div>
    );
  }

  // Projection
  const lats = usedNodes.map(n => n.lat), lngs = usedNodes.map(n => n.lng);
  const minLat = Math.min(...lats), maxLat = Math.max(...lats);
  const minLng = Math.min(...lngs), maxLng = Math.max(...lngs);
  const proj = (lat, lng) => ({
    x: PAD + ((lng - minLng) / (maxLng - minLng || 0.01)) * (W - PAD * 2),
    y: PAD + ((maxLat - lat) / (maxLat - minLat || 0.01)) * (H - PAD * 2),
  });

  const nodePts = {};
  usedNodes.forEach(n => { nodePts[n.code] = { ...proj(n.lat, n.lng), ...n }; });

  // Route index for colour assignment
  const uniqueSegments = [...new Set(rows.map(r => r.segment))];

  // Build arcs: each filtered row is one arc SCDC
  const arcs = filtered.map((r, i) => {
    const from = nodePts[r.lmscCode];
    const to   = nodePts[r.lmdcCode];
    if (!from || !to) return null;
    const segIdx = uniqueSegments.indexOf(r.segment);
    const col = routeColor(segIdx);
    const isHover = hoverRoute === r.segment;
    // Bezier control point (slight curve)
    const mx = (from.x + to.x) / 2 + (to.y - from.y) * 0.2;
    const my = (from.y + to.y) / 2 - (to.x - from.x) * 0.2;
    return { r, from, to, col, segIdx, isHover, mx, my };
  }).filter(Boolean);

  const LMSC_SZ = 10, LMDC_R = 7;

  return (
    <div style={{ position:"relative", borderRadius:12, border:`1px solid ${C.border}`, overflow:"hidden", background:"#e8f0fe" }}>
      <svg width="100%" viewBox={`0 0 ${W} ${H}`} style={{ display:"block", userSelect:"none" }}>
        {/* Subtle grid */}
        {[0.2,0.4,0.6,0.8].map(t => (
          <g key={t}>
            <line x1={PAD} y1={PAD+t*(H-PAD*2)} x2={W-PAD} y2={PAD+t*(H-PAD*2)} stroke="#c7d7f5" strokeWidth={0.5}/>
            <line x1={PAD+t*(W-PAD*2)} y1={PAD} x2={PAD+t*(W-PAD*2)} y2={H-PAD} stroke="#c7d7f5" strokeWidth={0.5}/>
          </g>
        ))}

        {/* Route arcs */}
        {arcs.map((a, i) => (
          <g key={`arc-${i}`}
            onMouseEnter={() => { setHoverRoute(a.r.segment); setTooltip({ x: (a.from.x+a.to.x)/2, y: (a.from.y+a.to.y)/2 - 18, row: a.r, col: a.col }); }}
            onMouseLeave={() => { setHoverRoute(null); setTooltip(null); }}
            style={{ cursor:"pointer" }}>
            <path
              d={`M ${a.from.x} ${a.from.y} Q ${a.mx} ${a.my} ${a.to.x} ${a.to.y}`}
              fill="none"
              stroke={a.col}
              strokeWidth={a.isHover ? 3.5 : 2}
              strokeOpacity={a.isHover ? 1 : 0.75}
              markerEnd={`url(#arrow-${a.segIdx % ROUTE_COLORS.length})`}
            />
            {/* Vehicle count label on arc */}
            <text
              x={(a.from.x+a.to.x)/2 + (a.to.y-a.from.y)*0.05}
              y={(a.from.y+a.to.y)/2 - (a.to.x-a.from.x)*0.05 - 4}
              textAnchor="middle" fontSize={9} fill={a.col} fontWeight={700} opacity={a.isHover?1:0.7}>
              {a.r.vehicleType} ×{a.r.vehicleCount}
            </text>
          </g>
        ))}

        {/* Arrow marker defs */}
        <defs>
          {ROUTE_COLORS.map((col,i) => (
            <marker key={i} id={`arrow-${i}`} markerWidth={8} markerHeight={8} refX={6} refY={3} orient="auto">
              <path d="M0,0 L0,6 L8,3 z" fill={col} opacity={0.85}/>
            </marker>
          ))}
        </defs>

        {/* LMDC nodes (circles) — draw before LMSC so SC is on top */}
        {Object.values(nodePts).filter(n => n.type==="LMDC").map((n,i) => (
          <g key={`lmdc-${n.code}`}
            onMouseEnter={() => setTooltip({ x:n.x, y:n.y-20, node:n })}
            onMouseLeave={() => setTooltip(null)}
            style={{ cursor:"pointer" }}>
            <circle cx={n.x} cy={n.y} r={LMDC_R} fill={NODE_TYPE_META.LMDC.color} stroke="#fff" strokeWidth={2} opacity={0.92}/>
            <text x={n.x} y={n.y+LMDC_R+11} textAnchor="middle" fontSize={8.5} fill="#1a2233" fontWeight={600}>{n.name.split(" ")[0]}</text>
            <text x={n.x} y={n.y+LMDC_R+21} textAnchor="middle" fontSize={7.5} fill={C.muted}>{n.code}</text>
          </g>
        ))}

        {/* LMSC nodes (squares) */}
        {Object.values(nodePts).filter(n => n.type==="LMSC").map((n,i) => (
          <g key={`lmsc-${n.code}`}
            onMouseEnter={() => setTooltip({ x:n.x, y:n.y-24, node:n })}
            onMouseLeave={() => setTooltip(null)}
            style={{ cursor:"pointer" }}>
            <rect x={n.x-LMSC_SZ} y={n.y-LMSC_SZ} width={LMSC_SZ*2} height={LMSC_SZ*2} rx={3}
              fill={NODE_TYPE_META.LMSC.color} stroke="#fff" strokeWidth={2.5}/>
            <text x={n.x} y={n.y+LMSC_SZ+12} textAnchor="middle" fontSize={8.5} fill="#1a2233" fontWeight={700}>{n.name.split(" ")[0]}</text>
            <text x={n.x} y={n.y+LMSC_SZ+22} textAnchor="middle" fontSize={7.5} fill={C.muted}>{n.code}</text>
          </g>
        ))}

        {/* Tooltip */}
        {tooltip && (
          <g>
            {tooltip.row && (
              <>
                <rect x={Math.min(tooltip.x - 70, W - 160)} y={tooltip.y - 36} width={160} height={44} rx={6}
                  fill="#1a2233" opacity={0.92}/>
                <text x={Math.min(tooltip.x - 70, W-160)+8} y={tooltip.y - 20} fontSize={9} fill="#fff" fontWeight={700}>{tooltip.row.segment}</text>
                <text x={Math.min(tooltip.x - 70, W-160)+8} y={tooltip.y - 8} fontSize={8.5} fill="#94a3b8">{tooltip.row.vehicleType} · {tooltip.row.vehicleCount} veh · {tooltip.row.routeDistanceKm} km · ₹{tooltip.row.cps}</text>
              </>
            )}
            {tooltip.node && (
              <>
                <rect x={Math.min(tooltip.x - 60, W-140)} y={tooltip.y - 32} width={140} height={36} rx={6}
                  fill="#1a2233" opacity={0.92}/>
                <text x={Math.min(tooltip.x - 60, W-140)+8} y={tooltip.y - 17} fontSize={9} fill="#fff" fontWeight={700}>{tooltip.node.name}</text>
                <text x={Math.min(tooltip.x - 60, W-140)+8} y={tooltip.y - 6} fontSize={8.5} fill="#94a3b8">{tooltip.node.code} · {tooltip.node.type} · {tooltip.node.zone}</text>
              </>
            )}
          </g>
        )}
      </svg>
    </div>
  );
}

// ── Legend component ────────────────────────────────────────────────────────
function MapLegend({ rows, defaultCollapsed=true }) {
  const uniqueSegments = [...new Set(rows.map(r => r.segment))];
  const [collapsed, setCollapsed] = useState(defaultCollapsed);
  return (
    <div style={{ background:"#fff", border:`1px solid ${C.border}`, borderRadius:8 }}>
      <button onClick={()=>setCollapsed(s=>!s)} style={{display:"flex",alignItems:"center",justifyContent:"space-between",width:"100%",padding:"10px 14px",border:"none",background:"none",cursor:"pointer",fontSize:11,fontWeight:600,color:C.muted}}>
        <span>Legend</span><span style={{fontSize:10}}>{collapsed?"show":"hide"}</span>
      </button>
      {!collapsed&&<div style={{padding:"0 14px 12px"}}>

      {/* Node types */}
      <div style={{ marginBottom:12 }}>
        <div style={{ fontSize:10, fontWeight:700, color:C.muted, textTransform:"uppercase", letterSpacing:.4, marginBottom:6 }}>Node types</div>
        <div style={{ display:"flex", flexDirection:"column", gap:5 }}>
          <div style={{ display:"flex", alignItems:"center", gap:8 }}>
            <div style={{ width:14, height:14, borderRadius:3, background:NODE_TYPE_META.LMSC.color, flexShrink:0 }}/>
            <span style={{ fontSize:11, color:"#374151" }}>LMSC — origin SC (■ square)</span>
          </div>
          <div style={{ display:"flex", alignItems:"center", gap:8 }}>
            <div style={{ width:14, height:14, borderRadius:"50%", background:NODE_TYPE_META.LMDC.color, flexShrink:0 }}/>
            <span style={{ fontSize:11, color:"#374151" }}>LMDC — delivery DC (● circle)</span>
          </div>
        </div>
      </div>

      {/* Route colours */}
      {uniqueSegments.length > 0 && (
        <div style={{marginTop:10}}>
          <div style={{ fontSize:10, fontWeight:600, color:C.muted, textTransform:"uppercase", letterSpacing:.4, marginBottom:6 }}>Routes ({uniqueSegments.length})</div>
          <div style={{ display:"flex", flexDirection:"column", gap:4, maxHeight:160, overflowY:"auto" }}>
            {uniqueSegments.map((seg, i) => (
              <div key={seg} style={{ display:"flex", alignItems:"center", gap:8 }}>
                <div style={{ width:20, height:2, borderRadius:99, background:routeColor(i), flexShrink:0 }}/>
                <span style={{ fontSize:10, color:"#374151", lineHeight:1.3 }}>{seg}</span>
              </div>
            ))}
          </div>
        </div>
      )}
      </div>}
    </div>
  );
}

// ── Filter bar ──────────────────────────────────────────────────────────────
function MapFilterBar({ rows, filters, setFilters }) {
  const routes       = useMemo(() => [...new Set(rows.map(r => r.segment).filter(Boolean))], [rows]);
  const vehicleTypes = useMemo(() => [...new Set(rows.map(r => r.vehicleType).filter(Boolean))], [rows]);
  const zones        = useMemo(() => [...new Set(rows.map(r => { const sc=LMSC_DATA.find(s=>s.lmscCode===r.lmscCode); return sc?.zone; }).filter(Boolean))], [rows]);

  const activeCount = [
    filters.lmdcSearch?.trim(),
    filters.route && filters.route!=="all" ? filters.route : null,
    filters.vehicleType && filters.vehicleType!=="all" ? filters.vehicleType : null,
    filters.zone && filters.zone!=="all" ? filters.zone : null,
  ].filter(Boolean).length;

  const clearAll = () => setFilters({ lmdcSearch:"", route:"all", vehicleType:"all", zone:"all" });

  const sel = (field, val) => (
    <select value={filters[field]||"all"} onChange={e => setFilters(f=>({...f,[field]:e.target.value}))}
      style={{ padding:"5px 10px", border:`1px solid ${C.border}`, borderRadius:6, fontSize:12, background:"#fff", outline:"none", color:filters[field]&&filters[field]!=="all"?C.primary:"#6b7280", fontWeight:filters[field]&&filters[field]!=="all"?600:400 }}>
      {val.map(v => <option key={v.value} value={v.value}>{v.label}</option>)}
    </select>
  );

  return (
    <div style={{ display:"flex", alignItems:"center", gap:8, flexWrap:"wrap", padding:"10px 14px", background:"#f8fafc", border:`1px solid ${C.border}`, borderRadius:10, marginBottom:14 }}>
      {/* LMDC search */}
      <div style={{ position:"relative" }}>
        <span style={{ position:"absolute", left:8, top:"50%", transform:"translateY(-50%)", fontSize:12, pointerEvents:"none", color:C.muted }}>🔍</span>
        <input value={filters.lmdcSearch||""} onChange={e => setFilters(f=>({...f,lmdcSearch:e.target.value}))}
          placeholder="Search LMDC…"
          style={{ padding:"5px 10px 5px 26px", border:`1px solid ${C.border}`, borderRadius:7, fontSize:12, width:170, outline:"none", background:"#fff" }}/>
      </div>

      {/* Route dropdown */}
      {sel("route", [
        {value:"all",label:"All Routes"},
        ...routes.map(r=>({value:r,label:r.length>34?r.slice(0,32)+"…":r})),
      ])}

      {/* Vehicle type dropdown */}
      {sel("vehicleType", [
        {value:"all",label:"All Vehicles"},
        ...vehicleTypes.map(v=>({value:v,label:v})),
      ])}

      {/* Zone dropdown */}
      {sel("zone", [
        {value:"all",label:"All Zones"},
        ...zones.map(z=>({value:z,label:z})),
      ])}

      {/* Active filter chip + clear */}
      {activeCount > 0 && (
        <div style={{ display:"flex", alignItems:"center", gap:6 }}>
          <span style={{ padding:"3px 10px", borderRadius:99, fontSize:11, fontWeight:700, background:C.primaryLight, color:C.primary }}>
            {activeCount} active filter{activeCount!==1?"s":""}
          </span>
          <button onClick={clearAll}
            style={{ padding:"3px 10px", fontSize:11, fontWeight:700, borderRadius:99, border:`1px solid ${C.border}`, background:"#fff", color:C.muted, cursor:"pointer" }}>
            Clear all ✕
          </button>
        </div>
      )}

      <span style={{ marginLeft:"auto", fontSize:11, color:C.muted }}>
        {rows.length} routes total
      </span>
    </div>
  );
}

// ── Ingested data uploader with full validation ────────────────────────────
function IngestUploader({ onLoad }) {
  const [file, setFile]     = useState(null);
  const [parsed, setParsed] = useState(null);
  const [errors, setErrors] = useState([]);
  const [warnings, setWarnings] = useState([]);
  const ref = useRef(null);

  const processFile = (f) => {
    if (!f || !f.name.match(/\.csv$/i)) { setFile(null); return; }
    setFile(f.name);
    const reader = new FileReader();
    reader.onload = e => {
      const { headers, rows } = parseCSV(e.target.result);

      // Missing mandatory column check
      const missingCols = INGEST_TEMPLATE.required.filter(c => !headers.includes(c));
      if (missingCols.length) {
        setErrors([{ field:"__file", msg:`Missing mandatory columns: ${missingCols.join(", ")}` }]);
        setParsed(null);
        return;
      }

      const allErrors = [], allWarnings = [];
      rows.forEach((row, i) => {
        const rowErrors = validateIngestRow(row);
        rowErrors.forEach(e => {
          if (INGEST_TEMPLATE.required.includes(e.field)) {
            allErrors.push({ rowNum: i+2, ...e });
          } else {
            allWarnings.push({ rowNum: i+2, ...e });
          }
        });
      });

      setErrors(allErrors);
      setWarnings(allWarnings);
      setParsed({ headers, rows, fileName: f.name });
    };
    reader.readAsText(f);
  };

  const handleFile = e => { processFile(e.target.files?.[0]); e.target.value=""; };
  const handleDrop = e => { e.preventDefault(); processFile(e.dataTransfer.files?.[0]); };

  const loadToMap = () => {
    if (!parsed || errors.length) return;
    // Enrich rows with coords from LMDC_MAP
    const enriched = parsed.rows.map((r, i) => ({
      rowId: `ing-${i}`,
      lmscCode: r.lmsc_code,
      lmdcCode: r.lmdc_code,
      segment: r.segment || `${r.lmsc_code}  ${r.lmdc_code}`,
      vehicleType: r.vehicle_type,
      vehicleCount: +r.vehicle_count || 1,
      tripFrequency: r.trip_frequency || "—",
      transitHours: +r.transit_hours || 0,
      routeDistanceKm: +r.route_distance_km || 0,
      cps: +r.cps || 0,
    }));
    onLoad(enriched, parsed.fileName);
  };

  const downloadTemplate = () => {
    const meta = ["Mandatory","Mandatory","Mandatory","Mandatory","Optional","Optional","Optional","Optional","Optional"];
    const csv = [INGEST_TEMPLATE.headers, meta].map(r=>r.join(",")).join("\n");
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([csv],{type:"text/csv"}));
    a.download = "map_visualisation_template.csv";
    a.click();
  };

  return (
    <div>
      {/* Drop zone */}
      {!parsed && (
        <div onDragOver={e=>e.preventDefault()} onDrop={handleDrop}
          onClick={() => ref.current?.click()}
          style={{ border:`2px dashed ${C.border}`, borderRadius:10, padding:"32px 20px", textAlign:"center", background:"#fafafa", cursor:"pointer" }}>
          <input ref={ref} type="file" accept=".csv" style={{display:"none"}} onChange={handleFile}/>
          <div style={{ fontSize:32, marginBottom:8 }}>📂</div>
          <div style={{ fontSize:13, fontWeight:600, color:"#374151", marginBottom:4 }}>Click to upload or drag & drop</div>
          <div style={{ fontSize:12, color:C.muted, marginBottom:12 }}>CSV only · must match template columns</div>
          <button onClick={e=>{e.stopPropagation();downloadTemplate();}}
            style={{ padding:"5px 14px", fontSize:11, fontWeight:600, borderRadius:7, border:`1px solid ${C.border}`, background:"#fff", color:C.muted, cursor:"pointer" }}>
            📥 Download Template
          </button>
        </div>
      )}

      {/* File loaded */}
      {parsed && (
        <div style={{ border:`1px solid ${errors.length?C.danger:C.border}`, borderRadius:10, overflow:"hidden" }}>
          <div style={{ padding:"10px 14px", background:"#f8fafc", borderBottom:`1px solid ${C.border}`,
            display:"flex", alignItems:"center", gap:10 }}>
            <div style={{ fontSize:16 }}>📄</div>
            <div style={{ flex:1 }}>
              <div style={{ fontWeight:600, fontSize:13 }}>{parsed.fileName}</div>
              <div style={{ fontSize:11, color:C.muted }}>{parsed.rows.length} rows · {parsed.headers.length} columns</div>
            </div>
            <div style={{ display:"flex", gap:6 }}>
              {errors.length===0 && <Badge small color="success">✓ Valid</Badge>}
              {errors.length>0 && <Badge small color="danger">{errors.length} error{errors.length!==1?"s":""}</Badge>}
              {warnings.length>0 && <Badge small color="warning">{warnings.length} warning{warnings.length!==1?"s":""}</Badge>}
              <button onClick={()=>{setFile(null);setParsed(null);setErrors([]);setWarnings([]);}}
                style={{ padding:"2px 8px", fontSize:11, borderRadius:5, border:`1px solid ${C.border}`, background:"#fff", color:C.muted, cursor:"pointer" }}>✕ Remove</button>
            </div>
          </div>

          {/* Validation results */}
          {(errors.length > 0 || warnings.length > 0) && (
            <div style={{ padding:"10px 14px", borderBottom:`1px solid ${C.border}` }}>
              {errors.length > 0 && (
                <div style={{ marginBottom:8 }}>
                  <div style={{ fontSize:10, fontWeight:700, textTransform:"uppercase", color:C.danger, marginBottom:5 }}>
                    🚫 Errors — must fix before loading ({errors.length})
                  </div>
                  <div style={{ display:"flex", flexDirection:"column", gap:3, maxHeight:120, overflowY:"auto" }}>
                    {errors.map((err,i)=>(
                      <div key={i} style={{ display:"flex", gap:8, padding:"3px 8px", background:C.dangerLight, borderRadius:5, fontSize:11 }}>
                        {err.rowNum && <span style={{ fontWeight:700, color:C.danger, flexShrink:0 }}>Row {err.rowNum}</span>}
                        <span style={{ color:"#7f1d1d" }}>[{err.field}] {err.msg}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {warnings.length > 0 && (
                <div>
                  <div style={{ fontSize:10, fontWeight:700, textTransform:"uppercase", color:"#92400e", marginBottom:5 }}>
                    ⚠ Warnings — can load but will be noted ({warnings.length})
                  </div>
                  <div style={{ display:"flex", flexDirection:"column", gap:3, maxHeight:80, overflowY:"auto" }}>
                    {warnings.map((w,i)=>(
                      <div key={i} style={{ display:"flex", gap:8, padding:"3px 8px", background:C.warningLight, borderRadius:5, fontSize:11 }}>
                        <span style={{ fontWeight:700, color:"#92400e", flexShrink:0 }}>Row {w.rowNum}</span>
                        <span style={{ color:"#92400e" }}>[{w.field}] {w.msg}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Preview */}
          <div style={{ overflowX:"auto", maxHeight:160, overflowY:"auto" }}>
            <table style={{ width:"100%", borderCollapse:"collapse" }}>
              <thead><tr>{parsed.headers.map((h,i)=>(
                <th key={i} style={{ padding:"5px 10px", background:"#f8fafc", borderBottom:`1px solid ${C.border}`,
                  fontSize:9, fontWeight:700, color:C.muted, textTransform:"uppercase", textAlign:"left", whiteSpace:"nowrap" }}>{h}</th>
              ))}</tr></thead>
              <tbody>{parsed.rows.slice(0,6).map((row,ri)=>(
                <tr key={ri} style={{ background:"#fff" }}>
                  {parsed.headers.map((h,ci)=>(
                    <td key={ci} style={{ padding:"5px 10px", borderBottom:`1px solid ${C.border}`, fontSize:11, color:"#374151" }}>{row[h]||"—"}</td>
                  ))}
                </tr>
              ))}</tbody>
            </table>
          </div>

          <div style={{ padding:"10px 14px", display:"flex", justifyContent:"flex-end", gap:8, borderTop:`1px solid ${C.border}`, background:"#fafafa" }}>
            <Btn variant="ghost" onClick={()=>{setFile(null);setParsed(null);setErrors([]);setWarnings([]);}}>Remove</Btn>
            <Btn disabled={errors.length>0} onClick={loadToMap}>Load to Map </Btn>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Main Map Visualisation Tab ──────────────────────────────────────────────
// Ingested plans store — shared singleton so Design Ingestion uploads feed Source B
const INGESTED_PLANS_STORE = { plans: [] };

function MapVisualisationTab({ designs, initialPlanId, clearInitialPlanId }) {
  const [source, setSource]   = useState("generated");
  const [selPlan, setSelPlan] = useState(null);
  const [ingestRows, setIngestRows]   = useState(null);
  const [ingestLabel, setIngestLabel] = useState("");
  const [ingestSource, setIngestSource] = useState("upload"); // "upload" | "ingested"
  const [selIngestedPlan, setSelIngestedPlan] = useState(null);
  const [filters, setFilters] = useState({ lmdcSearch:"", route:"all", vehicleType:"all", zone:"all" });

  const rlhPlans = useMemo(() => designs.filter(d => d.type==="RLH"), [designs]);

  // M7: consume initialPlanId — auto-select and navigate to it
  useEffect(() => {
    if (initialPlanId) {
      const plan = rlhPlans.find(p => p.id === initialPlanId);
      if (plan) { setSource("generated"); setSelPlan(initialPlanId); }
      if (clearInitialPlanId) clearInitialPlanId();
    }
  }, [initialPlanId]);

  const activeRows = useMemo(() => {
    if (source === "ingested") {
      if (ingestSource === "ingested" && selIngestedPlan) {
        return INGESTED_PLANS_STORE.plans.find(p=>p.id===selIngestedPlan)?.rows || [];
      }
      return ingestRows || [];
    }
    if (!selPlan) return [];
    const plan = rlhPlans.find(p => p.id === selPlan);
    return plan?.rows || [];
  }, [source, selPlan, ingestRows, rlhPlans, ingestSource, selIngestedPlan]);

  useEffect(() => {
    setFilters({ lmdcSearch:"", route:"all", vehicleType:"all", zone:"all" });
  }, [source, selPlan, ingestSource, selIngestedPlan]);

  return (
    <div>
      {/* Source toggle */}
      <div style={{ display:"flex", gap:0, background:"#f3f5f9", borderRadius:10, padding:4, width:"fit-content", marginBottom:16 }}>
        {[{key:"generated",label:"A. Generated Plans"},{key:"ingested",label:"B. Ingested / Custom Upload"}].map(s=>(
          <button key={s.key} onClick={()=>setSource(s.key)}
            style={{ padding:"7px 18px", fontSize:12, fontWeight:700, borderRadius:7, border:"none", cursor:"pointer",
              background:source===s.key?"#fff":"transparent", color:source===s.key?C.primary:C.muted,
              boxShadow:source===s.key?"0 1px 4px rgba(0,0,0,.1)":"none", transition:"all .1s" }}>
            {s.label}
          </button>
        ))}
      </div>

      {/* ── A: Generated Plans ── */}
      {source==="generated" && (
        <div>
          <div style={{ marginBottom:14 }}>
            <div style={{ fontSize:11, fontWeight:700, textTransform:"uppercase", letterSpacing:.5, color:C.muted, marginBottom:8 }}>Select RLH Plan Run</div>
            <div style={{ display:"flex", gap:8, flexWrap:"wrap" }}>
              {rlhPlans.length === 0 && (
                <div style={{ fontSize:12, color:C.muted, fontStyle:"italic", padding:"8px 14px", background:"#f8fafc", borderRadius:8, border:`1px dashed ${C.border}` }}>
                  No RLH plans available. Trigger a design run from Route Planning.
                </div>
              )}
              {rlhPlans.map(p=>{
                const sel = selPlan===p.id;
                return (
                  <button key={p.id} onClick={()=>setSelPlan(p.id)}
                    style={{ display:"flex", flexDirection:"column", alignItems:"flex-start", padding:"8px 14px",
                      borderRadius:8, border:`1.5px solid ${sel?C.primary:C.border}`, background:sel?C.primaryLight:"#fff",
                      cursor:"pointer", transition:"all .1s", textAlign:"left" }}>
                    <span style={{ fontSize:12, fontWeight:700, color:sel?C.primary:"#1a2233" }}>{p.name}</span>
                    <span style={{ fontSize:10, color:C.muted, fontFamily:"monospace" }}>{p.runId} · {p.scId} · {(p.rows||[]).length} routes</span>
                    {p.pushed && <Badge small color="success">📤 Pushed</Badge>}
                  </button>
                );
              })}
            </div>
          </div>
          {selPlan && activeRows.length > 0 && (
            <div style={{ display:"grid", gridTemplateColumns:"1fr 220px", gap:14, alignItems:"start" }}>
              <div><MapFilterBar rows={activeRows} filters={filters} setFilters={setFilters}/><RouteMapSVG rows={activeRows} filters={filters}/></div>
              <MapLegend rows={activeRows}/>
            </div>
          )}
          {selPlan && activeRows.length === 0 && (
            <div style={{ padding:"32px 24px", textAlign:"center", color:C.muted, background:"#f8fafc", borderRadius:12, border:`1px dashed ${C.border}` }}>
              <div style={{ fontSize:28, marginBottom:8 }}>📭</div>
              <div style={{ fontWeight:600, fontSize:13 }}>No mappable routes in this plan</div>
            </div>
          )}
          {!selPlan && rlhPlans.length > 0 && (
            <div style={{ padding:"48px 24px", textAlign:"center", color:C.muted, background:"#f8fafc", borderRadius:12, border:`1px dashed ${C.border}` }}>
              <div style={{ fontSize:36, marginBottom:10 }}>🗺️</div>
              <div style={{ fontWeight:600, fontSize:14, marginBottom:4 }}>Select a plan above to visualise</div>
            </div>
          )}
        </div>
      )}

      {/* ── B: Ingested / Custom Upload ── */}
      {source==="ingested" && (
        <div>
          {/* Source sub-toggle */}
          <div style={{ display:"flex", gap:6, marginBottom:14 }}>
            {[{key:"upload",label:"📂 Custom Upload"},{key:"ingested",label:"📋 From Design Ingestion"}].map(s=>(
              <button key={s.key} onClick={()=>{ setIngestSource(s.key); }}
                style={{ padding:"6px 14px", fontSize:11, fontWeight:700, borderRadius:7, cursor:"pointer",
                  border:`1.5px solid ${ingestSource===s.key?C.primary:C.border}`,
                  background:ingestSource===s.key?C.primaryLight:"#fff",
                  color:ingestSource===s.key?C.primary:C.muted }}>
                {s.label}
              </button>
            ))}
          </div>

          {/* From Design Ingestion */}
          {ingestSource==="ingested" && (
            <div>
              {INGESTED_PLANS_STORE.plans.length === 0 ? (
                <div style={{ padding:"32px 24px", textAlign:"center", color:C.muted, background:"#f8fafc", borderRadius:12, border:`1px dashed ${C.border}` }}>
                  <div style={{ fontSize:28, marginBottom:8 }}>📋</div>
                  <div style={{ fontWeight:600, fontSize:13, marginBottom:4 }}>No ingested plans available</div>
                  <div style={{ fontSize:12 }}>Upload a plan in Design Inputs  Design Ingestion first, then return here.</div>
                </div>
              ) : (
                <div>
                  <div style={{ fontSize:11, fontWeight:700, textTransform:"uppercase", letterSpacing:.5, color:C.muted, marginBottom:8 }}>Select ingested plan</div>
                  <div style={{ display:"flex", gap:8, flexWrap:"wrap", marginBottom:14 }}>
                    {INGESTED_PLANS_STORE.plans.map(p => {
                      const sel = selIngestedPlan===p.id;
                      return <button key={p.id} onClick={()=>setSelIngestedPlan(p.id)}
                        style={{ display:"flex", flexDirection:"column", alignItems:"flex-start", padding:"8px 14px",
                          borderRadius:8, border:`1.5px solid ${sel?C.primary:C.border}`, background:sel?C.primaryLight:"#fff", cursor:"pointer" }}>
                        <span style={{ fontSize:12, fontWeight:700, color:sel?C.primary:"#1a2233" }}>{p.name}</span>
                        <span style={{ fontSize:10, color:C.muted }}>{p.type} · {p.rows?.length||0} routes · Uploaded {p.uploadedOn}</span>
                      </button>;
                    })}
                  </div>
                  {selIngestedPlan && activeRows.length > 0 && (
                    <div style={{ display:"grid", gridTemplateColumns:"1fr 220px", gap:14, alignItems:"start" }}>
                      <div><MapFilterBar rows={activeRows} filters={filters} setFilters={setFilters}/><RouteMapSVG rows={activeRows} filters={filters}/></div>
                      <MapLegend rows={activeRows}/>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Custom Upload */}
          {ingestSource==="upload" && (
            <div>
              {!ingestRows && (
                <>
                  <div style={{ padding:"10px 14px", background:"#eef4ff", border:"1px solid #bfdbfe", borderRadius:8, fontSize:12, marginBottom:14, display:"flex", gap:8 }}>
                    <span>ℹ</span>
                    <div>Upload a CSV with columns: <code style={{background:"#f3f5f9",padding:"1px 5px",borderRadius:3}}>lmsc_code, lmdc_code, vehicle_type</code> (mandatory). Other columns optional.</div>
                  </div>
                  <IngestUploader onLoad={(rows, label) => { setIngestRows(rows); setIngestLabel(label); }}/>
                </>
              )}
              {ingestRows && (
                <>
                  <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:12, flexWrap:"wrap", gap:8 }}>
                    <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                      <Badge color="primary">📄 {ingestLabel}</Badge>
                      <Badge small>{ingestRows.length} routes loaded</Badge>
                    </div>
                    <button onClick={()=>{setIngestRows(null);setIngestLabel("");setFilters({lmdcSearch:"",route:"all",vehicleType:"all",zone:"all"});}}
                      style={{ padding:"4px 10px", fontSize:11, borderRadius:6, border:`1px solid ${C.border}`, background:"#fff", color:C.muted, cursor:"pointer" }}>
                      ✕ Remove & Re-upload
                    </button>
                  </div>
                  <div style={{ display:"grid", gridTemplateColumns:"1fr 220px", gap:14, alignItems:"start" }}>
                    <div><MapFilterBar rows={ingestRows} filters={filters} setFilters={setFilters}/><RouteMapSVG rows={ingestRows} filters={filters}/></div>
                    <MapLegend rows={ingestRows}/>
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Review & Alignments shell ────────────────────────────────────────────
function ReviewShell({ sub, setPage, designs, setDesigns, alignments, setAlignments, mapPlanId, setMapPlanId }) {
  const active=["review","operations-alignment","ops-lead","visualisation"].includes(sub)?sub:"review";
  return (
    <div style={{padding:"28px 32px",maxWidth:1200}}>
      <Breadcrumb items={[{label:"Dashboard",page:"dashboard"},{label:"Design Review & Alignments"}]} setPage={setPage}/>
      <div style={{marginBottom:20}}><h1 style={{fontSize:22,fontWeight:800}}>Design Review & Alignments</h1><p style={{color:C.muted,marginTop:4,fontSize:13}}>Review plans, check guardrail breaches, accept and manage Ops Alignment.</p></div>
      <Tabs tabs={[{key:"review",label:"Design Review"},{key:"operations-alignment",label:"Central Planner"},{key:"ops-lead",label:"👤 Ops Lead View"},{key:"visualisation",label:"🗺️ Map Visualisation"}]} active={active} onChange={k=>setPage(`sanctity-controls/${k}`)}/>
      {active==="review"&&<DesignReview designs={designs} setDesigns={setDesigns} setAlignments={setAlignments} setPage={setPage} setMapPlanId={setMapPlanId}/>}
      {active==="operations-alignment"&&<CentralPlannerAlignment alignments={alignments} setAlignments={setAlignments}/>}
      {active==="ops-lead"&&<OpsLeadAlignment alignments={alignments} setAlignments={setAlignments} setPage={setPage} setMapPlanId={setMapPlanId}/>}
      {active==="visualisation"&&<MapVisualisationTab designs={designs} initialPlanId={mapPlanId} clearInitialPlanId={()=>setMapPlanId(null)}/>}
    </div>
  );
}

// ─── Router ───────────────────────────────────────────────────────────────
function Router({ page, setPage, appState }) {
  const [top,sub]=[page.split("/")[0],page.split("/").slice(1).join("/")];
  if(page==="dashboard")return <Dashboard setPage={setPage}/>;
  if(top==="design-inputs")return <DesignInputs sub={sub} setPage={setPage}/>;
  if(top==="design-creation")return <DesignCreation sub={sub} setPage={setPage} addDesign={appState.addDesign}/>;
  if(top==="sanctity-controls")return <ReviewShell sub={sub} setPage={setPage} {...appState}/>;
  return <Dashboard setPage={setPage}/>;
}

// ─── App root ─────────────────────────────────────────────────────────────
function App() {
  const [page,setPage]       = useState("dashboard");
  const [designs,setDesigns] = useState(DESIGN_SEEDS);
  const [alignments,setAlignments] = useState(INIT_ALIGNMENTS);
  const [mapPlanId,setMapPlanId]   = useState(null);

  // Bridge: RLH completed run  designs list
  const addDesign = useCallback(newDesign => {
    setDesigns(prev => {
      const exists = prev.find(d => d.id === newDesign.id);
      return exists ? prev.map(d => d.id === newDesign.id ? newDesign : d) : [newDesign, ...prev];
    });
  }, []);

  const appState = { designs, setDesigns, alignments, setAlignments, mapPlanId, setMapPlanId };

  return (
    <div style={{display:"flex",height:"100vh",overflow:"hidden",background:"#f3f5f9",fontFamily:"-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif",fontSize:14,color:"#1a2233"}}>
      <Sidebar page={page} setPage={setPage}/>
      <main style={{flex:1,overflowY:"auto",position:"relative"}}>
        <Router page={page} setPage={setPage} appState={appState}/>
      </main>
    </div>
  );
}


    // Mount
    ReactDOM.createRoot(document.getElementById('root')).render(React.createElement(App));
    document.getElementById('loading').style.display = 'none';
    document.getElementById('root').style.display = '';

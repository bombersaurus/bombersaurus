(function(){
'use strict';

const D = window.RWH_DATA;
const KEY = 'rwh2_state';
const SCHEMA = 2;
const C1 = D.courses.digitalSkills.name;
const C2 = D.courses.tlevel.name;

const NAV = [
  ['WORKSPACE',[
    ['dashboard','Dashboard'],['curriculum','Curriculum'],['specs','Specifications'],['lesson','Lesson Studio'],['intelligence','Intelligence']
  ]],
  ['ASSESSMENT',[
    ['esp','Employer Set Project'],['assessmentPlanner','Assessment Planner'],['marking','Mark Work'],['briefs','Assignment Briefs']
  ]],
  ['LEARNERS',[
    ['learners','Learners'],['attendance','Attendance'],['oneToOnes','1:1s'],['progression','Progression']
  ]],
  ['PLANNING & ADMIN',[
    ['planner','Weekly Planner'],['timetable','Timetable'],['rooms','Rooms & Equipment'],['employers','Employer Engagement'],['resources','Resources'],['comms','Emails & Logs']
  ]],
  ['SYSTEM',[
    ['settings','Settings']
  ]]
];

const DEFAULT_STATE = () => ({
  schema: SCHEMA,
  style: D.defaultTeachingStyle.join('\n'),
  prefs: {
    defaultLessonPrompt: 'Keep it natural, specification-linked, active and appropriately challenging.',
    currentCourse: 'digitalSkills'
  },
  coverage: {},
  lessons: [],
  marking: [],
  briefs: [],
  assessments: [],
  espItems: [],
  tasks: [],
  learners: [],
  attendance: [],
  oneToOnes: [],
  progression: [],
  timetable: [],
  rooms: [],
  employers: [],
  resources: [],
  comms: [],
  vault: [],
  aiMessages: [],
  lastPage: 'dashboard',
  createdAt: new Date().toISOString()
});

let state = loadState();
let ui = {
  page: state.lastPage || 'dashboard',
  course: state.prefs.currentCourse || 'digitalSkills',
  specUnitId: null,
  currentSlides: [],
  selectedSlide: 0,
  lessonPromptHistory: [],
  markFeedback: null,
  briefPreview: null
};

function loadState(){
  try{
    const raw = localStorage.getItem(KEY);
    if(raw){
      const parsed = JSON.parse(raw);
      return migrate(parsed);
    }
  }catch(e){}
  const s = DEFAULT_STATE();
  try{
    const legacyStyle = JSON.parse(localStorage.getItem('rwh_live_style') || 'null');
    const legacyLessons = JSON.parse(localStorage.getItem('rwh_live_lessons') || 'null');
    const legacyTasks = JSON.parse(localStorage.getItem('rwh_live_tasks') || 'null');
    const legacyLearners = JSON.parse(localStorage.getItem('rwh_live_learners') || 'null');
    const legacyCoverage = JSON.parse(localStorage.getItem('rwh_live_coverage') || 'null');
    const legacyVault = JSON.parse(localStorage.getItem('rwh_live_vault') || 'null');
    if(legacyStyle) s.style = legacyStyle;
    if(Array.isArray(legacyLessons)) s.lessons = legacyLessons;
    if(Array.isArray(legacyTasks)) s.tasks = legacyTasks;
    if(Array.isArray(legacyLearners)) s.learners = legacyLearners;
    if(legacyCoverage && typeof legacyCoverage === 'object') s.coverage = legacyCoverage;
    if(Array.isArray(legacyVault)) s.vault = legacyVault;
  }catch(e){}
  saveState(s);
  return s;
}
function migrate(s){
  const base = DEFAULT_STATE();
  s = Object.assign(base,s||{});
  s.prefs = Object.assign(base.prefs,s.prefs||{});
  ['coverage'].forEach(k=>{ if(!s[k] || typeof s[k] !== 'object') s[k]={}; });
  ['lessons','marking','briefs','assessments','espItems','tasks','learners','attendance','oneToOnes','progression','timetable','rooms','employers','resources','comms','vault','aiMessages']
    .forEach(k=>{ if(!Array.isArray(s[k])) s[k]=[]; });
  s.schema = SCHEMA;
  return s;
}
function saveState(s=state){
  try{
    localStorage.setItem(KEY,JSON.stringify(s));
  }catch(e){
    toast('Could not save locally on this browser.');
  }
}
function commit(){
  state.lastPage = ui.page;
  state.prefs.currentCourse = ui.course;
  saveState();
}
function esc(v){
  return String(v==null?'':v).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
}
function nl(v){ return esc(v).replace(/\n/g,'<br>'); }
function uid(prefix='id'){ return prefix+'_'+Date.now().toString(36)+'_'+Math.random().toString(36).slice(2,7); }
function today(){ return new Date().toISOString().slice(0,10); }
function fmtDate(v){
  if(!v) return 'No date';
  try{return new Date(v+'T12:00:00').toLocaleDateString('en-GB',{day:'2-digit',month:'short',year:'numeric'});}catch(e){return v;}
}
function toast(msg){
  const el=document.getElementById('toast'); if(!el) return;
  el.textContent=msg; el.classList.add('show');
  clearTimeout(toast.t); toast.t=setTimeout(()=>el.classList.remove('show'),2300);
}
function modal(html){
  document.getElementById('modalContent').innerHTML=html;
  document.getElementById('modal').classList.add('show');
}
function closeModal(){ document.getElementById('modal').classList.remove('show'); }
window.closeModal=closeModal;
document.getElementById('modal').addEventListener('click',e=>{if(e.target.id==='modal')closeModal();});

function renderNav(){
  const nav=document.getElementById('nav');
  nav.innerHTML=NAV.map(([section,items])=>
    `<div class="nav-section">${esc(section)}</div>`+
    items.map(([id,label])=>`<button data-page="${id}" class="${ui.page===id?'active':''}" onclick="RWH.go('${id}')"><span class="dot"></span>${esc(label)}</button>`).join('')
  ).join('');
  const mobile=[['dashboard','Home'],['curriculum','Courses'],['lesson','Lesson'],['marking','Mark'],['settings','More']];
  document.getElementById('mobilebar').innerHTML=mobile.map(([id,label])=>`<button data-page="${id}" class="${ui.page===id?'active':''}" onclick="RWH.go('${id}')">${label}</button>`).join('');
}
function pageHead(title,subtitle,right=''){
  return `<div class="page-head"><div><button class="drawer-btn" onclick="RWH.toggleDrawer()">Menu</button><h1>${esc(title)}</h1><p>${esc(subtitle)}</p></div>${right||''}</div>
  <div class="card" style="padding:10px 12px;margin-bottom:14px;box-shadow:none">
    <div style="display:flex;gap:8px;align-items:center">
      <div class="search-box" style="flex:1"><input id="hubGlobalSearch" placeholder="Search the Hub or ask: what should I teach next?" onkeydown="if(event.key==='Enter') RWH.hubSearch(this.value)"></div>
      <button class="btn secondary" onclick="RWH.hubSearch(document.getElementById('hubGlobalSearch').value)">Search / Ask</button>
    </div>
  </div>`;
}
function render(){
  renderNav();
  document.body.classList.remove('drawer-open');
  const fn = {
    dashboard:renderDashboard,curriculum:renderCurriculum,specs:renderSpecs,lesson:renderLesson,
    intelligence:renderIntelligence,esp:renderESP,assessmentPlanner:renderAssessmentPlanner,marking:renderMarking,briefs:renderBriefs,learners:renderLearners,
    attendance:renderAttendance,oneToOnes:renderOneToOnes,progression:renderProgression,planner:renderPlanner,
    timetable:renderTimetable,rooms:renderRooms,employers:renderEmployers,resources:renderResources,
    comms:renderComms,settings:renderSettings
  }[ui.page] || renderDashboard;
  fn();
  commit();
  window.scrollTo({top:0,behavior:'instant'});
}
function go(page){ ui.page=page; render(); }
function toggleDrawer(){ document.body.classList.toggle('drawer-open'); }
window.RWH={go,toggleDrawer};

function course(id=ui.course){ return D.courses[id]; }
function dsUnit(id){ return D.courses.digitalSkills.units.find(u=>u.id===id); }
function allCourseAreas(courseId){
  if(courseId==='digitalSkills') return [
    ...D.courses.digitalSkills.units.map(u=>({id:u.id,title:u.title,kind:'unit'})),
    ...(D.courses.digitalSkills.deliveryAreas||[]).map(u=>({id:u.id,title:u.title,kind:'scheme'}))
  ];
  return [
    ...D.courses.tlevel.core.map(x=>({id:x.id,title:x.title,kind:'core'})),
    {id:'esp',title:'Employer Set Project',kind:'esp'},
    ...D.courses.tlevel.os.map(x=>({id:x.id,title:'Occupational Specialism: '+x.title,kind:'os'}))
  ];
}
function areaById(courseId,id){
  if(courseId==='digitalSkills') return dsUnit(id) || (D.courses.digitalSkills.deliveryAreas||[]).find(x=>x.id===id);
  return D.courses.tlevel.core.find(x=>x.id===id) || D.courses.tlevel.os.find(x=>x.id===id) || (id==='esp'?{id:'esp',title:'Employer Set Project',topics:['Applied core knowledge and skills','Planning','Research','Solution development','Evaluation']} : null);
}
function coverageKey(courseId,areaId,code='area'){ return [courseId,areaId,code].join('|'); }
function isCovered(key){ return !!state.coverage[key]; }
function setCovered(key,val){ if(val) state.coverage[key]={covered:true,date:today()}; else delete state.coverage[key]; saveState(); }
function digitalCoverage(){
  const all=D.courses.digitalSkills.units.flatMap(u=>u.criteria.map(c=>coverageKey('digitalSkills',u.id,c.code)));
  const covered=all.filter(isCovered).length;
  return {total:all.length,covered,pct:all.length?Math.round(covered/all.length*100):0};
}
function tlevelCoverage(){
  const all=[...D.courses.tlevel.core.map(x=>coverageKey('tlevel',x.id)),coverageKey('tlevel','esp'),...D.courses.tlevel.os.map(x=>coverageKey('tlevel',x.id))];
  const covered=all.filter(isCovered).length;
  return {total:all.length,covered,pct:Math.round(covered/all.length*100)};
}
function unitCriteria(courseId,areaId){
  if(courseId==='digitalSkills'){
    const u=dsUnit(areaId);
    if(u) return u.criteria;
    const a=(D.courses.digitalSkills.deliveryAreas||[]).find(x=>x.id===areaId);
    return a?[{code:'SOL',text:'Scheme of Learning delivery area: '+a.title+'. Use the relevant awarding-body source when formal assessment criteria are required.'}]:[];
  }
  const a=areaById(courseId,areaId);
  if(!a) return [];
  return [{code:'AREA',text:a.title+(a.count?` — ${a.count} numbered specification points in the official source.`:'')}];
}
function uncoveredCriteria(courseId,areaId){
  return unitCriteria(courseId,areaId).filter(c=>!isCovered(coverageKey(courseId,areaId,c.code)));
}

function renderDashboard(){
  const ds=digitalCoverage(), tl=tlevelCoverage();
  const upcoming=[...state.tasks].filter(t=>!t.done).sort((a,b)=>(a.date||'9999').localeCompare(b.date||'9999')).slice(0,5);
  const atRisk=state.learners.filter(l=>Number(l.attendance||100)<85 || l.risk==='High').length;
  const recent=state.lessons[0];
  const app=document.getElementById('app');
  app.innerHTML=pageHead('Dashboard','Your teaching, curriculum, assessment and planning workspace.','<span class="status">Workspace ready</span>')+
  `<div class="hero-band">
    <span class="pill">Rabiul teaching profile</span>
    <h2 style="font-size:27px;margin:10px 0 5px">One workspace for both courses</h2>
    <p>Plan from the specification, track what has been covered, build lessons in your Oldham College style, mark work, manage learner follow-up and keep admin actions in one place.</p>
    <div class="toolbar">
      <button class="btn" onclick="RWH.go('lesson')">Plan a lesson</button>
      <button class="btn secondary" onclick="RWH.go('marking')">Mark work</button>
      <button class="btn secondary" onclick="RWH.go('specs')">Check specification</button>
    </div>
    <div class="mini-grid" style="margin-top:14px">
      <div class="mini"><b>${state.lessons.length}</b><span>saved lessons</span></div>
      <div class="mini"><b>${state.tasks.filter(t=>!t.done).length}</b><span>open planner actions</span></div>
      <div class="mini"><b>${atRisk}</b><span>learner flags</span></div>
    </div>
  </div>

  <div class="grid g4" style="margin-top:14px">
    <div class="card"><div class="muted small">Digital Skills coverage</div><div class="kpi">${ds.pct}%</div><div class="progress"><span style="width:${ds.pct}%"></span></div><div class="small muted" style="margin-top:6px">${ds.covered}/${ds.total} official Gateway criteria marked covered</div></div>
    <div class="card"><div class="muted small">T Level areas</div><div class="kpi">${tl.pct}%</div><div class="progress"><span style="width:${tl.pct}%"></span></div><div class="small muted" style="margin-top:6px">${tl.covered}/${tl.total} core / ESP / OS areas tracked</div></div>
    <div class="card"><div class="muted small">Learners</div><div class="kpi">${state.learners.length}</div><div class="small muted">Local learner records</div></div>
    <div class="card"><div class="muted small">Assessment records</div><div class="kpi">${state.marking.length}</div><div class="small muted">Feedback saved in Hub</div></div>
  </div>

  <div class="grid g2" style="margin-top:14px">
    ${courseDashboardCard('digitalSkills',ds)}
    ${courseDashboardCard('tlevel',tl)}
  </div>

  <div class="grid g2" style="margin-top:14px">
    <div class="card">
      <div class="card-title"><h3>Next actions</h3><button class="btn ghost smallbtn" onclick="RWH.go('planner')">Open planner</button></div>
      ${upcoming.length?`<div class="list">${upcoming.map(t=>`<div class="item"><div class="item-title">${esc(t.text)}</div><div class="meta"><span class="pill gray">${esc(t.priority||'Normal')}</span><span class="small muted">${fmtDate(t.date)}</span></div></div>`).join('')}</div>`:'<div class="empty">No open planner tasks yet.</div>'}
    </div>
    <div class="card">
      <div class="card-title"><h3>Resume work</h3></div>
      ${recent?`<div class="item"><div class="item-title">${esc(recent.topic||'Saved lesson')}</div><div class="small muted">${esc(recent.courseName||recent.course||'')} · ${recent.slides?recent.slides.length:0} slides</div><div class="toolbar"><button class="btn secondary smallbtn" onclick="RWH.loadLesson('${esc(recent.id)}')">Open lesson</button></div></div>`:'<div class="empty">Your most recent saved lesson will appear here.</div>'}
      <div class="quick-actions" style="margin-top:12px">
        <button class="quick-action" onclick="RWH.go('attendance')"><b>Attendance</b><span class="small muted">Record a session</span></button>
        <button class="quick-action" onclick="RWH.go('oneToOnes')"><b>1:1</b><span class="small muted">Add follow-up</span></button>
        <button class="quick-action" onclick="RWH.go('rooms')"><b>Room issue</b><span class="small muted">Log equipment</span></button>
        <button class="quick-action" onclick="RWH.go('comms')"><b>Email / log</b><span class="small muted">Draft quickly</span></button>
      </div>
    </div>
  </div>`;
}
function courseDashboardCard(courseId,cov){
  const c=course(courseId);
  const next=getSuggestedNext(courseId);
  return `<div class="card course-hero">
    <div class="course-title">${esc(c.name)}</div>
    <div class="small muted" style="margin:4px 0 12px">${esc(c.sourceName)}</div>
    <div class="inline-stat"><span>Coverage tracked</span><b>${cov.pct}%</b></div>
    <div class="inline-stat"><span>Suggested next</span><b style="max-width:60%;text-align:right">${esc(next)}</b></div>
    <div class="toolbar">
      <button class="btn secondary smallbtn" onclick="RWH.openCourse('${courseId}')">Open curriculum</button>
      <button class="btn ghost smallbtn" onclick="RWH.planSuggested('${courseId}')">Plan next lesson</button>
    </div>
  </div>`;
}
function getSuggestedNext(courseId){
  if(courseId==='digitalSkills'){
    for(const u of D.courses.digitalSkills.units){
      const unc=u.criteria.find(c=>!isCovered(coverageKey(courseId,u.id,c.code)));
      if(unc) return `${u.title} ${unc.code}`;
    }
    return 'Review / stretch / progression';
  }
  for(const a of allCourseAreas('tlevel')){
    if(!isCovered(coverageKey('tlevel',a.id))) return a.title.replace(/^Content Area \d+: /,'');
  }
  return 'Review and assessment preparation';
}
function openCourse(courseId){ ui.course=courseId; ui.page='curriculum'; render(); }
function planSuggested(courseId){
  ui.course=courseId;
  const area=allCourseAreas(courseId).find(a=>{
    if(courseId==='digitalSkills') return uncoveredCriteria(courseId,a.id).length;
    return !isCovered(coverageKey(courseId,a.id));
  }) || allCourseAreas(courseId)[0];
  ui.page='lesson'; render();
  setTimeout(()=>{
    const c=document.getElementById('lessonCourse'); if(c){c.value=courseId; lessonCourseChanged(area.id);}
  },0);
}

function renderCurriculum(){
  const app=document.getElementById('app');
  app.innerHTML=pageHead('Curriculum','Delivery sequence, units/content areas and next-teaching decisions.')+
  `<div class="subtabs">
    <button class="subtab ${ui.course==='digitalSkills'?'active':''}" onclick="RWH.setCourse('digitalSkills')">${esc(C1)}</button>
    <button class="subtab ${ui.course==='tlevel'?'active':''}" onclick="RWH.setCourse('tlevel')">${esc(C2)}</button>
  </div>
  ${ui.course==='digitalSkills'?renderDigitalCurriculum():renderTLevelCurriculum()}`;
}
function setCourse(id){ ui.course=id; render(); }
function renderDigitalCurriculum(){
  const c=D.courses.digitalSkills;
  return `<div class="grid g2">
    <div class="card">
      <span class="pill">Curriculum intent</span>
      <h3 style="margin-top:9px">${esc(c.name)}</h3>
      <p>${esc(c.intent)}</p>
      <div class="note"><b>Delivery sequence:</b> ${esc(c.deliverySequence)}</div>
      <h4 style="margin:14px 0 8px">Five Elevate Skills</h4>
      <div class="chips">${c.elevateSkills.map(x=>`<span class="pill gray">${esc(x)}</span>`).join('')}</div>
    </div>
    <div class="card">
      <div class="card-title"><h3>Scheme of Learning highlights</h3><span class="pill blue">2026/27</span></div>
      <div class="timeline">${c.deliveryWeeks.map(w=>`<div class="timeline-item"><b>Week ${w.week}: ${esc(w.title)}</b><div class="small muted" style="margin:4px 0">${w.learning.map(esc).join(' · ')}</div><div class="small"><b>Progress:</b> ${esc(w.assessment)}</div></div>`).join('')}</div>
    </div>
  </div>
  <div class="card" style="margin-top:14px">
    <div class="card-title"><h3>Scheme of Learning delivery areas</h3><span class="pill">Delivery plan</span></div>
    <div class="note">These areas are taken from your 2026/27 Scheme of Learning and are kept separate from the official criteria in the uploaded Gateway extract.</div>
    <div class="grid g2" style="margin-top:10px">${(c.deliveryAreas||[]).map(a=>`<div class="week-card"><strong>${esc(a.title)}</strong><div class="small muted">${esc(a.note)}</div><div class="chips" style="margin-top:7px">${(a.topics||[]).slice(0,5).map(t=>`<span class="pill gray">${esc(t)}</span>`).join('')}</div><div class="toolbar"><button class="btn secondary smallbtn" onclick="RWH.openSpec('${a.id}')">Open area</button><button class="btn ghost smallbtn" onclick="RWH.planArea('digitalSkills','${a.id}')">Plan lesson</button></div></div>`).join('')}</div>
  </div>
  <div class="card" style="margin-top:14px">
    <div class="card-title"><h3>Qualification units in uploaded Gateway extract</h3><button class="btn ghost smallbtn" onclick="RWH.go('specs')">Specification library</button></div>
    <div class="grid g2">${c.units.map(u=>{
      const covered=u.criteria.filter(cr=>isCovered(coverageKey('digitalSkills',u.id,cr.code))).length;
      const pct=Math.round(covered/u.criteria.length*100);
      return `<div class="week-card"><div style="display:flex;justify-content:space-between;gap:8px"><strong>${esc(u.title)}</strong><span class="pill">${esc(u.code)}</span></div>
      <div class="small muted">${u.glh} GLH · ${u.credits} credits · ${covered}/${u.criteria.length} criteria covered</div>
      <div class="progress" style="margin-top:8px"><span style="width:${pct}%"></span></div>
      <div class="toolbar"><button class="btn secondary smallbtn" onclick="RWH.openSpec('${u.id}')">Open criteria</button><button class="btn ghost smallbtn" onclick="RWH.planArea('digitalSkills','${u.id}')">Plan lesson</button></div></div>`;
    }).join('')}</div>
  </div>`;
}
function renderTLevelCurriculum(){
  const c=D.courses.tlevel;
  return `<div class="grid g2">
    <div class="card">
      <span class="pill blue">Official source</span>
      <h3 style="margin-top:9px">${esc(c.name)}</h3>
      <p class="muted">${esc(c.sourceName)}</p>
      <div class="grid g2">${c.assessment.map(a=>`<div class="item"><b>${esc(a.name)}</b><div class="small muted">${esc(a.duration)} · ${a.marks} marks · ${esc(a.weight)}</div></div>`).join('')}</div>
    </div>
    <div class="card">
      <h3>Year 1 planning principle</h3>
      <p>Use Core content to build secure knowledge, retrieval and exam technique while connecting tasks to the Employer Set Project and later software-development specialism.</p>
      <div class="note">Use the specification point count as a coverage warning: completing a topic title is not the same as covering all numbered points underneath it.</div>
    </div>
  </div>
  <div class="card" style="margin-top:14px">
    <div class="card-title"><h3>Core content</h3><span class="pill gray">8 areas</span></div>
    <div class="grid g2">${c.core.map(a=>areaCard('tlevel',a)).join('')}</div>
  </div>
  <div class="card" style="margin-top:14px">
    <div class="card-title"><h3>Occupational Specialism</h3><span class="pill gray">8 areas</span></div>
    <div class="grid g2">${c.os.map(a=>areaCard('tlevel',a,true)).join('')}</div>
  </div>`;
}
function areaCard(courseId,a,os=false){
  const key=coverageKey(courseId,a.id);
  return `<div class="item"><div style="display:flex;justify-content:space-between;gap:8px"><b>${esc(a.title)}</b>${isCovered(key)?'<span class="pill green">Covered</span>':'<span class="pill gray">Not marked</span>'}</div>
  <div class="small muted">${a.count?`${a.count} numbered specification points · Paper ${a.paper}`:(os?'Occupational Specialism':'')}</div>
  ${a.topics?`<div class="chips" style="margin-top:7px">${a.topics.slice(0,5).map(t=>`<span class="pill gray">${esc(t)}</span>`).join('')}</div>`:''}
  <div class="toolbar"><button class="btn secondary smallbtn" onclick="RWH.openSpec('${a.id}')">Open</button><button class="btn ghost smallbtn" onclick="RWH.planArea('tlevel','${a.id}')">Plan lesson</button></div></div>`;
}

function renderSpecs(){
  const areas=allCourseAreas(ui.course);
  if(!ui.specUnitId || !areas.some(a=>a.id===ui.specUnitId)) ui.specUnitId=areas[0].id;
  const a=areaById(ui.course,ui.specUnitId);
  const q='';
  document.getElementById('app').innerHTML=pageHead('Specifications & Coverage','Search, mark coverage and move directly from criteria into lesson planning.','<span class="status">Official sources loaded</span>')+
  `<div class="card" style="margin-bottom:14px">
    <div class="form-grid">
      <label><span class="label">Course</span><select id="specCourse" onchange="RWH.specCourseChanged(this.value)"><option value="digitalSkills" ${ui.course==='digitalSkills'?'selected':''}>${esc(C1)}</option><option value="tlevel" ${ui.course==='tlevel'?'selected':''}>${esc(C2)}</option></select></label>
      <label class="search-box"><span class="label">Search this course</span><input id="specSearch" placeholder="Search unit, area, criterion or topic" oninput="RWH.filterSpecs(this.value)"></label>
    </div>
  </div>
  <div class="split">
    <div class="card sidebar-panel"><div id="specAreaList">${renderSpecAreaList(areas,q)}</div></div>
    <div class="card" id="specDetail">${renderSpecDetail(ui.course,a)}</div>
  </div>`;
}
function renderSpecAreaList(areas,q){
  return areas.filter(a=>!q || a.title.toLowerCase().includes(q.toLowerCase())).map(a=>{
    const active=a.id===ui.specUnitId;
    return `<button class="thumb ${active?'active':''}" onclick="RWH.selectSpec('${a.id}')"><b>${esc(a.title)}</b><span>${a.kind==='unit'?(dsUnit(a.id)?.code||'Gateway unit'):a.kind==='scheme'?'Scheme of Learning delivery area':a.kind==='core'?'T Level Core':a.kind==='os'?'Occupational Specialism':'Employer Set Project'}</span></button>`;
  }).join('') || '<div class="empty">No matching areas.</div>';
}
function renderSpecDetail(courseId,a){
  if(!a) return '<div class="empty">Select an area.</div>';
  if(courseId==='digitalSkills'){
    if(!a.criteria){
      return `<span class="pill">Scheme of Learning</span><h2 style="margin:9px 0 4px">${esc(a.title)}</h2>
      <div class="note">${esc(a.note||'This is a delivery area from the Scheme of Learning and is kept separate from the uploaded Gateway extract.')}</div>
      <div class="source-box" style="margin-top:12px"><b>Teaching topics</b><div class="chips">${(a.topics||[]).map(t=>`<span class="pill gray">${esc(t)}</span>`).join('')}</div></div>
      <div class="toolbar"><button class="btn" onclick="RWH.planArea('${courseId}','${a.id}')">Plan lesson from this delivery area</button></div>`;
    }
    const covered=a.criteria.filter(c=>isCovered(coverageKey(courseId,a.id,c.code))).length;
    return `<span class="pill blue">Uploaded Gateway source</span><h2 style="margin:9px 0 4px">${esc(a.title)}</h2><div class="small muted">${esc(a.code)} · ${a.glh} GLH · ${a.credits} credits</div>
    <p>${esc(a.aim)}</p>
    <div class="source-box"><b>Indicative content / teaching topics</b><div class="chips">${a.topics.map(t=>`<span class="pill gray">${esc(t)}</span>`).join('')}</div></div>
    <div style="margin:14px 0 8px"><b>Assessment criteria</b> · ${covered}/${a.criteria.length} covered</div>
    ${a.criteria.map(c=>{const key=coverageKey(courseId,a.id,c.code);return `<div class="spec-criterion"><input type="checkbox" ${isCovered(key)?'checked':''} onchange="RWH.toggleCoverage('${key}',this.checked)"><div><b>${esc(c.code)}</b> ${esc(c.text)}</div><span class="spec-code">${esc(c.code)}</span></div>`}).join('')}
    <div class="toolbar"><button class="btn" onclick="RWH.planArea('${courseId}','${a.id}')">Plan next lesson from this unit</button></div>`;
  }
  const key=coverageKey(courseId,a.id);
  return `<span class="pill blue">Pearson T Level specification · Version 1.0 May 2025</span><h2 style="margin:9px 0 4px">${esc(a.title)}</h2>
  <div class="small muted">${a.count?`${a.count} numbered specification points · Core Paper ${a.paper}`:(a.id==='esp'?'Employer Set Project':'Occupational Specialism')}</div>
  ${a.topics?`<div class="source-box" style="margin-top:12px"><b>Planning topics</b><div class="chips">${a.topics.map(t=>`<span class="pill gray">${esc(t)}</span>`).join('')}</div></div>`:''}
  <div class="note" style="margin-top:12px">Coverage here is tracked at content-area level. Use the official specification source when checking every numbered point underneath the area.</div>
  <div class="spec-criterion" style="margin-top:10px"><input type="checkbox" ${isCovered(key)?'checked':''} onchange="RWH.toggleCoverage('${key}',this.checked)"><div><b>Area coverage</b><br><span class="small muted">Mark only when you are satisfied the area has been taught/reviewed to your required level.</span></div><span class="spec-code">AREA</span></div>
  <div class="toolbar"><button class="btn" onclick="RWH.planArea('${courseId}','${a.id}')">Plan lesson from this area</button></div>`;
}
function specCourseChanged(v){ ui.course=v; ui.specUnitId=null; render(); }
function filterSpecs(v){
  const areas=allCourseAreas(ui.course);
  const root=document.getElementById('specAreaList'); if(root) root.innerHTML=renderSpecAreaList(areas,v);
}
function selectSpec(id){ ui.specUnitId=id; document.getElementById('specDetail').innerHTML=renderSpecDetail(ui.course,areaById(ui.course,id)); }
function openSpec(id){ ui.specUnitId=id; ui.page='specs'; render(); }
function openSpecCourse(courseId,id){ ui.course=courseId; ui.specUnitId=id; ui.page='specs'; render(); }
function toggleCoverage(key,val){ setCovered(key,val); if(ui.page==='specs') selectSpec(ui.specUnitId); else render(); }
function planArea(courseId,areaId){
  ui.course=courseId; ui.page='lesson'; ui.specUnitId=areaId; render();
  setTimeout(()=>{ const c=document.getElementById('lessonCourse'); if(c){c.value=courseId; lessonCourseChanged(areaId);} },0);
}

function lessonAreaOptions(courseId,selected){
  return allCourseAreas(courseId).map(a=>`<option value="${a.id}" ${a.id===selected?'selected':''}>${esc(a.title)}</option>`).join('');
}
function renderLesson(){
  const areas=allCourseAreas(ui.course);
  let areaId=ui.specUnitId || areas[0].id;
  if(!areas.some(a=>a.id===areaId)) areaId=areas[0].id;
  ui.specUnitId=areaId;
  const saved=state.lessons.slice(0,6);
  document.getElementById('app').innerHTML=pageHead('Lesson Studio','Build, edit and improve specification-linked lessons in your Oldham College teaching style.','<span class="pill">Oldham lesson standard</span>')+
  `<div class="card" style="margin-bottom:14px">
    <div class="form-grid">
      <label><span class="label">Course</span><select id="lessonCourse" onchange="RWH.lessonCourseChanged()"><option value="digitalSkills" ${ui.course==='digitalSkills'?'selected':''}>${esc(C1)}</option><option value="tlevel" ${ui.course==='tlevel'?'selected':''}>${esc(C2)}</option></select></label>
      <label><span class="label">Unit / content area</span><select id="lessonArea" onchange="RWH.lessonAreaChanged(this.value)">${lessonAreaOptions(ui.course,areaId)}</select></label>
      <label><span class="label">Topic</span><input id="lessonTopic" value="${esc(areaById(ui.course,areaId)?.title||'')}" placeholder="Specific lesson topic"></label>
      <label><span class="label">Duration</span><select id="lessonDuration"><option value="210">3.5 hours</option><option value="180">3 hours</option><option value="120">2 hours</option></select></label>
      <label><span class="label">Slides</span><select id="lessonCount"><option>20</option><option>16</option><option>12</option><option>24</option></select></label>
      <label><span class="label">Delivery mode</span><select id="lessonMode"><option>Balanced theory + active learning</option><option>100% theoretical</option><option>Programming practical</option><option>Assessment preparation</option><option>Revision / retrieval</option></select></label>
      <label><span class="label">Grouping</span><select id="lessonGrouping"><option>Mixed</option><option>Groups of 3</option><option>Pairs</option><option>Individual</option></select></label>
      <label><span class="label">Task frequency</span><select id="lessonFrequency"><option value="2">Task after 2 teaching slides</option><option value="3">Task after 3 teaching slides</option><option value="1">Task after each teaching slide</option></select></label>
      <label class="full"><span class="label">Lesson improvement prompt</span><textarea id="lessonPrompt" placeholder="Example: 100% theoretical, no code, groups of 3, more advanced tasks, use exam-style questioning.">${esc(state.prefs.defaultLessonPrompt||'')}</textarea></label>
    </div>
    <div class="toolbar"><button class="btn" onclick="RWH.generateLesson()">Generate lesson</button><button class="btn secondary" onclick="RWH.saveLesson()">Save lesson</button><button class="btn ghost" onclick="RWH.printLesson()">Print / Save PDF</button><button class="btn ghost" onclick="RWH.newLesson()">New</button></div>
  </div>
  <div class="lesson-grid">
    <div class="card">
      <div class="card-title"><h3>Slides</h3><span class="pill gray">${ui.currentSlides.length}</span></div>
      <div class="thumbs" id="lessonThumbs">${renderLessonThumbs()}</div>
    </div>
    <div class="slide-stage"><div id="slidePreview">${renderSlidePreview()}</div></div>
    <div class="lesson-side">
      <div class="card"><h3>My lesson standard</h3><div class="style-box" style="margin-top:8px">${esc(state.style.split('\n').slice(0,9).join('\n'))}</div></div>
      <div class="card" style="margin-top:12px">
        <h3>Improve current lesson</h3>
        <textarea id="improvePrompt" placeholder="Make tasks more advanced, remove code, add model answers, shorten slide text..."></textarea>
        <div class="chips" style="margin-top:8px">
          ${['Shorter','More advanced','Theory only','No code','Groups of 3','Paired task','Model answer','Exam-style task','Task every 2','Recap + extension'].map(x=>`<button class="chip" onclick="RWH.addImprovePrompt('${x}')">${x}</button>`).join('')}
        </div>
        <div class="toolbar"><button class="btn smallbtn" onclick="RWH.improveLesson(false)">Improve whole lesson</button><button class="btn secondary smallbtn" onclick="RWH.improveLesson(true)">Selected slide</button></div>
      </div>
      <div class="card" style="margin-top:12px">
        <h3>Edit selected slide</h3>
        <label><span class="label">Type</span><select id="editSlideType"><option>Title</option><option>Expectations</option><option>Do Now</option><option>Objectives</option><option>New learning</option><option>Task</option><option>Worked example</option><option>Assessment</option><option>Recap</option></select></label>
        <label><span class="label">Title</span><input id="editSlideTitle"></label>
        <label><span class="label">Content</span><textarea id="editSlideBody"></textarea></label>
        <label><span class="label">Speaker notes</span><textarea id="editSlideNotes"></textarea></label>
        <div class="toolbar"><button class="btn secondary smallbtn" onclick="RWH.updateSelectedSlide()">Update slide</button><button class="btn danger smallbtn" onclick="RWH.deleteSelectedSlide()">Delete</button></div>
      </div>
      <div class="card" style="margin-top:12px">
        <div class="card-title"><h3>Recent saved lessons</h3></div>
        ${saved.length?`<div class="list">${saved.map(l=>`<div class="item"><b>${esc(l.topic)}</b><div class="small muted">${esc(l.courseName||'')} · ${l.slides?.length||0} slides</div><div class="toolbar"><button class="btn ghost smallbtn" onclick="RWH.loadLesson('${l.id}')">Open</button></div></div>`).join('')}</div>`:'<div class="empty">No saved lessons yet.</div>'}
      </div>
    </div>
  </div>`;
  fillSlideEditor();
}
function lessonCourseChanged(forceArea){
  ui.course=document.getElementById('lessonCourse').value;
  const areas=allCourseAreas(ui.course);
  const chosen=forceArea && areas.some(a=>a.id===forceArea)?forceArea:areas[0].id;
  ui.specUnitId=chosen;
  const sel=document.getElementById('lessonArea'); if(sel) sel.innerHTML=lessonAreaOptions(ui.course,chosen);
  const topic=document.getElementById('lessonTopic'); if(topic) topic.value=areaById(ui.course,chosen)?.title||'';
}
function lessonAreaChanged(v){ ui.specUnitId=v; const t=document.getElementById('lessonTopic'); if(t) t.value=areaById(ui.course,v)?.title||''; }
function makeSlide(type,title,body,notes=''){ return {id:uid('s'),type,title,body,notes}; }
function teachingPoints(courseId,areaId,topic){
  const a=areaById(courseId,areaId);
  if(courseId==='digitalSkills'){
    const u=dsUnit(areaId);
    if(!u){
      return (a?.topics||[a?.title||topic]).map(t=>({title:t,text:`Explain ${t.toLowerCase()} clearly, then connect it to ${topic||a?.title||'the lesson'} using a realistic digital-workplace example. Keep this as Scheme-of-Learning content unless formal criteria are supplied from the awarding-body source.`}));
    }
    const uncovered=uncoveredCriteria(courseId,areaId);
    const crit=(uncovered.length?uncovered:u.criteria).map(c=>({title:`Specification ${c.code}`,text:c.text}));
    const concepts=(u.topics||[]).map(t=>({title:t,text:`Explain ${t.toLowerCase()} clearly, then connect it to ${topic||u.title} using a realistic digital-workplace example.`}));
    return [...crit,...concepts];
  }
  const topics=(a?.topics||[a?.title||topic]).map(t=>({title:t,text:`Teach the key knowledge for ${t}. Define the concept, explain why it matters and connect it to a software-development or digital-business scenario.`}));
  if(a?.count) topics.unshift({title:'Specification focus',text:`This content area contains ${a.count} numbered specification points. Keep lesson coverage precise and avoid treating the area title as complete coverage.`});
  return topics;
}
function taskBody(topic,group,advanced,exam){
  const grouping=group==='Groups of 3'?'Work in groups of 3 and assign a clear role to each person.':group==='Pairs'?'Work in pairs and agree one final response.':group==='Individual'?'Work independently.':'Work individually first, then compare with a partner or group.';
  const core=exam?`Answer an exam-style question on ${topic}. Use a clear point, accurate technical explanation and applied example.`:`Complete an applied task on ${topic}. Use the new learning to solve or explain a realistic digital scenario.`;
  return `${grouping}\n\n${core}${advanced?' Compare alternatives, justify your decision and identify one limitation.':''}\n\nExpected output: full sentences, correct terminology and evidence linked to the lesson objective.\n\nExtension: apply the idea to a different workplace or software scenario.`;
}
function generateLesson(){
  const courseId=document.getElementById('lessonCourse').value;
  const areaId=document.getElementById('lessonArea').value;
  const topic=document.getElementById('lessonTopic').value.trim() || areaById(courseId,areaId)?.title || 'Lesson';
  const count=Number(document.getElementById('lessonCount').value)||20;
  const mode=document.getElementById('lessonMode').value;
  let group=document.getElementById('lessonGrouping').value;
  let freq=Number(document.getElementById('lessonFrequency').value)||2;
  const prompt=document.getElementById('lessonPrompt').value.trim();
  const q=prompt.toLowerCase();
  const theory=mode==='100% theoretical'||q.includes('theory only')||q.includes('100% theoretical');
  const noCode=theory||q.includes('no code')||q.includes('remove code');
  const advanced=q.includes('advanced')||q.includes('stretch')||q.includes('challeng');
  const exam=mode==='Assessment preparation'||q.includes('exam');
  if(q.includes('groups of 3')) group='Groups of 3';
  if(q.includes('pairs')) group='Pairs';
  if(q.includes('individual')) group='Individual';
  if(q.includes('task every 3')) freq=3;
  if(q.includes('task every 2')) freq=2;
  const points=teachingPoints(courseId,areaId,topic);
  const slides=[];
  slides.push(makeSlide('Title',topic,`${course(courseId).name}\n${areaById(courseId,areaId)?.title||''}\n\nOldham College · Faculty of Digital & Creative`,'Introduce the lesson and connect it to prior learning.'));
  slides.push(makeSlide('Expectations','Classroom expectations',D.classroomExpectations.map((x,i)=>`${i+1}. ${x}`).join('\n'),'Settle the room quickly before retrieval.'));
  slides.push(makeSlide('Do Now','Do Now / retrieval',`Answer in full sentences:\n\n1. What do you already know about ${topic}?\n2. Which previous topic links to today?\n3. Give one realistic example.\n4. Identify one technical term you expect to use today.\n\nExtension: explain why the previous learning matters for today.`,'Use answers to identify misconceptions before new learning.'));
  const spec=unitCriteria(courseId,areaId).slice(0,3);
  slides.push(makeSlide('Objectives','Learning objectives',`By the end of the lesson, learners will be able to:\n• explain the key knowledge in ${topic}\n• apply it to a realistic digital scenario\n• produce assessment-ready evidence${spec.length?`\n\nSpecification focus:\n${spec.map(x=>`${x.code} ${x.text}`).join('\n')}`:''}`,'Keep objectives visible and measurable.'));
  let teachSinceTask=0,idx=0;
  while(slides.length < Math.max(8,count-4)){
    const p=points[idx%points.length]; idx++;
    slides.push(makeSlide('New learning',p.title,`${p.text}\n\nKey points:\n• define the idea accurately\n• explain why it matters\n• connect it to a realistic example${noCode?'':'\n• use a short technical or code example only if it improves understanding'}\n\nCheck for understanding: ask one learner to explain the idea without reading the slide.`,'Teach in a short chunk, question learners, then move on.'));
    teachSinceTask++;
    if(teachSinceTask>=freq && slides.length < count-5){
      slides.push(makeSlide('Task',exam?'Exam-style task':'Active learning task',taskBody(topic,group,advanced,exam),'Circulate, check misconceptions and select responses to review.'));
      teachSinceTask=0;
    }
  }
  slides.push(makeSlide('Worked example','Worked / model answer',`Model a strong response to a task on ${topic}.\n\nModel structure:\n1. Make a clear technical point.\n2. Explain how or why it works.\n3. Apply it to the scenario.\n4. Link back to the requirement or specification.\n5. Add a limitation, comparison or justification for higher challenge.`,'Model the thinking process, not just the finished answer.'));
  slides.push(makeSlide('Assessment','Independent assessment',`Work independently.\n\nProduce an assessment-ready response on ${topic}. Use correct terminology and full sentences. Include an applied example and justify your reasoning where appropriate.\n\nSuccess check:\n• technically accurate\n• directly answers the task\n• evidence is clear\n• explanation goes beyond a definition\n• proofread before submission`,'Use this as the clearest independent evidence from the lesson.'));
  slides.push(makeSlide('Recap','Recap: 5 questions',`1. Define the main concept from today.\n2. Explain one purpose, benefit or reason it matters.\n3. Apply it to a realistic example.\n4. Link one answer to the specification.\n5. Identify one common error or misconception.\n\nExtension: justify which idea from today is most important and why.`,'Use cold call / mini-whiteboards / written exit check.'));
  slides.push(makeSlide('Assessment','Exit ticket',`Write one strong paragraph that explains what you learned, applies it to a realistic digital scenario and uses the correct technical vocabulary.\n\nThen identify one area you still need to improve.`,'Collect or sample before learners leave.'));
  ui.currentSlides=slides.slice(0,count);
  ui.selectedSlide=0;
  ui.lessonPromptHistory.unshift({date:new Date().toISOString(),prompt:prompt||'Default teaching style'});
  renderLesson();
  toast(`Generated ${ui.currentSlides.length} slides.`);
}
function renderLessonThumbs(){
  if(!ui.currentSlides.length) return '<div class="empty">Generate or open a lesson.</div>';
  return ui.currentSlides.map((s,i)=>`<button class="thumb ${i===ui.selectedSlide?'active':''}" onclick="RWH.selectSlide(${i})"><b>${i+1}. ${esc(s.title)}</b><span>${esc(s.type)}</span></button>`).join('');
}
function renderSlidePreview(){
  if(!ui.currentSlides.length) return '<div class="card">Generate a lesson to start building.</div>';
  const s=ui.currentSlides[ui.selectedSlide];
  return `<div class="slide"><div class="slide-brand"><span>Oldham College</span><span>Faculty of Digital & Creative</span></div><div class="slide-type">${esc(s.type)}</div><h2>${esc(s.title)}</h2><div class="slide-body">${nl(s.body)}</div><div class="slide-footer"><span>Oldham College</span><span>${ui.selectedSlide+1} / ${ui.currentSlides.length}</span></div></div>`;
}
function fillSlideEditor(){
  const s=ui.currentSlides[ui.selectedSlide]; if(!s) return;
  const type=document.getElementById('editSlideType'),title=document.getElementById('editSlideTitle'),body=document.getElementById('editSlideBody'),notes=document.getElementById('editSlideNotes');
  if(type) type.value=s.type;
  if(title) title.value=s.title;
  if(body) body.value=s.body;
  if(notes) notes.value=s.notes||'';
}
function selectSlide(i){ ui.selectedSlide=i; document.getElementById('lessonThumbs').innerHTML=renderLessonThumbs(); document.getElementById('slidePreview').innerHTML=renderSlidePreview(); fillSlideEditor(); }
function updateSelectedSlide(){
  const s=ui.currentSlides[ui.selectedSlide]; if(!s) return;
  s.type=document.getElementById('editSlideType').value;
  s.title=document.getElementById('editSlideTitle').value.trim();
  s.body=document.getElementById('editSlideBody').value;
  s.notes=document.getElementById('editSlideNotes').value;
  selectSlide(ui.selectedSlide); toast('Slide updated.');
}
function deleteSelectedSlide(){
  if(!ui.currentSlides.length) return;
  ui.currentSlides.splice(ui.selectedSlide,1);
  ui.selectedSlide=Math.max(0,Math.min(ui.selectedSlide,ui.currentSlides.length-1));
  renderLesson(); toast('Slide deleted.');
}
function addImprovePrompt(t){ const e=document.getElementById('improvePrompt'); e.value=(e.value?e.value+', ':'')+t; }
function improveLesson(selectedOnly){
  if(!ui.currentSlides.length) return toast('Generate a lesson first.');
  const raw=document.getElementById('improvePrompt').value.trim(); if(!raw) return toast('Add an improvement instruction.');
  const q=raw.toLowerCase();
  const idxs=selectedOnly?[ui.selectedSlide]:ui.currentSlides.map((_,i)=>i);
  idxs.forEach(i=>{
    const s=ui.currentSlides[i];
    if(q.includes('shorter')){
      const lines=s.body.split('\n').filter(Boolean);
      s.body=lines.slice(0,Math.max(3,Math.ceil(lines.length*.65))).join('\n');
    }
    if((q.includes('advanced')||q.includes('challenge')) && s.type==='Task') s.body += '\n\nChallenge: compare two approaches, justify which is more suitable and explain one limitation.';
    if((q.includes('theory only')||q.includes('no code')||q.includes('remove code'))) s.body=s.body.replace(/^.*\b(code|coding|programming practical)\b.*$/gim,'').replace(/\n{3,}/g,'\n\n');
    if(q.includes('groups of 3') && s.type==='Task') s.body='Work in groups of 3. Give each person a defined role and combine your work into one final response.\n\n'+s.body;
    if(q.includes('paired') && s.type==='Task') s.body='Work in pairs. Each person must contribute, then agree one final response.\n\n'+s.body;
    if(q.includes('exam') && s.type==='Task'){ s.title='Exam-style task'; s.body='Answer independently using a clear point, technical explanation and applied example.\n\n'+s.body; }
    if(q.includes('model answer') && (s.type==='Worked example'||s.type==='Task')) s.body += '\n\nModel structure: Point → explanation → applied example → justification / limitation.';
  });
  if(!selectedOnly && q.includes('model answer') && !ui.currentSlides.some(s=>s.type==='Worked example')){
    ui.currentSlides.splice(Math.max(4,ui.currentSlides.length-3),0,makeSlide('Worked example','Worked / model answer','Model a strong response using: Point → technical explanation → applied example → justification.'));
  }
  ui.lessonPromptHistory.unshift({date:new Date().toISOString(),prompt:raw,selectedOnly});
  document.getElementById('improvePrompt').value='';
  renderLesson(); toast(selectedOnly?'Selected slide improved.':'Lesson improvements applied.');
}
function saveLesson(){
  if(!ui.currentSlides.length) return toast('Generate or open a lesson first.');
  const courseId=document.getElementById('lessonCourse')?.value||ui.course;
  const areaId=document.getElementById('lessonArea')?.value||ui.specUnitId;
  const topic=document.getElementById('lessonTopic')?.value||ui.currentSlides[0]?.title||'Lesson';
  const rec={id:uid('lesson'),courseId,courseName:course(courseId).name,areaId,areaTitle:areaById(courseId,areaId)?.title||'',topic,date:new Date().toISOString(),slides:JSON.parse(JSON.stringify(ui.currentSlides)),promptHistory:JSON.parse(JSON.stringify(ui.lessonPromptHistory)),styleSnapshot:state.style};
  state.lessons.unshift(rec); saveState(); renderLesson(); toast('Lesson saved.');
}
function loadLesson(id){
  const l=state.lessons.find(x=>String(x.id)===String(id)); if(!l) return toast('Lesson not found.');
  ui.course=l.courseId||'digitalSkills'; ui.specUnitId=l.areaId; ui.currentSlides=JSON.parse(JSON.stringify(l.slides||[])); ui.selectedSlide=0; ui.lessonPromptHistory=l.promptHistory||[]; ui.page='lesson'; render();
}
function newLesson(){ ui.currentSlides=[]; ui.selectedSlide=0; ui.lessonPromptHistory=[]; renderLesson(); }
function printLesson(){ if(!ui.currentSlides.length)return toast('Generate a lesson first.'); window.print(); }


function hubSearch(query){
  const q=(query||'').trim();
  if(!q) return toast('Type something to search or ask.');
  const low=q.toLowerCase();
  const hits=[];
  D.courses.digitalSkills.units.forEach(u=>{
    if((u.title+' '+u.code+' '+u.aim+' '+u.topics.join(' ')).toLowerCase().includes(low)) hits.push({type:'Digital Skills unit',title:u.title,detail:u.code,action:"RWH.openSpecCourse('digitalSkills','"+u.id+"')"});
    u.criteria.forEach(c=>{if((c.code+' '+c.text).toLowerCase().includes(low))hits.push({type:'Specification criterion',title:u.title+' '+c.code,detail:c.text,action:"RWH.openSpecCourse('digitalSkills','"+u.id+"')"});});
  });
  (D.courses.digitalSkills.deliveryAreas||[]).forEach(a=>{
    if((a.title+' '+(a.topics||[]).join(' ')).toLowerCase().includes(low)) hits.push({type:'Scheme of Learning',title:a.title,detail:a.note||'',action:"RWH.openSpecCourse('digitalSkills','"+a.id+"')"});
  });
  D.courses.tlevel.core.forEach(a=>{if((a.title+' '+(a.topics||[]).join(' ')).toLowerCase().includes(low))hits.push({type:'T Level Core',title:a.title,detail:(a.count||0)+' numbered specification points',action:"RWH.openSpecCourse('tlevel','"+a.id+"')"});});
  D.courses.tlevel.os.forEach(a=>{if(a.title.toLowerCase().includes(low))hits.push({type:'Occupational Specialism',title:a.title,detail:'T Level Digital Software Development',action:"RWH.openSpecCourse('tlevel','"+a.id+"')"});});
  state.lessons.forEach(x=>{if((x.topic+' '+x.areaTitle).toLowerCase().includes(low))hits.push({type:'Saved lesson',title:x.topic,detail:x.courseName||'',action:"RWH.loadLesson('"+x.id+"')"});});
  state.tasks.forEach(x=>{if((x.text||'').toLowerCase().includes(low))hits.push({type:'Planner task',title:x.text,detail:fmtDate(x.date),action:"RWH.go('planner')"});});
  state.learners.forEach(x=>{if((x.ref+' '+(x.strengths||'')+' '+(x.support||'')).toLowerCase().includes(low))hits.push({type:'Learner record',title:x.ref,detail:x.support||x.strengths||'',action:"RWH.go('learners')"});});
  state.resources.forEach(x=>{if((x.title+' '+x.type+' '+(x.notes||'')).toLowerCase().includes(low))hits.push({type:'Resource',title:x.title,detail:x.type,action:"RWH.go('resources')"});});
  state.rooms.forEach(x=>{if((x.room+' '+x.issue+' '+x.type).toLowerCase().includes(low))hits.push({type:'Room / equipment',title:x.room+' · '+x.type,detail:x.issue,action:"RWH.go('rooms')"});});
  state.employers.forEach(x=>{if((x.name+' '+x.type+' '+(x.details||'')).toLowerCase().includes(low))hits.push({type:'Employer engagement',title:x.name,detail:x.details||x.type,action:"RWH.go('employers')"});});
  const nextIntent=/next lesson|teach next|what next|next topic/.test(low);
  const answer=nextIntent?'<div class="note"><b>Suggested next:</b><br>'+esc(C1)+': '+esc(getSuggestedNext('digitalSkills'))+'<br>'+esc(C2)+': '+esc(getSuggestedNext('tlevel'))+'</div>':'';
  modal('<div class="card-title"><h2>Hub search</h2><button class="btn ghost smallbtn" onclick="closeModal()">Close</button></div>'+
    '<p class="muted">Query: '+esc(q)+'</p>'+answer+
    (hits.length?'<div class="list" style="margin-top:12px">'+hits.slice(0,14).map(h=>'<div class="item"><span class="pill gray">'+esc(h.type)+'</span><b style="display:block;margin-top:5px">'+esc(h.title)+'</b><div class="small muted">'+esc(h.detail)+'</div><div class="toolbar"><button class="btn ghost smallbtn" onclick="closeModal();'+h.action+'">Open</button></div></div>').join('')+'</div>':'<div class="empty">No direct stored match. Use the intelligent request button below to work across your Hub context.</div>')+
    '<div class="toolbar"><button class="btn" onclick="closeModal();RWH.openIntelligenceSearch('+JSON.stringify(q)+')">Use Intelligence Workspace</button></div>');
}
function openIntelligenceSearch(q){ openIntelligenceWith(q,'Full Hub'); }

function renderESP(){
  const esp=D.courses.tlevel.assessment.find(x=>x.name==='Employer Set Project')||{duration:'14h 30m',marks:100,weight:'40%'};
  const items=[...state.espItems].sort((a,b)=>(a.date||'9999').localeCompare(b.date||'9999'));
  document.getElementById('app').innerHTML=pageHead('Employer Set Project','Plan preparation, formative checkpoints and delivery without mixing it up with the Core exams.')+
  '<div class="grid g2">'+
    '<div class="card"><span class="pill blue">T Level Core component</span><h2 style="margin:9px 0 4px">Employer Set Project</h2><div class="grid g3" style="margin-top:12px"><div class="item"><div class="muted small">Duration</div><b>'+esc(esp.duration)+'</b></div><div class="item"><div class="muted small">Marks</div><b>'+esc(esp.marks)+'</b></div><div class="item"><div class="muted small">Core weighting</div><b>'+esc(esp.weight)+'</b></div></div><div class="note" style="margin-top:12px">Use this area for preparation and internal planning. Keep official live assessment materials and controlled conditions separate from teaching resources.</div></div>'+
    '<div class="card"><h3>Add ESP checkpoint</h3><div class="form-grid"><label><span class="label">Checkpoint / activity</span><input id="espTitle" placeholder="e.g. Task 1 formative recap"></label><label><span class="label">Planned date</span><input id="espDate" type="date"></label><label><span class="label">Status</span><select id="espStatus"><option>Planned</option><option>In progress</option><option>Complete</option><option>Needs follow-up</option></select></label><label><span class="label">Focus</span><select id="espFocus"><option>Problem solving</option><option>Research / sources</option><option>Planning</option><option>Communication</option><option>Solution development</option><option>Evaluation</option></select></label><label class="full"><span class="label">Notes / learner preparation</span><textarea id="espNotes"></textarea></label></div><div class="toolbar"><button class="btn" onclick="RWH.addESPItem()">Add checkpoint</button><button class="btn secondary" onclick="RWH.prepareESPRequest()">Prepare planning request</button></div></div>'+
  '</div>'+
  '<div class="card" style="margin-top:14px"><div class="card-title"><h3>ESP plan</h3><span class="pill gray">'+items.length+' items</span></div>'+
    (items.length?'<div class="table-wrap"><table><thead><tr><th>Date</th><th>Checkpoint</th><th>Focus</th><th>Status</th><th>Notes</th></tr></thead><tbody>'+items.map(x=>'<tr><td>'+fmtDate(x.date)+'</td><td><b>'+esc(x.title)+'</b></td><td>'+esc(x.focus)+'</td><td><span class="pill '+(x.status==='Complete'?'green':x.status==='Needs follow-up'?'red':'gray')+'">'+esc(x.status)+'</span></td><td>'+esc(x.notes||'')+'</td></tr>').join('')+'</tbody></table></div>':'<div class="empty">No ESP checkpoints saved yet.</div>')+
  '</div>';
}
function addESPItem(){
  const title=document.getElementById('espTitle').value.trim(); if(!title) return toast('Add a checkpoint title.');
  state.espItems.unshift({id:uid('esp'),title,date:document.getElementById('espDate').value,status:document.getElementById('espStatus').value,focus:document.getElementById('espFocus').value,notes:document.getElementById('espNotes').value.trim(),created:new Date().toISOString()});
  saveState(); renderESP(); toast('ESP checkpoint added.');
}
function prepareESPRequest(){
  openIntelligenceWith('Help me plan the next Employer Set Project preparation session. Use my existing ESP checkpoints, T Level Core coverage and teaching style. Keep official controlled assessment separate from formative teaching and do not invent live assessment material.','Curriculum & coverage');
}

function renderAssessmentPlanner(){
  const rows=[...state.assessments].sort((a,b)=>(a.due||'9999').localeCompare(b.due||'9999'));
  const courseId='digitalSkills';
  document.getElementById('app').innerHTML=pageHead('Assessment Planner','Track issue dates, deadlines, mocks, formative assessments and resubmissions across both courses.')+
  '<div class="grid g2"><div class="card"><div class="form-grid">'+
    '<label><span class="label">Course</span><select id="assCourse" onchange="RWH.assessmentCourseChanged()"><option value="digitalSkills">'+esc(C1)+'</option><option value="tlevel">'+esc(C2)+'</option></select></label>'+
    '<label><span class="label">Unit / content area</span><select id="assArea">'+lessonAreaOptions(courseId,allCourseAreas(courseId)[0].id)+'</select></label>'+
    '<label><span class="label">Assessment title</span><input id="assTitle" placeholder="e.g. Programming Implementation Task 1"></label>'+
    '<label><span class="label">Type</span><select id="assType"><option>Assignment</option><option>Formative assessment</option><option>Mock</option><option>Resubmission</option><option>Practical evidence</option><option>Exam preparation</option></select></label>'+
    '<label><span class="label">Issue / start date</span><input id="assStart" type="date"></label><label><span class="label">Due / assessment date</span><input id="assDue" type="date"></label>'+
    '<label><span class="label">Status</span><select id="assStatus"><option>Planned</option><option>Issued</option><option>Marking</option><option>Feedback given</option><option>Complete</option></select></label>'+
    '<label><span class="label">Priority</span><select id="assPriority"><option>Normal</option><option>High</option><option>Critical date</option></select></label>'+
    '<label class="full"><span class="label">Notes</span><textarea id="assNotes"></textarea></label>'+
    '</div><div class="toolbar"><button class="btn" onclick="RWH.addAssessment()">Add assessment</button></div></div>'+
    '<div class="card"><h3>Assessment overview</h3><div class="grid g3" style="margin-top:10px"><div class="item"><div class="muted small">Planned / issued</div><b>'+rows.filter(x=>['Planned','Issued'].includes(x.status)).length+'</b></div><div class="item"><div class="muted small">Marking</div><b>'+rows.filter(x=>x.status==='Marking').length+'</b></div><div class="item"><div class="muted small">Complete</div><b>'+rows.filter(x=>x.status==='Complete').length+'</b></div></div><div class="note" style="margin-top:12px">Use the planner for your delivery schedule. Official external assessment dates and controlled conditions should still be checked against the current awarding-body / exams-team information.</div></div></div>'+
  '<div class="card" style="margin-top:14px">'+
    (rows.length?'<div class="table-wrap"><table><thead><tr><th>Due</th><th>Assessment</th><th>Course / area</th><th>Type</th><th>Status</th></tr></thead><tbody>'+rows.map(x=>'<tr><td>'+fmtDate(x.due)+'</td><td><b>'+esc(x.title)+'</b><div class="small muted">Start: '+fmtDate(x.start)+'</div></td><td>'+esc(course(x.courseId)?.name||'')+'<div class="small muted">'+esc(areaById(x.courseId,x.areaId)?.title||'')+'</div></td><td>'+esc(x.type)+'</td><td><span class="pill '+(x.status==='Complete'?'green':x.priority==='Critical date'?'red':'gray')+'">'+esc(x.status)+'</span></td></tr>').join('')+'</tbody></table></div>':'<div class="empty">No assessments planned yet.</div>')+
  '</div>';
}
function assessmentCourseChanged(){
  const cid=document.getElementById('assCourse').value;
  const a=allCourseAreas(cid);
  document.getElementById('assArea').innerHTML=lessonAreaOptions(cid,a[0].id);
}
function addAssessment(){
  const title=document.getElementById('assTitle').value.trim(); if(!title) return toast('Add an assessment title.');
  const courseId=document.getElementById('assCourse').value;
  state.assessments.unshift({id:uid('ass'),courseId,areaId:document.getElementById('assArea').value,title,type:document.getElementById('assType').value,start:document.getElementById('assStart').value,due:document.getElementById('assDue').value,status:document.getElementById('assStatus').value,priority:document.getElementById('assPriority').value,notes:document.getElementById('assNotes').value.trim(),created:new Date().toISOString()});
  saveState(); renderAssessmentPlanner(); toast('Assessment added.');
}

function renderMarking(){
  const areas=allCourseAreas(ui.course);
  const areaId=ui.specUnitId && areas.some(a=>a.id===ui.specUnitId)?ui.specUnitId:areas[0].id;
  const crit=unitCriteria(ui.course,areaId);
  document.getElementById('app').innerHTML=pageHead('Mark Work','Create precise WWW / EBI / Overall feedback and save assessment records.')+
  `<div class="grid g2">
    <div class="card">
      <div class="form-grid">
        <label><span class="label">Course</span><select id="markCourse" onchange="RWH.markCourseChanged()"><option value="digitalSkills" ${ui.course==='digitalSkills'?'selected':''}>${esc(C1)}</option><option value="tlevel" ${ui.course==='tlevel'?'selected':''}>${esc(C2)}</option></select></label>
        <label><span class="label">Unit / area</span><select id="markArea" onchange="RWH.markAreaChanged(this.value)">${lessonAreaOptions(ui.course,areaId)}</select></label>
        <label><span class="label">Learner reference</span><input id="markLearner" placeholder="Initials / learner reference"></label>
        <label><span class="label">Assessment / task</span><input id="markAssessment" placeholder="e.g. VIA, Task 1, OOP Assignment"></label>
        <label class="full"><span class="label">Work / evidence summary</span><textarea id="markEvidence" placeholder="What has the learner completed well? You can paste a short summary or key evidence."></textarea></label>
        <label class="full"><span class="label">Missing / weak evidence</span><textarea id="markMissing" placeholder="Be exact: missing output screenshot, flow arrows, test evidence, explanation too brief..."></textarea></label>
        <label><span class="label">Indicative grade</span><select id="markGrade"><option>Working towards</option><option>Pass</option><option>Merit</option><option>Distinction</option><option>D-</option><option>D</option><option>D+</option></select></label>
        <label><span class="label">Resubmission date</span><input id="markResub" type="date"></label>
      </div>
      <div class="source-box" style="margin-top:12px"><b>Criteria focus</b><div id="markCriteria">${crit.map(c=>`<label class="spec-criterion"><input type="checkbox" class="mark-criterion" value="${esc(c.code)}"><span><b>${esc(c.code)}</b> ${esc(c.text)}</span></label>`).join('')}</div></div>
      <div class="toolbar"><button class="btn" onclick="RWH.generateFeedback()">Generate feedback</button><button class="btn secondary" onclick="RWH.prepareMarkingRequest()">Prepare intelligent marking request</button></div>
    </div>
    <div class="card">
      <div class="card-title"><h3>Feedback preview</h3><span class="pill">WWW / EBI / Overall</span></div>
      <div id="feedbackPreview">${renderFeedbackPreview()}</div>
      <div class="toolbar"><button class="btn secondary" onclick="RWH.copyFeedback()">Copy feedback</button><button class="btn" onclick="RWH.saveMarking()">Save record</button></div>
      <div style="margin-top:16px"><h3>Recent marking</h3>${state.marking.length?`<div class="list" style="margin-top:8px">${state.marking.slice(0,6).map(m=>`<div class="item"><b>${esc(m.learner||'Learner')} · ${esc(m.assessment||'Assessment')}</b><div class="small muted">${esc(m.courseName)} · ${esc(m.grade)} · ${new Date(m.date).toLocaleDateString('en-GB')}</div></div>`).join('')}</div>`:'<div class="empty" style="margin-top:8px">No marking saved yet.</div>'}</div>
    </div>
  </div>`;
}
function markCourseChanged(){ ui.course=document.getElementById('markCourse').value; ui.specUnitId=allCourseAreas(ui.course)[0].id; renderMarking(); }
function markAreaChanged(v){ ui.specUnitId=v; const root=document.getElementById('markCriteria'); if(root) root.innerHTML=unitCriteria(ui.course,v).map(c=>`<label class="spec-criterion"><input type="checkbox" class="mark-criterion" value="${esc(c.code)}"><span><b>${esc(c.code)}</b> ${esc(c.text)}</span></label>`).join(''); }
function generateFeedback(){
  const evidence=document.getElementById('markEvidence').value.trim();
  const missing=document.getElementById('markMissing').value.trim();
  const grade=document.getElementById('markGrade').value;
  const selected=[...document.querySelectorAll('.mark-criterion:checked')].map(x=>x.value);
  const learner=document.getElementById('markLearner').value.trim();
  const resub=document.getElementById('markResub').value;
  const www=evidence?`You have shown clear evidence in the areas identified, particularly: ${evidence.replace(/\n+/g,' ')}`:`You have made a clear attempt at the task and there is evidence that you understand some of the required content${selected.length?` for ${selected.join(', ')}`:''}.`;
  let ebi=missing?`Improve the submission by addressing the following missing or weak evidence: ${missing.replace(/\n+/g,' ')}. Make the changes clearly visible in the final submission and check that every required output is included.`:`Check each selected criterion against your evidence and strengthen any explanation that is mainly descriptive. Use full sentences, correct terminology and show the required outputs clearly.`;
  if(resub) ebi+=` Resubmit by ${fmtDate(resub)}.`;
  const overall=`Overall, the work is currently at an indicative ${grade} standard. The strongest improvement will come from making the evidence complete, specific and directly linked to the task requirements${selected.length?` (${selected.join(', ')})`:''}.`;
  ui.markFeedback={learner,www,ebi,overall,grade,selected,generated:new Date().toISOString()};
  document.getElementById('feedbackPreview').innerHTML=renderFeedbackPreview();
}
function renderFeedbackPreview(){
  if(!ui.markFeedback) return '<div class="empty">Generate feedback to preview it here.</div>';
  const f=ui.markFeedback;
  return `<div class="feedback"><div class="feedback-box"><b>WWW</b>${esc(f.www)}</div><div class="feedback-box"><b>EBI</b>${esc(f.ebi)}</div><div class="feedback-box"><b>Overall</b>${esc(f.overall)}</div><div class="feedback-box"><b>Indicative Grade</b><span class="grade">${esc(f.grade)}</span></div></div>`;
}
async function copyText(t){ try{await navigator.clipboard.writeText(t);toast('Copied.');}catch(e){toast('Copy unavailable — select the text manually.');} }
function copyFeedback(){ if(!ui.markFeedback)return toast('Generate feedback first.'); const f=ui.markFeedback; copyText(`WWW: ${f.www}\n\nEBI: ${f.ebi}\n\nOverall: ${f.overall}\n\nIndicative Grade: ${f.grade}`); }
function saveMarking(){
  if(!ui.markFeedback) return toast('Generate feedback first.');
  state.marking.unshift({id:uid('mark'),date:new Date().toISOString(),courseId:ui.course,courseName:course(ui.course).name,areaId:document.getElementById('markArea').value,learner:document.getElementById('markLearner').value.trim(),assessment:document.getElementById('markAssessment').value.trim(),evidence:document.getElementById('markEvidence').value,missing:document.getElementById('markMissing').value,resub:document.getElementById('markResub').value,...ui.markFeedback});
  saveState(); renderMarking(); toast('Marking record saved.');
}
function prepareMarkingRequest(){
  const prompt=`Mark this learner work using my normal WWW / EBI / Overall / Indicative Grade format. Be precise about missing evidence and do not invent evidence.\n\nCourse: ${course(ui.course).name}\nArea: ${areaById(ui.course,document.getElementById('markArea').value)?.title||''}\nAssessment: ${document.getElementById('markAssessment').value}\nLearner work/evidence:\n${document.getElementById('markEvidence').value}\n\nKnown missing/weak evidence:\n${document.getElementById('markMissing').value}`;
  openIntelligenceWith(prompt,'Assessment & marking');
}

function renderBriefs(){
  const areas=allCourseAreas(ui.course);
  const areaId=ui.specUnitId && areas.some(a=>a.id===ui.specUnitId)?ui.specUnitId:areas[0].id;
  document.getElementById('app').innerHTML=pageHead('Assignment Briefs','Build short, professional briefs mapped to the selected specification area.')+
  `<div class="grid g2">
    <div class="card">
      <div class="form-grid">
        <label><span class="label">Course</span><select id="briefCourse" onchange="RWH.briefCourseChanged()"><option value="digitalSkills" ${ui.course==='digitalSkills'?'selected':''}>${esc(C1)}</option><option value="tlevel" ${ui.course==='tlevel'?'selected':''}>${esc(C2)}</option></select></label>
        <label><span class="label">Unit / area</span><select id="briefArea" onchange="RWH.briefAreaChanged(this.value)">${lessonAreaOptions(ui.course,areaId)}</select></label>
        <label><span class="label">Assignment title</span><input id="briefTitle" placeholder="e.g. Programming Implementation Assignment"></label>
        <label><span class="label">Hand-in date</span><input id="briefDue" type="date"></label>
        <label class="full"><span class="label">Scenario / context</span><textarea id="briefScenario" placeholder="Keep this realistic and short. Example: You are a junior developer asked to produce evidence for a client solution."></textarea></label>
      </div>
      <div class="source-box" style="margin-top:12px"><b>Criteria to include</b><div id="briefCriteria">${renderBriefCriteria(ui.course,areaId)}</div></div>
      <div class="toolbar"><button class="btn" onclick="RWH.generateBrief()">Generate brief</button><button class="btn secondary" onclick="RWH.saveBrief()">Save brief</button><button class="btn ghost" onclick="window.print()">Print / Save PDF</button></div>
    </div>
    <div class="card"><div class="card-title"><h3>Brief preview</h3><span class="pill">Student-ready</span></div><div id="briefPreview">${ui.briefPreview?renderBriefPreview(ui.briefPreview):'<div class="empty">Generate a brief to preview it here.</div>'}</div></div>
  </div>`;
}
function renderBriefCriteria(courseId,areaId){
  return unitCriteria(courseId,areaId).map(c=>`<label class="spec-criterion"><input type="checkbox" class="brief-criterion" value="${esc(c.code)}" checked><span><b>${esc(c.code)}</b> ${esc(c.text)}</span></label>`).join('');
}
function briefCourseChanged(){ ui.course=document.getElementById('briefCourse').value; ui.specUnitId=allCourseAreas(ui.course)[0].id; renderBriefs(); }
function briefAreaChanged(v){ ui.specUnitId=v; document.getElementById('briefCriteria').innerHTML=renderBriefCriteria(ui.course,v); }
function generateBrief(){
  const courseId=document.getElementById('briefCourse').value, areaId=document.getElementById('briefArea').value;
  const title=document.getElementById('briefTitle').value.trim()||`${areaById(courseId,areaId)?.title||'Assignment'} Brief`;
  const scenario=document.getElementById('briefScenario').value.trim()||'You are working in a junior digital role and have been asked to produce clear professional evidence that meets the requirements below.';
  const due=document.getElementById('briefDue').value;
  const selected=[...document.querySelectorAll('.brief-criterion:checked')].map(x=>x.value);
  const all=unitCriteria(courseId,areaId).filter(c=>selected.includes(c.code));
  const groups={}; all.forEach(c=>{const k=c.code.includes('.')?c.code.split('.')[0]:'1';(groups[k]||(groups[k]=[])).push(c);});
  const tasks=Object.keys(groups).map((k,i)=>({title:`Task ${i+1}`,criteria:groups[k],instruction:`Produce evidence that fully addresses ${groups[k].map(c=>c.code).join(', ')}. Use correct technical terminology, clear explanations and suitable screenshots/diagrams/testing evidence where the task requires them.`}));
  ui.briefPreview={id:uid('brief'),courseId,courseName:course(courseId).name,areaId,areaTitle:areaById(courseId,areaId)?.title||'',title,scenario,due,tasks,created:new Date().toISOString()};
  document.getElementById('briefPreview').innerHTML=renderBriefPreview(ui.briefPreview);
}
function renderBriefPreview(b){
  return `<div style="border-top:7px solid var(--orange);padding-top:12px"><div class="small muted">Oldham College · Faculty of Digital & Creative</div><h2>${esc(b.title)}</h2><div class="item"><b>Course</b><div>${esc(b.courseName)}</div><b>Unit / area</b><div>${esc(b.areaTitle)}</div>${b.due?`<b>Hand-in</b><div>${fmtDate(b.due)}</div>`:''}</div><h3 style="margin-top:14px">Scenario</h3><p>${esc(b.scenario)}</p><h3>Assessment tasks</h3>${b.tasks.map(t=>`<div class="item" style="margin-top:8px"><b>${esc(t.title)}</b><p>${esc(t.instruction)}</p><div class="chips">${t.criteria.map(c=>`<span class="pill">${esc(c.code)}</span>`).join('')}</div></div>`).join('')}<div class="note" style="margin-top:12px"><b>Submission standard:</b> your work must be your own, clearly presented, proofread and include the evidence requested in each task.</div></div>`;
}
function saveBrief(){ if(!ui.briefPreview)return toast('Generate a brief first.'); state.briefs.unshift(JSON.parse(JSON.stringify(ui.briefPreview))); saveState(); toast('Brief saved.'); }

function renderLearners(){
  const q='';
  document.getElementById('app').innerHTML=pageHead('Learners','Local learner records, support notes and quick follow-up flags.')+
  `<div class="grid g2">
    <div class="card">
      <div class="form-grid">
        <label><span class="label">Learner reference</span><input id="learnerRef" placeholder="Initials / internal reference"></label>
        <label><span class="label">Course</span><select id="learnerCourse"><option value="digitalSkills">${esc(C1)}</option><option value="tlevel">${esc(C2)}</option></select></label>
        <label><span class="label">Attendance %</span><input id="learnerAttendance" type="number" min="0" max="100"></label>
        <label><span class="label">Risk / support flag</span><select id="learnerRisk"><option>None</option><option>Monitor</option><option>High</option></select></label>
        <label class="full"><span class="label">Strengths / progress</span><textarea id="learnerStrengths"></textarea></label>
        <label class="full"><span class="label">Support / actions</span><textarea id="learnerSupport"></textarea></label>
      </div>
      <div class="toolbar"><button class="btn" onclick="RWH.addLearner()">Save learner</button></div>
    </div>
    <div class="card">
      <div class="search-box"><input id="learnerSearch" placeholder="Search learner records" oninput="RWH.filterLearners(this.value)"></div>
      <div id="learnerList" class="list" style="margin-top:12px">${renderLearnerList(q)}</div>
    </div>
  </div>`;
}
function renderLearnerList(q){
  const list=state.learners.filter(l=>!q || (l.ref+' '+l.support+' '+l.strengths).toLowerCase().includes(q.toLowerCase()));
  return list.length?list.map(l=>`<div class="item"><div style="display:flex;justify-content:space-between;gap:10px"><b>${esc(l.ref)}</b><span class="pill ${l.risk==='High'?'red':l.risk==='Monitor'?'':'green'}">${esc(l.risk||'None')}</span></div><div class="small muted">${esc(course(l.courseId)?.name||'')} · Attendance ${Number(l.attendance||0)}%</div>${l.strengths?`<div class="small" style="margin-top:5px"><b>Strengths:</b> ${esc(l.strengths)}</div>`:''}${l.support?`<div class="small"><b>Actions:</b> ${esc(l.support)}</div>`:''}<div class="toolbar"><button class="btn ghost smallbtn" onclick="RWH.startOneToOne('${l.id}')">1:1</button><button class="btn ghost smallbtn" onclick="RWH.startProgression('${l.id}')">Progression</button><button class="btn danger smallbtn" onclick="RWH.deleteLearner('${l.id}')">Delete</button></div></div>`).join(''):'<div class="empty">No learner records yet.</div>';
}
function addLearner(){
  const ref=document.getElementById('learnerRef').value.trim(); if(!ref)return toast('Add a learner reference.');
  state.learners.unshift({id:uid('learner'),ref,courseId:document.getElementById('learnerCourse').value,attendance:Number(document.getElementById('learnerAttendance').value||0),risk:document.getElementById('learnerRisk').value,strengths:document.getElementById('learnerStrengths').value.trim(),support:document.getElementById('learnerSupport').value.trim(),date:new Date().toISOString()});
  saveState(); renderLearners(); toast('Learner saved.');
}
function filterLearners(v){ document.getElementById('learnerList').innerHTML=renderLearnerList(v); }
function deleteLearner(id){ if(!confirm('Delete this local learner record?'))return; state.learners=state.learners.filter(l=>l.id!==id); saveState(); renderLearners(); }

function learnerOptions(selected=''){ return state.learners.map(l=>`<option value="${l.id}" ${l.id===selected?'selected':''}>${esc(l.ref)} — ${esc(course(l.courseId)?.name||'')}</option>`).join(''); }

function renderAttendance(){
  document.getElementById('app').innerHTML=pageHead('Attendance','Record a session and keep a simple local attendance trail.')+
  `<div class="grid g2">
    <div class="card">
      <div class="form-grid"><label><span class="label">Date</span><input id="attDate" type="date" value="${today()}"></label><label><span class="label">Course</span><select id="attCourse" onchange="RWH.renderAttendanceRows()"><option value="digitalSkills">${esc(C1)}</option><option value="tlevel">${esc(C2)}</option></select></label><label class="full"><span class="label">Session / lesson</span><input id="attSession" placeholder="e.g. Ethical Hacking Lesson 3"></label></div>
      <div id="attRows" style="margin-top:12px">${renderAttendanceRowsHtml('digitalSkills')}</div>
      <div class="toolbar"><button class="btn" onclick="RWH.saveAttendance()">Save session</button></div>
    </div>
    <div class="card"><h3>Recent sessions</h3>${state.attendance.length?`<div class="list" style="margin-top:8px">${state.attendance.slice(0,8).map(a=>`<div class="item"><b>${fmtDate(a.date)} · ${esc(a.session||'Session')}</b><div class="small muted">${esc(course(a.courseId)?.name||'')} · ${a.entries.length} learners</div><div class="chips" style="margin-top:6px"><span class="pill green">${a.entries.filter(x=>x.status==='Present').length} present</span><span class="pill red">${a.entries.filter(x=>x.status==='Absent').length} absent</span></div></div>`).join('')}</div>`:'<div class="empty" style="margin-top:8px">No attendance sessions saved.</div>'}</div>
  </div>`;
}
function renderAttendanceRowsHtml(courseId){
  const list=state.learners.filter(l=>l.courseId===courseId);
  if(!list.length)return '<div class="empty">Add learners for this course first.</div>';
  return `<div class="table-wrap"><table><thead><tr><th>Learner</th><th>Status</th><th>Note</th></tr></thead><tbody>${list.map(l=>`<tr><td>${esc(l.ref)}</td><td><select class="att-status" data-learner="${l.id}"><option>Present</option><option>Late</option><option>Authorised</option><option>Absent</option></select></td><td><input class="att-note" data-learner="${l.id}" placeholder="Optional note"></td></tr>`).join('')}</tbody></table></div>`;
}
function renderAttendanceRows(){ const c=document.getElementById('attCourse').value; document.getElementById('attRows').innerHTML=renderAttendanceRowsHtml(c); }
function saveAttendance(){
  const courseId=document.getElementById('attCourse').value;
  const entries=[...document.querySelectorAll('.att-status')].map(s=>({learnerId:s.dataset.learner,status:s.value,note:document.querySelector(`.att-note[data-learner="${s.dataset.learner}"]`)?.value||''}));
  if(!entries.length)return toast('No learners to record.');
  state.attendance.unshift({id:uid('att'),date:document.getElementById('attDate').value,courseId,session:document.getElementById('attSession').value.trim(),entries});
  entries.forEach(e=>{ const l=state.learners.find(x=>x.id===e.learnerId); if(l && e.status==='Absent' && Number(l.attendance||100)>0) l.risk=l.risk==='High'?'High':'Monitor'; });
  saveState(); renderAttendance(); toast('Attendance saved.');
}

function renderOneToOnes(selected=''){
  document.getElementById('app').innerHTML=pageHead('1:1s','Record concise catch-ups, targets and follow-up actions.')+
  `<div class="grid g2"><div class="card"><label><span class="label">Learner</span><select id="oneLearner"><option value="">Select learner</option>${learnerOptions(selected)}</select></label><label><span class="label">Date</span><input id="oneDate" type="date" value="${today()}"></label><label><span class="label">What is going well?</span><textarea id="oneWWW"></textarea></label><label><span class="label">Main issue / discussion</span><textarea id="oneIssue"></textarea></label><label><span class="label">Agreed actions / target</span><textarea id="oneAction"></textarea></label><label><span class="label">Review date</span><input id="oneReview" type="date"></label><div class="toolbar"><button class="btn" onclick="RWH.saveOneToOne()">Save 1:1</button></div></div>
  <div class="card"><h3>Recent 1:1 records</h3>${state.oneToOnes.length?`<div class="list" style="margin-top:8px">${state.oneToOnes.slice(0,10).map(o=>`<div class="item"><b>${esc(state.learners.find(l=>l.id===o.learnerId)?.ref||'Learner')} · ${fmtDate(o.date)}</b><div class="small">${esc(o.action)}</div><div class="small muted">Review: ${fmtDate(o.review)}</div></div>`).join('')}</div>`:'<div class="empty" style="margin-top:8px">No 1:1 records yet.</div>'}</div></div>`;
}
function startOneToOne(id){ ui.page='oneToOnes'; renderOneToOnes(id); renderNav(); }
function saveOneToOne(){
  const learnerId=document.getElementById('oneLearner').value;if(!learnerId)return toast('Select a learner.');
  state.oneToOnes.unshift({id:uid('one'),learnerId,date:document.getElementById('oneDate').value,www:document.getElementById('oneWWW').value.trim(),issue:document.getElementById('oneIssue').value.trim(),action:document.getElementById('oneAction').value.trim(),review:document.getElementById('oneReview').value});
  saveState(); renderOneToOnes(); toast('1:1 saved.');
}

function renderProgression(selected=''){
  document.getElementById('app').innerHTML=pageHead('Progression & Transfers','Track progression conversations, intended destinations and transfer actions.')+
  `<div class="grid g2"><div class="card"><label><span class="label">Learner</span><select id="progLearner"><option value="">Select learner</option>${learnerOptions(selected)}</select></label><div class="form-grid"><label><span class="label">Route / destination</span><input id="progRoute" placeholder="e.g. T Level, apprenticeship, HE, employment"></label><label><span class="label">Status</span><select id="progStatus"><option>Exploring</option><option>Interested</option><option>Application in progress</option><option>Confirmed</option><option>Transfer requested</option><option>Withdrawn</option></select></label></div><label><span class="label">Notes / evidence</span><textarea id="progNotes"></textarea></label><label><span class="label">Next action</span><input id="progAction"></label><div class="toolbar"><button class="btn" onclick="RWH.saveProgression()">Save progression record</button></div></div>
  <div class="card"><h3>Progression records</h3>${state.progression.length?`<div class="list" style="margin-top:8px">${state.progression.map(p=>`<div class="item"><b>${esc(state.learners.find(l=>l.id===p.learnerId)?.ref||'Learner')} · ${esc(p.route)}</b><div class="meta"><span class="pill">${esc(p.status)}</span></div><div class="small">${esc(p.notes||'')}</div><div class="small muted">Next: ${esc(p.action||'')}</div></div>`).join('')}</div>`:'<div class="empty" style="margin-top:8px">No progression records yet.</div>'}</div></div>`;
}
function startProgression(id){ ui.page='progression'; renderProgression(id); renderNav(); }
function saveProgression(){
  const learnerId=document.getElementById('progLearner').value;if(!learnerId)return toast('Select a learner.');
  state.progression.unshift({id:uid('prog'),learnerId,route:document.getElementById('progRoute').value.trim(),status:document.getElementById('progStatus').value,notes:document.getElementById('progNotes').value.trim(),action:document.getElementById('progAction').value.trim(),date:new Date().toISOString()});
  saveState(); renderProgression(); toast('Progression record saved.');
}

function renderPlanner(){
  const open=state.tasks.filter(t=>!t.done).sort((a,b)=>(a.date||'9999').localeCompare(b.date||'9999'));
  const done=state.tasks.filter(t=>t.done).slice(0,8);
  document.getElementById('app').innerHTML=pageHead('Weekly Planner','Teaching, assessment and admin actions in one priority list.')+
  `<div class="grid g2"><div class="card"><div class="form-grid"><label class="full"><span class="label">Task</span><input id="taskText" placeholder="What needs doing?"></label><label><span class="label">Due date</span><input id="taskDate" type="date"></label><label><span class="label">Priority</span><select id="taskPriority"><option>Normal</option><option>High</option><option>Urgent</option></select></label><label><span class="label">Course / area</span><select id="taskCourse"><option value="">General</option><option value="digitalSkills">${esc(C1)}</option><option value="tlevel">${esc(C2)}</option></select></label></div><div class="toolbar"><button class="btn" onclick="RWH.addTask()">Add task</button></div></div>
  <div class="card"><div class="card-title"><h3>Open actions</h3><span class="pill gray">${open.length}</span></div>${open.length?`<div class="list">${open.map(t=>`<div class="item"><label style="display:flex;gap:9px"><input type="checkbox" style="width:auto" onchange="RWH.toggleTask('${t.id}',this.checked)"><span><b>${esc(t.text)}</b><div class="meta"><span class="pill ${t.priority==='Urgent'?'red':t.priority==='High'?'':'gray'}">${esc(t.priority)}</span><span class="small muted">${fmtDate(t.date)}</span></div></span></label></div>`).join('')}</div>`:'<div class="empty">No open tasks.</div>'}${done.length?`<h3 style="margin-top:16px">Recently completed</h3><div class="list" style="margin-top:8px">${done.map(t=>`<div class="item" style="opacity:.65"><s>${esc(t.text)}</s></div>`).join('')}</div>`:''}</div></div>`;
}
function addTask(){ const text=document.getElementById('taskText').value.trim();if(!text)return toast('Add a task.');state.tasks.unshift({id:uid('task'),text,date:document.getElementById('taskDate').value,priority:document.getElementById('taskPriority').value,courseId:document.getElementById('taskCourse').value,done:false,created:new Date().toISOString()});saveState();renderPlanner();toast('Task added.');}
function toggleTask(id,on){const t=state.tasks.find(x=>x.id===id);if(t)t.done=on;saveState();renderPlanner();}

function renderTimetable(){
  const days=['Monday','Tuesday','Wednesday','Thursday','Friday'];
  document.getElementById('app').innerHTML=pageHead('Timetable','Build a simple working timetable for teaching, meetings and protected admin time.')+
  `<div class="card"><div class="form-grid"><label><span class="label">Day</span><select id="ttDay">${days.map(d=>`<option>${d}</option>`).join('')}</select></label><label><span class="label">Start</span><input id="ttStart" type="time"></label><label><span class="label">End</span><input id="ttEnd" type="time"></label><label><span class="label">Room</span><input id="ttRoom" placeholder="e.g. B114"></label><label><span class="label">Type</span><select id="ttType"><option>Teaching</option><option>1:1 / tutorial</option><option>CPD</option><option>Meeting</option><option>Admin / planning</option></select></label><label><span class="label">Course / activity</span><input id="ttActivity"></label></div><div class="toolbar"><button class="btn" onclick="RWH.addTimetable()">Add slot</button></div></div>
  <div class="grid g2" style="margin-top:14px">${days.map(day=>`<div class="card"><h3>${day}</h3><div class="list" style="margin-top:8px">${state.timetable.filter(x=>x.day===day).sort((a,b)=>a.start.localeCompare(b.start)).map(x=>`<div class="item"><b>${esc(x.start)}–${esc(x.end)} · ${esc(x.activity)}</b><div class="small muted">${esc(x.type)} · ${esc(x.room||'Room TBC')}</div></div>`).join('')||'<div class="empty">No slots.</div>'}</div></div>`).join('')}</div>`;
}
function addTimetable(){ const activity=document.getElementById('ttActivity').value.trim();if(!activity)return toast('Add an activity.');state.timetable.push({id:uid('tt'),day:document.getElementById('ttDay').value,start:document.getElementById('ttStart').value,end:document.getElementById('ttEnd').value,room:document.getElementById('ttRoom').value.trim(),type:document.getElementById('ttType').value,activity});saveState();renderTimetable();toast('Timetable slot added.');}

function renderRooms(){
  document.getElementById('app').innerHTML=pageHead('Rooms & Equipment','Log room, laptop and equipment issues so recurring problems are visible.')+
  `<div class="grid g2"><div class="card"><div class="form-grid"><label><span class="label">Room</span><input id="roomName" placeholder="e.g. A306"></label><label><span class="label">Issue type</span><select id="roomType"><option>PC capacity</option><option>Laptops</option><option>Battery / charging</option><option>Display / projector</option><option>Network</option><option>Room capacity</option><option>Other</option></select></label><label class="full"><span class="label">Issue</span><textarea id="roomIssue"></textarea></label><label><span class="label">Status</span><select id="roomStatus"><option>Open</option><option>Workaround in place</option><option>Reported</option><option>Resolved</option></select></label><label><span class="label">Date</span><input id="roomDate" type="date" value="${today()}"></label></div><div class="toolbar"><button class="btn" onclick="RWH.addRoomIssue()">Log issue</button></div></div>
  <div class="card"><h3>Issue log</h3>${state.rooms.length?`<div class="list" style="margin-top:8px">${state.rooms.map(r=>`<div class="item"><div style="display:flex;justify-content:space-between;gap:8px"><b>${esc(r.room)} · ${esc(r.type)}</b><span class="pill ${r.status==='Resolved'?'green':r.status==='Open'?'red':''}">${esc(r.status)}</span></div><div class="small">${esc(r.issue)}</div><div class="small muted">${fmtDate(r.date)}</div></div>`).join('')}</div>`:'<div class="empty" style="margin-top:8px">No room issues logged.</div>'}</div></div>`;
}
function addRoomIssue(){ const room=document.getElementById('roomName').value.trim(),issue=document.getElementById('roomIssue').value.trim();if(!room||!issue)return toast('Add the room and issue.');state.rooms.unshift({id:uid('room'),room,type:document.getElementById('roomType').value,issue,status:document.getElementById('roomStatus').value,date:document.getElementById('roomDate').value});saveState();renderRooms();toast('Room issue logged.');}

function renderEmployers(){
  document.getElementById('app').innerHTML=pageHead('Employer Engagement','Track guest speakers, visits, briefs, apprenticeship activity and follow-up.')+
  `<div class="grid g2"><div class="card"><div class="form-grid"><label><span class="label">Employer / organisation</span><input id="empName"></label><label><span class="label">Type</span><select id="empType"><option>Guest talk</option><option>Site visit</option><option>Employer brief</option><option>Apprenticeship engagement</option><option>Hack / innovation day</option><option>Other</option></select></label><label><span class="label">Date</span><input id="empDate" type="date"></label><label><span class="label">Course</span><select id="empCourse"><option value="digitalSkills">${esc(C1)}</option><option value="tlevel">${esc(C2)}</option><option value="">Both</option></select></label><label class="full"><span class="label">Details / learner value</span><textarea id="empDetails"></textarea></label><label class="full"><span class="label">Follow-up</span><input id="empFollow"></label></div><div class="toolbar"><button class="btn" onclick="RWH.addEmployer()">Save engagement</button></div></div>
  <div class="card"><h3>Engagement log</h3>${state.employers.length?`<div class="list" style="margin-top:8px">${state.employers.map(e=>`<div class="item"><b>${esc(e.name)} · ${esc(e.type)}</b><div class="small muted">${fmtDate(e.date)} · ${e.courseId?esc(course(e.courseId)?.name||''):'Both courses'}</div><div class="small">${esc(e.details||'')}</div><div class="small"><b>Follow-up:</b> ${esc(e.follow||'')}</div></div>`).join('')}</div>`:'<div class="empty" style="margin-top:8px">No employer engagement saved yet.</div>'}</div></div>`;
}
function addEmployer(){const name=document.getElementById('empName').value.trim();if(!name)return toast('Add an employer / organisation.');state.employers.unshift({id:uid('emp'),name,type:document.getElementById('empType').value,date:document.getElementById('empDate').value,courseId:document.getElementById('empCourse').value,details:document.getElementById('empDetails').value.trim(),follow:document.getElementById('empFollow').value.trim()});saveState();renderEmployers();toast('Employer engagement saved.');}

function renderResources(){
  document.getElementById('app').innerHTML=pageHead('Resources','Keep links, files and teaching references easy to find.')+
  `<div class="grid g2"><div class="card"><div class="form-grid"><label><span class="label">Title</span><input id="resTitle"></label><label><span class="label">Type</span><select id="resType"><option>Lesson</option><option>Worksheet</option><option>Specification</option><option>Website</option><option>Video</option><option>Assessment</option><option>Other</option></select></label><label><span class="label">Course</span><select id="resCourse"><option value="">Both / General</option><option value="digitalSkills">${esc(C1)}</option><option value="tlevel">${esc(C2)}</option></select></label><label><span class="label">Link / reference</span><input id="resLink" placeholder="URL, Drive reference or file note"></label><label class="full"><span class="label">Notes</span><textarea id="resNotes"></textarea></label></div><div class="toolbar"><button class="btn" onclick="RWH.addResource()">Add resource</button></div></div>
  <div class="card"><div class="search-box"><input id="resSearch" placeholder="Search resources" oninput="RWH.filterResources(this.value)"></div><div id="resourceList" class="list" style="margin-top:12px">${renderResourceList('')}</div></div></div>`;
}
function renderResourceList(q){const list=state.resources.filter(r=>!q||(r.title+' '+r.type+' '+r.notes).toLowerCase().includes(q.toLowerCase()));return list.length?list.map(r=>`<div class="item"><b>${esc(r.title)}</b><div class="meta"><span class="pill gray">${esc(r.type)}</span>${r.courseId?`<span class="small muted">${esc(course(r.courseId)?.name||'')}</span>`:''}</div>${r.link?`<div class="small" style="margin-top:5px;word-break:break-all">${esc(r.link)}</div>`:''}<div class="small muted">${esc(r.notes||'')}</div></div>`).join(''):'<div class="empty">No resources saved.</div>';}
function addResource(){const title=document.getElementById('resTitle').value.trim();if(!title)return toast('Add a resource title.');state.resources.unshift({id:uid('res'),title,type:document.getElementById('resType').value,courseId:document.getElementById('resCourse').value,link:document.getElementById('resLink').value.trim(),notes:document.getElementById('resNotes').value.trim()});saveState();renderResources();toast('Resource added.');}
function filterResources(q){document.getElementById('resourceList').innerHTML=renderResourceList(q);}

function renderComms(){
  document.getElementById('app').innerHTML=pageHead('Emails & Logs','Draft concise professional communications and save a simple record.')+
  `<div class="grid g2"><div class="card"><div class="form-grid"><label><span class="label">Type</span><select id="commType"><option>Email</option><option>Learner log</option><option>Parent contact log</option><option>Room request</option><option>Progression note</option></select></label><label><span class="label">Subject / heading</span><input id="commSubject"></label><label class="full"><span class="label">Key facts</span><textarea id="commFacts" placeholder="Write the facts in your own shorthand. The Hub will turn them into a concise professional draft."></textarea></label><label><span class="label">Tone</span><select id="commTone"><option>Professional and direct</option><option>Warm but professional</option><option>Very concise</option></select></label></div><div class="toolbar"><button class="btn" onclick="RWH.generateComm()">Generate draft</button></div></div>
  <div class="card"><h3>Draft</h3><textarea id="commDraft" style="min-height:260px" placeholder="Generated draft will appear here."></textarea><div class="toolbar"><button class="btn secondary" onclick="RWH.copyComm()">Copy</button><button class="btn" onclick="RWH.saveComm()">Save log</button></div><div style="margin-top:16px"><h3>Recent saved communications</h3>${state.comms.length?`<div class="list" style="margin-top:8px">${state.comms.slice(0,6).map(c=>`<div class="item"><b>${esc(c.type)} · ${esc(c.subject||'No subject')}</b><div class="small muted">${new Date(c.date).toLocaleString('en-GB')}</div></div>`).join('')}</div>`:'<div class="empty" style="margin-top:8px">No saved communications.</div>'}</div></div></div>`;
}
function generateComm(){
  const type=document.getElementById('commType').value,facts=document.getElementById('commFacts').value.trim(),tone=document.getElementById('commTone').value;
  if(!facts)return toast('Add the key facts first.');
  let draft='';
  if(type==='Email'){
    draft=`Hi,\n\n${facts.replace(/\n+/g,' ')}\n\nPlease let me know if you need any further information.\n\nThanks,\nRabiul`;
  }else{
    const subject=document.getElementById('commSubject').value.trim();
    draft=`${subject?subject+': ':''}${facts.replace(/\n+/g,' ')}${facts.trim().endsWith('.')?'':'.'} Follow-up will be completed where required.`;
  }
  if(tone==='Very concise') draft=draft.replace('Please let me know if you need any further information.\n\n','');
  document.getElementById('commDraft').value=draft;
}
function copyComm(){const t=document.getElementById('commDraft').value;if(!t)return toast('Generate a draft first.');copyText(t);}
function saveComm(){const draft=document.getElementById('commDraft').value.trim();if(!draft)return toast('Generate a draft first.');state.comms.unshift({id:uid('comm'),type:document.getElementById('commType').value,subject:document.getElementById('commSubject').value.trim(),draft,date:new Date().toISOString()});saveState();renderComms();toast('Communication saved.');}

function renderIntelligence(){
  const pin=sessionStorage.getItem('rwh_ai_pin')||'';
  const messages=state.aiMessages||[];
  document.getElementById('app').innerHTML=pageHead('Hub Intelligence','Ask directly inside the Hub using your saved teaching and curriculum context.','<span class="pill green">GPT-5.6 Sol · High</span>')+
  `<div class="ai-layout">
    <section class="card ai-chat-card">
      <div class="ai-chat-head">
        <div><h3>Hub Assistant</h3><div class="small muted">Uses the relevant Hub context automatically. Your OpenAI key stays on the server.</div></div>
        <button class="btn ghost smallbtn" onclick="RWH.clearAIChat()">Clear chat</button>
      </div>
      <div class="ai-messages" id="aiMessages">
        ${messages.length?messages.map(m=>`<div class="ai-msg ${m.role==='assistant'?'assistant':'user'}"><div class="ai-role">${m.role==='assistant'?'Hub Intelligence':'You'}</div><div class="ai-text">${nl(m.content)}</div></div>`).join(''):`<div class="ai-welcome"><b>Ask anything about your teaching work.</b><span>Examples: “Create my next Programming Implementation lesson”, “Mark this work using WWW/EBI”, or “What specification content should I teach next?”</span></div>`}
      </div>
      <div class="ai-compose">
        <textarea id="aiPrompt" placeholder="Ask the Hub..." onkeydown="if((event.ctrlKey||event.metaKey)&&event.key==='Enter') RWH.sendAI()"></textarea>
        <div class="ai-compose-row">
          <select id="aiFocus"><option>Full Hub</option><option>Curriculum & coverage</option><option>Lessons & planning</option><option>Assessment & marking</option><option>Learner support</option><option>Admin & communications</option><option>Resources</option></select>
          <select id="aiEffort"><option value="high">High reasoning</option><option value="medium">Medium reasoning</option><option value="xhigh">Extra high reasoning</option></select>
          <button class="btn" id="aiSendBtn" onclick="RWH.sendAI()">Send</button>
        </div>
      </div>
    </section>
    <aside class="card ai-context-card">
      <h3>Connection</h3>
      <label><span class="label">Hub AI PIN</span><input id="aiPin" type="password" value="${esc(pin)}" placeholder="PIN set in Vercel"></label>
      <div class="small muted">The PIN is kept only for this browser session. The OpenAI API key is never stored in this page.</div>
      <h3 style="margin-top:16px">Active context</h3>
      <div id="intelContext">${renderIntelContext()}</div>
      <details style="margin-top:16px"><summary><b>Manual handoff fallback</b></summary>
        <label><span class="label">Request</span><textarea id="intelPrompt"></textarea></label>
        <select id="intelFocus"><option>Full Hub</option><option>Curriculum & coverage</option><option>Lessons & planning</option><option>Assessment & marking</option><option>Learner support</option><option>Admin & communications</option><option>Resources</option></select>
        <div class="toolbar"><button class="btn secondary" onclick="RWH.prepareIntel()">Prepare</button><button class="btn ghost" onclick="RWH.copyIntel()">Copy</button></div>
        <textarea id="intelPrepared" style="min-height:180px" readonly></textarea>
      </details>
    </aside>
  </div>`;
  setTimeout(()=>{const box=document.getElementById('aiMessages');if(box)box.scrollTop=box.scrollHeight;},0);
}
function renderIntelContext(){
  const ds=digitalCoverage(),tl=tlevelCoverage();
  return `<div class="list"><div class="item"><b>Courses</b><div class="small muted">${esc(C1)} · ${esc(C2)}</div></div><div class="item"><b>Coverage</b><div class="small muted">Digital Skills ${ds.covered}/${ds.total} criteria · T Level ${tl.covered}/${tl.total} areas</div></div><div class="item"><b>Teaching profile</b><div class="small muted">${esc(state.style.split('\n').slice(0,4).join(' · '))}</div></div><div class="item"><b>Workspace records</b><div class="small muted">${state.lessons.length} lessons · ${state.marking.length} marking · ${state.learners.length} learners · ${state.tasks.filter(t=>!t.done).length} open tasks</div></div></div>`;
}
function intelSnapshot(focus){
  const base={focus,courses:[C1,C2],teachingStyle:state.style,defaultLessonPrompt:state.prefs.defaultLessonPrompt,coverage:state.coverage};
  if(focus==='Full Hub'||focus==='Lessons & planning'){base.recentLessons=state.lessons.slice(0,5);base.planner=state.tasks.filter(t=>!t.done).slice(0,12);}
  if(focus==='Full Hub'||focus==='Assessment & marking'){base.recentMarking=state.marking.slice(0,8);base.savedBriefs=state.briefs.slice(0,5);}
  if(focus==='Full Hub'||focus==='Learner support'){base.learners=state.learners.slice(0,30);base.oneToOnes=state.oneToOnes.slice(0,12);base.progression=state.progression.slice(0,12);}
  if(focus==='Full Hub'||focus==='Admin & communications'){base.rooms=state.rooms.slice(0,10);base.employers=state.employers.slice(0,10);base.timetable=state.timetable;}
  if(focus==='Curriculum & coverage'){base.digitalSkillsUnits=D.courses.digitalSkills.units; base.tlevel={core:D.courses.tlevel.core,os:D.courses.tlevel.os,assessment:D.courses.tlevel.assessment};}
  if(focus==='Resources') base.resources=state.resources.slice(0,20);
  return base;
}
function prepareIntel(){
  const focus=document.getElementById('intelFocus').value,prompt=document.getElementById('intelPrompt').value.trim();if(!prompt)return toast('Add a request first.');
  const prepared=`Use high reasoning effort.\n\nREQUEST\n${prompt}\n\nRABIUL WORK HUB CONTEXT\n${JSON.stringify(intelSnapshot(focus),null,2)}\n\nWORKING RULES\n- Treat the Hub context and official specification structure as the source of truth.\n- Keep wording concise, natural and professional.\n- For lessons, follow my Oldham College teaching style, use specification links and avoid repeating covered content.\n- For marking, use WWW / EBI / Overall / Indicative Grade and identify exact missing evidence.\n- Do not invent learner facts, specification points or evidence.\n- Give a finished usable output rather than generic advice.`;
  document.getElementById('intelPrepared').value=prepared;
}
async function shareIntel(){let t=document.getElementById('intelPrepared').value;if(!t){prepareIntel();t=document.getElementById('intelPrepared').value;}if(!t)return;if(navigator.share){try{await navigator.share({title:'Rabiul Work Hub request',text:t});return;}catch(e){}}copyText(t);}
function copyIntel(){const t=document.getElementById('intelPrepared').value;if(!t)return toast('Prepare a request first.');copyText(t);}
function openIntelligenceWith(prompt,focus){
  ui.page='intelligence'; render();
  setTimeout(()=>{document.getElementById('intelFocus').value=focus||'Full Hub';document.getElementById('intelPrompt').value=prompt;prepareIntel();},0);
}
function saveVault(){const text=document.getElementById('vaultInput').value.trim();if(!text)return toast('Paste a response first.');state.vault.unshift({id:uid('vault'),date:new Date().toISOString(),text});saveState();renderIntelligence();toast('Response saved.');}

async function sendAI(){
  const input=document.getElementById('aiPrompt');
  const message=input?.value.trim();
  if(!message)return toast('Type a message first.');
  const pin=(document.getElementById('aiPin')?.value||'').trim();
  if(pin)sessionStorage.setItem('rwh_ai_pin',pin);
  const focus=document.getElementById('aiFocus')?.value||'Full Hub';
  const effort=document.getElementById('aiEffort')?.value||'high';
  state.aiMessages=state.aiMessages||[];
  state.aiMessages.push({role:'user',content:message,date:new Date().toISOString()});
  saveState();
  input.value='';
  renderIntelligence();
  const btn=document.getElementById('aiSendBtn');if(btn){btn.disabled=true;btn.textContent='Thinking…';}
  try{
    const history=state.aiMessages.slice(0,-1).slice(-10).map(m=>({role:m.role,content:m.content}));
    const response=await fetch('/api/chat',{
      method:'POST',
      headers:{'Content-Type':'application/json','x-hub-key':pin},
      body:JSON.stringify({message,focus,effort,history,context:intelSnapshot(focus)})
    });
    const data=await response.json().catch(()=>({}));
    if(!response.ok)throw new Error(data.error||'AI request failed.');
    state.aiMessages.push({role:'assistant',content:data.text||'No response returned.',date:new Date().toISOString(),model:data.model||''});
    saveState();
    renderIntelligence();
  }catch(err){
    state.aiMessages.push({role:'assistant',content:'Connection error: '+(err.message||'Please try again.'),date:new Date().toISOString()});
    saveState();
    renderIntelligence();
  }
}
function clearAIChat(){
  if(!confirm('Clear the Hub Intelligence conversation on this browser?'))return;
  state.aiMessages=[];saveState();renderIntelligence();toast('Chat cleared.');
}

function renderSettings(){
  document.getElementById('app').innerHTML=pageHead('Settings','Teaching standards, backup and reliability controls.','<span class="pill green">Version '+esc(D.version)+'</span>')+
  `<div class="grid g2"><div class="card"><h3>My teaching style</h3><p class="small muted">These rules are used by Lesson Studio and included in intelligent requests.</p><textarea id="settingsStyle" style="min-height:390px">${esc(state.style)}</textarea><label><span class="label">Default lesson improvement prompt</span><textarea id="settingsPrompt">${esc(state.prefs.defaultLessonPrompt||'')}</textarea></label><div class="toolbar"><button class="btn" onclick="RWH.saveSettings()">Save teaching style</button><button class="btn secondary" onclick="RWH.resetStyle()">Restore defaults</button></div></div>
  <div class="card"><h3>Backup & data</h3><p class="small muted">Working data is stored locally in this browser. Export a backup before moving device or clearing browser data.</p><div class="toolbar"><button class="btn secondary" onclick="RWH.exportBackup()">Export JSON backup</button><button class="btn secondary" onclick="document.getElementById('backupFile').click()">Import backup</button><input id="backupFile" type="file" accept="application/json" style="display:none" onchange="RWH.importBackup(event)"><button class="btn danger" onclick="RWH.resetAll()">Reset local data</button></div><h3 style="margin-top:18px">Diagnostics</h3><div class="diag" id="diag">Run self-check to verify the main Hub functions.</div><div class="toolbar"><button class="btn secondary" onclick="RWH.selfCheck()">Run self-check</button></div><div class="source-box" style="margin-top:16px"><b>Data model</b><div class="small muted">Schema ${SCHEMA} · ${state.lessons.length} lessons · ${state.marking.length} marking records · ${state.learners.length} learners · ${Object.keys(state.coverage).length} coverage marks</div></div></div></div>`;
}
function saveSettings(){state.style=document.getElementById('settingsStyle').value.trim()||D.defaultTeachingStyle.join('\n');state.prefs.defaultLessonPrompt=document.getElementById('settingsPrompt').value.trim();saveState();toast('Settings saved.');}
function resetStyle(){state.style=D.defaultTeachingStyle.join('\n');state.prefs.defaultLessonPrompt='Keep it natural, specification-linked, active and appropriately challenging.';saveState();renderSettings();toast('Teaching style restored.');}
function exportBackup(){const blob=new Blob([JSON.stringify({exportedAt:new Date().toISOString(),version:D.version,state},null,2)],{type:'application/json'});const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download='rabiul-work-hub-backup.json';a.click();setTimeout(()=>URL.revokeObjectURL(a.href),1000);}
function importBackup(e){const f=e.target.files?.[0];if(!f)return;const r=new FileReader();r.onload=()=>{try{const x=JSON.parse(r.result);state=migrate(x.state||x);saveState();toast('Backup imported.');setTimeout(()=>location.reload(),500);}catch(err){toast('Backup could not be imported.');}};r.readAsText(f);}
function resetAll(){if(!confirm('Reset all locally stored Work Hub data on this browser? This cannot be undone without a backup.'))return;localStorage.removeItem(KEY);state=DEFAULT_STATE();saveState();location.reload();}
function selfCheck(){
  const checks=[];
  checks.push(`Version: ${D.version}`);
  try{localStorage.setItem('rwh2_test','1');localStorage.removeItem('rwh2_test');checks.push('Local storage: OK');}catch(e){checks.push('Local storage: FAILED');}
  checks.push(`Course data: ${D.courses.digitalSkills.units.length===7 && D.courses.tlevel.core.length===8?'OK':'FAILED'}`);
  checks.push(`Navigation: ${NAV.flatMap(x=>x[1]).length>=15?'OK':'FAILED'}`);
  checks.push(`Lesson generator: ${typeof generateLesson==='function'?'OK':'FAILED'}`);
  checks.push(`Marking workflow: ${typeof generateFeedback==='function'?'OK':'FAILED'}`);
  checks.push(`Backup workflow: ${typeof exportBackup==='function'?'OK':'FAILED'}`);
  checks.push(`Share support: ${navigator.share?'Available':'Copy fallback active'}`);
  document.getElementById('diag').textContent=checks.join('\n');
}

Object.assign(window.RWH,{
  openCourse,planSuggested,setCourse,openSpec,openSpecCourse,toggleCoverage,specCourseChanged,filterSpecs,selectSpec,planArea,hubSearch,openIntelligenceSearch,
  lessonCourseChanged,lessonAreaChanged,generateLesson,selectSlide,updateSelectedSlide,deleteSelectedSlide,addImprovePrompt,improveLesson,saveLesson,loadLesson,newLesson,printLesson,
  addESPItem,prepareESPRequest,assessmentCourseChanged,addAssessment,
  markCourseChanged,markAreaChanged,generateFeedback,copyFeedback,saveMarking,prepareMarkingRequest,
  briefCourseChanged,briefAreaChanged,generateBrief,saveBrief,
  addLearner,filterLearners,deleteLearner,startOneToOne,startProgression,
  renderAttendanceRows,saveAttendance,saveOneToOne,saveProgression,
  addTask,toggleTask,addTimetable,addRoomIssue,addEmployer,addResource,filterResources,
  generateComm,copyComm,saveComm,prepareIntel,shareIntel,copyIntel,saveVault,sendAI,clearAIChat,
  saveSettings,resetStyle,exportBackup,importBackup,resetAll,selfCheck
});

render();
})();

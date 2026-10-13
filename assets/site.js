const $ = (s, root=document) => root.querySelector(s);
const $$ = (s, root=document) => [...root.querySelectorAll(s)];
const themeButton = $('#theme-toggle');
const media = matchMedia('(prefers-color-scheme: dark)');
function setTheme(dark){document.documentElement.dataset.theme=dark?'dark':'light';themeButton?.setAttribute('aria-pressed',String(dark));themeButton?.setAttribute('aria-label',dark?'Ativar tema claro':'Ativar tema escuro');}
setTheme(media.matches);
let themeChosen=false;media.addEventListener('change',e=>{if(!themeChosen)setTheme(e.matches);});
themeButton?.addEventListener('click',()=>{themeChosen=true;setTheme(document.documentElement.dataset.theme!=='dark');});
const menuButton=$('#menu-open'), sidebar=$('#sidebar'), backdrop=$('#nav-backdrop');
const mobileNav=matchMedia('(max-width:650px)');
sidebar.inert=mobileNav.matches;
function navOpen(open,restoreFocus=true){open=open&&mobileNav.matches;sidebar.inert=mobileNav.matches&&!open;document.querySelector('.shell').inert=open;if(open){sidebar.setAttribute('role','dialog');sidebar.setAttribute('aria-modal','true');sidebar.setAttribute('aria-label','Navegação');}else{sidebar.removeAttribute('role');sidebar.removeAttribute('aria-modal');sidebar.removeAttribute('aria-label');}document.body.classList.toggle('nav-open',open);backdrop.hidden=!open;menuButton?.setAttribute('aria-expanded',String(open));if(open)$('#menu-close')?.focus();else if(restoreFocus&&mobileNav.matches)menuButton?.focus();}
menuButton?.addEventListener('click',()=>navOpen(!document.body.classList.contains('nav-open')));
$('#menu-close')?.addEventListener('click',()=>navOpen(false));backdrop?.addEventListener('click',()=>navOpen(false));
sidebar?.querySelectorAll('a').forEach(a=>a.addEventListener('click',()=>{if(matchMedia('(max-width:650px)').matches)navOpen(false);}));
if(matchMedia('(min-width:651px) and (max-width:900px)').matches)document.body.classList.add('sidebar-collapsed');
const initialCollapsed=document.body.classList.contains('sidebar-collapsed');$('#sidebar-toggle')?.setAttribute('aria-expanded',String(!initialCollapsed));$('#sidebar-toggle')?.setAttribute('aria-label',initialCollapsed?'Expandir menu lateral':'Recolher menu lateral');
$('#sidebar-toggle')?.addEventListener('click',()=>{const collapsed=document.body.classList.toggle('sidebar-collapsed');$('#sidebar-toggle').setAttribute('aria-expanded',String(!collapsed));$('#sidebar-toggle').setAttribute('aria-label',collapsed?'Expandir menu lateral':'Recolher menu lateral');});
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&document.body.classList.contains('nav-open'))navOpen(false);if(e.key==='Tab'&&document.body.classList.contains('nav-open')){const items=[...sidebar.querySelectorAll('a,button')].filter(el=>el.getClientRects().length);const first=items[0],last=items[items.length-1];if(e.shiftKey&&document.activeElement===first){e.preventDefault();last.focus();}else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first.focus();}}});
mobileNav.addEventListener('change',()=>{const activeWasSidebar=sidebar.contains(document.activeElement);navOpen(false,false);if(mobileNav.matches&&activeWasSidebar)menuButton?.focus();});
if(!matchMedia('(prefers-reduced-motion: reduce)').matches && matchMedia('(hover:hover) and (pointer:fine)').matches){$$('[data-tilt]').forEach(card=>{card.addEventListener('pointermove',e=>{const r=card.getBoundingClientRect();card.style.setProperty('--ry',`${((e.clientX-r.left)/r.width-.5)*4}deg`);card.style.setProperty('--rx',`${-((e.clientY-r.top)/r.height-.5)*4}deg`);});card.addEventListener('pointerleave',()=>{card.style.setProperty('--rx','0deg');card.style.setProperty('--ry','0deg');});});}
$$('[data-copy]').forEach(button=>button.addEventListener('click',async()=>{const code=button.closest('.code-wrap,.ref-code')?.querySelector('code')?.innerText||'';const original=button.textContent;try{await navigator.clipboard.writeText(code);button.textContent='Copiado';}catch{const area=document.createElement('textarea');area.value=code;area.style.position='fixed';area.style.opacity='0';document.body.append(area);area.select();try{button.textContent=document.execCommand('copy')?'Copiado':'Selecione o código';}catch{button.textContent='Selecione o código';}area.remove();}setTimeout(()=>button.textContent=original,1600);}));
const norm=s=>(s||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
const trackSearch=$('#track-search');let category='all';
function filterTracks(){if(!trackSearch)return;const q=norm(trackSearch.value.trim());let n=0;$$('[data-track-card]').forEach(card=>{const ok=norm(card.dataset.search).includes(q)&&(category==='all'||card.dataset.category===category);card.hidden=!ok;if(ok)n++;});$('#track-count').textContent=`${n} ${n===1?'trilha encontrada':'trilhas encontradas'}`;$('#track-empty').hidden=n>0;}
trackSearch?.addEventListener('input',filterTracks);
$$('[data-category-filter]').forEach(btn=>btn.addEventListener('click',()=>{category=btn.dataset.categoryFilter;$$('[data-category-filter]').forEach(b=>b.setAttribute('aria-pressed',String(b===btn)));filterTracks();}));
$('#clear-track-search')?.addEventListener('click',()=>{trackSearch.value='';category='all';$$('[data-category-filter]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.categoryFilter==='all')));filterTracks();trackSearch.focus();});
const refSearch=$('#ref-search');let tool='all';
function filterRefs(){if(!refSearch)return;const q=norm(refSearch.value.trim());let n=0;$$('[data-ref-card]').forEach(card=>{const ok=norm(card.dataset.search).includes(q)&&(tool==='all'||card.dataset.tool===tool);card.hidden=!ok;if(ok)n++;});$('#ref-count').textContent=`${n} ${n===1?'referência encontrada':'referências encontradas'}`;$('#ref-empty').hidden=n>0;}
refSearch?.addEventListener('input',filterRefs);
$$('[data-ref-tool]').forEach(btn=>btn.addEventListener('click',()=>{tool=btn.dataset.refTool;$$('[data-ref-tool]').forEach(b=>{const selected=b.dataset.refTool===tool;b.setAttribute('aria-pressed',String(selected));b.classList.toggle('active',selected);});filterRefs();}));
function focusReferenceSearch(){refSearch?.focus();refSearch?.scrollIntoView({block:'center'});}
document.addEventListener('keydown',event=>{const typing=['INPUT','TEXTAREA','SELECT'].includes(document.activeElement?.tagName)||document.activeElement?.isContentEditable;const shortcut=((event.ctrlKey||event.metaKey)&&event.key.toLowerCase()==='k')||(event.key==='/'&&!event.ctrlKey&&!event.metaKey&&!event.altKey);if(shortcut&&!typing&&!document.body.classList.contains('nav-open')){event.preventDefault();if(refSearch)focusReferenceSearch();else{const link=$('.search-shortcut');if(link){const target=new URL(link.href);target.hash='ref-search';location.assign(target.href);}}}});
if(refSearch&&location.hash==='#ref-search')focusReferenceSearch();

const searchParam=new URLSearchParams(location.search).get('q');if(refSearch&&searchParam){refSearch.value=searchParam;filterRefs();}

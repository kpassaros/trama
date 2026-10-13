import {spawn} from 'node:child_process';import {mkdtemp,rm,writeFile,readdir} from 'node:fs/promises';import {tmpdir} from 'node:os';import {fileURLToPath} from 'node:url';import path from 'node:path';import {pathToFileURL} from 'node:url';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..'),profile=await mkdtemp(path.join(tmpdir(),'trama-qa-'));
const cp=spawn('chromium',['--headless','--no-sandbox','--disable-gpu','--disable-dev-shm-usage','--allow-file-access-from-files','--disable-background-networking','--run-all-compositor-stages-before-draw','--remote-debugging-port=9377',`--user-data-dir=${profile}`,'about:blank'],{stdio:'ignore'});
const delay=ms=>new Promise(r=>setTimeout(r,ms));let ws;const results=[];const errors=[];
try{
 let tabs;for(let i=0;i<50;i++){try{tabs=await(await fetch('http://127.0.0.1:9377/json')).json();break;}catch{await delay(100);}}
 ws=new WebSocket(tabs.find(t=>t.type==='page').webSocketDebuggerUrl);await new Promise(r=>ws.addEventListener('open',r,{once:true}));let next=1;const pending=new Map();
 ws.addEventListener('message',e=>{const x=JSON.parse(e.data);if(x.id){const p=pending.get(x.id);pending.delete(x.id);x.error?p.reject(x.error):p.resolve(x.result);}if(x.method==='Runtime.exceptionThrown')errors.push(x.params.exceptionDetails.text);});
 const cmd=(method,params={})=>new Promise((resolve,reject)=>{const id=next++;const timer=setTimeout(()=>{pending.delete(id);reject(Error('Timeout '+method));},10000);pending.set(id,{resolve:x=>{clearTimeout(timer);resolve(x);},reject:e=>{clearTimeout(timer);reject(e);}});ws.send(JSON.stringify({id,method,params}));});
 const evaluate=async expression=>{const x=await cmd('Runtime.evaluate',{expression,returnByValue:true,awaitPromise:true});if(x.exceptionDetails)throw Error(x.exceptionDetails.text);return x.result.value;};
 await cmd('Page.enable');await cmd('Runtime.enable');
 const load=async(file,width=1440,theme='dark')=>{await cmd('Emulation.setDeviceMetricsOverride',{width,height:1000,deviceScaleFactor:1,mobile:width<650});await cmd('Page.navigate',{url:pathToFileURL(path.join(root,'public',file)).href});await delay(100);await evaluate(`new Promise(async r=>{await document.fonts.ready;document.documentElement.dataset.theme='${theme}';setTimeout(()=>r(true),20);})`);};
 const check=(name,passed,extra={})=>{console.log(name,passed?'PASS':'FAIL');results.push({name,passed,...extra});if(!passed)errors.push(name);};
 await load('index.html');
 check('desktop collapse',await evaluate(`(()=>{document.querySelector('#sidebar-toggle').click();return document.body.classList.contains('sidebar-collapsed')&&document.querySelector('#sidebar-toggle').getAttribute('aria-expanded')==='false';})()`));
 check('desktop expand',await evaluate(`(()=>{document.querySelector('#sidebar-toggle').click();return !document.body.classList.contains('sidebar-collapsed');})()`));
 check('theme toggles to light',await evaluate(`(()=>{document.querySelector('#theme-toggle').click();return document.documentElement.dataset.theme==='light';})()`));
 check('track category web',await evaluate(`(()=>{document.querySelector('[data-category-filter="Desenvolvimento web"]').click();return [...document.querySelectorAll('[data-track-card]')].filter(c=>!c.hidden).length===3;})()`));
 check('track search JavaScript',await evaluate(`(()=>{const i=document.querySelector('#track-search');i.value='JavaScript';i.dispatchEvent(new Event('input'));return [...document.querySelectorAll('[data-track-card]')].filter(c=>!c.hidden).length===1;})()`));
 check('track empty state',await evaluate(`(()=>{const i=document.querySelector('#track-search');i.value='zzzzzz';i.dispatchEvent(new Event('input'));return !document.querySelector('#track-empty').hidden;})()`));
 check('clear filters',await evaluate(`(()=>{document.querySelector('#clear-track-search').click();return [...document.querySelectorAll('[data-track-card]')].filter(c=>!c.hidden).length===13;})()`));
 await load('consultas.html');
 check('reference SQL filter',await evaluate(`(()=>{document.querySelector('[data-ref-tool="SQL"]').click();return [...document.querySelectorAll('[data-ref-card]')].filter(c=>!c.hidden).length===25;})()`));
 check('reference search WHERE',await evaluate(`(()=>{const i=document.querySelector('#ref-search');i.value='WHERE';i.dispatchEvent(new Event('input'));return !document.querySelector('#ref-002').hidden;})()`));
 check('expand reference explanation',await evaluate(`(()=>{const d=document.querySelector('#ref-002 details');d.querySelector('summary').click();return d.open;})()`));
 // Sem escrever na área de transferência do usuário: substituição controlada só para o teste.
 check('copy handler',await evaluate(`(async()=>{let copied='';Object.defineProperty(navigator,'clipboard',{configurable:true,value:{writeText:async t=>{copied=t;}}});const b=document.querySelector('#ref-002 [data-copy]');b.click();await new Promise(r=>setTimeout(r,20));return copied===document.querySelector('#ref-002 code').innerText&&b.textContent==='Copiado';})()`));
 await load('index.html',390);
 check('mobile menu open and focus',await evaluate(`(()=>{document.querySelector('#menu-open').click();return document.body.classList.contains('nav-open')&&!document.querySelector('#nav-backdrop').hidden&&document.activeElement.id==='menu-close';})()`));
 check('mobile menu escape and return focus',await evaluate(`(()=>{document.dispatchEvent(new KeyboardEvent('keydown',{key:'Escape',bubbles:true}));return !document.body.classList.contains('nav-open')&&document.activeElement.id==='menu-open';})()`));
 // Tamanhos de todas as páginas geradas, incluindo cursos e aulas.
 async function paths(dir){let all=[];for(const ent of await readdir(dir,{withFileTypes:true})){const full=path.join(dir,ent.name);if(ent.isDirectory())all.push(...await paths(full));else if(ent.name.endsWith('.html')&&!ent.name.startsWith('preview-'))all.push(path.relative(path.join(root,'public'),full));}return all;}
 const routes=await paths(path.join(root,'public'));const overflow=[];for(const width of [1440,390])for(const file of routes){await load(file,width);const info=await evaluate(`(()=>({overflow:document.documentElement.scrollWidth>innerWidth+1,images:[...document.images].filter(i=>!i.complete||i.naturalWidth===0).length}))()`);if(info.overflow||info.images)overflow.push({file,width,...info});}
 check('all route layouts',overflow.length===0,{routes:routes.length,widths:[1440,390],issues:overflow});
 // Cenário reduce: os efeitos decorativos ficam sem transição.
 await cmd('Emulation.setEmulatedMedia',{features:[{name:'prefers-reduced-motion',value:'reduce'}]});await load('index.html');check('reduced motion',await evaluate(`getComputedStyle(document.querySelector('[data-tilt]')).transitionDuration==='0s'`));
 const report={results,errors};await writeFile(root+'/reports/qa-browser.json',JSON.stringify(report,null,2));console.log(JSON.stringify({checks:results.length,passed:results.filter(x=>x.passed).length,errors}));if(errors.length)throw Error('Falhas no QA interativo: '+errors.join(', '));
}finally{ws?.close();cp.kill('SIGTERM');await delay(150);await rm(profile,{recursive:true,force:true});}

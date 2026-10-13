import {spawn} from 'node:child_process';import {mkdtemp,rm,writeFile,readdir,readFile} from 'node:fs/promises';import {tmpdir} from 'node:os';import {fileURLToPath} from 'node:url';import path from 'node:path';import {pathToFileURL} from 'node:url';
// Este QA abre o site e executa JavaScript: somente conteúdo local previamente revisado. Não é sandbox e não roda no workflow de PR.
if(process.env.CI)throw Error('QA interativo é local; não executar conteúdo editável no CI.');
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..'),profile=await mkdtemp(path.join(tmpdir(),'trama-qa-'));
const cp=spawn('chromium',['--headless','--no-sandbox','--disable-gpu','--disable-dev-shm-usage','--allow-file-access-from-files','--disable-background-networking','--run-all-compositor-stages-before-draw','--remote-debugging-port=9377',`--user-data-dir=${profile}`,'about:blank'],{stdio:'ignore'});
const catalog=JSON.parse(await readFile(root+'/content/catalog.json','utf8')).tracks;
const referenceItems=JSON.parse(await readFile(root+'/content/reference.json','utf8')).items;
const totalTracks=catalog.length,sqlReferences=referenceItems.filter(r=>r.tool==='SQL').length;
const delay=ms=>new Promise(r=>setTimeout(r,ms));let ws;const results=[];const errors=[];
try{
 let tabs;for(let i=0;i<50;i++){try{tabs=await(await fetch('http://127.0.0.1:9377/json')).json();break;}catch{await delay(100);}}
 ws=new WebSocket(tabs.find(t=>t.type==='page').webSocketDebuggerUrl);await new Promise(r=>ws.addEventListener('open',r,{once:true}));let next=1;const pending=new Map(),lifecycle=[];
 ws.addEventListener('message',e=>{const x=JSON.parse(e.data);if(x.id){const p=pending.get(x.id);pending.delete(x.id);if(!p)return;x.error?p.reject(x.error):p.resolve(x.result);}if(x.method==='Page.lifecycleEvent')lifecycle.push(x.params);if(x.method==='Runtime.exceptionThrown')errors.push(x.params.exceptionDetails.text);});
 const cmd=(method,params={})=>new Promise((resolve,reject)=>{const id=next++;const timer=setTimeout(()=>{pending.delete(id);reject(Error('Timeout '+method));},10000);pending.set(id,{resolve:x=>{clearTimeout(timer);resolve(x);},reject:e=>{clearTimeout(timer);reject(e);}});ws.send(JSON.stringify({id,method,params}));});
 const evaluate=async expression=>{const x=await cmd('Runtime.evaluate',{expression,returnByValue:true,awaitPromise:true});if(x.exceptionDetails)throw Error(x.exceptionDetails.text);return x.result.value;};
 await cmd('Page.enable');await cmd('Page.setLifecycleEventsEnabled',{enabled:true});await cmd('Runtime.enable');
 const load=async(file,width=1440,theme='dark')=>{
  await cmd('Emulation.setDeviceMetricsOverride',{width,height:1000,deviceScaleFactor:1,mobile:width<650});
  const url=pathToFileURL(path.join(root,'public',file)).href;
  lifecycle.length=0;
  const nav=await cmd('Page.navigate',{url});
  if(nav.errorText)throw Error('Navegação falhou: '+nav.errorText);
  const deadline=Date.now()+15000;
  while(!lifecycle.some(e=>e.name==='load'&&e.frameId===nav.frameId&&e.loaderId===nav.loaderId)){
   if(Date.now()>deadline)throw Error('Timeout de carregamento: '+file);
   await delay(20);
  }
  if(await evaluate('location.href')!==url)throw Error('Rota incorreta: '+file);
  await evaluate(`(async()=>{await document.fonts.ready;document.querySelector('[data-notice-dismiss]')?.click();document.documentElement.dataset.theme=${JSON.stringify(theme)};await new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r)));return true;})()`);
 };

 const check=(name,passed,extra={})=>{console.log(name,passed?'PASS':'FAIL');results.push({name,passed,...extra});if(!passed)errors.push(name);};
 await load('index.html');
 check('desktop collapse',await evaluate(`(()=>{document.querySelector('#sidebar-toggle').click();return document.body.classList.contains('sidebar-collapsed')&&document.querySelector('#sidebar-toggle').getAttribute('aria-expanded')==='false';})()`));
 check('desktop expand',await evaluate(`(()=>{document.querySelector('#sidebar-toggle').click();return !document.body.classList.contains('sidebar-collapsed');})()`));
 check('theme toggles to light',await evaluate(`(()=>{document.querySelector('#theme-toggle').click();return document.documentElement.dataset.theme==='light';})()`));
 check('track category web',await evaluate(`(()=>{document.querySelector('[data-category-filter="Desenvolvimento web"]').click();return [...document.querySelectorAll('[data-track-card]')].filter(c=>!c.hidden).length===3;})()`));
 check('track search JavaScript',await evaluate(`(()=>{const i=document.querySelector('#track-search');i.value='JavaScript';i.dispatchEvent(new Event('input'));return [...document.querySelectorAll('[data-track-card]')].filter(c=>!c.hidden).length===1;})()`));
 check('track empty state',await evaluate(`(()=>{const i=document.querySelector('#track-search');i.value='zzzzzz';i.dispatchEvent(new Event('input'));return !document.querySelector('#track-empty').hidden;})()`));
 check('clear filters',await evaluate(`(()=>{document.querySelector('#clear-track-search').click();return [...document.querySelectorAll('[data-track-card]')].filter(c=>!c.hidden).length===${totalTracks};})()`));
 await load('consultas.html');
 check('reference shortcut focuses reference input',await evaluate(`(()=>{document.activeElement.blur();document.dispatchEvent(new KeyboardEvent('keydown',{key:'/',bubbles:true}));return document.activeElement.id==='ref-search';})()`));
 check('reference SQL filter',await evaluate(`(()=>{document.querySelector('[data-ref-tool="SQL"]').click();return [...document.querySelectorAll('[data-ref-card]')].filter(c=>!c.hidden).length===${sqlReferences};})()`));
 check('reference search WHERE',await evaluate(`(()=>{const i=document.querySelector('#ref-search');i.value='WHERE';i.dispatchEvent(new Event('input'));return !document.querySelector('#ref-002').hidden;})()`));
 check('expand reference explanation',await evaluate(`(()=>{const d=document.querySelector('#ref-002 details');d.querySelector('summary').click();return d.open;})()`));
 // Sem escrever na área de transferência do usuário: substituição controlada só para o teste.
 check('copy handler',await evaluate(`(async()=>{let copied='';Object.defineProperty(navigator,'clipboard',{configurable:true,value:{writeText:async t=>{copied=t;}}});const b=document.querySelector('#ref-002 [data-copy]');b.click();await new Promise(r=>setTimeout(r,20));return copied===document.querySelector('#ref-002 code').innerText&&b.textContent==='Copiado';})()`));
 await load('index.html',390);
 check('closed mobile menu is inert',await evaluate(`document.querySelector('#sidebar').inert&&!document.querySelector('.shell').inert`));
 check('mobile menu open and focus',await evaluate(`(()=>{document.querySelector('#menu-open').click();return document.body.classList.contains('nav-open')&&!document.querySelector('#nav-backdrop').hidden&&document.activeElement.id==='menu-close'&&!document.querySelector('#sidebar').inert&&document.querySelector('.shell').inert;})()`));
 check('mobile menu escape and return focus',await evaluate(`(()=>{document.dispatchEvent(new KeyboardEvent('keydown',{key:'Escape',bubbles:true}));return !document.body.classList.contains('nav-open')&&document.activeElement.id==='menu-open'&&document.querySelector('#sidebar').inert&&!document.querySelector('.shell').inert;})()`));
 await load('trilhas/javascript/javascript-02.html',390);
 check('mobile lesson contents precede article',await evaluate(`(()=>{const toc=document.querySelector('.lesson-toc'),article=document.querySelector('.lesson-main');return Boolean(toc.compareDocumentPosition(article)&Node.DOCUMENT_POSITION_FOLLOWING)&&toc.getBoundingClientRect().bottom<=article.getBoundingClientRect().top;})()`));
 // Apenas neste QA local, executa exemplos revisados em um perfil Chromium descartável.
 const counterLesson=JSON.parse(await readFile(root+'/content/lessons/javascript-02.json','utf8'));
 const counter=counterLesson.sections.find(s=>s.codeBlocks).codeBlocks;
 check('counter HTML and JavaScript work separately',await evaluate(`(()=>{const fixture=document.createElement('div');fixture.innerHTML=${JSON.stringify(counter[0].code.replace(/<script[\s\S]*?<\/script>/,''))};document.body.append(fixture);try{(new Function(${JSON.stringify(counter[1].code)}))();document.querySelector('#adicionar').click();return document.querySelector('#contador').textContent==='1 exemplos';}finally{fixture.remove();}})()`));
 const fetchLesson=JSON.parse(await readFile(root+'/content/lessons/javascript-03.json','utf8'));
 const fetchCode=fetchLesson.sections.find(s=>s.code).code;
 const fetchResults=await evaluate(`(async()=>{const cases=[['valid',{ok:true,json:async()=>[{status:'paid',total:150}]},false,[{status:'paid',total:150}]],['empty',{ok:true,json:async()=>[]},false,[]],['HTTP404',{ok:false,status:404},true],['invalidJSON',{ok:true,json:async()=>{throw Error('JSON inválido')}},true],['wrongSchema',{ok:true,json:async()=>({status:'paid',total:150})},true],['textAmount',{ok:true,json:async()=>[{status:'paid',total:'150'}]},true],['nullRecord',{ok:true,json:async()=>[null]},true]];const results=[];for(const [name,response,throws,expected] of cases){let failed=false,result;const fn=new Function('fetch','console',${JSON.stringify(fetchCode)}+';return carregarPedidos;')(async()=>response,{error:()=>{}});try{result=await fn();}catch{failed=true;}results.push({name,passed:failed===throws&&(throws||JSON.stringify(result)===JSON.stringify(expected))});}return results;})()`);
 check('Fetch errors and exact success results',fetchResults.every(r=>r.passed),{fixtures:fetchResults});
 // Tamanhos de todas as páginas geradas, incluindo cursos e aulas.
 async function paths(dir){let all=[];for(const ent of await readdir(dir,{withFileTypes:true})){const full=path.join(dir,ent.name);if(ent.isDirectory())all.push(...await paths(full));else if(ent.name.endsWith('.html')&&!ent.name.startsWith('preview-'))all.push(path.relative(path.join(root,'public'),full));}return all;}
 const routes=await paths(path.join(root,'public'));const overflow=[];for(const width of [1440,390])for(const file of routes){await load(file,width);const info=await evaluate(`(()=>({overflow:document.documentElement.scrollWidth>innerWidth+1,images:[...document.images].filter(i=>!i.complete||i.naturalWidth===0).length}))()`);if(info.overflow||info.images)overflow.push({file,width,...info});}
 check('all route layouts',overflow.length===0,{routes:routes.length,widths:[1440,390],issues:overflow});
 // Cenário reduce: os efeitos decorativos ficam sem transição.
 await cmd('Emulation.setEmulatedMedia',{features:[{name:'prefers-reduced-motion',value:'reduce'}]});await load('index.html');check('reduced motion',await evaluate(`getComputedStyle(document.querySelector('[data-tilt]')).transitionDuration==='0s'`));
 const report={results,errors};await writeFile(root+'/reports/qa-browser.json',JSON.stringify(report,null,2));console.log(JSON.stringify({checks:results.length,passed:results.filter(x=>x.passed).length,errors}));if(errors.length)throw Error('Falhas no QA interativo: '+errors.join(', '));
}finally{ws?.close();cp.kill('SIGTERM');await delay(150);await rm(profile,{recursive:true,force:true});}

// QA local offline: o site é servido pela interceptação CDP e gtag é um stub.
// Nunca envia dados ao Google. Não comprova recebimento no GA4/DebugView.
import {spawn} from 'node:child_process';
import {mkdtemp,rm,readFile,writeFile} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {fileURLToPath} from 'node:url';
import path from 'node:path';
if(process.env.CI)throw Error('Teste interativo somente local e offline.');
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const profile=await mkdtemp(path.join(tmpdir(),'trama-analytics-'));
const cp=spawn('chromium',['--headless','--no-sandbox','--disable-gpu','--disable-dev-shm-usage','--disable-background-networking','--remote-debugging-port=9388',`--user-data-dir=${profile}`,'about:blank'],{stdio:'ignore'});
const delay=ms=>new Promise(r=>setTimeout(r,ms));
const requests=[],results=[],errors=[],lifecycle=[];
let ws,next=1;const pending=new Map();
const origin='https://kpassaros.github.io',base=origin+'/trama/';
const check=(name,passed)=>{results.push({name,passed});console.log(name,passed?'PASS':'FAIL');if(!passed)errors.push(name);};
let cmd,evaluate;
const stub=`window.__gaMock=(window.dataLayer||[]).map(x=>Array.from(x));const originalPush=window.dataLayer.push;window.dataLayer.push=function(...items){for(const x of items)window.__gaMock.push(Array.from(x));return originalPush.apply(this,items);};document.cookie='trama_ga=fixture; Path=/trama/; Secure; SameSite=Lax';document.cookie='portfolio_ga=keep; Path=/; Secure; SameSite=Lax';`;
try{
 let tabs;
 for(let i=0;i<100;i++){try{tabs=await(await fetch('http://127.0.0.1:9388/json')).json();break;}catch{await delay(100);}}
 if(!tabs)throw Error('Chromium não iniciou');
 ws=new WebSocket(tabs.find(t=>t.type==='page').webSocketDebuggerUrl);
 await new Promise((resolve,reject)=>{const timer=setTimeout(()=>reject(Error('Timeout websocket')),10000);ws.addEventListener('open',()=>{clearTimeout(timer);resolve();},{once:true});});
 cmd=(method,params={})=>new Promise((resolve,reject)=>{const id=next++,timer=setTimeout(()=>{pending.delete(id);reject(Error('Timeout '+method));},15000);pending.set(id,{resolve:x=>{clearTimeout(timer);resolve(x);},reject:e=>{clearTimeout(timer);reject(e);}});ws.send(JSON.stringify({id,method,params}));});
 async function fulfill(p){
  const u=new URL(p.request.url);let data,type='text/plain';
  if([origin,'https://preview.example.test'].includes(u.origin)&&u.pathname.startsWith('/trama/')){
   let rel=decodeURIComponent(u.pathname.slice('/trama/'.length))||'index.html';if(rel.endsWith('/'))rel+='index.html';
   const file=path.resolve(root,'public',rel);
   if(!file.startsWith(path.resolve(root,'public')+path.sep))throw Error('Path inválido');
   data=await readFile(file);const ext=path.extname(file);type=({'.html':'text/html; charset=utf-8','.js':'application/javascript','.css':'text/css','.svg':'image/svg+xml','.woff':'font/woff','.webp':'image/webp'})[ext]||'application/octet-stream';
  }else if(u.hostname==='www.googletagmanager.com'&&u.pathname==='/gtag/js'){
   requests.push({url:u.href,type:'gtag'});data=Buffer.from(stub);type='application/javascript';
  }else{
   errors.push('Requisição externa bloqueada: '+u.origin);await cmd('Fetch.failRequest',{requestId:p.requestId,errorReason:'BlockedByClient'});return;
  }
  await cmd('Fetch.fulfillRequest',{requestId:p.requestId,responseCode:200,responseHeaders:[{name:'Content-Type',value:type},{name:'Cache-Control',value:'no-store'}],body:data.toString('base64')});
 }
 ws.addEventListener('message',e=>{const x=JSON.parse(e.data);if(x.id){const p=pending.get(x.id);pending.delete(x.id);if(p)x.error?p.reject(x.error):p.resolve(x.result);}if(x.method==='Page.lifecycleEvent')lifecycle.push(x.params);if(x.method==='Fetch.requestPaused')fulfill(x.params).catch(error=>errors.push(error.message));if(x.method==='Runtime.exceptionThrown')errors.push(x.params.exceptionDetails.text);});
 evaluate=async expression=>{const x=await cmd('Runtime.evaluate',{expression,returnByValue:true,awaitPromise:true});if(x.exceptionDetails)throw Error(x.exceptionDetails.text);return x.result.value;};
 await cmd('Page.enable');await cmd('Runtime.enable');await cmd('Page.setLifecycleEventsEnabled',{enabled:true});await cmd('Fetch.enable',{patterns:[{urlPattern:'*',requestStage:'Request'}]});
 const ready=async()=>{await evaluate('document.fonts.ready.then(()=>true)');};
 const load=async(file,width=1440,prefix=base)=>{
  await cmd('Emulation.setDeviceMetricsOverride',{width,height:900,deviceScaleFactor:1,mobile:width<650});lifecycle.length=0;
  const nav=await cmd('Page.navigate',{url:prefix+file,referrer:'https://example.test/?email=private@example.test'});if(nav.errorText)throw Error(nav.errorText);
  const deadline=Date.now()+15000;
  while(!lifecycle.some(e=>e.name==='load'&&e.frameId===nav.frameId&&e.loaderId===nav.loaderId)){if(Date.now()>deadline)throw Error('Timeout load '+file);await delay(20);}
  await ready();
 };
 const mockReady=async()=>{for(let i=0;i<100;i++){if(await evaluate('Boolean(window.__gaMock)'))return;await delay(20);}throw Error('Stub não carregou');};
 await load('index.html');await mockReady();
 check('automatic pageview precedes notice dismissal',requests.length===1&&await evaluate(`document.querySelector('#analytics-notice').open&&__gaMock.filter(x=>x[0]==='event'&&x[1]==='page_view').length===1&&!document.querySelector('[data-consent-accept]')`));
 check('native dialog has accessible name and focus',await evaluate(`(()=>{const d=document.querySelector('#analytics-notice');return d.tagName==='DIALOG'&&d.getAttribute('aria-labelledby')==='metrics-notice-title'&&d.contains(document.activeElement)&&document.activeElement.textContent==='Entendi';})()`));
 check('no fabricated consent command or record',await evaluate(`!__gaMock.some(x=>x[0]==='consent')&&localStorage.getItem('trama.analytics.consent.v1')===null&&localStorage.getItem('trama.analytics.preference.v2')===null`));
 check('config disables automatic pageview and advertising',await evaluate(`(()=>{const c=__gaMock.find(x=>x[0]==='config')[2];return c.send_page_view===false&&c.allow_google_signals===false&&c.allow_ad_personalization_signals===false&&c.cookie_prefix==='trama'&&c.cookie_domain==='none'&&c.cookie_path==='/trama/'&&c.page_referrer==='https://example.test/';})()`));
 check('six professional links with icons',await evaluate(`(()=>{const as=[...document.querySelectorAll('[data-creator-link]')];return as.length===6&&as.every(a=>a.querySelector('svg')&&a.target==='_blank'&&a.rel.includes('noopener'));})()`));
 await evaluate(`document.querySelector('.notice-actions [data-notice-dismiss]').click()`);
 check('Entendi records notice only',await evaluate(`(()=>{const x=JSON.parse(localStorage.getItem('trama.analytics.notice.v1'));return x.dismissed===true&&Object.keys(x).sort().join(',')==='dismissed,expiresAt,version'&&!document.querySelector('#analytics-notice').open&&localStorage.getItem('trama.analytics.preference.v2')===null;})()`));
 check('dismissal does not duplicate or authorize pageview',requests.length===1&&await evaluate(`__gaMock.filter(x=>x[0]==='event'&&x[1]==='page_view').length===1&&!__gaMock.some(x=>x[0]==='consent')`));
 await load('consultas.html?q=private%40example.test#ref-017');await mockReady();
 check('notice stays dismissed on next page',requests.length===2&&await evaluate(`!document.querySelector('#analytics-notice').open&&__gaMock.filter(x=>x[0]==='event'&&x[1]==='page_view').length===1`));
 check('canonical pageview excludes query/hash',await evaluate(`(()=>{const e=__gaMock.filter(x=>x[0]==='event'&&x[1]==='page_view');return e.length===1&&e[0][2].page_location==='https://kpassaros.github.io/trama/consultas.html'&&!JSON.stringify(__gaMock).includes('private@example.test')&&!location.search&&!location.hash;})()`));
 await evaluate(`(async()=>{Object.defineProperty(navigator,'clipboard',{configurable:true,value:{writeText:async()=>{}}});document.querySelector('#ref-017 [data-copy]').click();await new Promise(r=>setTimeout(r,40));})()`);
 check('copy emits identifier, not copied code',await evaluate(`(()=>{const e=__gaMock.filter(x=>x[0]==='event'&&x[1]==='copy_reference');return e.length===1&&e[0][2].reference_id==='ref-017'&&!JSON.stringify(e).includes('SELECT');})()`));
 await evaluate(`const input=document.querySelector('#ref-search');input.value='sensitive@example.test';input.dispatchEvent(new Event('input'));`);await delay(750);
 check('search emits count, never typed term',await evaluate(`(()=>{const e=__gaMock.filter(x=>x[0]==='event'&&x[1]==='search_outcome');return e.length===1&&e[0][2].result_count===0&&!JSON.stringify(__gaMock).includes('sensitive@example.test');})()`));
 await evaluate(`document.addEventListener('click',e=>e.preventDefault(),{capture:true});document.querySelector('[data-creator-link="linkedin"][data-placement="footer"]').click();`);
 check('creator click emits link ID and placement only',await evaluate(`(()=>{const e=__gaMock.find(x=>x[0]==='event'&&x[1]==='creator_link_click');return e[2].link_id==='linkedin'&&e[2].placement==='footer'&&!JSON.stringify(e).includes('linkedin.com');})()`));
 await evaluate(`(()=>{const a=document.createElement('a');a.href='/trama/trilhas/sql/sql-01.html';document.body.append(a);a.click();a.remove();})()`);
 check('lesson link emits content IDs once',await evaluate(`(()=>{const e=__gaMock.filter(x=>x[0]==='event'&&x[1]==='open_lesson');return e.length===1&&e[0][2].track_id==='sql'&&e[0][2].lesson_id==='sql-01';})()`));
 await evaluate(`const opener=document.querySelector('[data-notice-open]');opener.focus();opener.click();`);
 check('footer reopens dialog without changing preference',await evaluate(`document.querySelector('#analytics-notice').open&&localStorage.getItem('trama.analytics.preference.v2')===null&&__gaMock.filter(x=>x[0]==='event'&&x[1]==='page_view').length===1`));
 await cmd('Input.dispatchKeyEvent',{type:'keyDown',key:'Escape',code:'Escape',windowsVirtualKeyCode:27});await cmd('Input.dispatchKeyEvent',{type:'keyUp',key:'Escape',code:'Escape',windowsVirtualKeyCode:27});
 check('Escape closes and restores focus to opener',await evaluate(`!document.querySelector('#analytics-notice').open&&document.activeElement.hasAttribute('data-notice-open')`));
 await evaluate(`document.querySelector('[data-metrics-toggle]').click()`);
 for(let i=0;i<100;i++){try{if(await evaluate(`document.readyState==='complete'&&!window.dataLayer&&document.querySelector('#metrics-status').textContent.includes('desativadas')`))break;}catch{}await delay(30);}
 check('opt-out reloads with analytics disabled',requests.length===2&&await evaluate(`!window.dataLayer&&window['ga-disable-G-4SFQY2C6J3']===true&&JSON.parse(localStorage.getItem('trama.analytics.preference.v2')).disabled===true`));
 check('opt-out deletes Trama cookie, preserves portfolio cookie',await evaluate(`!document.cookie.includes('trama_ga=')&&document.cookie.includes('portfolio_ga=keep')`));
 await load('index.html',390);
 check('opt-out persists between pages',requests.length===2&&await evaluate(`!window.dataLayer&&document.querySelector('[data-metrics-toggle]').textContent==='Ativar métricas'`));
 await evaluate(`document.querySelector('[data-notice-open]').click();document.querySelector('.notice-actions [data-notice-dismiss]').click()`);
 check('dismissing notice does not override opt-out',requests.length===2&&await evaluate(`!window.dataLayer&&JSON.parse(localStorage.getItem('trama.analytics.preference.v2')).disabled===true`));
 await evaluate(`localStorage.removeItem('trama.analytics.preference.v2');localStorage.setItem('trama.analytics.consent.v1',JSON.stringify({version:1,choice:'denied',expiresAt:Date.now()+86400000}));`);await load('index.html',390);
 check('legacy refusal migrates without collecting',requests.length===2&&await evaluate(`!window.dataLayer&&JSON.parse(localStorage.getItem('trama.analytics.preference.v2')).disabled===true`));
 await evaluate(`localStorage.removeItem('trama.analytics.consent.v1');localStorage.setItem('trama.analytics.preference.v2',JSON.stringify({version:2,disabled:true,expiresAt:Date.now()-1000}));`);await load('index.html',390);await mockReady();
 check('expired preference restores configured default',requests.length===3&&await evaluate(`__gaMock.filter(x=>x[0]==='event'&&x[1]==='page_view').length===1`));
 await load('privacidade.html',390);await load('termos.html',390);
 check('privacy and terms never load analytics tag',requests.length===3&&await evaluate(`!window.dataLayer&&!document.querySelector('#trama-ga4-tag')`));
 await evaluate(`localStorage.clear()`);
 const injection=await cmd('Page.addScriptToEvaluateOnNewDocument',{source:`Storage.prototype.setItem=function(){throw new Error('Storage bloqueado no teste');};`});
 await load('index.html',390);
 check('blocked storage fails closed automatically',requests.length===3&&await evaluate(`!window.dataLayer&&document.querySelector('#analytics-notice').open&&document.querySelector('#metrics-status').textContent.includes('indisponível')`));
 check('mobile dialog has no overflow',await evaluate(`(()=>{const d=document.querySelector('#analytics-notice'),r=d.getBoundingClientRect();return document.documentElement.scrollWidth<=innerWidth+1&&d.scrollWidth<=d.clientWidth+1&&r.left>=0&&r.right<=innerWidth&&r.top>=0&&r.bottom<=innerHeight;})()`));
 await evaluate(`document.querySelector('.notice-actions [data-notice-dismiss]').click()`);
 check('notice closes with storage blocked',requests.length===3&&await evaluate(`!document.querySelector('#analytics-notice').open&&!window.dataLayer`));
 await cmd('Page.removeScriptToEvaluateOnNewDocument',{identifier:injection.identifier});
 await load('index.html',390,'https://preview.example.test/trama/');
 check('preview origin never loads GA4',requests.length===3&&await evaluate(`!window.dataLayer&&!document.querySelector('#trama-ga4-tag')`));
 const report={checks:results.length,results,errors,googleScriptsStubbed:requests.length,scope:'Navegador local com interceptação de todos os requests. Gtag simulado; zero dados enviados ao Google. Não comprova recebimento no GA4.'};
 await writeFile(root+'/reports/qa-analytics-browser.json',JSON.stringify(report,null,2));
 console.log(JSON.stringify({checks:results.length,passed:results.filter(x=>x.passed).length,errors}));
 if(errors.length)throw Error('QA analytics falhou: '+errors.join('; '));
}finally{ws?.close();cp.kill('SIGTERM');await delay(150);await rm(profile,{recursive:true,force:true});}

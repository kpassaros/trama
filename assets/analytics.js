/* GA4 basic opt-in. Antes de aceite: nenhum script/ping do Google é carregado. */
(() => {
  'use strict';
  const body=document.body;
  const id=body.dataset.analyticsId;
  if(!/^G-[A-Z0-9]+$/.test(id||''))return;
  const base=new URL(body.dataset.analyticsBase);
  const route=body.dataset.pagePath||'index.html';
  const canonical=new URL(route,base).href;
  const production=location.origin===base.origin&&location.pathname.startsWith(base.pathname);
  const key='trama.analytics.consent.v1';
  const days=Number(body.dataset.consentDays)||180;
  const banner=document.querySelector('#analytics-consent');
  const status=document.querySelector('#consent-status');
  const disableKey='ga-disable-'+id;
  let choice=null,loaded=false,pageSent=false,storageOK=true;
  let searchTimer;
  window[disableKey]=true;
  function readChoice(){
    try{
      const saved=JSON.parse(localStorage.getItem(key)||'null');
      if(saved?.version===1&&['granted','denied'].includes(saved.choice)&&Number.isFinite(saved.expiresAt)&&saved.expiresAt>Date.now())return saved.choice;
      return null;
    }catch{return null;}
  }
  function saveChoice(value){
    try{localStorage.setItem(key,JSON.stringify({version:1,choice:value,expiresAt:Date.now()+days*86400000}));storageOK=true;}
    catch{storageOK=false;}
  }
  function render(){
    banner.hidden=choice!==null;
    status.textContent=(choice==='granted'?'Analytics autorizado':choice==='denied'?'Analytics recusado':'Analytics não autorizado')+(storageOK?'':' · preferência somente neste acesso');
  }
  function cleanCookies(){
    const names=document.cookie.split(';').map(c=>c.trim().split('=')[0]).filter(n=>/^_?trama_ga(?:_|$)/.test(n));
    for(const name of names)for(const path of [base.pathname,base.pathname.replace(/\/$/,''),'/']){
      document.cookie=`${name}=; Max-Age=0; Path=${path}; SameSite=Lax; Secure`;
    }
  }
  function safeReferrer(){
    try{return document.referrer?new URL(document.referrer).origin+'/':'';}catch{return '';}
  }
  function event(name,params={}){
    if(choice!=='granted'||!loaded||window[disableKey])return;
    window.gtag('event',name,{...params,send_to:id,page_location:canonical,page_referrer:safeReferrer()});
  }
  function start(){
    if(loaded||choice!=='granted'||!production||route==='privacidade.html')return;
    // Remover parâmetros/hash livres antes de carregar código de terceiros.
    // A busca já foi aplicada pelo site.js; não transportamos seu texto ao GA4.
    try{if(location.search||location.hash)history.replaceState(null,'',location.pathname);}catch{return;}
    window[disableKey]=false;
    window.dataLayer=window.dataLayer||[];
    window.gtag=function(){window.dataLayer.push(arguments);};
    window.gtag('consent','default',{analytics_storage:'denied',ad_storage:'denied',ad_user_data:'denied',ad_personalization:'denied'});
    window.gtag('consent','update',{analytics_storage:'granted',ad_storage:'denied',ad_user_data:'denied',ad_personalization:'denied'});
    window.gtag('js',new Date());
    window.gtag('config',id,{send_page_view:false,page_location:canonical,page_referrer:safeReferrer(),allow_google_signals:false,allow_ad_personalization_signals:false,cookie_prefix:'trama',cookie_domain:'none',cookie_path:base.pathname,cookie_expires:days*86400,cookie_flags:'SameSite=Lax;Secure'});
    loaded=true;
    if(!pageSent){pageSent=true;event('page_view',{page_title:document.title});}
    const script=document.createElement('script');
    script.id='trama-ga4-tag';script.async=true;script.referrerPolicy='no-referrer';
    script.src='https://www.googletagmanager.com/gtag/js?id='+encodeURIComponent(id);
    document.head.append(script);
  }
  function focusMain(){document.querySelector('#conteudo')?.focus({preventScroll:true});}
  function choose(value){
    const wasLoaded=loaded;
    choice=value;saveChoice(value);
    if(value==='granted')start();
    else{
      window[disableKey]=true;clearTimeout(searchTimer);cleanCookies();
      document.querySelector('#trama-ga4-tag')?.remove();
    }
    render();focusMain();
    // Remover uma tag não descarrega código já executado: recarregar após revogação.
    if(value==='denied'&&wasLoaded)location.reload();
  }
  document.querySelectorAll('[data-consent-accept]').forEach(b=>b.addEventListener('click',()=>choose('granted')));
  document.querySelectorAll('[data-consent-reject]').forEach(b=>b.addEventListener('click',()=>choose('denied')));
  document.querySelectorAll('[data-consent-open]').forEach(b=>b.addEventListener('click',()=>{banner.hidden=false;banner.scrollIntoView({block:'center'});banner.querySelector('[data-consent-reject]')?.focus();}));
  document.addEventListener('trama:reference-copy',e=>{
    const ref=e.detail?.reference_id;
    if(!/^ref-[0-9]{3,}$/.test(ref||''))return;
    const card=document.getElementById(ref);
    if(card?.matches('[data-ref-card]'))event('copy_reference',{reference_id:ref,tool:card.dataset.tool});
  });
  document.addEventListener('click',e=>{
    const a=e.target.closest?.('a');if(!a)return;
    if(['portfolio','linkedin','contact'].includes(a.dataset.creatorLink)){
      event('creator_link_click',{link_id:a.dataset.creatorLink,placement:a.dataset.placement==='sidebar'?'sidebar':'footer'});return;
    }
    try{
      const target=new URL(a.href);
      const rel=target.pathname.startsWith(base.pathname)?target.pathname.slice(base.pathname.length):'';
      const match=rel.match(/^trilhas\/([a-z0-9-]+)\/([a-z0-9-]+)\.html$/);
      if(target.origin===base.origin&&match&&match[2]!=='index')event('open_lesson',{track_id:match[1],lesson_id:match[2]});
    }catch{}
  });
  for(const area of ['track','ref'])document.getElementById(area+'-search')?.addEventListener('input',()=>{
    clearTimeout(searchTimer);
    if(choice!=='granted')return;
    searchTimer=setTimeout(()=>event('search_outcome',{search_area:area==='track'?'tracks':'references',result_count:document.querySelectorAll(area==='track'?'[data-track-card]:not([hidden])':'[data-ref-card]:not([hidden])').length}),650);
  });
  window.addEventListener('storage',e=>{
    if(e.key!==key)return;
    const next=readChoice();if(next===choice)return;
    choice=next;render();
    if(next==='granted')start();
    else{window[disableKey]=true;clearTimeout(searchTimer);cleanCookies();if(loaded)location.reload();}
  });
  choice=readChoice();render();
  if(choice==='granted')start();
  else cleanCookies();
})();

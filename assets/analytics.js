/* GA4 informativo: não há aceite; Entendi só dispensa o aviso. Não valida base legal. */
(() => {
  'use strict';
  const body=document.body,id=body.dataset.analyticsId;
  if(!/^G-[A-Z0-9]+$/.test(id||'')||body.dataset.collectionMode!=='informational')return;
  const base=new URL(body.dataset.analyticsBase),route=body.dataset.pagePath||'index.html';
  const canonical=new URL(route,base).href;
  const production=location.origin===base.origin&&location.pathname.startsWith(base.pathname);
  const preferenceKey='trama.analytics.preference.v2',noticeKey='trama.analytics.notice.v1',legacyKey='trama.analytics.consent.v1';
  const days=Number(body.dataset.preferenceDays)||180,disableKey='ga-disable-'+id;
  const notice=document.querySelector('#analytics-notice'),status=document.querySelector('#metrics-status');
  const toggle=document.querySelector('[data-metrics-toggle]'),preferenceNote=document.querySelector('#notice-preference');
  let disabled=false,loaded=false,pageSent=false,storageOK=true,searchTimer;
  window[disableKey]=true;
  // Se não é possível guardar uma recusa, não iniciar coleta automática.
  try{const probe='trama.analytics.storage-check';localStorage.setItem(probe,'1');localStorage.removeItem(probe);}catch{storageOK=false;}
  function read(key){try{const x=JSON.parse(localStorage.getItem(key)||'null');return x&&Number.isFinite(x.expiresAt)&&x.expiresAt>Date.now()?x:null;}catch{return null;}}
  function save(key,value){try{localStorage.setItem(key,JSON.stringify(value));return true;}catch{storageOK=false;return false;}}
  function savedPreference(){
    const saved=read(preferenceKey);if(saved?.version===2&&typeof saved.disabled==='boolean')return saved.disabled;
    const legacy=read(legacyKey);
    if(legacy?.version===1&&legacy.choice==='denied'){
      save(preferenceKey,{version:2,disabled:true,expiresAt:legacy.expiresAt});return true;
    }
    return !storageOK;
  }
  function render(){
    status.textContent=(disabled?'Métricas desativadas':production?'Métricas de uso ativas':'Métricas somente no site publicado')+(storageOK?'':' · armazenamento indisponível');
    toggle.textContent=disabled?'Ativar métricas':'Desativar métricas';toggle.setAttribute('aria-pressed',String(disabled));
    preferenceNote.hidden=!disabled;
    preferenceNote.textContent=storageOK?'Sua preferência foi preservada: as métricas estão desativadas.':'A coleta automática está desativada porque não foi possível guardar sua preferência.';
  }
  function cleanCookies(){
    const names=document.cookie.split(';').map(c=>c.trim().split('=')[0]).filter(n=>/^_?trama_ga(?:_|$)/.test(n));
    for(const name of names)for(const path of [base.pathname,base.pathname.replace(/\/$/,''),'/'])document.cookie=`${name}=; Max-Age=0; Path=${path}; SameSite=Lax; Secure`;
  }
  function safeReferrer(){try{return document.referrer?new URL(document.referrer).origin+'/':'';}catch{return '';}}
  function event(name,params={}){
    if(disabled||!loaded||window[disableKey])return;
    window.gtag('event',name,{...params,send_to:id,page_location:canonical,page_referrer:safeReferrer()});
  }
  function start(){
    if(loaded||disabled||!production||['privacidade.html','termos.html'].includes(route))return;
    try{if(location.search||location.hash)history.replaceState(null,'',location.pathname);}catch{return;}
    window[disableKey]=false;window.dataLayer=window.dataLayer||[];
    window.gtag=function(){window.dataLayer.push(arguments);};
    // Não emitir comandos que atribuam consentimento ao fechamento do aviso.
    window.gtag('js',new Date());
    window.gtag('config',id,{send_page_view:false,page_location:canonical,page_referrer:safeReferrer(),allow_google_signals:false,allow_ad_personalization_signals:false,cookie_prefix:'trama',cookie_domain:'none',cookie_path:base.pathname,cookie_expires:days*86400,cookie_flags:'SameSite=Lax;Secure'});
    loaded=true;if(!pageSent){pageSent=true;event('page_view',{page_title:document.title});}
    const script=document.createElement('script');script.id='trama-ga4-tag';script.async=true;script.referrerPolicy='no-referrer';
    script.src='https://www.googletagmanager.com/gtag/js?id='+encodeURIComponent(id);document.head.append(script);
  }
  function stop(reload){
    window[disableKey]=true;clearTimeout(searchTimer);cleanCookies();document.querySelector('#trama-ga4-tag')?.remove();
    if(loaded&&reload)location.reload();
  }
  function dismiss(){
    save(noticeKey,{version:1,dismissed:true,expiresAt:Date.now()+days*86400000});
    if(notice.open)notice.close();
  }
  function openNotice(){if(!notice.open)notice.showModal();}
  document.querySelectorAll('[data-notice-dismiss]').forEach(b=>b.addEventListener('click',dismiss));
  document.querySelectorAll('[data-notice-open]').forEach(b=>b.addEventListener('click',openNotice));
  notice.addEventListener('cancel',e=>{e.preventDefault();dismiss();});
  toggle.addEventListener('click',()=>{
    disabled=!disabled;
    const persisted=save(preferenceKey,{version:2,disabled,expiresAt:Date.now()+days*86400000});
    render();if(disabled)stop(persisted);else start();
  });
  document.addEventListener('trama:reference-copy',e=>{
    const ref=e.detail?.reference_id;if(!/^ref-[0-9]{3,}$/.test(ref||''))return;
    const card=document.getElementById(ref);if(card?.matches('[data-ref-card]'))event('copy_reference',{reference_id:ref,tool:card.dataset.tool});
  });
  document.addEventListener('click',e=>{
    const a=e.target.closest?.('a');if(!a)return;
    if(['portfolio','linkedin','contact'].includes(a.dataset.creatorLink)){
      event('creator_link_click',{link_id:a.dataset.creatorLink,placement:a.dataset.placement==='sidebar'?'sidebar':'footer'});return;
    }
    try{const target=new URL(a.href),rel=target.pathname.startsWith(base.pathname)?target.pathname.slice(base.pathname.length):'';
      const match=rel.match(/^trilhas\/([a-z0-9-]+)\/([a-z0-9-]+)\.html$/);
      if(target.origin===base.origin&&match&&match[2]!=='index')event('open_lesson',{track_id:match[1],lesson_id:match[2]});
    }catch{}
  });
  for(const area of ['track','ref'])document.getElementById(area+'-search')?.addEventListener('input',()=>{
    clearTimeout(searchTimer);if(disabled)return;
    searchTimer=setTimeout(()=>event('search_outcome',{search_area:area==='track'?'tracks':'references',result_count:document.querySelectorAll(area==='track'?'[data-track-card]:not([hidden])':'[data-ref-card]:not([hidden])').length}),650);
  });
  window.addEventListener('storage',e=>{
    if(e.key!==null&&e.key!==preferenceKey&&e.key!==legacyKey)return;
    const next=savedPreference();if(next===disabled)return;disabled=next;render();if(disabled)stop(true);else start();
  });
  disabled=savedPreference();render();if(disabled)cleanCookies();else start();
  const savedNotice=read(noticeKey);if(savedNotice?.version!==1||savedNotice.dismissed!==true)openNotice();
})();

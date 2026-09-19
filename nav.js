/* Navigation markup is rendered from _data/navigation.json by Eleventy. */
(function(){
  function closeMenu(restore){
    const menu=document.getElementById('mobileMenu'), button=document.querySelector('.hamburger');
    if(menu) menu.classList.remove('open');
    if(button){button.setAttribute('aria-expanded','false');button.setAttribute('aria-label','Open navigation');if(restore)button.focus();}
  }
  window.toggleMobileNav=function(){
    const menu=document.getElementById('mobileMenu'),button=document.querySelector('.hamburger');
    if(!menu)return;
    const open=menu.classList.toggle('open');
    menu.removeAttribute('aria-hidden');
    button.setAttribute('aria-expanded',String(open));button.setAttribute('aria-label',open?'Close navigation':'Open navigation');
  };
  document.addEventListener('keydown',function(e){
    if(e.key!=='Escape')return;
    const detail=e.target.closest('#site-nav details[open]');
    if(detail){detail.open=false;detail.querySelector('summary').focus();return;}
    if(document.getElementById('mobileMenu')?.classList.contains('open'))closeMenu(true);
  });
  document.addEventListener('click',function(e){
    document.querySelectorAll('#site-nav details[open]').forEach(d=>{if(!d.contains(e.target))d.open=false;});
    if(!e.target.closest('#site-nav'))closeMenu(false);
    if(e.target.closest('#mobileMenu a'))closeMenu(false);
  });
  document.querySelectorAll('#site-nav details').forEach(d=>d.addEventListener('toggle',()=>{
    if(d.open)document.querySelectorAll('#site-nav details[open]').forEach(other=>{if(other!==d)other.open=false;});
  }));
  const mq=matchMedia('(min-width: 901px)');mq.addEventListener('change',()=>closeMenu(false));
})();

/* Keyboard parity and focus containment for optional reading tools. */
(function(){
 document.querySelectorAll('.prov-name,.prov-num[onclick]').forEach(el=>{
  el.tabIndex=0;el.setAttribute('role','button');
  if(el.classList.contains('prov-name'))el.setAttribute('aria-label',el.textContent.trim()+': optional AI rationale');
  el.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();el.click();}});
 });
 for(const [id,closeName] of [['navResults','closeNav'],['searchOverlay','closeSearch'],['annPanel','closeAnnotation']]){
  const panel=document.getElementById(id);if(!panel)continue;
  let wasOpen=false,trigger=null;
  const visible=()=>id==='annPanel'?getComputedStyle(panel).display!=='none':panel.classList.contains('open');
  function sync(){
   const open=visible();panel.inert=!open;panel.setAttribute('aria-hidden',String(!open));
   if(open&&!wasOpen){trigger=document.activeElement;panel.setAttribute('aria-modal','true');panel.querySelector('input,button,a[href]')?.focus();}
   if(!open&&wasOpen&&trigger?.isConnected)trigger.focus();
   wasOpen=open;
  }
  new MutationObserver(sync).observe(panel,{attributes:true,attributeFilter:['class','style']});sync();
  panel.addEventListener('keydown',e=>{
   if(e.key==='Escape'){e.preventDefault();window[closeName]?.();return;}
   if(e.key!=='Tab')return;
   const items=[...panel.querySelectorAll('input,button,a[href],[tabindex="0"]')].filter(el=>!el.disabled&&el.getClientRects().length);
   if(!items.length)return;const first=items[0],last=items.at(-1);
   if(e.shiftKey&&document.activeElement===first){e.preventDefault();last.focus();}
   else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first.focus();}
  });
 }
})();

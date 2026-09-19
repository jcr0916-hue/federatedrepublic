/* Progressive enhancement: full content remains readable without JavaScript. */
(function(){
 const form=document.getElementById('archiveFilters');
 if(form){
  form.hidden=false;
  const rows=[...document.querySelectorAll('.archive-item')], more=document.getElementById('archiveMore');let limit=24;
  const names=['q','type','file','place'];
  function restore(){const params=new URLSearchParams(location.search);names.forEach(n=>form.elements[n].value=params.get(n)||'');}
  function filter(updateURL){
   const q=form.elements.q.value.toLowerCase().trim(),type=form.elements.type.value,arc=form.elements.file.value,place=form.elements.place.value;
   const matches=rows.filter(r=>(!q||(r.textContent+' '+r.dataset.refs).toLowerCase().includes(q))&&(!type||(type==='civic'?r.dataset.civic==='true':r.dataset.type===type))&&(!arc||r.dataset.files.split('|').includes(arc))&&(!place||r.dataset.places.split('|').includes(place)));
   const visible=new Set(matches.slice(0,limit));rows.forEach(r=>r.hidden=!visible.has(r));
   document.getElementById('archiveCount').textContent=`${matches.length} matching records · ${Math.min(limit,matches.length)} shown · newest first`;
   document.getElementById('archiveEmpty').hidden=matches.length>0;more.hidden=matches.length<=limit;
   if(updateURL){const params=new URLSearchParams();names.forEach(n=>{if(form.elements[n].value)params.set(n,form.elements[n].value);});history.replaceState(null,'',location.pathname+(params.size?'?'+params:''));}
  }
  restore();filter(false);
  form.addEventListener('submit',e=>e.preventDefault());form.addEventListener('input',()=>{limit=24;filter(true);});
  form.addEventListener('reset',()=>setTimeout(()=>{limit=24;filter(true);},0));
  more.addEventListener('click',()=>{const firstHidden=rows.filter(r=>r.hidden);limit+=24;filter(false);const revealed=firstHidden.find(r=>!r.hidden);revealed?.querySelector('a')?.focus();});
  window.addEventListener('popstate',()=>{restore();limit=24;filter(false);});
 }
 const historySearch=document.getElementById('historySearch');
 if(historySearch){historySearch.hidden=false;historySearch.querySelector('input').addEventListener('input',e=>{let count=0;document.querySelectorAll('.hist-entry').forEach(entry=>{entry.hidden=!entry.textContent.toLowerCase().includes(e.target.value.toLowerCase());if(!entry.hidden)count++;});document.getElementById('historyCount').textContent=count+' matching entries';});}
})();
// Printing an archive includes complete entries, then restores the reader’s disclosure state.
(function(){let closed=[];addEventListener('beforeprint',()=>{closed=[...document.querySelectorAll('details.hist-entry:not([open])')];closed.forEach(d=>d.open=true);});addEventListener('afterprint',()=>closed.forEach(d=>d.open=false));})();
(function(){function revealTarget(){const target=document.getElementById(decodeURIComponent(location.hash.slice(1)));if(target?.matches('details.hist-entry'))target.open=true;}addEventListener('hashchange',revealTarget);revealTarget();})();

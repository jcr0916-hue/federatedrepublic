// Disposable callback relay only. No credentials, storage, minting or administration.
const ISSUER='https://newsroom-current-issuer-20261109.jcr0916.workers.dev';
const escape=s=>s.replace(/[&<>"']/g,c=>'&#'+c.charCodeAt(0)+';');
export default {fetch(request){
 const u=new URL(request.url),p=u.searchParams;
 if(request.method!=='GET'||u.pathname!=='/callback'||[...p.keys()].length!==3||
    ['code','state','iss'].some(k=>p.getAll(k).length!==1)||p.get('iss')!==ISSUER||
    !/^nr1c\.[a-f0-9]{64}\.[a-f0-9]{64}$/.test(p.get('code')||'')||
    !/^[A-Za-z0-9_-]{40,100}$/.test(p.get('state')||''))return new Response(null,{status:400});
 const target=new URL('http://127.0.0.1:18765/callback');target.search=u.search;
 return new Response('<!doctype html><meta charset="utf-8"><title>Finish isolated test</title><a href="'+escape(target.href)+'">Finish authorization on this Mac</a>',{
  headers:{'Content-Type':'text/html; charset=utf-8','Cache-Control':'no-store','Pragma':'no-cache','Referrer-Policy':'no-referrer',
   'X-Content-Type-Options':'nosniff','Content-Security-Policy':"default-src 'none'; frame-ancestors 'none'; base-uri 'none'"}});
}};

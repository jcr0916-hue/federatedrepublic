"""Private loopback receiver for NEW PR319 disposable grants only; no token output.
Run from repository root after the documented new App/S3 setup and coordinated ingress.
Each invocation tests one fresh human browser consent. Repeat once with other exercise.
"""
import argparse, base64, hashlib, hmac, http.server, json, os, secrets, stat, threading, time
import urllib.error, urllib.parse, urllib.request
from pathlib import Path
ROOT=Path(__file__).resolve().parents[3]
PRIVATE=ROOT/'.private'
CREDS=PRIVATE/'current-credentials.json'
PENDING=PRIVATE/'current-grant-pending.json'
ISSUER='https://newsroom-current-issuer-20261109.jcr0916.workers.dev'
AUDIENCE='https://newsroom-current-resource-20261109.jcr0916.workers.dev/mcp'
REDIRECT='https://newsroom-current-client-20261109.jcr0916.workers.dev/callback'
CLIENT='newsroom-current-client-20261109'
VALIDATOR='newsroom-current-validator-20261109'
PORT=18765
FIXTURE='submissions/korda/2026-11-09/33333333-3333-4333-8333-333333333333.json'
class NoRedirect(urllib.request.HTTPRedirectHandler):
    def redirect_request(self,*a,**kw): return None
OPENER=urllib.request.build_opener(NoRedirect)
def save_private(path,value):
    flags=os.O_WRONLY|os.O_CREAT|os.O_TRUNC|getattr(os,'O_NOFOLLOW',0)
    fd=os.open(path,flags,0o600)
    with os.fdopen(fd,'w') as f:
        os.fchmod(f.fileno(),0o600);json.dump(value,f);f.flush();os.fsync(f.fileno())
def send(url,fields=None,basic=None,bearer=None,rpc=None):
    if urllib.parse.urlparse(url).netloc not in {urllib.parse.urlparse(ISSUER).netloc,urllib.parse.urlparse(AUDIENCE).netloc}:
        raise ValueError('unexpected destination')
    headers={'User-Agent':'Mozilla/5.0','Accept':'application/json'}
    data=None
    if fields is not None: data=urllib.parse.urlencode(fields).encode();headers['Content-Type']='application/x-www-form-urlencoded'
    if rpc is not None: data=json.dumps(rpc).encode();headers['Content-Type']='application/json'
    if basic: headers['Authorization']='Basic '+base64.b64encode((basic[0]+':'+basic[1]).encode()).decode()
    if bearer: headers['Authorization']='Bearer '+bearer
    req=urllib.request.Request(url,data=data,headers=headers)
    try:
        with OPENER.open(req,timeout=15) as r:
            body = r.read(65536)
            if r.status == 200 and url == ISSUER + '/revoke' and not body:
                return r.status, {}
            return r.status, json.loads(body)
    except urllib.error.HTTPError as e:
        try: result=json.loads(e.read(65536))
        except Exception: result={}
        return e.code,result

def valid_token_pair(tokens):
    return isinstance(tokens, dict) and all(
        isinstance(tokens.get(key), str) and tokens[key]
        for key in ('access_token', 'refresh_token')
    )

def main():
    parser=argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--exercise',choices=['replay','revoke','cleanup'],required=True)
    args=parser.parse_args()
    if args.exercise != 'cleanup' and PENDING.exists():
        raise SystemExit('Unresolved prior disposable grant requires cleanup before a fresh browser run.')
    if not CREDS.is_file() or CREDS.is_symlink() or stat.S_IMODE(CREDS.stat().st_mode)!=0o600:
        raise SystemExit('Exact task-private credential file with mode 0600 required.')
    creds=json.loads(CREDS.read_text())
    if any(creds.get(k)!=v for k,v in {'issuer':ISSUER,'audience':AUDIENCE,'client_id':CLIENT,'validator_id':VALIDATOR,'redirect_uri':REDIRECT}.items()):
        raise SystemExit('Private credentials do not match this NEW disposable environment.')
    state=secrets.token_urlsafe(32);verifier=secrets.token_urlsafe(48);start_nonce=secrets.token_urlsafe(32)
    local_host='127.0.0.1:'+str(PORT);local_origin='http://'+local_host
    challenge=base64.urlsafe_b64encode(hashlib.sha256(verifier.encode()).digest()).decode().rstrip('=')
    query=urllib.parse.urlencode({'response_type':'code','client_id':CLIENT,'redirect_uri':REDIRECT,'scope':'newsroom:read',
        'resource':AUDIENCE,'state':state,'code_challenge':challenge,'code_challenge_method':'S256'})
    checks=[];known=[];started=False;claimed=False;lock=threading.Lock();finished=threading.Event();born=time.monotonic()
    client=(CLIENT,creds['oauth_client_secret']);validator=(VALIDATOR,creds['resource_validator_secret'])
    def check(name,ok):
        checks.append({'check':name,'pass':bool(ok)})
        if not ok: raise ValueError(name)
    def active(token):
        s,j=send(ISSUER+'/introspect',{'token':token,'token_type_hint':'access_token'},basic=validator)
        if s != 200 or not isinstance(j, dict) or type(j.get('active')) is not bool:
            raise ValueError('validator response unavailable')
        if j['active'] and (j.get('aud') != AUDIENCE or j.get('scope') != 'newsroom:read'):
            raise ValueError('validator returned a different audience or scope')
        return j['active']
    def record(tokens):
        if not valid_token_pair(tokens):
            raise ValueError('invalid token response')
        known.append(tokens);save_private(PENDING,{'uncertain':True,'newDisposableOnly':True,'knownTokens':known})
    def refresh(token): return send(ISSUER+'/token',{'grant_type':'refresh_token','refresh_token':token,'resource':AUDIENCE},basic=client)
    def refresh_denied(token):
        status, response = refresh(token)
        if status == 200:
            record(response)
        return status == 400 and isinstance(response, dict) and response.get('error') == 'invalid_grant'
    def revoke(token):
        return send(ISSUER+'/revoke',{'token':token,'token_type_hint':'refresh_token'},basic=client)[0]
    def confirm_cleanup():
        clean = bool(known)
        for tokens in tuple(known):
            try:
                if revoke(tokens['refresh_token']) != 200 or active(tokens['access_token']):
                    clean = False
                    continue
                if not refresh_denied(tokens['refresh_token']):
                    clean = False
            except Exception:
                clean = False
        return clean
    def finish_report(clean):
        checks.append({'check':'all-known-new-grants-confirmed-inactive','pass':clean})
        if clean:
            PENDING.unlink(missing_ok=True)
        report={'schemaVersion':1,'sourceCommit':'d7c65bea969be9bebe541a7bb1e069928e12c60c','exercise':args.exercise,
            'success':all(c['pass'] for c in checks),'checks':checks,'secretsDisplayed':False,'unresolvedGrant':not clean}
        target=ROOT/'workers/newsroom/release'/('current-mac-'+args.exercise+'-'+time.strftime('%Y%m%dT%H%M%SZ',time.gmtime())+'.json')
        target.write_text(json.dumps(report,indent=2)+'\n')
        print(json.dumps(report,indent=2))
        finished.set()

    if args.exercise == 'cleanup':
        if not PENDING.is_file() or PENDING.is_symlink() or stat.S_IMODE(PENDING.stat().st_mode) != 0o600:
            raise SystemExit('Cleanup requires the receiver’s mode-0600 pending grant file.')
        pending = json.loads(PENDING.read_text())
        tokens = pending.get('knownTokens') if isinstance(pending, dict) else None
        if not isinstance(tokens, list) or not tokens or not all(map(valid_token_pair, tokens)) or pending.get('newDisposableOnly') is not True:
            raise SystemExit('The pending file does not identify complete disposable token pairs.')
        known.extend(tokens)
        clean = confirm_cleanup()
        finish_report(clean)
        if not clean:
            raise SystemExit(1)
        return

    def rpc(token,name,arguments):
        return send(AUDIENCE,bearer=token,rpc={'jsonrpc':'2.0','id':1,'method':'tools/call','params':{'name':name,'arguments':arguments}})
    def exercise(code):
        save_private(PENDING,{'uncertain':True,'newDisposableOnly':True,'knownTokens':[]})
        try:
            s,a=send(ISSUER+'/token',{'grant_type':'authorization_code','code':code,'redirect_uri':REDIRECT,'code_verifier':verifier,'resource':AUDIENCE},basic=client)
            if s==200: record(a)
            check('real-browser-code-exchange',s==200 and a.get('expires_in')==900)
            check('new-access-active',active(a['access_token']))
            s,j=rpc(a['access_token'],'newsroom_list',{'desk':'korda','limit':1})
            check('real-s3-list',s==200 and j.get('result',{}).get('isError') is not True and any(FIXTURE in c.get('text','') for c in j.get('result',{}).get('content',[])))
            s,j=rpc(a['access_token'],'newsroom_read',{'key':FIXTURE})
            try: item=json.loads(j['result']['content'][0]['text'])
            except Exception: item={}
            check('real-s3-exact-noncanonical-read',s==200 and item.get('key')==FIXTURE and item.get('body')=='Disposable noncanonical acceptance only' and item.get('nonCanonical') is True)
            s,j=rpc(a['access_token'],'newsroom_submit',{})
            check('write-tool-denied',s==403)
            s,b=refresh(a['refresh_token'])
            if s==200: record(b)
            check('refresh-rotation',s==200 and b['access_token']!=a['access_token'] and b['refresh_token']!=a['refresh_token'])
            check('predecessor-access-inactive',not active(a['access_token']))
            check('successor-access-active',active(b['access_token']))
            if args.exercise=='replay':
                check('spent-refresh-rejected',refresh_denied(a['refresh_token']))
            else:
                check('voluntary-revocation-accepted',revoke(b['refresh_token'])==200)
            check('successor-access-inactive',not active(b['access_token']))
            check('successor-refresh-denied',refresh_denied(b['refresh_token']))
        except Exception: checks.append({'check':'exercise-failed-redacted','pass':False})
        finally:
            finish_report(confirm_cleanup())
    class Handler(http.server.BaseHTTPRequestHandler):
        def log_message(self,*a): pass
        def valid_context(self):
            if self.headers.get_all('Host')!=[local_host]:
                self.send_error(400,'Use the exact local receiver address printed in Terminal.');return False
            if time.monotonic()-born>600:
                self.send_error(410,'This receiver window has expired. Coordinate ingress closure before retrying.');return False
            return True
        def do_POST(self):
            nonlocal started
            if not self.valid_context():return
            if self.path!='/start':self.send_error(400,'Unexpected local start path.');return
            if self.headers.get_all('Origin')!=[local_origin]:
                self.send_error(403,'Begin authorization from the local receiver page.');return
            lengths=self.headers.get_all('Content-Length',[])
            if self.headers.get('Transfer-Encoding') or len(lengths)!=1 or not lengths[0].isdecimal():
                self.send_error(400,'Invalid local start request.');return
            if len(lengths[0])>3:self.send_error(413,'Local start request is too large.');return
            length=int(lengths[0])
            if length>512:self.send_error(413,'Local start request is too large.');return
            if self.headers.get('Content-Type','').split(';',1)[0]!='application/x-www-form-urlencoded':
                self.send_error(400,'Invalid local start form.');return
            try:
                self.connection.settimeout(5)
                body=self.rfile.read(length)
                if len(body)!=length:raise ValueError('incomplete form')
                fields=urllib.parse.parse_qs(body.decode('ascii'),keep_blank_values=True,strict_parsing=True)
            except (ValueError,UnicodeError,TimeoutError,OSError):
                self.send_error(400,'Invalid local start form.');return
            if set(fields)!={'start_nonce'} or len(fields['start_nonce'])!=1:
                self.send_error(400,'Invalid local start fields.');return
            if not fields['start_nonce'][0].isascii() or not hmac.compare_digest(fields['start_nonce'][0],start_nonce):
                self.send_error(403,'This start page does not belong to the running receiver.');return
            with lock:
                if started:self.send_error(409,'Authorization already started. Continue in the existing authorization tab.');return
                started=True
            self.send_response(303);self.send_header('Location',ISSUER+'/authorize?'+query)
            self.send_header('Cache-Control','no-store');self.send_header('Referrer-Policy','no-referrer')
            self.send_header('Content-Length','0');self.end_headers()
        def do_GET(self):
            nonlocal claimed
            if not self.valid_context():return
            u=urllib.parse.urlsplit(self.path)
            if self.path=='/start':
                if started:self.send_error(409,'Authorization already started. Continue in the existing authorization tab.');return
                body=('''<!doctype html><html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Begin disposable newsroom authorization</title><h1>Begin newsroom authorization</h1>
<p>Keep Terminal running. Continue only when the disposable test window is open.</p>
<form method="post" action="/start"><input type="hidden" name="start_nonce" value="'''+start_nonce+'''">
<button type="submit">Begin authorization</button></form>
<p>Then complete Turnstile, GitHub approval and newsroom consent. Finish using the button that returns to this Mac.</p></html>''').encode()
                self.send_response(200);self.send_header('Content-Type','text/html; charset=utf-8')
                # Form navigation needs its real local Origin; the 303 below still strips cross-origin referrers.
                self.send_header('Cache-Control','no-store');self.send_header('Referrer-Policy','same-origin')
                self.send_header('Content-Security-Policy',"default-src 'none'; form-action 'self' "+ISSUER+"; frame-ancestors 'none'; base-uri 'none'")
                self.send_header('X-Frame-Options','DENY');self.send_header('X-Content-Type-Options','nosniff')
                self.send_header('Content-Length',str(len(body)));self.end_headers();self.wfile.write(body);return
            p=urllib.parse.parse_qs(u.query,keep_blank_values=True)
            if u.path!='/callback' or set(p)!={'code','state','iss'} or any(len(v)!=1 for v in p.values()) or not started or finished.is_set() or p['iss'][0]!=ISSUER or not hmac.compare_digest(p['state'][0],state):
                self.send_error(400);return
            import re
            if not re.fullmatch(r'nr1c\.[a-f0-9]{64}\.[a-f0-9]{64}',p['code'][0]):self.send_error(400);return
            with lock:
                if claimed:self.send_error(409);return
                claimed=True
            self.send_response(200);self.send_header('Cache-Control','no-store');self.send_header('Referrer-Policy','no-referrer');self.end_headers()
            exercise(p['code'][0]);self.wfile.write(b'Isolated test finished. Check the private Terminal result; no token values are displayed.')
    server=http.server.ThreadingHTTPServer(('127.0.0.1',PORT),Handler);server.timeout=1
    print('Open '+local_origin+'/start in one top-level browser tab. When Work confirms the test window is open, click Begin authorization. Complete Turnstile, GitHub and consent, then click Finish authorization on this Mac. Do not copy callback URLs into chat.')
    try:
        while not finished.is_set() and time.monotonic()-born<600:server.handle_request()
    finally:server.server_close()
    if not finished.is_set():raise SystemExit('Browser window expired; listener stopped. Coordinate ingress closure before retrying.')
if __name__=='__main__':main()

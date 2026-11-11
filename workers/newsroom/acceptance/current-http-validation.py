"""Nonsecret HTTP checks; only the two explicitly named disposable PR318 hosts."""
import hashlib, json, urllib.request, urllib.parse, urllib.error
ISSUER='https://newsroom-current-issuer-20261109.jcr0916.workers.dev'
RESOURCE='https://newsroom-current-resource-20261109.jcr0916.workers.dev'
REDIRECT='https://newsroom-current-client-20261109.jcr0916.workers.dev/callback'
class NoRedirect(urllib.request.HTTPRedirectHandler):
    def redirect_request(self,*args,**kwargs): return None
opener=urllib.request.build_opener(NoRedirect)
def request(url, data=None, headers=None):
    h={'User-Agent':'Mozilla/5.0','Accept':'application/json',**(headers or {})}
    req=urllib.request.Request(url,data=data,headers=h)
    try:
        with opener.open(req,timeout=12) as r: return r.status,r.headers,r.read(65536)
    except urllib.error.HTTPError as r: return r.code,r.headers,r.read(65536)
checks=[]
def check(name,value): checks.append({'check':name,'pass':bool(value)})
def form(fields): return urllib.parse.urlencode(fields).encode()
try:
    s,h,b=request(ISSUER+'/.well-known/oauth-authorization-server');d=json.loads(b)
    check('current-issuer-discovery',s==200 and d.get('issuer')==ISSUER and 'S256' in d.get('code_challenge_methods_supported',[]))
    s,h,b=request(RESOURCE+'/.well-known/oauth-protected-resource/mcp');d=json.loads(b)
    check('current-resource-discovery',s==200 and d.get('resource')==RESOURCE+'/mcp' and d.get('authorization_servers')==[ISSUER])
    rpc=json.dumps({'jsonrpc':'2.0','id':1,'method':'tools/list'}).encode()
    for name,headers in [('missing-bearer-denied',{}),('forged-bearer-denied',{'Authorization':'Bearer invalid-test-token'})]:
        s,h,b=request(RESOURCE+'/mcp',rpc,{'Content-Type':'application/json',**headers})
        check(name,s==401 and json.loads(b).get('error')=='invalid_token' and 'resource_metadata=' in h.get('WWW-Authenticate',''))
    for path,name,expected in [('/oauth/callback?state=forged&code=forged','forged-callback-denied',403),('/oauth/callback?state=forged&code=forged&iss=https%3A%2F%2Foutside.invalid','foreign-provider-issuer-denied',400),('/authorize','incomplete-authorization-denied',400)]:
        s,h,b=request(ISSUER+path);check(name,s==expected)
    import base64
    challenge=base64.urlsafe_b64encode(hashlib.sha256(b'current-private-http-probe-verifier-ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789').digest()).decode().rstrip('=')
    p=urllib.parse.urlencode({'response_type':'code','client_id':'newsroom-current-client-20261109','redirect_uri':REDIRECT,'scope':'newsroom:read','resource':RESOURCE+'/mcp','state':'synthetic-http-only-not-a-real-grant','code_challenge':challenge,'code_challenge_method':'S256'})
    s,h,b=request(ISSUER+'/authorize?'+p);cookie=h.get('Set-Cookie','')
    check('dedicated-real-widget-present',s==200 and b'0x4AAAAAAF6ssiEhk1gj8QlU' in b and b'newsroom_login' in b)
    check('secure-admission-cookie-preserved',all(x in cookie for x in ['__Host-newsroom-admission=','Secure','HttpOnly','SameSite=Lax','Max-Age=300','Path=/']))
    check('challenge-csp-preserved',"frame-ancestors 'none'" in h.get('Content-Security-Policy','') and 'challenges.cloudflare.com' in h.get('Content-Security-Policy',''))
    check('no-store-and-no-referrer',h.get('Cache-Control')=='no-store' and h.get('Referrer-Policy')=='no-referrer')
    s,h,b=request(ISSUER+'/authorize',form({'authorization':p,'cf-turnstile-response':'XXXX.DUMMY.TOKEN.XXXX'}),{'Origin':ISSUER,'Content-Type':'application/x-www-form-urlencoded','Cookie':cookie.split(';')[0]})
    check('current-backend-dummy-turnstile-denied',s==403 and json.loads(b).get('error')=='challenge_rejected')
    s,h,b=request(ISSUER+'/authorize',form({'authorization':p,'cf-turnstile-response':'XXXX.DUMMY.TOKEN.XXXX'}),{'Origin':'https://outside.invalid','Content-Type':'application/x-www-form-urlencoded'})
    check('foreign-origin-denied',s==403 and json.loads(b).get('error')=='origin_not_allowed')
    for path in ['/token','/introspect','/revoke']:
        s,h,b=request(ISSUER+path,form({'token':'invalid-test-token'}),{'Content-Type':'application/x-www-form-urlencoded'})
        check('unauthenticated-'+path[1:]+'-denied',s==401 and json.loads(b).get('error')=='invalid_client')
except Exception as e:
    checks.append({'check':'transport-or-response-failure-redacted','pass':False,'kind':type(e).__name__})
print(json.dumps({'schemaVersion':1,'sourceCommit':'d7c65bea969be9bebe541a7bb1e069928e12c60c','success':bool(checks) and all(x['pass'] for x in checks),'checks':checks,'limitations':['No real GitHub/browser consent','Dummy-token denial is not positive Turnstile or secret-validity proof','No successful S3 read or OAuth grant lifecycle in this run']},indent=2))

// Synthetic transport checks for the fixed, credential-free callback relay.
import assert from 'node:assert/strict';
import relay from './current-callback-relay.js';
const origin='https://newsroom-current-client-20261109.jcr0916.workers.dev';
const p=new URLSearchParams({code:'nr1c.'+'a'.repeat(64)+'.'+'b'.repeat(64),state:'c'.repeat(43),iss:'https://newsroom-current-issuer-20261109.jcr0916.workers.dev'});
let response=relay.fetch(new Request(origin+'/callback?'+p));
assert.equal(response.status,200);
assert.equal(response.headers.get('Referrer-Policy'),'no-referrer');
assert.equal(response.headers.get('Cache-Control'),'no-store');
assert.ok((await response.text()).includes('http://127.0.0.1:18765/callback?'));
for(const [path,query] of [['/other',p.toString()],['/callback',p+'&code=duplicate'],['/callback',p+'&extra=1'],['/callback',new URLSearchParams({...Object.fromEntries(p),iss:'https://outside.invalid'})],['/callback',new URLSearchParams({...Object.fromEntries(p),code:'not-a-code'})]])
 assert.equal(relay.fetch(new Request(origin+path+'?'+query)).status,400);
assert.equal(relay.fetch(new Request(origin+'/callback?'+p,{method:'POST'})).status,400);
console.log('Callback relay validation: valid private loopback link and 6 malformed/foreign requests checked.');

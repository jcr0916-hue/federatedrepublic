import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
const script=fs.readFileSync(new URL('../related-rail.js',import.meta.url),'utf8');
test('arrows and keyboard move one whole card including its gap, respecting end bounds and reduced motion',()=>{
 const events={},buttons={prev:{addEventListener:(type,fn)=>events.prev=fn},next:{addEventListener:(type,fn)=>events.next=fn}};
 const track={children:[{getBoundingClientRect:()=>({left:10})},{getBoundingClientRect:()=>({left:326})}],clientWidth:932,scrollWidth:1880,scrollLeft:0,
  scrollTo(options){this.scrollLeft=options.left;this.last=options;},addEventListener:(type,fn)=>events[type]=fn};
 const rail={dataset:{},classList:{add(){},toggle(){}},querySelector:s=>s.includes('track')?track:s.includes('prev')?buttons.prev:buttons.next};
 vm.runInNewContext(script,{document:{querySelectorAll:()=>[rail]},window:{addEventListener:(type,fn)=>events[type]=fn,matchMedia:()=>({matches:true})}});
 assert.equal(buttons.prev.disabled,true);events.next();assert.equal(track.scrollLeft,316);assert.equal(track.last.behavior,'auto');
 events.next();assert.equal(track.scrollLeft,632);events.next();events.next();assert.equal(track.scrollLeft,948);
 events.scroll();assert.equal(buttons.next.disabled,true);
 events.prev();assert.equal(track.scrollLeft,632);
 let prevented=false;events.keydown({target:track,key:'ArrowLeft',preventDefault(){prevented=true;}});
 assert.equal(prevented,true);assert.equal(track.scrollLeft,316);
});

import test from 'node:test';
import assert from 'node:assert/strict';
import {fictionalDate,isAfter,publishedChronology,clockWarnings,validateRegistries,registryWarnings,clockDashboard} from '../lib/world-chronology.mjs';
const record={data:{worldId:'source',worldDate:'13.12',worldKind:'news',worldArcs:[],worldJurisdictions:[]}};
const clock=(timing,extra={})=>({id:'test-clock',title:'Test obligation',status:'scheduled',trigger:{description:'Established process'},summary:'Pending',nextAction:'Publish the required notice.',sources:['source'],timing,...extra});
test('month-only history remains imprecise; exact days are optional',()=>{
 assert.deepEqual(fictionalDate('13.12'),{year:13,month:12});
 assert.equal(publishedChronology([record])[0].date.day,undefined);
 assert.equal(isAfter('14.02',{year:14,month:2,day:10}),false);
 assert.equal(isAfter({year:14,month:2,day:11},{year:14,month:2,day:10}),true);
 assert.equal(isAfter('14.03',{year:14,month:2}),true);
 for(const date of ['13.13','13.00',{year:13,month:1,day:0}])assert.throws(()=>fictionalDate(date));
});
test('crossing a deadline identifies clock and action; within a window does not warn',()=>{
 const c=clock({kind:'window',start:{year:14,month:1},end:{year:14,month:3}});
 assert.deepEqual(clockWarnings('14.02',[c]),[]);assert.deepEqual(clockWarnings('14.03',[c]),[]);
 assert.match(clockWarnings('14.04',[c])[0],/crosses 1.*test-clock.*Publish the required notice/);
 const exact=clock({kind:'deadline',due:{year:14,month:2,day:10}});
 assert.deepEqual(clockWarnings({year:14,month:2,day:10},[exact]),[]);
 assert.equal(clockWarnings({year:14,month:2,day:11},[exact]).length,1);
 assert.deepEqual(clockWarnings('14.12',[{...c,status:'published'},{...c,status:'planned'}]),[]);
});
test('season and relative clocks report uncertainty rather than invented deadlines',()=>{
 const seasonal=clock({kind:'window',year:14,season:'spring'});
 assert.deepEqual(clockWarnings('13.12',[seasonal]),[]);
 assert.match(clockWarnings('14.02',[seasonal])[0],/requires clock review/);
 assert.match(clockWarnings('15.01',[seasonal])[0],/crosses/);
 const relative=clock({kind:'relative',amount:87,unit:'active-days',reviewAfter:{year:13,month:12}},{trigger:{description:'Stay ended',date:{year:13,month:12,day:26}}});
 assert.deepEqual(clockWarnings('13.12',[relative]),[]);
 assert.match(clockWarnings('14.01',[relative])[0],/requires clock review/);
 assert.deepEqual(clockWarnings('99.01',[clock({kind:'none'}),clock({kind:'unscheduled'})]),[]);
});
test('planning never advances the canonical frontier; invalid registry states block',()=>{
 const e={id:'editorial-intention',date:{year:99,month:1},stream:'editorial',type:'idea',status:'planned',sources:['source']};
 const status='**Current published frontier:** Year 13, Month 12\n'+clockDashboard([]);
 assert.deepEqual(registryWarnings([record],{events:[e],clocks:[]},status),[]);
 assert.throws(()=>validateRegistries([record],[{...e,sources:['missing']}],[]),/unknown source/);
 assert.throws(()=>validateRegistries([record],[e,e],[]),/duplicate/);
 assert.throws(()=>validateRegistries([record],[],[clock({kind:'window',start:{year:14,month:3},end:{year:14,month:1}})]),/reversed/);
 assert.match(registryWarnings([record],{events:[],clocks:[]},status.replace('Month 12','Month 11'))[0],/frontier/);
 assert.match(registryWarnings([record],{events:[],clocks:[]},'Human notes')[1],/dashboard/);
});

test('dashboard includes structured deadlines and changes when their bounds change',()=>{
 const c=clock({kind:'deadline',due:{year:14,month:2}});
 const before=clockDashboard([c]);assert.match(before,/Due 14.02/);
 c.timing.due.month=3;assert.notEqual(clockDashboard([c]),before);
 const bad=clock({kind:'deadline',due:{year:13,month:1}},{trigger:{description:'Later trigger',date:{year:14,month:1}}});
 assert.throws(()=>validateRegistries([record],[],[bad]),/precedes trigger/);
});

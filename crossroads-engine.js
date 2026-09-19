/* Deterministic rules only. All player-visible narrative lives in authored game data. */
(function(root){
  'use strict';
  const games = ['korda-crossroads.json', 'thoss-crossroads.json'];
  function gameFile(search){
    const name = new URLSearchParams(search).get('game') || games[0];
    if(!games.includes(name)) throw Error('Unknown game. Choose Korda or Thoss below.');
    return name;
  }
  function initialize(data, role){
    const selected = data.roles?.find(r=>r.id===role);
    if(data.roles?.length && !selected) throw Error('Choose a delegate before starting.');
    return {role: selected?.id || null, meters: Object.fromEntries(data.meters.map(m=>[m.id,selected?.meters?.[m.id] ?? m.start])),
      state:{...data.initialState,...selected?.state}, lastFragmentId:null, visited:[]};
  }
  function available(fragment, run){
    if(!fragment || (fragment.role && fragment.role!==run.role)) return false;
    const req=fragment.requires;
    if(req?.anyState && !Object.entries(req.anyState).some(([k,v])=>run.state[k]===v)) return false;
    return true;
  }
  function fragments(scene,run){ return Object.fromEntries(Object.entries(scene.fragments).filter(([,f])=>available(f,run))); }
  function deltas(data,run,values={}){
    for(const m of data.meters) if(Number.isFinite(values[m.id])) run.meters[m.id]=Math.max(m.min,Math.min(m.max,run.meters[m.id]+values[m.id]));
    if(Number.isFinite(values.trust)) run.state.trust=(run.state.trust||0)+values.trust;
  }
  function enter(data,run,scene){
    if(run.visited.includes(scene.id)) return;
    run.visited.push(scene.id);
    deltas(data,run,scene.enterDeltas);
    if(scene.riskDays) deltas(data,run,{days:-(scene.riskDays[run.state.walkoutRisk]||0)});
  }
  function candidate(run){
    const {interior:i,corridor:c,swing:w}=run.meters, s=run.state;
    if(s.deliberateLapse) return null;
    if(s.proposal==='bargain' && s.broadPackage && s.corridorStructure==='autonomy' &&
       ['full','narrow'].includes(s.infrastructureCommitment) && i>=60 && c>=45 && w>=55 && s.trust>=0) return 'grand_bargain';
    // Support is coalition access, so corridor respect does not disqualify a clean proposal.
    if(s.proposal==='clean' && s.corridorStructure!=='autonomy' && i>=65 && w>=55) return 'clean_statehood';
    if(s.proposal==='split' && i>=30 && w>=55 && c>=50 && s.trust>=0) return 'negotiated_split';
    if(s.proposal==='split' && i>=25 && w>=45 && c>=40 && s.trust<0) return 'ugly_split';
    return null;
  }
  function lock(run){
    if(run.state.resolutionLocked) return 'locked';
    if(run.state.deliberateLapse) return 'lapse';
    if(run.meters.days<=0) return 'expired';
    const outcome=candidate(run);
    if(!outcome) return 'short';
    run.state.resolutionLocked=true;
    run.state.lockedEnding=outcome;
    return 'locked';
  }
  function apply(data,run,scene,id){
    const f=scene.fragments[id];
    if(!Object.hasOwn(scene.fragments,id) || !available(f,run)) throw Error('Unavailable fragment');
    run.lastFragmentId=id;
    // A deadline or deliberate refusal cannot be repaired by clicking a later option.
    if(data.rules==='korda' && (run.state.deliberateLapse || (run.meters.days<=0 && !run.state.resolutionLocked))) return 'expired';
    deltas(data,run,f.deltas);
    Object.assign(run.state,f.state);
    if(f.lockResolution){
      const status=lock(run);
      if(f.exhaustIfUnlocked && !run.state.resolutionLocked){ run.meters.days=0; return 'expired'; }
      return status;
    }
    return null;
  }
  function selectEnding(data,run){
    if(data.rules==='korda') return run.state.deliberateLapse ? 'hung_convention' : (run.state.resolutionLocked && run.state.lockedEnding) || 'hung_convention';

    const S = run.meters.standing, A = run.meters.allies, I = run.meters.intent;
    const last = run.lastFragmentId || '';
    // --- Legat Consul branch. Checked BEFORE the allies floor below: the LC
    //     path spends allies by construction, so a gutted chamber is the PRICE
    //     of the loud door, not evidence she never ran.
    if(last === 's4lc_declare')     return 'legat_run';
    if(last === 's4lc_withdraw')    return 'returned';
    if(last === 's4lc_wait')        return 'legislator';
    if(last === 's4lc_conditional') return 'legislator';
    // Explicit final-choice outcomes first
    if(last === 's4_kingmaker') return 'kingmaker';
    // If she never committed and the coalition dispersed -> back to legislator
    if(I < 25 || A < 30) return 'legislator';
    // Long game: high standing, real allies, but intent kept deliberately mid — both doors open
    if(I >= 30 && I < 52 && A >= 55) return 'long_game';
    // A path that leaned onto the public/Legat stage (high standing, intent present, allies not chamber-deep)
    if(last === 's4_wait' && I >= 30 && A < 60) return 'legat_run';
    // Committed to the quiet office:
    if(I >= 52){
      return A >= 65 ? 'commit_civic' : 'commit_civic_thin';
    }
    // Fallbacks by shape
    if(A >= 55) return 'long_game';
    return 'legislator';

  }
  function count(data,run){
    const t=data.countText,s=run.state;
    const key={clean_statehood:'clean_ready',grand_bargain:'bargain_ready',negotiated_split:'split_ready',ugly_split:'ugly_ready'}[candidate(run)] || 'short';
    return [t[run.meters.days<=0?'expired':key],
      s.walkoutRisk!=='none' && t.escalated,
      s.corridorCohesion==='fractured' && t.fractured,
      s.corridorGuarantee==='requested' && t.guarantee].filter(Boolean).join('<br><br>');
  }
  function tone(data,run){
    if(run.state.trust<0) return data.ratificationTone.damaged;
    const c=candidate(run);
    const broad=run.state.trust>=2 && run.meters.swing>=65 &&
      (c==='grand_bargain' || (c==='clean_statehood' && run.meters.interior>=75) || (c==='negotiated_split' && run.meters.corridor>=60));
    return data.ratificationTone[broad?'confident':'uneasy'];
  }
  const api={games,gameFile,initialize,available,fragments,enter,apply,candidate,lock,selectEnding,count,tone};
  if(typeof module!=='undefined' && module.exports) module.exports=api;
  else root.CrossroadsEngine=api;
})(typeof globalThis!=='undefined'?globalThis:this);

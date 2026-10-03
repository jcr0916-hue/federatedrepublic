import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';
import assert from 'node:assert/strict';
import { guardrailFindings, validateWorldDraftFile } from '../lib/world-draft-validation.mjs';

const kordaGuardrail = {
  id:'korda-open',
  arc:'korda',
  active:true,
  afterWorldSeq:143,
  afterNrsSeq:68,
  note:'still open',
  patterns:['\\bConvention (?:approved|adopted|passed) (?:a |the )?(?:final )?resolution\\b'],
  resolutionInstruction:'update the guardrail deliberately',
};

test('active guardrails catch a new positive canon-resolution assertion but ignore earlier records',()=>{
  const content='<p>The Convention adopted a final resolution.</p>';
  assert.equal(guardrailFindings({data:{worldKind:'news',worldSeq:144,worldArcs:['korda']},content},[kordaGuardrail]).length,1);
  assert.equal(guardrailFindings({data:{worldKind:'news',worldSeq:143,worldArcs:['korda']},content},[kordaGuardrail]).length,0);
  assert.equal(guardrailFindings({data:{worldKind:'news',worldSeq:144,worldArcs:['lake-varda']},content},[kordaGuardrail]).length,0);
});

test('draft validator checks next sequence, constitutional references, clocks, and unresolved canon',()=>{
  const dir=fs.mkdtempSync(path.join(os.tmpdir(),'world-draft-validation-'));
  try{
    fs.mkdirSync(path.join(dir,'_data'),{recursive:true});
    fs.copyFileSync('constitution_data.json',path.join(dir,'constitution_data.json'));
    fs.copyFileSync('_data/worldClocks.json',path.join(dir,'_data/worldClocks.json'));
    fs.copyFileSync('_data/worldChronology.json',path.join(dir,'_data/worldChronology.json'));
    fs.copyFileSync('_data/worldAuthoringGuardrails.json',path.join(dir,'_data/worldAuthoringGuardrails.json'));

    fs.writeFileSync(path.join(dir,'torenthia-news-001.html'),`---
worldKind: news
worldSeq: 143
worldDate: "13.12"
worldTitle: "Existing"
worldOutlet: "The Torenthian"
worldBlurb: "Existing"
worldId: "torenthia-news-001"
worldArcs: ["korda"]
worldJurisdictions: ["Korda"]
worldProvisions: []
worldRelated: []
---
<p>Existing record.</p>
`);

    const draftPath=path.join(dir,'torenthia-news-002.html');
    fs.writeFileSync(draftPath,`---
worldKind: news
worldSeq: 144
worldDate: "13.12"
worldTitle: "Draft"
worldOutlet: "The Torenthian"
worldBlurb: "Draft"
worldId: "torenthia-news-002"
worldArcs: ["korda"]
worldJurisdictions: ["Korda"]
worldProvisions: ["§15.5.a"]
worldRelated: []
---
<p>Delegates discussed the Convention under §15.5.a, but no final resolution was introduced.</p>
`);

    let result=validateWorldDraftFile('torenthia-news-002.html',{root:dir});
    assert.deepEqual(result.errors,[]);
    assert.equal(result.bodyRefs.includes('§15.5.a'),true);

    fs.writeFileSync(draftPath,fs.readFileSync(draftPath,'utf8').replace(
      'Delegates discussed the Convention under §15.5.a, but no final resolution was introduced.',
      'The Convention adopted a final resolution under §15.5.a.'
    ));
    result=validateWorldDraftFile('torenthia-news-002.html',{root:dir});
    assert.ok(result.errors.some(x=>/korda-unresolved-outcome/i.test(x)));

    fs.writeFileSync(draftPath,fs.readFileSync(draftPath,'utf8').replace('worldSeq: 144','worldSeq: 145'));
    result=validateWorldDraftFile('torenthia-news-002.html',{root:dir});
    assert.ok(result.errors.some(x=>/expected 144, found 145/i));
  }finally{
    fs.rmSync(dir,{recursive:true,force:true});
  }
});

test('draft validator flags body constitutional references omitted from front matter',()=>{
  const dir=fs.mkdtempSync(path.join(os.tmpdir(),'world-draft-provision-'));
  try{
    fs.mkdirSync(path.join(dir,'_data'),{recursive:true});
    fs.copyFileSync('constitution_data.json',path.join(dir,'constitution_data.json'));
    fs.writeFileSync(path.join(dir,'_data/worldClocks.json'),'[]\n');
    fs.writeFileSync(path.join(dir,'_data/worldChronology.json'),'[]\n');
    fs.writeFileSync(path.join(dir,'_data/worldAuthoringGuardrails.json'),'[]\n');
    fs.writeFileSync(path.join(dir,'torenthia-news-001.html'),`---
worldKind: news
worldSeq: 1
worldDate: "13.12"
worldTitle: "Draft"
worldOutlet: "The Torenthian"
worldBlurb: "Draft"
worldId: "torenthia-news-001"
worldArcs: []
worldJurisdictions: []
worldProvisions: []
worldRelated: []
---
<p>The report discusses §2.7.</p>
`);
    const result=validateWorldDraftFile('torenthia-news-001.html',{root:dir,enforceNext:false});
    assert.ok(result.warnings.some(x=>/Body cites §2\.7 but worldProvisions does not list it/));
  }finally{
    fs.rmSync(dir,{recursive:true,force:true});
  }
});

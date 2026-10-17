import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {parseStateConstitution, loadStateConstitutionDisplays, renderStateConstitutionBody} from '../lib/state-constitution-display.mjs';
import statepages from '../_data/statepages.js';

test('Varek presentation parser preserves the constitutional structure',()=>{
  const source='State Constitutions/varek-state-constitution.md';
  const parsed=parseStateConstitution(fs.readFileSync(source,'utf8'),'varek',source);
  assert.equal(parsed.articles.length,14);
  assert.match(parsed.title,/CONSTITUTION OF THE STATE OF VAREK/);
  assert.match(parsed.subtitle,/Cantonal Republic/);
  assert.match(parsed.preamble,/We establish no general executive/);
  const emergency=parsed.articles.find(a=>a.number==='XII');
  assert.ok(emergency);
  assert.equal(emergency.provisions.find(p=>p.number==='12.11').title,'Reversion');
  assert.match(emergency.provisions.find(p=>p.number==='12.11').body,/ordinary constitutional distribution of powers/);
});

test('all established State Constitutions can be loaded for presentation',()=>{
  const displays=loadStateConstitutionDisplays();
  assert.equal(Object.keys(displays).length,12);
  for(const [id,state] of Object.entries(displays)){
    assert.ok(state.title,id);
    assert.ok(state.articles.length,id);
    assert.ok(state.articles.every(article=>article.provisions.length),id);
  }
});

test('State constitutional body renderer preserves paragraphs, lists and bold without trusting HTML',()=>{
  const html=renderStateConstitutionBody('(a) First paragraph.\n\n- one;\n- two.\n\n**Orath State Record**\n\n**<b>not markup</b>**');
  assert.match(html,/<p>\(a\) First paragraph\.<\/p>/);
  assert.match(html,/<ul><li>one;<\/li><li>two\.<\/li><\/ul>/);
  assert.match(html,/<strong>Orath State Record<\/strong>/);
  assert.match(html,/<strong>&lt;b&gt;not markup&lt;\/b&gt;<\/strong>/);
  assert.ok(!html.includes('<b>'));
});

test('Orath and Merath retain their article structure and Merath front and closing text',()=>{
  const displays=loadStateConstitutionDisplays();
  assert.equal(displays.orath.articles.length,13);
  assert.equal(displays.merath.articles.length,12);
  assert.equal(displays.merath.tagline,"Industrial Heartland — Workers' Commonwealth");
  assert.equal(displays.merath.adopted,'Adopted by the working people of Merath.');
  assert.ok(!displays.merath.articles.at(-1).provisions.at(-1).body.includes('Adopted by'));
  for(const id of ['orath','merath']){
    const source=fs.readFileSync(displays[id].source,'utf8');
    const numbers=[...source.matchAll(/^### §(\d+\.\d+) /gm)].map(match=>match[1]);
    assert.deepEqual(displays[id].articles.flatMap(article=>article.provisions.map(p=>p.number)),numbers);
  }
});

test('numbered constitutional lists retain explicit values and do not absorb following clauses',()=>{
  const html=renderStateConstitutionBody('(b) Structural matters:\n\n3. Courts;\n4. Elections;\n7. **<script>unsafe</script>**.\n\n(c) Existing law continues.\n\n- Public record.');
  assert.match(html,/<ol><li value="3">Courts;<\/li><li value="4">Elections;<\/li><li value="7"><strong>&lt;script&gt;unsafe&lt;\/script&gt;<\/strong>\.<\/li><\/ol>/);
  assert.match(html,/<\/ol>\s*<p>\(c\) Existing law continues\.<\/p>\s*<ul><li>Public record\.<\/li><\/ul>/);
  assert.ok(!html.includes('<script>'));
});

test('published State profiles have formatted Constitution entry pages',()=>{
  for(const {key:id} of statepages){
    const page='state-constitution-'+id+'.html';
    const profile='torenthia-state-'+id+'.html';
    assert.ok(fs.existsSync(page),page);
    assert.ok(fs.existsSync(profile),profile);
    assert.ok(fs.readFileSync(page,'utf8').includes('stateConstitution: '+id));
    assert.ok(fs.readFileSync(profile,'utf8').includes('stateConstitutionPage: '+page));
  }
});

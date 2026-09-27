import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {parseStateConstitution, loadStateConstitutionDisplays, renderStateConstitutionBody} from '../lib/state-constitution-display.mjs';

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

test('State constitutional body renderer preserves paragraphs and lists without trusting HTML',()=>{
  const html=renderStateConstitutionBody('(a) First paragraph.\n\n- one;\n- two.\n\n<b>not markup</b>');
  assert.match(html,/<p>\(a\) First paragraph\.<\/p>/);
  assert.match(html,/<ul><li>one;<\/li><li>two\.<\/li><\/ul>/);
  assert.match(html,/&lt;b&gt;not markup&lt;\/b&gt;/);
});

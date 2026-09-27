import fs from 'node:fs';
import path from 'node:path';

const escapeHTML = value => String(value)
  .replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;');

export function renderStateConstitutionBody(text='') {
  const lines=String(text).split(/\r?\n/);
  const out=[];
  let paragraph=[];
  let list=[];
  const flushParagraph=()=>{
    if(!paragraph.length) return;
    const body=escapeHTML(paragraph.join(' ').trim());
    if(body) out.push(`<p>${body}</p>`);
    paragraph=[];
  };
  const flushList=()=>{
    if(!list.length) return;
    out.push('<ul>'+list.map(item=>`<li>${escapeHTML(item)}</li>`).join('')+'</ul>');
    list=[];
  };
  for(const raw of lines){
    const line=raw.trim();
    if(!line){flushParagraph();flushList();continue;}
    if(line.startsWith('- ')){flushParagraph();list.push(line.slice(2).trim());continue;}
    flushList();
    paragraph.push(line);
  }
  flushParagraph();flushList();
  return out.join('\n');
}

export function parseStateConstitution(text,id,source) {
  const lines=String(text).split(/\r?\n/);
  let title='', subtitle='', preamble=[], adopted='', currentArticle=null, currentProvision=null;
  const articles=[];
  const flushProvision=()=>{ if(currentProvision && currentArticle){ currentProvision.body=currentProvision.body.join('\n').trim(); currentArticle.provisions.push(currentProvision); } currentProvision=null; };
  const flushArticle=()=>{ flushProvision(); if(currentArticle) articles.push(currentArticle); currentArticle=null; };
  let mode='front';
  for(const raw of lines){
    const line=raw.trimEnd();
    if(!title && /^#\s+/.test(line)){ title=line.replace(/^#\s+/,'').trim(); continue; }
    if(!subtitle && /^\*[^*].*\*$/.test(line)){ subtitle=line.slice(1,-1).trim(); continue; }
    if(/^##\s+PREAMBLE\s*$/i.test(line)){ mode='preamble'; continue; }
    const article=/^#\s+ARTICLE\s+([^—–-]+)\s*[—–-]\s*(.+)$/.exec(line);
    if(article){
      flushArticle();
      currentArticle={number:article[1].trim(),title:article[2].trim(),provisions:[]};
      mode='article';
      continue;
    }
    const provision=/^##\s+§(\d+(?:\.\d+)*)\s+(.+)$/.exec(line);
    if(provision && currentArticle){
      flushProvision();
      currentProvision={number:provision[1],title:provision[2].trim(),body:[]};
      continue;
    }
    if(/^\*Adopted by the people of .+\*\.?$/.test(line)){ adopted=line.replace(/^\*/,'').replace(/\*\.?$/,'').trim(); continue; }
    if(line.trim()==='---') continue;
    if(mode==='preamble' && !currentArticle) preamble.push(line);
    else if(currentProvision) currentProvision.body.push(line);
  }
  flushArticle();
  return {id,source,title,subtitle,preamble:preamble.join('\n').trim(),articles,adopted};
}

export function loadStateConstitutionDisplays(root='.') {
  const dir=path.join(root,'State Constitutions');
  if(!fs.existsSync(dir)) return {};
  const out={};
  for(const name of fs.readdirSync(dir).filter(n=>/^[a-z]+-state-constitution\.md$/.test(n)).sort()){
    const id=name.replace('-state-constitution.md','');
    const source=`State Constitutions/${name}`;
    out[id]=parseStateConstitution(fs.readFileSync(path.join(root,source),'utf8'),id,source);
  }
  return out;
}

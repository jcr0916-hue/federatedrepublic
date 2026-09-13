#!/usr/bin/env python3
import json, re, html, pathlib

ROOT=pathlib.Path(__file__).resolve().parents[1]
data=json.load(open(ROOT/'constitution_data.json',encoding='utf-8'))
path=ROOT/'annotated.html'
s=path.read_text(encoding='utf-8')
ROMAN={1:'I',2:'II',3:'III',4:'IV',5:'V',6:'VI',7:'VII',8:'VIII',9:'IX',10:'X',11:'XI',12:'XII',13:'XIII',14:'XIV',15:'XV',16:'XVI',17:'XVII',18:'XVIII',19:'XIX',20:'XX'}

def anchor(num):
    parts=num[1:].split('.')
    out='s'+parts[0]
    if len(parts)>1: out+='-'+parts[1]
    if len(parts)>2: out+=parts[2]
    return out

def render(p):
    num,name,text=p['num'],p.get('name',''),p.get('text','')
    aid=anchor(num)
    label=(f'  <div class="provision" id="{aid}">\n'
           f'    <div class="prov-label"><span class="prov-num" title="Click to copy link to {html.escape(num)}" onclick="copyProvLink(\'{aid}\')" style="cursor:pointer">{html.escape(num)}<span class="prov-permalink" aria-hidden="true">¶</span></span><span class="prov-name">{html.escape(name)}</span></div>\n')
    paras=[x.strip() for x in text.split('\n') if x.strip()]
    if len(paras)==1:
        body=f'    <p class="prov-text">{html.escape(paras[0],quote=False)}</p>\n'
    else:
        body='    <div class="prov-text">\n'+''.join(f'      <p class="prov-para">{html.escape(x,quote=False)}</p>\n' for x in paras)+'    </div>\n'
    return label+body+'  </div>'

starts=list(re.finditer(r'<div id="art(\d+)" class="article-section">',s))
for idx in range(len(starts)-1,-1,-1):
    m=starts[idx]
    n=int(m.group(1))
    if idx+1<len(starts):
        end=starts[idx+1].start()
    else:
        end=s.find('\n</main>',m.start())
        if end<0:
            raise SystemExit('Could not locate annotated main-content close after Article XX')
    section=s[m.start():end]
    article=next(a for a in data if a.get('heading','').startswith(f'Article {ROMAN[n]} '))
    first=section.find('<div class="provision"')
    if first<0:
        raise SystemExit(f'Article {n}: no provision block found')
    prefix=section[:first].rstrip()
    prefix=re.sub(r'(<h2 class="article-header">)Article [^<]+',lambda z:z.group(1)+html.escape(article['heading']),prefix,count=1)
    newsec=prefix+'\n\n'+'\n\n'.join(render(p) for p in article['provisions'])+'\n</div>\n'
    s=s[:m.start()]+newsec+s[end:]

path.write_text(s,encoding='utf-8')
print('Synchronized annotated.html from constitution_data.json')

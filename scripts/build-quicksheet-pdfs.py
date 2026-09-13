#!/usr/bin/env python3
"""Build printable two-column quicksheets from the reviewed HTML content."""
from pathlib import Path
from lxml import html
from reportlab.pdfgen import canvas
from reportlab.platypus import Paragraph, Frame, KeepTogether, Spacer
from reportlab.lib.styles import ParagraphStyle
from reportlab.lib.colors import HexColor
from xml.sax.saxutils import escape

navy=HexColor('#142638'); gold=HexColor('#a18030')
body=ParagraphStyle('body',fontName='Helvetica',fontSize=8.4,leading=11.5,textColor=navy,spaceAfter=6)
heading=ParagraphStyle('heading',parent=body,fontName='Helvetica-Bold',fontSize=9,leading=12,textColor=gold,spaceBefore=8,spaceAfter=5)
label=ParagraphStyle('label',parent=body,fontName='Helvetica-Bold',spaceAfter=3)

def txt(el): return ' '.join(el.text_content().split()).replace('→',' / ').replace('≥','at least ').replace('—',' - ').replace('–','-')
for path in sorted(Path('.').glob('quicksheet-*.html')):
 root=html.fromstring(path.read_text())
 page=root.find_class('page')[0]
 title=page.find_class('qs-title')[0].text_content()
 main=page.find_class('qs-body')[0]
 flow=[]
 # Leaf content blocks retain source reading order; tables become compact row summaries.
 for el in main.iter():
  if el.tag=='tr':
   cells=el.xpath('./td|./th')
   if cells: flow.append(Paragraph(escape(' | '.join(txt(c) for c in cells)),body))
   continue
  if any(a.tag in ('tr','td','th') for a in el.iterancestors()):continue
  cls=(el.get('class') or '').split()
  if not isinstance(el.tag,str):continue
  if any(c in cls for c in ['section-label','cas-num','cas-title','tier-title','veto-name','duo-name','trio-name','fact-num','hl-title','constant-icon']):
   flow.append(Paragraph(escape(txt(el)),heading if 'section-label' in cls else label))
  elif not el.xpath('.//div') and el.tag in ('div','p','li') and txt(el):
   flow.append(Paragraph(escape(txt(el)),body))
 c=canvas.Canvas(str(Path('pdf')/(path.stem+'.pdf')),pagesize=(612,792));c.setTitle(title+' - Federated Republic')
 def decorate(n):
  c.setFillColor(navy);c.rect(0,714,612,78,fill=1,stroke=0);c.setFillColor(HexColor('#d6b95b'));c.setFont('Helvetica',8);c.drawString(30,768,'THE FEDERATED REPUBLIC / QUICK SHEET')
  c.setFillColor(HexColor('#ffffff'));c.setFont('Helvetica-Bold',min(17,520/max(1,c.stringWidth(title,'Helvetica-Bold',1))));c.drawString(30,738,title)
  c.setFillColor(navy);c.setFont('Helvetica',7);c.drawString(30,24,'Current Constitution / verified 13 September 2026 / thefederatedrepublic.org');c.drawRightString(582,24,str(n))
 n=1
 while flow:
  decorate(n)
  for x in [30,315]: Frame(x,40,267,658,leftPadding=0,rightPadding=0,topPadding=0,bottomPadding=0).addFromList(flow,c)
  c.showPage();n+=1
 c.save();print(path.stem,n-1,'pages')

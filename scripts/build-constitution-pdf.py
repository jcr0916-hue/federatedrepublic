#!/usr/bin/env python3
"""Render the public Constitution PDF directly from constitution_data.json.

Requires reportlab. Run from the repository root. No constitutional text is abridged.
"""
import json
from html import escape
from pathlib import Path
from reportlab.lib import colors
from reportlab.lib.enums import TA_CENTER
from reportlab.lib.styles import ParagraphStyle
from reportlab.lib.pagesizes import letter
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, PageBreak, HRFlowable

source = json.loads(Path('constitution_data.json').read_text())
articles = [a for a in source if not a.get('preamble')]
count = sum(len(a['provisions']) for a in articles)
navy = colors.HexColor('#1b2b4b')
gold = colors.HexColor('#b28b2e')
body = ParagraphStyle('Body', fontName='Times-Roman', fontSize=10.5, leading=12.8, spaceAfter=5)
heading = ParagraphStyle('Article', parent=body, fontName='Times-Bold', fontSize=15, leading=18, textColor=navy, spaceAfter=15, keepWithNext=True)
provision = ParagraphStyle('Provision', parent=body, fontName='Times-BoldItalic', fontSize=10.8, leading=13, textColor=navy, spaceBefore=8, spaceAfter=4, keepWithNext=True)
cover = ParagraphStyle('Cover', parent=body, fontName='Times-Bold', fontSize=22, leading=27, alignment=TA_CENTER, textColor=navy)
subtitle = ParagraphStyle('Subtitle', parent=cover, fontName='Times-Roman', fontSize=16, leading=21, textColor=gold)
small = ParagraphStyle('Small', parent=body, fontSize=9, leading=13, alignment=TA_CENTER, textColor=colors.HexColor('#6b6258'))
flow = [Spacer(1,68), Paragraph('THE FEDERATED REPUBLIC',cover), Paragraph('CONSTITUTION',subtitle), Spacer(1,5), HRFlowable(width='100%',thickness=0.8,color=gold), Spacer(1,10), Paragraph(f'{count} Provisions · {len(articles)} Articles',small), Paragraph('thefederatedrepublic.org',small), PageBreak()]
for i, article in enumerate(source):
    if i:
        flow.append(PageBreak())
    flow.append(Paragraph(escape(article['heading']), heading))
    if article.get('preamble'):
        for paragraph in article['text'].strip().split('\n\n'):
            flow.append(Paragraph(escape(paragraph), body))
    for p in article['provisions']:
        flow.append(Paragraph(escape(p['num']+'  '+p['name']), provision))
        for paragraph in p['text'].splitlines():
            if paragraph.strip():
                flow.append(Paragraph(escape(paragraph.strip()), body))

def footer(canvas, doc):
    if doc.page == 1:
        return
    canvas.saveState()
    canvas.setFont('Times-Roman',8)
    canvas.setFillColor(colors.HexColor('#6b6258'))
    canvas.drawString(72,38,'The Federated Republic · Constitution')
    canvas.drawRightString(letter[0]-72,38,str(doc.page))
    canvas.restoreState()

out=Path('pdf/constitution-current.pdf')
doc=SimpleDocTemplate(str(out),pagesize=letter,rightMargin=72,leftMargin=72,topMargin=64,bottomMargin=58,title='The Federated Republic — Constitution',author='The Federated Republic')
doc.build(flow,onFirstPage=footer,onLaterPages=footer)
print(f'Wrote {out}: {len(articles)} articles, {count} provisions, full canonical text.')

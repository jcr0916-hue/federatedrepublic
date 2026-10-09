import json
from pathlib import Path
p=Path('constitution_data.json')
data=json.loads(p.read_text())
sections={x['num']:x for a in data for x in a['provisions']}
sections['§7.3']['text']="Except for constitutional-amendment referendums governed by §17.1, any supermajority required by this Constitution in a direct vote of the citizens is 60% of votes cast. This threshold may be changed only by constitutional amendment and does not alter separately established participation or turnout requirements."
old=sections['§7.4']['text']
tail=old[old.index('(7) A person removed'):]
start="(1) Every candidate for federal office and every person assuming federal office without election shall publicly disclose their criminal history under penalty of perjury. A current and accurate disclosure satisfies this requirement for subsequent appointments or elevations. Knowingly false or materially incomplete disclosure constitutes a federal offense.\n(2) No criminal conviction disqualifies a person from federal office except a conviction for insurrection, rebellion, or treason against the Republic, or subversion of a federal election. These grounds are exhaustive and require conviction rather than accusation or pending charges."
sections['§7.4']['text']=start+'\n'+tail
p.write_text(json.dumps(data,ensure_ascii=False,indent=2)+'\n')

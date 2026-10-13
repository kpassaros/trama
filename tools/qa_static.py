from pathlib import Path
import json,re,sqlite3,sys,hashlib
from html.parser import HTMLParser
sys.path.insert(0,str(Path(__file__).parent));from highlight import highlight
R=Path(__file__).resolve().parents[1];P=R/'public';fail=[]
class H(HTMLParser):
 def __init__(self):super().__init__();self.links=[];self.ids=[];self.text=[]
 def handle_starttag(self,tag,attrs):
  d=dict(attrs)
  if 'id' in d:self.ids.append(d['id'])
  for key in ('href','src'):
   if d.get(key):self.links.append(d[key])
 def handle_data(self,data):self.text.append(data)
for file in P.rglob('*.html'):
 h=H();h.feed(file.read_text())
 if len(h.ids)!=len(set(h.ids)):fail.append('ID duplicado: '+str(file))
 for url in h.links:
  if url.startswith(('https:','http:','data:','mailto:')):continue
  loc,_,anchor=url.partition('#');dest=(file.parent/loc).resolve() if loc else file.resolve()
  if not dest.exists():fail.append('Destino ausente: '+str(file)+':'+url)
  elif anchor and dest.suffix=='.html':
   q=H();q.feed(dest.read_text())
   if anchor not in q.ids:fail.append('Âncora ausente: '+url)
refs=json.loads((R/'content/reference.json').read_text())['items'];lessons=[json.loads(p.read_text()) for p in (R/'content/lessons').glob('*.json')]
for r in refs:
 h=H();h.feed(highlight(r['code'],r['tool']))
 if ''.join(h.text)!=r['code']:fail.append('Código alterado pelo destaque: '+r['id'])
 for k in ('use','result','steps','pitfall'):
  if not r.get(k):fail.append('Campo de contexto vazio: '+r['id']+k)
for l in lessons:
 for s in l['sections']:
  blocks=s.get('codeBlocks',[]) or ([{'code':s['code'],'language':l['track']}] if s.get('code') else [])
  for b in blocks:
   h=H();h.feed(highlight(b['code'],b['language']))
   if ''.join(h.text)!=b['code']:fail.append('Código da aula alterado: '+l['id'])
conn=sqlite3.connect(':memory:');conn.executescript('CREATE TABLE orders(order_id INTEGER,customer_id TEXT,status TEXT,total_amount REAL);INSERT INTO orders VALUES(101,"a","paid",150),(102,"a","pending",80),(103,"b","paid",50),(104,"b","paid",0),(105,"b",NULL,40);')
assert conn.execute(refs[0]['code']).fetchall()==[(101,150),(102,80),(103,50),(104,0),(105,40)]
assert conn.execute(refs[1]['code']).fetchall()==[(101,150),(103,50)]
assert conn.execute("SELECT customer_id,SUM(total_amount) AS revenue FROM orders WHERE status='paid' GROUP BY customer_id").fetchall()==[('a',150),('b',50)]
conn.executescript('CREATE TABLE customers(customer_id TEXT,name TEXT);INSERT INTO customers VALUES("a","Ana");')
left_join=next(r for r in refs if r['id']=='ref-017')
left_rows=conn.execute(left_join['code']).fetchall()
assert len(left_rows)==5 and (103,'b',None) in left_rows
conn.execute('INSERT INTO customers VALUES("a","Ana duplicada")')
assert len(conn.execute(left_join['code']).fetchall())==7
# Tokens medidos contra o fundo opaco/conservador. Sobreposições reais precisam de avaliação visual.
def lum(hex):
 c=[int(hex[i:i+2],16)/255 for i in (1,3,5)];v=[x/12.92 if x<=.04045 else ((x+.055)/1.055)**2.4 for x in c];return sum(x*y for x,y in zip(v,[.2126,.7152,.0722]))
def ratio(a,b):x,y=sorted([lum(a),lum(b)]);return round((y+.05)/(x+.05),2)
pairs=[('#52646e','#E9EFF0'),('#19353d','#E9EFF0'),('#b9c9ce','#253e45'),('#c4e3e8','#253e45'),('#c1b0f0','#352e4d'),('#6844a3','#ffffff'),('#20505A','#ffffff'),('#216b42','#ffffff'),('#92500f','#ffffff'),('#64717e','#ffffff'),('#ffffff','#20505A')]
contrasts=[{'fg':a,'bg':b,'ratio':ratio(a,b)} for a,b in pairs]
for item in contrasts:
 if item['ratio']<4.5:fail.append('Contraste abaixo do alvo: '+str(item))
(R/'reports').mkdir(exist_ok=True)
report={'pages':len(list(P.rglob('*.html'))),'tracks':len(json.loads((R/'content/catalog.json').read_text())['tracks']),'lessons':len(lessons),'references':len(refs),'highlight_roundtrip':'pass','sql_fixture_checks':5,'contrast_tokens':contrasts,'errors':fail,'scope':'Estrutura, links locais, exemplos SQL em SQLite e tokens; não equivale à execução de todos os produtos nem à auditoria WCAG completa.'}
(R/'reports/qa-static.json').write_text(json.dumps(report,ensure_ascii=False,indent=2));print(json.dumps({k:v for k,v in report.items() if k!='contrast_tokens'},ensure_ascii=False));assert not fail

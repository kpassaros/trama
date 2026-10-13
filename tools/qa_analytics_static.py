"""Verificação estrutural de analytics. Não instala nem executa tags do Google."""
from pathlib import Path
import copy,json
from html.parser import HTMLParser
from build import validate_config
R=Path(__file__).resolve().parents[1]
cfg=json.loads((R/'config.json').read_text());validate_config(cfg)
fixture=copy.deepcopy(cfg);fixture['analytics']['enabled']=True
for patch in [{'measurement_id':'<script>'},{'consent_required':True},{'collection_mode':'unknown'},{'advertising_enabled':True},{'site_url':'http://example.test/'},{'preference_days':True}]:
 bad=copy.deepcopy(fixture);bad['analytics'].update(patch)
 try:validate_config(bad)
 except ValueError:pass
 else:raise AssertionError('Config insegura aceita: '+str(patch))
class Page(HTMLParser):
 def __init__(self):super().__init__();self.body={};self.scripts=[];self.links=[]
 def handle_starttag(self,tag,attrs):
  d=dict(attrs)
  if tag=='body':self.body=d
  if tag=='script':self.scripts.append(d.get('src',''))
  if tag=='a' and 'data-creator-link' in d:self.links.append(d)
files=list((R/'public').rglob('*.html'))
for file in files:
 p=Page();p.feed(file.read_text())
 if cfg['analytics']['enabled']:
  assert p.body['data-analytics-id']==cfg['analytics']['measurement_id']
  assert any(s.endswith('assets/analytics.js') for s in p.scripts)
 else:
  assert 'data-analytics-id' not in p.body
  assert not any(s.endswith('assets/analytics.js') for s in p.scripts)
 assert p.body['data-page-path']==file.relative_to(R/'public').as_posix()
 assert not any(s.startswith(('https:','http:','//')) for s in p.scripts)
 assert len(p.links)==6
 for link in p.links:
  assert link['target']=='_blank' and {'noopener','noreferrer'}<=set(link['rel'].split())
js=(R/'assets/analytics.js').read_text()
assert 'send_page_view:false' in js and 'allow_google_signals:false' in js
assert 'allow_ad_personalization_signals:false' in js and "script.referrerPolicy='no-referrer'" in js
assert (R/'public/privacidade.html').exists() and (R/'public/termos.html').exists()
assert "window.gtag('consent'" not in js
assert 'data-consent-accept' not in (R/'tools/views.py').read_text()
print(f'Analytics estrutural: {len(files)} páginas, seis links profissionais por página, sem tag remota no HTML e gate de configuração aprovado.')

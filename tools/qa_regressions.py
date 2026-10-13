"""Testes de regressão do gerador: conteúdo é tratado como dados, não executado."""
import copy,json,tempfile
from pathlib import Path
from build import validate
from views import render_site,track_icon
R=Path(__file__).resolve().parents[1]
cfg=json.loads((R/'config.json').read_text())
tracks=json.loads((R/'content/catalog.json').read_text())['tracks']
lessons=[json.loads(p.read_text()) for p in (R/'content/lessons').glob('*.json')]
refs=json.loads((R/'content/reference.json').read_text())['items']
attack='ref-001"><img src=x onerror=alert(1)>'
bad=copy.deepcopy(refs);bad[0]['id']=attack
try:validate(tracks,lessons,bad)
except ValueError:pass
else:raise AssertionError('ID malicioso não rejeitado')
track=next(t for t in tracks if t['id']=='javascript')
lesson=copy.deepcopy(next(l for l in lessons if l['id']=='javascript-02'));lesson.pop('exercise')
validate([track],[lesson],refs)
with tempfile.TemporaryDirectory() as folder:
 out=Path(folder);render_site(cfg,[track],[lesson],bad[:1],out)
 refhtml=(out/'consultas.html').read_text();assert '<img src=x onerror=alert(1)>' not in refhtml
 assert 'ref-001&quot;&gt;&lt;img' in refhtml
 page=(out/'trilhas/javascript/javascript-02.html').read_text()
 assert 'id="pratica"' not in page and 'href="#pratica"' not in page
 assert page.index('class="lesson-toc glass"')<page.index('class="lesson-main"')
 assert page.count('class="copy-button"')==2
 assert '1 aulas' not in (out/'index.html').read_text()
assert 'ui-icon' in track_icon({'icon':'SQL'})
assert '&lt;bad&gt;'==track_icon({'icon':'<bad>'})
print('Regressões: IDs rejeitados/escapados, prática opcional, TOC, ícones e dois blocos independentes aprovados.')

"""Auditoria de higiene: artefatos, URLs perigosas e padrões comuns de segredo."""
from pathlib import Path
import re,json
R=Path(__file__).resolve().parents[1]
patterns={'AWS_access_key':r'\bAKIA[0-9A-Z]{16}\b','GitHub_token':r'\bgh[pousr]_[A-Za-z0-9]{30,}\b','GitHub_PAT':r'\bgithub_pat_[A-Za-z0-9_]{40,}\b','private_key':r'-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----'}
issues=[]
for f in R.rglob('*'):
 if not f.is_file() or '.git' in f.parts or '__pycache__' in f.parts:continue
 if f.suffix in ('.png','.jpg','.jpeg','.webp','.woff','.woff2','.zip'):continue
 text=f.read_text(errors='replace')
 for name,pattern in patterns.items():
  if re.search(pattern,text):issues.append({'file':str(f.relative_to(R)),'type':name})
 if f.parts[-2:-1]==('public',) and 'data-preview-theme' in text:issues.append({'file':str(f.relative_to(R)),'type':'preview_only'})
 if f.suffix=='.html' and re.search(r'(?:src|href)=["\'](?:file:|/data/|javascript:)',text):issues.append({'file':str(f.relative_to(R)),'type':'unsafe_or_sandbox_path'})
for f in (R/'public').rglob('*'):
 if f.is_file() and f.name.startswith(('preview-','qa-')):issues.append({'file':str(f.relative_to(R)),'type':'preview_file'})
config=json.loads((R/'config.json').read_text())
from build import validate_config
try:validate_config(config)
except ValueError as error:issues.append({'file':'config.json','type':'analytics_config_invalid','detail':str(error)})
if config.get('analytics',{}).get('enabled') and not (R/'public/privacidade.html').exists():issues.append({'file':'public','type':'privacy_page_missing'})
(R/'reports').mkdir(exist_ok=True)
report={'pattern_scan':'pass' if not issues else 'fail','issues':issues,'scope':'Padrões comuns e higiene do pacote; não é garantia de ausência de todo segredo ou vulnerabilidade.'}
(R/'reports/audit.json').write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n')
print('Auditoria:',len(issues),'ocorrências.');assert not issues,issues

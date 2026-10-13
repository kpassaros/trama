"""Gera o portal estático, validando IDs, referências e conteúdo antes da saída."""
from pathlib import Path
import json, re, shutil, sys, base64
from urllib.parse import urlsplit
ROOT=Path(__file__).resolve().parents[1]
OUT=ROOT/'public'
def read(path): return json.loads(path.read_text(encoding='utf-8'))
def validate(tracks,lessons,refs):
    track_ids=[t['id'] for t in tracks]
    if len(track_ids)!=len(set(track_ids)): raise ValueError('ID de trilha duplicado')
    ids=[]
    for item in tracks+lessons+refs:
        if not re.fullmatch(r'[a-z0-9]+(?:-[a-z0-9]+)*',item['id']): raise ValueError('ID inválido: '+item['id'])
    for l in lessons:
        if l['track'] not in track_ids: raise ValueError('Aula aponta para trilha inexistente: '+l['id'])
        ids.append(l['id'])
        for key in ('title','objective','intro','sections','review','references'):
            if not l.get(key): raise ValueError(f'Campo obrigatório ausente em {l["id"]}: {key}')
        for section in l['sections']:
            if section.get('code') and section.get('codeBlocks'):
                raise ValueError('Use code ou codeBlocks, não ambos: '+l['id'])
            for block in section.get('codeBlocks', []):
                if not block.get('code') or not block.get('language') or not block.get('label'):
                    raise ValueError('Bloco precisa de code, language e label: '+l['id'])
        if not l['review'] or not l['references']: raise ValueError('Aula precisa de revisão e fontes: '+l['id'])
    if len(ids)!=len(set(ids)): raise ValueError('ID de aula duplicado')
    for track_id in track_ids:
        if not any(l['track']==track_id for l in lessons):
            raise ValueError('Trilha precisa de ao menos uma aula: '+track_id)
    ref_ids=[x['id'] for x in refs]
    if len(ref_ids)!=len(set(ref_ids)): raise ValueError('ID de referência duplicado')
    for source in [s for l in lessons for s in l['references']]+[r['source'] for r in refs]:
        if not source.get('url','').startswith('https://'): raise ValueError('Fonte precisa ser HTTPS: '+str(source))
    return track_ids

def validate_config(cfg):
    for key in ('portfolio_url','contact_url','linkedin_url'):
        value=cfg.get('creator',{}).get(key)
        if value:
            u=urlsplit(value)
            if u.scheme!='https' or not u.netloc or u.username or u.password:
                raise ValueError('Link do criador inválido: '+key)
    a=cfg.get('analytics',{})
    if a.get('enabled'):
        u=urlsplit(a.get('site_url',''))
        if a.get('provider')!='ga4' or not re.fullmatch(r'G-[A-Z0-9]+',a.get('measurement_id','')):
            raise ValueError('Provider/ID GA4 inválido')
        if not a.get('consent_required') or a.get('advertising_enabled'):
            raise ValueError('Coleta exige opt-in; publicidade deve permanecer desligada')
        if u.scheme!='https' or not u.netloc or u.username or u.password or u.query or u.fragment or not u.path.endswith('/'):
            raise ValueError('URL base GA4 inválida')
        days=a.get('consent_days',180)
        if not isinstance(days,int) or isinstance(days,bool) or not 1<=days<=365:
            raise ValueError('Prazo de preferência inválido')

def build():
    cfg=read(ROOT/'config.json')
    tracks=read(ROOT/'content/catalog.json')['tracks']
    lessons=[read(p) for p in sorted((ROOT/'content/lessons').glob('*.json'))]
    refs=read(ROOT/'content/reference.json')['items']
    validate(tracks,lessons,refs)
    # Gate de configuração: enabled não dispensa consentimento individual no navegador.
    validate_config(cfg)
    if OUT.exists(): shutil.rmtree(OUT)
    OUT.mkdir(parents=True)
    shutil.copytree(ROOT/'assets',OUT/'assets',dirs_exist_ok=True)
    # Suporta tanto fontes binárias locais quanto transporte textual .base64.
    for encoded in (OUT/'assets').rglob('*.base64'):
        target=encoded.with_suffix('')
        if not target.exists(): target.write_bytes(base64.b64decode(encoded.read_text(),validate=True))
        encoded.unlink()
    if (ROOT/'docs').exists():
        shutil.copytree(ROOT/'docs',OUT/'docs',dirs_exist_ok=True)
        for encoded in (OUT/'docs').rglob('*.base64'):
            target=encoded.with_suffix('')
            if not target.exists(): target.write_bytes(base64.b64decode(encoded.read_text(),validate=True))
            encoded.unlink()
    from views import render_site
    render_site(cfg,tracks,lessons,refs,OUT)
    print(f'Gerado: {len(tracks)} trilhas, {len(lessons)} aulas, {len(refs)} referências rápidas. Saída: public/')
if __name__=='__main__':
    try: build()
    except Exception as ex:
        print('Falha na geração:',ex,file=sys.stderr)
        raise

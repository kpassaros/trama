"""Coloração editorial estática. Não é parser/execução: o texto original é preservado."""
import re, html
WORDS=set('SELECT FROM WHERE AND OR NOT IS NULL IN LIKE ORDER BY ASC DESC CASE WHEN THEN ELSE END AS CAST DISTINCT GROUP HAVING JOIN INNER LEFT RIGHT FULL OUTER ON WITH OVER PARTITION ROWS BETWEEN UNBOUNDED PRECEDING CURRENT ROW LIMIT OFFSET UNION ALL EXPLAIN USING TRUE FALSE let in each if then else const let var function return async await try catch throw new import export of for class extends typeof document console'.lower().split())
FUNC=set('count sum avg min max coalesce nullif row_number rank dense_rank lag lead date_trunc datediff calculate divide distinctcount filter lookup patch empty xlookup sumifs unique fetch map reduce selectrows transformcolumntypes nestedjoin queryselector addeventlistener'.split())
TOKEN=re.compile(r"(--[^\n]*|//[^\n]*|/\*[\s\S]*?\*/|<!--[^>]*-->|'(?:''|[^'])*'|\"(?:\\.|[^\"\\])*\"|`(?:\\.|[^`\\])*`|\b\d+(?:\.\d+)?\b|[#.]?[A-Za-z_$][\w$-]*|[<>=+*/!?:%&|]+)")
def highlight(code,lang=''):
    out=[]; pos=0
    for m in TOKEN.finditer(code):
        out.append(html.escape(code[pos:m.start()])); text=m.group(); low=text.lower(); cls=''
        if text.startswith(('--','//','/*','<!--')): cls='comment'
        elif text[0] in "'\"`": cls='string'
        elif text[0].isdigit(): cls='number'
        elif low in WORDS: cls='keyword'
        elif low in FUNC or re.match(r'\s*\(',code[m.end():]): cls='function'
        elif text.startswith(('#','.')) or lang.lower()=='css' and re.match(r'\s*:',code[m.end():]): cls='property'
        elif text[0] in '<>=+*/!?:%&|': cls='operator'
        elif lang.lower()=='html' and code[max(0,m.start()-2):m.start()].endswith(('<','</')): cls='keyword'
        safe=html.escape(text); out.append(f'<span class="syn-{cls}">{safe}</span>' if cls else safe); pos=m.end()
    out.append(html.escape(code[pos:])); return ''.join(out)

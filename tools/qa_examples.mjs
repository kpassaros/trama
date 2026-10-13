// CI: analisa JavaScript como texto; nunca executa código editável de aulas.
import {spawnSync} from 'node:child_process';
import {readFile,readdir,writeFile,mkdir} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import path from 'node:path';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const blocks=[];
for(const file of await readdir(root+'/content/lessons')){
 if(!file.endsWith('.json'))continue;
 const lesson=JSON.parse(await readFile(root+'/content/lessons/'+file,'utf8'));
 for(const section of lesson.sections){
  if(section.code&&lesson.track==='javascript')blocks.push({id:lesson.id,code:section.code});
  for(const block of section.codeBlocks||[])if(block.language.toLowerCase()==='javascript')blocks.push({id:lesson.id+':'+block.label,code:block.code});
 }
}
const refs=JSON.parse(await readFile(root+'/content/reference.json','utf8')).items;
for(const ref of refs)if(ref.tool==='JavaScript')blocks.push({id:ref.id,code:ref.code});
const checks=blocks.map(({id,code})=>{
 const result=spawnSync(process.execPath,['--input-type=module','--check'],{input:code,encoding:'utf8',timeout:10000});
 if(result.error||result.status!==0)throw Error('Sintaxe inválida: '+id+'\n'+(result.error||result.stderr));
 return {id,passed:true};
});
await mkdir(root+'/reports',{recursive:true});
await writeFile(root+'/reports/qa-examples.json',JSON.stringify({checks,executed:false,scope:'Somente parsing pelo Node --check. Nenhum exemplo editável é executado em CI; não comprova comportamento nem retorno.'},null,2));
console.log(`Sintaxe JavaScript: ${checks.length} blocos aprovados, sem executar exemplos.`);

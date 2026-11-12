import fs from 'node:fs';
const path='public/templates/manifest.json';
const current=JSON.parse(fs.readFileSync(path,'utf8'));
const incoming=JSON.parse(fs.readFileSync('new-template-entries.json','utf8'));
for(const t of incoming){if(!current.some(c=>c.id===t.id))current.push(t);}
fs.writeFileSync(path,JSON.stringify(current,null,2)+'\n');
console.log('Installed',incoming.length,'templates; total:',current.length);

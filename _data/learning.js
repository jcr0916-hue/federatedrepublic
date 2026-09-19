import fs from 'node:fs';
const source=fs.readFileSync('scenarios.html','utf8');
const categories=JSON.parse(source.match(/const SCENARIO_CATS = (.*);/)[1]);
for(const category of categories)for(const entry of category.entries){
 const text=fs.readFileSync(entry.href,'utf8').replace(/<(script|style)\b[^>]*>[\s\S]*?<\/\1>/gi,'').replace(/<[^>]+>/g,' ');
 entry.minutes=Math.max(1,Math.ceil(text.split(/\s+/).length/220));
 entry.refs=[...new Set(text.match(/§\d+\.\d+(?:\.[a-z])?/g)||[])].slice(0,4);
}
export default {categories};

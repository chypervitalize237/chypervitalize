// Canonical legal templates; this generator does not modify application code.
import {readFileSync,writeFileSync} from 'node:fs';
for(const name of ['contact','privacy','terms']) {
 writeFileSync(new URL('./public/'+name+'.html',import.meta.url),readFileSync(new URL('./legal/'+name+'.html',import.meta.url),'utf8'));
}

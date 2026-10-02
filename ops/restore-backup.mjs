// Restore to a NEW, offline file. Never overwrite the running production database.
import {readFile, writeFile} from 'node:fs/promises';
import {resolve} from 'node:path';
import {decryptSnapshot,encryptionKey,checkSnapshot} from './automatic-backup.mjs';
const [input,destination]=process.argv.slice(2);
if(!input||!destination)throw Error('Usage: BACKUP_ENCRYPTION_KEY=... node ops/restore-backup.mjs ENCRYPTED_FILE NEW_DATABASE');
const bytes=decryptSnapshot(await readFile(resolve(input)),encryptionKey(process.env.BACKUP_ENCRYPTION_KEY));
await writeFile(resolve(destination),bytes,{flag:'wx',mode:0o600});
checkSnapshot(resolve(destination));
console.log('Restore verified: SQLite integrity_check=ok');

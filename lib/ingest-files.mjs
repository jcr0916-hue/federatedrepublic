import fs from 'node:fs';
import path from 'node:path';

export const exists = p => { try { fs.lstatSync(p); return true; } catch (e) { if(e.code==='ENOENT') return false; throw e; } };

// Never traverse symlinks, including a destination's parent directories.
export function safePath(root, relative) {
  if(path.isAbsolute(relative) || relative.split(/[\\/]/).some(p=>p==='..')) throw Error('Unsafe path');
  const absolute=path.resolve(root,relative);
  let current=path.parse(absolute).root;
  for(const part of absolute.slice(current.length).split(path.sep).filter(Boolean)) {
    current=path.join(current,part);
    if(exists(current) && fs.lstatSync(current).isSymbolicLink()) throw Error(`Symlink refused: ${current}`);
  }
  return absolute;
}

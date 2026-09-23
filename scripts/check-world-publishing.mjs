#!/usr/bin/env node
import fs from 'node:fs';
import {readPublishingRecords,checkWorldPublishing} from '../lib/world-publishing.mjs';
try {
  const records=readPublishingRecords();
  const provisions=new Set(JSON.parse(fs.readFileSync('constitution_data.json','utf8')).flatMap(a=>a.provisions.map(p=>p.num)));
  const dossiers=JSON.parse(fs.readFileSync('_data/currentFiles.json','utf8'));
  const status=fs.existsSync('docs/WORLD-STORY-STATUS.md')?fs.readFileSync('docs/WORLD-STORY-STATUS.md','utf8'):null;
  const {errors,warnings}=checkWorldPublishing(records,{provisions,dossiers,status});
  for(const message of warnings)console.warn(`[world publish warning] ${message}`);
  for(const message of errors)console.error(`[world publish FAIL] ${message}`);
  if(errors.length)process.exitCode=1;
  else console.log(`[world publish PASS] ${records.length} records validated; ${warnings.length} editorial reminder(s).`);
} catch(error){console.error(`[world publish FAIL] ${error.message}`);process.exitCode=1;}

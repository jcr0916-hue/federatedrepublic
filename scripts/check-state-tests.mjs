import {loadStateTestIndex} from '../lib/state-tests.mjs';

try {
  const index=loadStateTestIndex();
  console.log(`[state tests PASS] ${index.entries.length} canonical historical tests; ${Object.keys(index.byProvision).length} cited State provisions.`);
} catch(error) {
  console.error(`[state tests FAIL] ${error.message}`);
  process.exitCode=1;
}

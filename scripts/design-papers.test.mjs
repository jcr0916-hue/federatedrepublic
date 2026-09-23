import test from "node:test";
import assert from "node:assert/strict";
import {validateDesignPapers,paperChronology} from "../lib/design-papers.mjs";
const page=(id,status="draft",date=null,related=[])=>({inputPath:id+".html",data:{paperId:id,paperTitle:id,paperTopic:"principles",paperStatus:status,paperDate:date,paperSummary:"Summary",paperProvisions:["§2.1"],paperRelated:related}});
test("validates paper metadata and relationships",()=>{
  const refs=new Set(["§2.1"]);
  assert.doesNotThrow(()=>validateDesignPapers([page("a"),page("b","published","2026-09-22",["a"])],refs));
  assert.throws(()=>validateDesignPapers([page("a"),page("a")],refs),/duplicate paperId/);
  assert.throws(()=>validateDesignPapers([page("a","published",null)],refs),/YYYY-MM-DD/);
  assert.throws(()=>validateDesignPapers([page("a","draft",null,["missing"])],refs),/Unknown related paper/);
});
test("published chronology sorts newest first",()=>{
  const p=[page("a","published","2026-01-01"),page("b","published","2026-09-22")].sort(paperChronology);
  assert.deepEqual(p.map(x=>x.data.paperId),["b","a"]);
});

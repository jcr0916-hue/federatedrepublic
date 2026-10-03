const { test } = require('node:test');
const assert = require('node:assert/strict');
const { usageTotals, annotatorMetric, navigatorEfficiencyFields } = require('../api/_ai-metrics.js');

test('usage totals combine provider usage across rewrite attempts',()=>{
  assert.deepEqual(
    usageTotals({input_tokens:100,output_tokens:20},{input_tokens:110,output_tokens:30}),
    {inputTokens:210,outputTokens:50}
  );
});

test('AI efficiency metrics exclude prompt and answer text',()=>{
  const original=console.info;
  let logged;
  console.info=(_label,payload)=>{ logged=payload; };
  try{
    const metric=annotatorMetric({
      model:'anthropic/claude-sonnet-5',
      route:'gateway',
      aiCalls:2,
      durationMs:1234,
      packetChars:4567,
      relatedCount:3,
      inputTokens:800,
      outputTokens:300,
      retried:true,
      retryKind:'output_contract',
      prompt:'secret question',
      answer:'secret answer',
    });
    assert.equal(metric.prompt,undefined);
    assert.equal(metric.answer,undefined);
    assert.equal(logged.prompt,undefined);
    assert.equal(logged.answer,undefined);
    assert.equal(metric.inputTokens,800);
    assert.equal(metric.retried,true);

    const nav=navigatorEfficiencyFields({
      durationMs:700,
      inputTokens:400,
      outputTokens:100,
      completionRetried:true,
      question:'do not log',
    });
    assert.deepEqual(nav,{durationMs:700,inputTokens:400,outputTokens:100,completionRetried:true});
  } finally {
    console.info=original;
  }
});

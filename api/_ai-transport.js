// Shared AI transport for gradual migration to Vercel AI Gateway.
// Prefer Gateway credentials on Vercel; retain direct Anthropic as a rollback path
// while endpoints are migrated and benchmarked.

function gatewayToken() {
  return process.env.AI_GATEWAY_API_KEY || process.env.VERCEL_OIDC_TOKEN || '';
}

function anthropicDirectModel(model) {
  return String(model || '').replace(/^anthropic\//, '');
}

async function anthropicMessage({
  model,
  max_tokens,
  system,
  messages,
  tags = [],
}) {
  const token = gatewayToken();

  if (token) {
    const gatewayModel = String(model || '').includes('/') ? String(model) : `anthropic/${model}`;
    const response = await fetch('https://ai-gateway.vercel.sh/v1/messages', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: gatewayModel,
        max_tokens,
        system,
        messages,
        providerOptions: {
          gateway: {
            tags: ['site:federated-republic', ...tags],
          },
        },
      }),
    });
    return { response, route: 'gateway', model: gatewayModel };
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) throw new Error('No AI Gateway or Anthropic credential configured');

  const directModel = anthropicDirectModel(model);
  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: directModel,
      max_tokens,
      system,
      messages,
    }),
  });
  return { response, route: 'anthropic-direct', model: directModel };
}

module.exports = { anthropicMessage, gatewayToken, anthropicDirectModel };

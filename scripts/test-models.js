/**
 * Test script to check which OpenRouter models actually return data.
 * Run: node test-models.js
 */
import 'dotenv/config';

const models = [
  'google/gemini-2.0-flash-001',
  'google/gemini-2.5-pro',
  'meta-llama/llama-3.3-70b-instruct:free',
  'deepseek/deepseek-chat',
  'deepseek/deepseek-r1-0528:free',
];

const testPrompt = {
  messages: [
    {
      role: 'system',
      content: 'You are a helpful assistant. Respond with valid JSON only: {"test": "success"}'
    },
    {
      role: 'user',
      content: 'Respond with the JSON now.'
    }
  ],
  max_tokens: 100,
  temperature: 0.5,
};

async function testModel(model) {
  console.log(`\n🧪 Testing: ${model}`);

  try {
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
        'HTTP-Referer': 'http://localhost:3001',
        'X-Title': 'Tasks Generator Model Test',
      },
      body: JSON.stringify({
        ...testPrompt,
        model,
      }),
    });

    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      console.error(`❌ HTTP ${response.status}: ${errData.error?.message || response.statusText}`);
      return { model, status: 'error', error: errData.error?.message || response.statusText };
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || '';

    if (!content || content.trim().length === 0) {
      console.error(`❌ Empty response`);
      return { model, status: 'empty', content: '' };
    }

    console.log(`✅ Success (${content.length} chars)`);
    console.log(`   Response: ${content.substring(0, 100)}...`);
    return { model, status: 'success', content, length: content.length };

  } catch (err) {
    console.error(`❌ Network error: ${err.message}`);
    return { model, status: 'network_error', error: err.message };
  }
}

async function runTests() {
  console.log('='.repeat(60));
  console.log('OpenRouter Model Response Test');
  console.log('='.repeat(60));

  if (!process.env.OPENROUTER_API_KEY) {
    console.error('❌ OPENROUTER_API_KEY not set in .env');
    process.exit(1);
  }

  const results = [];

  for (const model of models) {
    const result = await testModel(model);
    results.push(result);
    await new Promise(resolve => setTimeout(resolve, 1000)); // 1s delay between tests
  }

  console.log('\n' + '='.repeat(60));
  console.log('Summary');
  console.log('='.repeat(60));

  results.forEach(r => {
    const emoji = r.status === 'success' ? '✅' : '❌';
    console.log(`${emoji} ${r.model.padEnd(40)} ${r.status}`);
  });

  const successful = results.filter(r => r.status === 'success').length;
  console.log(`\n${successful}/${results.length} models working`);
}

runTests().catch(console.error);

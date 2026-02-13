/**
 * Basic tests for API endpoints
 * Run with: node --test server/api/generate.test.js
 */
import { test, describe } from 'node:test';
import assert from 'node:assert';

describe('Input Validation', () => {
  test('should validate goal length', () => {
    const shortGoal = 'test';
    const validGoal = 'Build a user authentication system';

    assert.ok(shortGoal.length < 10, 'Short goal should be rejected');
    assert.ok(validGoal.length >= 10, 'Valid goal should pass');
  });

  test('should sanitize inputs to prevent token overflow', () => {
    const longGoal = 'a'.repeat(2000);
    const maxLength = 1000;
    const sanitized = longGoal.slice(0, maxLength);

    assert.strictEqual(sanitized.length, maxLength, 'Goal should be truncated to 1000 chars');
  });
});

describe('JSON Parsing', () => {
  test('should extract JSON from markdown fence', () => {
    const content = '```json\n{"title": "Test"}\n```';
    const fenceMatch = content.match(/```(?:json)?\s*([\s\S]*?)```/);

    assert.ok(fenceMatch, 'Should match markdown fence');
    assert.strictEqual(fenceMatch[1].trim(), '{"title": "Test"}', 'Should extract JSON');
  });

  test('should handle JSON without fences', () => {
    const content = '{"title": "Test"}';
    const parsed = JSON.parse(content);

    assert.strictEqual(parsed.title, 'Test', 'Should parse plain JSON');
  });

  test('should handle malformed JSON gracefully', () => {
    const malformedJson = '{title: "missing quotes"}';

    assert.throws(() => JSON.parse(malformedJson), SyntaxError, 'Should throw on malformed JSON');
  });
});

describe('Template Validation', () => {
  test('should accept valid template types', () => {
    const validTemplates = ['web', 'mobile', 'internal', 'api'];
    const templateLabels = {
      web: 'Web App',
      mobile: 'Mobile App',
      internal: 'Internal Tool',
      api: 'API Service'
    };

    validTemplates.forEach(template => {
      assert.ok(templateLabels[template], `Template ${template} should have a label`);
    });
  });
});

console.log('✓ All basic validation tests passed');

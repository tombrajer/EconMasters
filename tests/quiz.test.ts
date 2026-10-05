import { test } from 'node:test';
import assert from 'node:assert/strict';
import { questions, verdict } from '../src/quiz.ts';

test('the practice quiz has ten well-formed questions', () => {
  assert.equal(questions.length, 10);
  for (const question of questions) {
    assert.equal(question.options.length, 4);
    assert.equal(new Set(question.options).size, 4);
    assert.ok(question.answer >= 0 && question.answer < 4);
    assert.ok(question.prompt.length > 0 && question.explanation.length > 0);
  }
  assert.equal(new Set(questions.map(question => question.prompt)).size, 10);
});

test('the correct answer is not always in the same position', () => {
  const positions = new Set(questions.map(question => question.answer));
  assert.equal(positions.size, 4);
});

test('the quiz covers both microeconomics and macroeconomics', () => {
  const topics = new Set(questions.map(question => question.topic));
  assert.deepEqual([...topics].sort(), ['Macroeconomics', 'Microeconomics']);
});

test('scores map to the three result messages', () => {
  for (const score of [10, 9, 8]) assert.equal(verdict(score).title, "You're ready");
  for (const score of [7, 6, 5]) assert.equal(verdict(score).title, 'Practice more');
  for (const score of [4, 3, 2, 1, 0]) assert.equal(verdict(score).title, 'This needs some work');
});

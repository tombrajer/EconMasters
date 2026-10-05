export type QuizQuestion = {
  topic: 'Microeconomics' | 'Macroeconomics';
  prompt: string;
  options: [string, string, string, string];
  answer: 0 | 1 | 2 | 3;
  explanation: string;
};

export type Verdict = { tone: 'ready' | 'practice' | 'work'; title: string; message: string };

export const questions: QuizQuestion[] = [
  {
    topic: 'Microeconomics',
    prompt: 'A new technology lowers the cost of making solar panels. With demand unchanged, what happens to equilibrium price and quantity?',
    options: ['Price rises, quantity falls', 'Price falls, quantity rises', 'Price and quantity both rise', 'Nothing changes'],
    answer: 1,
    explanation: 'Lower production costs shift supply to the right. Equilibrium price falls and quantity rises.'
  },
  {
    topic: 'Microeconomics',
    prompt: 'The price of a good with elastic demand rises. What happens to total revenue?',
    options: ['It rises', 'It stays the same', 'It rises, then falls', 'It falls'],
    answer: 3,
    explanation: 'When demand is elastic, quantity demanded falls by a larger percentage than price rises, so total revenue falls.'
  },
  {
    topic: 'Microeconomics',
    prompt: "A firm's marginal cost is below its average total cost. If it produces one more unit, what happens to average total cost?",
    options: ['It falls', 'It rises', 'It stays the same', 'It cannot be determined'],
    answer: 0,
    explanation: 'A marginal unit that costs less than the current average pulls the average down.'
  },
  {
    topic: 'Microeconomics',
    prompt: 'Which of these describes a perfectly competitive firm but not a monopolist?',
    options: ['It faces a downward-sloping demand curve', 'It earns economic profit in the long run', 'It is a price taker', 'It restricts output to raise price'],
    answer: 2,
    explanation: 'A perfectly competitive firm is too small to affect the market price, so it takes the price as given.'
  },
  {
    topic: 'Microeconomics',
    prompt: 'A factory pollutes a river and the nearby residents bear the cost without being part of the sale. This is an example of:',
    options: ['A public good', 'A negative externality', 'A price ceiling', 'Allocative efficiency'],
    answer: 1,
    explanation: 'The cost falls on third parties, so the social cost is higher than the private cost and the market overproduces.'
  },
  {
    topic: 'Macroeconomics',
    prompt: "Which of these is counted in this year's GDP?",
    options: ['The resale of a used car', "A household's purchase of shares", 'Unemployment benefits paid by the government', 'A new car produced and sold domestically'],
    answer: 3,
    explanation: 'GDP counts newly produced final goods and services. Resales, financial assets and transfer payments are not production.'
  },
  {
    topic: 'Macroeconomics',
    prompt: 'A worker has stopped looking for a job because they believe none is available. How are they classified?',
    options: ['Not in the labor force', 'Unemployed', 'Employed', 'Underemployed'],
    answer: 0,
    explanation: 'To count as unemployed, a person must be actively looking for work. Discouraged workers are outside the labor force.'
  },
  {
    topic: 'Macroeconomics',
    prompt: 'Which of these shifts the aggregate demand curve to the right?',
    options: ['A rise in the price level', 'An increase in income taxes', 'An increase in government spending', 'A fall in consumer confidence'],
    answer: 2,
    explanation: 'Government spending is a component of aggregate demand. A rise in the price level is a movement along the curve, not a shift.'
  },
  {
    topic: 'Macroeconomics',
    prompt: 'To reduce inflation, a central bank would most likely:',
    options: ['Buy government bonds', 'Sell government bonds', 'Lower the reserve requirement', 'Lower the discount rate'],
    answer: 1,
    explanation: 'Selling bonds pulls reserves out of the banking system, raising interest rates and cooling aggregate demand.'
  },
  {
    topic: 'Macroeconomics',
    prompt: 'The domestic currency appreciates, all else equal. What happens to exports and imports?',
    options: ['Exports rise, imports fall', 'Both rise', 'Both fall', 'Exports fall, imports rise'],
    answer: 3,
    explanation: 'Domestic goods become more expensive for foreign buyers, while foreign goods become cheaper for domestic buyers.'
  }
];

export function verdict(score: number, total = questions.length): Verdict {
  const share = total === 0 ? 0 : score / total;
  if (share >= .8) return { tone: 'ready', title: "You're ready", message: 'Strong result. The real exam has about 60 questions at this level, so keep your timing sharp and register your team.' };
  if (share >= .5) return { tone: 'practice', title: 'Practice more', message: 'A solid base. Go back over the topics you missed, then try again.' };
  return { tone: 'work', title: 'This needs some work', message: 'Review the core micro and macro topics in "What to prepare" below, then take the quiz again.' };
}

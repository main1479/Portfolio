export type CurtainMessageKind = 'personality' | 'experiment' | 'functional';

export type CurtainMessage = {
  text: string;
  kind: CurtainMessageKind;
};

export const CURTAIN_MESSAGES: readonly CurtainMessage[] = [
  // Personality — carries the previous portfolio's voice
  { kind: 'personality', text: 'Almost there…' },
  { kind: 'personality', text: 'Please wait…' },
  { kind: 'personality', text: 'Wow, you are here!' },
  { kind: 'personality', text: 'You made it.' },
  // Experiment voice — on-brand for an A/B testing specialist
  { kind: 'experiment', text: 'Variant A is loading…' },
  { kind: 'experiment', text: 'Hypothesis: you’ll like this one' },
  { kind: 'experiment', text: 'Stat sig: pending…' },
  { kind: 'experiment', text: 'Running the test…' },
  // Functional — substitutes the destination label for {{route}}
  { kind: 'functional', text: 'Next: {{route}}' },
] as const;

// 60% personality / 30% experiment / 10% functional
function pickKind(canUseFunctional: boolean): CurtainMessageKind {
  const r = Math.random();
  if (r < 0.6) return 'personality';
  if (r < 0.9) return 'experiment';
  return canUseFunctional ? 'functional' : 'personality';
}

export function pickCurtainMessage(destinationLabel?: string): string {
  const trimmed = destinationLabel?.trim();
  const kind = pickKind(Boolean(trimmed));
  const pool = CURTAIN_MESSAGES.filter((m) => m.kind === kind);
  const choice = pool[Math.floor(Math.random() * pool.length)];
  if (choice.kind === 'functional' && trimmed) {
    return choice.text.replace('{{route}}', trimmed);
  }
  return choice.text;
}

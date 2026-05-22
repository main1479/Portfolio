const MARKS = Array.from({ length: 21 }, (_, i) => i);

export function TickRule({ className }: { className?: string }) {
  return (
    <div className={['tick-rule', className].filter(Boolean).join(' ')} aria-hidden="true">
      <div className="tick-rule__marks">
        {MARKS.map((i) => (
          <span key={i} />
        ))}
      </div>
    </div>
  );
}

type Props = {
  size?: number;
  strokeWidth?: number;
  className?: string;
};

export function Arrow({ size = 16, strokeWidth = 1.5, className }: Props) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
      className={className}
    >
      <path d="M5 12h14M13 5l7 7-7 7" />
    </svg>
  );
}

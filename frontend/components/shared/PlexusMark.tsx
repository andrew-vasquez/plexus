type PlexusMarkProps = {
  className?: string;
};

export function PlexusMark({ className }: PlexusMarkProps) {
  return (
    <svg
      aria-hidden="true"
      className={className}
      fill="none"
      viewBox="0 0 24 24"
    >
      <path
        d="M4 12.2h5.3l2.7-4.4 2.7 8.4 1.8-4h3.5"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.8"
      />
    </svg>
  );
}

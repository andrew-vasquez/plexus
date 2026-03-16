type SectionHeadingProps = {
  eyebrow: string;
  title: string;
  description: string;
};

export function SectionHeading({
  eyebrow,
  title,
  description,
}: SectionHeadingProps) {
  return (
    <div className="max-w-3xl">
      <p className="type-label text-[var(--color-accent)]">{eyebrow}</p>
      <h2 className="mt-4 type-display text-4xl leading-tight tracking-[-0.04em] text-white sm:text-5xl">
        {title}
      </h2>
      <p className="mt-4 max-w-2xl text-base leading-8 text-[var(--color-text-muted)]">
        {description}
      </p>
    </div>
  );
}

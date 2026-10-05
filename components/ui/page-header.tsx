type PageHeaderProps = {
  title: string;
  description?: string;
};

export function PageHeader({ title, description }: PageHeaderProps) {
  return (
    <header>
      <h1 style={{ margin: 0, fontSize: "1.75rem", lineHeight: 1.2 }}>{title}</h1>
      {description ? (
        <p style={{ margin: "0.5rem 0 0", color: "var(--muted)" }}>{description}</p>
      ) : null}
    </header>
  );
}

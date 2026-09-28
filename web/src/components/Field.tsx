export function Field({
  label,
  name,
  errors,
  hint,
  children,
}: {
  label: string;
  name: string;
  errors?: Record<string, string[] | undefined>;
  hint?: React.ReactNode;
  children: React.ReactNode;
}) {
  const msg = errors?.[name]?.[0];
  return (
    <div className="field">
      <label htmlFor={name}>{label}</label>
      {children}
      {hint && !msg && <span className="hint">{hint}</span>}
      {msg && (
        <span className="field-error" id={`${name}-error`}>
          {msg}
        </span>
      )}
    </div>
  );
}

export function FormAlert({ error, message }: { error?: string; message?: string }) {
  if (error) return <div className="alert error" role="alert">{error}</div>;
  if (message) return <div className="alert ok" role="status">{message}</div>;
  return null;
}

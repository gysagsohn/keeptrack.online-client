import { useId } from "react";

/**
 * Reusable labelled input field.
 * Generates a stable id to link the label and input for accessibility.
 */
export default function Input({ label, error, hint, className = "", wrapperClassName = "", ...props }) {
  // useId generates a stable unique id — same pattern as PasswordInput
  const id = useId();

  return (
    <div className={`w-full ${wrapperClassName}`}>
      {label && (
        <label
          htmlFor={id}
          className="mb-1 block text-sm font-medium text-secondary"
        >
          {label}
        </label>
      )}
      <input
        id={id}
        className={`input ${className}`}
        aria-invalid={!!error}
        aria-describedby={error ? `${id}-err` : undefined}
        {...props}
      />
      {error && (
        <p id={`${id}-err`} className="mt-1 text-sm" style={{ color: "var(--color-warning)" }}>
          {error}
        </p>
      )}
      {hint && !error && (
        <p className="mt-1 text-xs text-secondary">{hint}</p>
      )}
    </div>
  );
}
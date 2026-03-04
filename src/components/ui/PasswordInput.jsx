import { useId, useState } from "react";
import { FaEye, FaEyeSlash } from "react-icons/fa";

export default function PasswordInput({
  label = "Password",
  name = "password",
  value,
  onChange,
  placeholder="At least 8 chars, incl. letters, numbers & symbol",
  error = "",
  onBlur,
  onKeyDown, // allow parent to listen (for strength, etc.)
  onKeyUp,
  required,
  autoComplete = "current-password",
}) {
  const [show, setShow] = useState(false);
  const [capsOn, setCapsOn] = useState(false);
  const id = useId();
  const describedBy = [
    error ? `${id}-err` : null,
    capsOn ? `${id}-caps` : null,
  ].filter(Boolean).join(" ") || undefined;

  const handleKeyDown = (e) => {
    setCapsOn(e.getModifierState && e.getModifierState("CapsLock"));
    onKeyDown?.(e);
  };
  const handleKeyUp = (e) => {
    setCapsOn(e.getModifierState && e.getModifierState("CapsLock"));
    onKeyUp?.(e);
  };

  return (
    <div>
      <label htmlFor={id} className="mb-1 block text-sm text-secondary">{label}</label>
      <div className="relative">
        <input
          id={id}
          name={name}
          type={show ? "text" : "password"}
          value={value}
          onChange={onChange}
          onBlur={onBlur}
          onKeyDown={handleKeyDown}
          onKeyUp={handleKeyUp}
          placeholder={placeholder}
          autoComplete={autoComplete}
          required={required}
          className={`input pr-10 ${error ? "input-error" : ""}`}
          aria-invalid={!!error}
          aria-describedby={describedBy}
        />
        <button
          type="button"
          onClick={() => setShow(s => !s)}
          className="absolute right-3 top-1/2 -translate-y-1/2 icon-secondary"
          aria-label={show ? "Hide password" : "Show password"}
        >
          {show ? <FaEyeSlash /> : <FaEye />}
        </button>
      </div>

      {capsOn && (
        <p id={`${id}-caps`} className="mt-1 text-sm" style={{ color: "var(--color-warning)" }}>
          Warning: Caps Lock is on.
        </p>
      )}
      {error && (
        <p id={`${id}-err`} className="mt-1 text-sm" style={{ color: "var(--color-warning)" }}>
          {error}
        </p>
      )}
    </div>
  );
}

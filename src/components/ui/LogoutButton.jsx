import { useAuth } from "../../contexts/useAuth";

/**
 * Logout button styled with warning colours.
 * Uses Tailwind hover/focus variants instead of inline JS event handlers
 * so keyboard users get a visible focus ring.
 *
 * Props:
 *   className  — extra classes to merge in (e.g. for margin)
 *   fullWidth  — if true, stretches to fill its container
 */
export default function LogoutButton({ className = "", fullWidth = false }) {
  const { logout } = useAuth();

  return (
    <button
      onClick={logout}
      className={[
        "btn text-sm py-3 transition-colors duration-200",
        // Light red background + red text to signal a destructive action
        "bg-[color-mix(in_oklab,var(--color-warning)_10%,white)]",
        "text-[var(--color-warning)]",
        "border border-[color-mix(in_oklab,var(--color-warning)_30%,transparent)]",
        // Slightly darker on hover
        "hover:bg-[color-mix(in_oklab,var(--color-warning)_20%,white)]",
        // Visible focus ring for keyboard navigation
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-warning)] focus-visible:ring-offset-2",
        fullWidth ? "w-full justify-center" : "inline-flex justify-center",
        className,
      ].join(" ")}
    >
      Logout
    </button>
  );
}
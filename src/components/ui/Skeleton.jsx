export default function Skeleton({ className = "", variant = "default" }) {
  const variants = {
    default: "h-4 bg-[--color-border-muted] rounded",
    text: "h-3 bg-[--color-border-muted] rounded",
    title: "h-6 bg-[--color-border-muted] rounded",
    avatar: "h-10 w-10 bg-[--color-border-muted] rounded-full",
    button: "h-10 bg-[--color-border-muted] rounded-lg",
    card: "h-32 bg-[--color-border-muted] rounded-lg",
  };

  // role and aria-label are intentionally omitted here.
  // Wrap a group of skeletons in a single <div role="status" aria-label="Loading">
  // at the page level so screen readers announce "Loading" only once.
  return <div className={`${variants[variant]} ${className} animate-pulse`} />;
}
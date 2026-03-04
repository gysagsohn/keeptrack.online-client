export default function Button({ 
  className = "", 
  disabled, 
  loading, 
  variant = "primary",  
  size = "default",     
  children, 
  ...props 
}) {
  const isDisabled = disabled || loading;
  
  const variantClass = {
    primary: "btn-primary",
    success: "btn-success",
    warning: "btn-warning",
    secondary: "", 
  }[variant] || "btn-primary";
  
  const sizeClass = size === "sm" ? "btn-sm" : "";
  
  return (
    <button
      className={`btn ${variantClass} ${sizeClass} relative ${className}`.trim()}
      disabled={isDisabled}
      {...props}
    >
      {loading && (
        <span 
          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 inline-block h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"
          aria-hidden="true"
        />
      )}
      <span className={loading ? "opacity-0" : ""}>{children}</span>
    </button>
  );
}
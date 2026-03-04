import googleLogo from "../assets/google-logo.svg";

function trimTrailingSlash(s = "") {
  return s.replace(/\/+$/, "");
}

export default function GoogleButton({ className = "" }) {
  // VITE_API_URL already includes /api (e.g., http://localhost:3001/api)
  const API = trimTrailingSlash(import.meta.env.VITE_API_URL || "");

  const handleClick = () => {
    if (!API) {
      console.error("VITE_API_URL is not defined");
      return;
    }
    
    // DEBUG: Log the full URL
    const redirect = encodeURIComponent(window.location.pathname || "/dashboard");
    const fullUrl = `${API}/auth/google?redirect=${redirect}`;
    console.log("🔍 API:", API);
    console.log("🔍 Full OAuth URL:", fullUrl);
    
    // API already has /api, so just add /auth/google
    window.location.href = fullUrl;
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      className={`w-full flex items-center justify-center gap-3 rounded-[var(--radius-standard)] border border-[--color-border-muted] bg-white py-3 text-sm font-medium shadow-sm transition duration-200 hover:bg-[#f8f9fa] hover:border-[#4285F4] hover:shadow-md active:scale-[0.98] ${className}`}
    >
      <img src={googleLogo} alt="" className="h-5 w-5" />
      <span className="text-[#5F6368]">Continue with Google</span>
    </button>
  );
}
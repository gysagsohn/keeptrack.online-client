import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import logo from "../assets/logo.png";
import GoogleButton from "../components/GoogleButton";
import Button from "../components/ui/Button";
import Input from "../components/ui/Input";
import PasswordInput from "../components/ui/PasswordInput";
import { useAuth } from "../contexts/useAuth";
import { useToast } from "../contexts/useToast";
import { isEmail, validatePasswordLogin } from "../utils/validators";

export default function LoginPage() {
  const { state } = useLocation();
  const toast = useToast();

  useEffect(() => {
    if (state?.justReset) {
      toast.success("Password updated. Please sign in.");
      // Clear the navigation state so it doesn't re-toast on refresh
      window.history.replaceState({}, document.title);
    }
  }, [state, toast]);

  const nav = useNavigate();
  const { login } = useAuth();
  const [form, setForm] = useState({ email: "", password: "" });
  const [errors, setErrors] = useState({ email: "", password: "" });
  const [formError, setFormError] = useState("");
  const [loading, setLoading] = useState(false);

  const validateEmailField = (v) => (isEmail(v) ? "" : "Enter a valid email address.");
  const validatePasswordField = (v) => {
    const res = validatePasswordLogin(v);
    return res.ok ? "" : res.message;
  };

  const onChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
    if (name === "email") setErrors((er) => ({ ...er, email: validateEmailField(value) }));
    if (name === "password") setErrors((er) => ({ ...er, password: validatePasswordField(value) }));
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    const emailErr = validateEmailField(form.email);
    const pwErr = validatePasswordField(form.password);
    setErrors({ email: emailErr, password: pwErr });
    if (emailErr || pwErr) return;

    setLoading(true);
    setFormError("");
    try {
      await login(form.email.trim(), form.password);
      nav("/dashboard");
    } catch (err) {
      setFormError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const submitDisabled = loading || !!errors.email || !!errors.password;

  return (
    <div className="min-h-screen bg-default flex items-center justify-center p-6">
      <div className="mx-auto max-w-6xl w-full">
        <div className="grid gap-8 lg:grid-cols-2 lg:items-center">
          <div className="flex justify-center lg:justify-start">
            <img
              src={logo}
              alt="Keep Track"
              className="w-32 h-auto sm:w-40 lg:w-[520px] lg:max-w-[520px]"
            />
          </div>

          <div className="card shadow-card p-6 bg-card rounded-[var(--radius-standard)] w-full max-w-md justify-self-center lg:justify-self-auto text-center">
            {/* ARIA live region announces form-level errors to screen readers */}
            <div aria-live="polite" className="sr-only">
              {formError || errors.email || errors.password}
            </div>

            <h1 className="mb-1 h1">Welcome back</h1>
            <p className="mb-6 text-secondary">Log in to track your games</p>

            {formError && (
              <div
                className="mb-4 rounded-[var(--radius-standard)] border p-3 text-sm"
                style={{
                  borderColor: "color-mix(in oklab, var(--color-warning) 40%, transparent)",
                  background: "color-mix(in oklab, var(--color-warning) 10%, white)",
                  color: "var(--color-warning)",
                }}
              >
                {formError}
              </div>
            )}

            <form onSubmit={onSubmit} className="space-y-4 text-left">
              <Input
                label="Email"
                type="email"
                name="email"
                placeholder="you@example.com"
                value={form.email}
                onChange={onChange}
                autoComplete="email"
                required
              />
              {errors.email && (
                <p className="text-sm mt-1" style={{ color: "var(--color-warning)" }}>
                  {errors.email}
                </p>
              )}

              <PasswordInput
                name="password"
                value={form.password}
                onChange={onChange}
                error={errors.password}
                autoComplete="current-password"
              />

              <Button
                type="submit"
                className="w-full"
                loading={loading}
                disabled={submitDisabled}
              >
                Sign in
              </Button>

              <div className="text-center">
                <Link
                  to="/forgot-password"
                  className="text-sm underline"
                  style={{ color: "var(--color-cta)" }}
                >
                  Forgot password?
                </Link>
              </div>

              <div className="flex items-center my-4">
                <div className="flex-grow border-t border-[--color-border-muted]" />
                <span className="px-2 text-secondary text-sm">or</span>
                <div className="flex-grow border-t border-[--color-border-muted]" />
              </div>

              {/* Google Sign-in */}
              <GoogleButton className="w-full" />
            </form>

            <p className="mt-4 text-center text-sm">
              New here?{" "}
              <Link className="underline" style={{ color: "var(--color-cta)" }} to="/signup">
                Create an account
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

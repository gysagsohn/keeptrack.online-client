import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import * as Sentry from "@sentry/react";
import "./index.css";
import App from "./App.jsx";

Sentry.init({
  dsn: import.meta.env.VITE_SENTRY_DSN,

  integrations: [
    Sentry.browserTracingIntegration(),
    Sentry.replayIntegration(),
  ],

  // Only trace my own backend 
  tracePropagationTargets: [
    "localhost",
    /^https:\/\/keeptrack\.online\/api/,
  ],

  // Capture 100% of transactions in dev, 20% in production.
  tracesSampleRate: import.meta.env.DEV ? 1.0 : 0.2,

  // Record 10% of sessions normally, 100% of sessions where an error occurs
  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1.0,

  // Don't send errors in development — keeps your Sentry dashboard clean
  enabled: !import.meta.env.DEV,
});

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <App />
  </StrictMode>
);
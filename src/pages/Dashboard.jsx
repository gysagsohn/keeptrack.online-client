import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import ActionButtons from "../components/dashboard/ActionButtons";
import LastGameCard from "../components/dashboard/LastGameCard";
import StatsCard from "../components/dashboard/StatsCard";
import Alert from "../components/ui/Alert";
import Card from "../components/ui/Card";
import { useAuth } from "../contexts/useAuth";
import api from "../lib/axios";

export default function Dashboard() {
  const { user } = useAuth();

  const [loading, setLoading] = useState(true);
  const [matches, setMatches] = useState([]);
  const [stats, setStats] = useState(null);
  const [error, setError] = useState("");

  // Fetch sessions and stats in parallel on mount, or when the user changes
  useEffect(() => {
    let ignore = false; // prevents state updates if the component unmounts mid-request

    async function load() {
      if (!user?._id) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError("");

        const [mRes, sRes] = await Promise.all([
          api.get("/sessions"),
          api.get(`/users/${user._id}/stats`)
        ]);

        if (ignore) return;

        const mPayload = mRes.data?.data || mRes.data || [];
        const sPayload = sRes.data?.data || sRes.data || {};

        // Sort newest match first for the "last game" card
        const sorted = Array.isArray(mPayload)
          ? [...mPayload].sort((a, b) => new Date(b.date) - new Date(a.date))
          : [];

        setMatches(sorted);
        setStats(sPayload);
      } catch (e) {
        if (!ignore) setError(e.message || "Failed to load dashboard data.");
      } finally {
        if (!ignore) setLoading(false);
      }
    }

    load();
    return () => { ignore = true; };
  }, [user?._id]);

  // Most recent match — first item after sorting
  const lastMatch = matches?.[0] || null;

  return (
    <main className="py-2 lg:py-6 px-4">
      <h1 className="h1 text-center mb-6 lg:mb-10">
        Welcome back{user?.firstName ? `, ${user.firstName}` : ""}
      </h1>

      {error && (
        <div className="mb-4">
          <Alert variant="error" title="Something went wrong" onClose={() => setError("")}>
            {error}
          </Alert>
        </div>
      )}

      <section className="grid gap-6 lg:gap-10 md:grid-cols-2 mb-8 lg:mb-12 max-w-2xl md:max-w-none mx-auto">
        {loading ? (
          // Skeleton uses design token colour (not raw Tailwind grey) to stay
          // consistent with the Skeleton component used elsewhere
          <Card className="p-6">
            <div className="animate-pulse space-y-4">
              <div className="h-6 bg-[--color-border-muted] rounded w-1/2"></div>
              <div className="h-4 bg-[--color-border-muted] rounded w-3/4"></div>
              <div className="h-4 bg-[--color-border-muted] rounded w-2/3"></div>
            </div>
          </Card>
        ) : lastMatch ? (
          <LastGameCard match={lastMatch} loading={false} />
        ) : (
          <Card className="p-6 text-center">
            <div className="text-6xl mb-4">🎮</div>
            <h3 className="text-lg font-semibold mb-2">No matches yet</h3>
            <p className="text-secondary mb-4">
              Start tracking your game nights with friends!
            </p>
            <Link to="/matches/new" className="btn btn-primary inline-block">
              Log Your First Match
            </Link>
          </Card>
        )}

        <StatsCard stats={stats} loading={loading} />
      </section>

      <div className="mt-6 lg:mt-10">
        <ActionButtons />
      </div>
    </main>
  );
}
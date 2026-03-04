import { useEffect, useMemo, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import Card from "../components/ui/Card";
import Skeleton from "../components/ui/Skeleton";
import MatchCard from "../components/matches/MatchCard";
import { useAuth } from "../contexts/useAuth";
import api from "../lib/axios";

function idOf(v) {
  if (!v) return null;
  if (typeof v === "string") return v;
  if (v && typeof v === "object" && v._id) return v._id;
  return null;
}

export default function MatchesPage() {
  const { user } = useAuth();
  const myId = user?._id ? String(user._id) : null;
  const location = useLocation(); 

  const [loading, setLoading] = useState(true);
  const [matches, setMatches] = useState([]);
  const [error, setError] = useState("");
  const [filters, setFilters] = useState({ result: "all", q: "" });
  const [confirmingId, setConfirmingId] = useState(null);
  const [remindingId, setRemindingId] = useState(null);
  const [remindMsg, setRemindMsg] = useState("");


  useEffect(() => {
    let ignore = false;
    async function load() {
      try {
        setLoading(true);
        setError("");
        const res = await api.get("/sessions");
        const payload = res.data?.data || res.data || [];
        if (!ignore) setMatches(Array.isArray(payload) ? payload : []);
      } catch (e) {
        if (!ignore) setError(e.message || "Failed to load matches.");
      } finally {
        if (!ignore) setLoading(false);
      }
    }
    load();
    return () => {
      ignore = true;
    };
  }, [location.key]);

  // Derived list with filters
  const list = useMemo(() => {
    let out = [...matches].sort((a, b) => new Date(b.date) - new Date(a.date));

    if (filters.result !== "all") {
      out = out.filter((m) => {
        const me =
          (m?.players || []).find((p) => String(idOf(p.user)) === myId) || null;
        return (me?.result || "") === filters.result;
      });
    }

    const q = filters.q.trim().toLowerCase();
    if (q) {
      out = out.filter((m) => {
        const name = m?.game?.name || m?.game?.title || "";
        return String(name).toLowerCase().includes(q);
      });
    }
    return out;
  }, [matches, filters, myId]);

  const confirmMe = async (matchId) => {
    try {
      setConfirmingId(matchId);
      await api.post(`/sessions/${matchId}/confirm`);
      setMatches((prev) =>
        prev.map((m) => {
          if (m._id !== matchId) return m;
          const players = (m.players || []).map((p) =>
            String(idOf(p.user)) === myId
              ? { ...p, confirmed: true, confirmedAt: new Date().toISOString() }
              : p
          );
          const allConfirmed =
            players.length > 0 &&
            players.every((p) => (p.user ? p.confirmed : true));
          return { ...m, players, matchStatus: allConfirmed ? "Confirmed" : "Pending" };
        })
      );
    } catch (e) {
      setError(e.message || "Failed to confirm match.");
    } finally {
      setConfirmingId(null);
    }
  };

  const remindPlayers = async (matchId) => {
    try {
      setRemindMsg("");
      setRemindingId(matchId);
      const res = await api.post(`/sessions/${matchId}/remind`);
      const count =
        res?.data?.data?.count ??
        (res?.data?.message?.toLowerCase().includes("sent") ? "some" : 0);
      setRemindMsg(`Reminder sent to ${count} unconfirmed player(s).`);
    } catch (e) {
      setError(e.message || "Failed to send reminders.");
    } finally {
      setRemindingId(null);
    }
  };

  return (
    <main className="py-2 lg:py-6">
      {/* Header with "+ New Match" button */}
      <div className="max-w-3xl mx-auto mb-6 lg:mb-10 px-1
                      flex flex-col items-center
                      md:grid md:grid-cols-[1fr_auto_1fr] md:items-center">
        <h1 className="h1 text-center md:col-span-3">Match History</h1>
        <div className="mt-2 md:mt-0 md:col-start-3 md:justify-self-end">
          <Link to="/matches/new" className="btn btn-primary md:btn">
            + New Match
          </Link>
        </div>
      </div>

      {/* Filters */}
      <div className="mb-4 grid grid-cols-2 gap-3 sm:max-w-md sm:mx-auto md:max-w-lg">
        <input
          className="input col-span-2 md:col-span-1"
          placeholder="Search by game…"
          value={filters.q}
          onChange={(e) => setFilters((f) => ({ ...f, q: e.target.value }))}
        />
        <select
          className="input md:col-span-1"
          value={filters.result}
          onChange={(e) => setFilters((f) => ({ ...f, result: e.target.value }))}
        >
          <option value="all">All results</option>
          <option value="Win">Wins</option>
          <option value="Loss">Losses</option>
          <option value="Draw">Draws</option>
        </select>
      </div>

      {/* Errors / success */}
      {error && (
        <div
          className="mb-4 rounded-[var(--radius-standard)] border p-3 text-sm mx-auto max-w-lg"
          style={{
            borderColor: "color-mix(in oklab, var(--color-warning) 40%, transparent)",
            background: "color-mix(in oklab, var(--color-warning) 10%, white)",
            color: "var(--color-warning)",
          }}
        >
          {error}
        </div>
      )}
      {remindMsg && (
        <div
          className="mb-4 rounded-[var(--radius-standard)] border p-3 text-sm mx-auto max-w-lg"
          style={{
            borderColor: "color-mix(in oklab, var(--color-success) 40%, transparent)",
            background: "color-mix(in oklab, var(--color-success) 10%, white)",
          }}
        >
          {remindMsg}
        </div>
      )}

      {/* Content */}
      {loading ? (
        <div className="grid gap-3 max-w-3xl mx-auto">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i} className="p-4">
              <div className="flex items-center justify-between mb-3">
                <Skeleton variant="title" className="w-40" />
                <Skeleton variant="text" className="w-24" />
              </div>
              <div className="flex items-center gap-2 mb-3">
                <Skeleton className="w-16" />
                <Skeleton className="w-20" />
                <Skeleton className="w-24 ml-3" />
                <Skeleton className="w-16" />
              </div>
              <div className="flex gap-2 mb-2">
                <Skeleton className="w-20 h-6 rounded-full" />
                <Skeleton className="w-20 h-6 rounded-full" />
                <Skeleton className="w-24 h-6 rounded-full" />
              </div>
              <Skeleton variant="text" className="w-full" />
            </Card>
          ))}
        </div>
      ) : list.length === 0 ? (
        <Card className="p-6 text-center max-w-2xl mx-auto">
          <p className="text-secondary">
            No matches found.{" "}
            <Link
              to="/matches/new"
              className="underline"
              style={{ color: "var(--color-cta)" }}
            >
              Log your first one
            </Link>
            .
          </p>
        </Card>
      ) : (
        <div className="grid gap-3 max-w-3xl mx-auto">
          {list.map((m) => (
            <MatchCard
              key={m._id}
              match={m}
              myId={myId}
              onConfirm={confirmMe}
              onRemind={remindPlayers}
              confirmingId={confirmingId}
              remindingId={remindingId}
            />
          ))}
        </div>
      )}
    </main>
  );
}
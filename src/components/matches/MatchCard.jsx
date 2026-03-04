import { memo } from "react";
import { Link } from "react-router-dom";
import Button from "../ui/Button";
import Card from "../ui/Card";

// Helper functions moved outside component to prevent recreation
function idOf(v) {
  if (!v) return null;
  if (typeof v === "string") return v;
  if (v && typeof v === "object" && v._id) return v._id;
  return null;
}

function badgeClassForResult(r) {
  switch (r) {
    case "Win":
      return "bg-[color-mix(in oklab,var(--color-success)_18%,white)]";
    case "Loss":
      return "bg-[color-mix(in oklab,var(--color-warning)_18%,white)]";
    case "Draw":
      return "bg-[color-mix(in oklab,var(--color-border-muted)_40%,white)]";
    default:
      return "";
  }
}

// Memo-ized MatchCard component
// Only re-renders when match data, user actions, or loading states change
const MatchCard = memo(
  function MatchCard({
    match,
    myId,
    onConfirm,
    onRemind,
    confirmingId,
    remindingId,
  }) {
    const createdBy = String(idOf(match.createdBy));
    const amCreator = myId && createdBy === myId;

    const me =
      (match?.players || []).find((p) => String(idOf(p.user)) === myId) ||
      (match?.players || [])[0] ||
      null;

    const myResult = me?.result || "—";
    const canConfirm = !!me && me.confirmed === false;
    const hasUnconfirmedOthers = (match.players || []).some(
      (p) => p.user && String(idOf(p.user)) !== myId && !p.confirmed
    );
    const canRemind =
      match.matchStatus === "Pending" && amCreator && hasUnconfirmedOthers;

    const myBadge =
      myResult !== "—" ? (
        <span
          className={`px-2 py-0.5 rounded text-xs ${badgeClassForResult(
            myResult
          )}`}
        >
          {myResult}
        </span>
      ) : (
        <span>—</span>
      );

    return (
      <Card className="p-4">
        {/* Top row: game + date + quick nav */}
        <div className="flex items-baseline justify-between gap-2">
          <h3 className="font-semibold text-sm">
            <Link
              to={`/matches/${match._id}`}
              className="underline hover:no-underline"
              style={{ color: "var(--color-cta)" }}
            >
              {match?.game?.name || "Game"}
            </Link>
          </h3>
          <span className="text-xs text-secondary">
            {match?.date ? new Date(match.date).toLocaleDateString() : ""}
          </span>
        </div>

        {/* Status + your result */}
        <div className="mt-1 flex items-center gap-2 text-sm">
          <span className="font-medium">Status:</span>
          <span
            className={`px-2 py-0.5 rounded text-xs ${
              match.matchStatus === "Confirmed"
                ? "bg-[color-mix(in oklab,var(--color-success)_15%,white)]"
                : "bg-[color-mix(in oklab,var(--color-border-muted)_35%,white)]"
            }`}
          >
            {match.matchStatus || "Pending"}
          </span>

          <span className="ml-3 font-medium">Your result:</span>
          {myBadge}
        </div>

        {/* Players (tiny guest hints) */}
        <div className="mt-2 flex flex-wrap gap-2">
          {(match.players || []).map((p, idx) => {
            const isGuest = !p.user;
            const guestIcon = amCreator ? "✎" : "🔒";
            return (
              <span
                key={`${String(idOf(p.user)) || "guest"}-${idx}`}
                className="inline-flex items-center gap-1 rounded-full border border-[--color-border-muted] px-2 py-0.5 text-xs"
                title={
                  isGuest
                    ? amCreator
                      ? "Guest • you can edit this player"
                      : "Guest • read-only"
                    : ""
                }
              >
                <span>{p.name || "Player"}</span>
                {isGuest && (
                  <span className="ml-1 px-1 rounded bg-[color-mix(in oklab,var(--color-border-muted)_35%,white)]">
                    Guest {guestIcon}
                  </span>
                )}
                {p.confirmed ? (
                  <span title="Confirmed" aria-label="Confirmed">
                    ✔︎
                  </span>
                ) : (
                  <span title="Pending" aria-label="Pending">
                    ⧗
                  </span>
                )}
              </span>
            );
          })}
        </div>

        {/* Notes */}
        {match?.notes && (
          <p className="text-sm text-secondary mt-2">{match.notes}</p>
        )}

        {/* Actions */}
        <div className="mt-3 flex gap-2">
          {canConfirm && (
            <Button
              className="btn-sm"
              onClick={() => onConfirm(match._id)}
              disabled={confirmingId === match._id}
            >
              {confirmingId === match._id ? "Confirming…" : "Confirm I'm in"}
            </Button>
          )}

          {canRemind && (
            <Button
              className="btn-sm"
              onClick={() => onRemind(match._id)}
              disabled={remindingId === match._id}
            >
              {remindingId === match._id ? "Sending…" : "Remind players"}
            </Button>
          )}
        </div>
      </Card>
    );
  },
  // Custom comparison: only re-render if match data or loading states change
  (prevProps, nextProps) => {
    return (
      prevProps.match._id === nextProps.match._id &&
      prevProps.match.matchStatus === nextProps.match.matchStatus &&
      prevProps.confirmingId === nextProps.confirmingId &&
      prevProps.remindingId === nextProps.remindingId &&
      // Check if players array changed (simple length check)
      prevProps.match.players?.length === nextProps.match.players?.length
    );
  }
);

export default MatchCard;
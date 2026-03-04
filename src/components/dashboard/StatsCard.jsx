import { memo } from "react";
import Card from "../ui/Card";
import Skeleton from "../ui/Skeleton";

// Memo-ized StatsCard — only re-renders when stats or loading changes.
// Displays a compact summary for the dashboard; Profile page shows the full breakdown.
const StatsCard = memo(
  function StatsCard({ stats, loading }) {
    if (loading) {
      return (
        <Card className="p-4">
          <Skeleton variant="title" className="w-24 mb-4 mx-auto" />
          <div className="space-y-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="flex justify-between items-center">
                <Skeleton className="w-28" />
                <Skeleton className="w-12" />
              </div>
            ))}
          </div>
        </Card>
      );
    }

    const wins = stats?.wins ?? 0;
    const losses = stats?.losses ?? 0;
    const winRate = stats?.winRate ?? null;
    const currentStreak = stats?.currentStreak ?? 0;
    const mostPlayed = stats?.mostPlayedGame || "—";

    return (
      <Card className="p-4 text-center">
        <h3 className="text-sm font-semibold mb-3">Your Stats</h3>
        <div className="text-sm space-y-1">
          <div>
            <span className="font-medium">Total Wins:</span> {wins}
          </div>
          <div>
            <span className="font-medium">Total Losses:</span> {losses}
          </div>
          {winRate !== null && (
            <div>
              <span className="font-medium">Win Rate:</span> {winRate}%
            </div>
          )}
          {currentStreak > 1 && (
            <div style={{ color: "var(--color-success)" }}>
              <span className="font-medium">🔥 Win Streak:</span> {currentStreak}
            </div>
          )}
          <div>
            <span className="font-medium">Most Played:</span> {mostPlayed}
          </div>
        </div>
      </Card>
    );
  },
  (prevProps, nextProps) =>
    prevProps.loading === nextProps.loading &&
    prevProps.stats?.wins === nextProps.stats?.wins &&
    prevProps.stats?.losses === nextProps.stats?.losses &&
    prevProps.stats?.winRate === nextProps.stats?.winRate &&
    prevProps.stats?.currentStreak === nextProps.stats?.currentStreak &&
    prevProps.stats?.mostPlayedGame === nextProps.stats?.mostPlayedGame
);

export default StatsCard;
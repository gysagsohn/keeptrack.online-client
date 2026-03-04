import { memo, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import Alert from "../components/ui/Alert";
import Button from "../components/ui/Button";
import Card from "../components/ui/Card";
import Input from "../components/ui/Input";
import Skeleton from "../components/ui/Skeleton";
import FriendSearch from "../components/friends/FriendSearch";
import { useAuth } from "../contexts/useAuth";
import api from "../lib/axios";

// Memoized row component for each user in a list.
// Custom comparator avoids re-renders when unrelated state changes —
// only re-renders if the user's id or subtitle changes.
const UserRow = memo(
  function UserRow({ user, right, subtitle }) {
    const name =
      `${user?.firstName || ""} ${user?.lastName || ""}`.trim() ||
      user?.email ||
      "User";
    return (
      <div className="flex items-center justify-between gap-3 border border-[--color-border-muted] rounded-[var(--radius-standard)] p-4 bg-white shadow-sm">
        <div className="min-w-0">
          <div className="text-sm font-medium truncate">{name}</div>
          {(user?.email || subtitle) && (
            <div className="text-xs text-secondary truncate">
              {subtitle || user?.email}
            </div>
          )}
        </div>
        <div className="flex items-center gap-2">{right}</div>
      </div>
    );
  },
  (prev, next) =>
    prev.user?._id === next.user?._id && prev.subtitle === next.subtitle
);

// Tab button — defined outside the page component so it isn't
// recreated on every render
function TabButton({ id, activeTab, onSelect, children }) {
  const isActive = activeTab === id;
  return (
    <button
      type="button"
      role="tab"
      aria-selected={isActive}
      onClick={() => onSelect(id)}
      className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200
        ${isActive
          ? "bg-[color-mix(in oklab,var(--color-cta)_10%,transparent)] text-[var(--color-cta)] shadow-sm"
          : "text-[var(--color-secondary)] hover:bg-[color-mix(in oklab,var(--color-border-muted)_25%,transparent)] hover:text-[var(--color-primary)]"
        }`}
    >
      {children}
    </button>
  );
}

export default function FriendsPage() {
  const { user } = useAuth();
  const myId = user?._id;

  const [params, setParams] = useSearchParams();
  const tab = params.get("tab") || "list";

  const [loading, setLoading] = useState(false);
  const [ok, setOk] = useState("");
  const [err, setErr] = useState("");

  // Per-tab data
  const [friends, setFriends] = useState([]);
  const [requests, setRequests] = useState([]);
  const [sent, setSent] = useState([]);
  const [suggested, setSuggested] = useState([]);

  // Send-by-email form state
  const [targetEmail, setTargetEmail] = useState("");
  const [sending, setSending] = useState(false);

  const setTab = (next) => {
    const nextParams = new URLSearchParams(params);
    nextParams.set("tab", next);
    setParams(nextParams, { replace: true });
  };

  // Re-fetch data whenever the active tab or user changes
  useEffect(() => {
    let ignore = false;
    async function load() {
      if (!myId) return;
      try {
        setLoading(true);
        setErr("");
        setOk("");

        if (tab === "list") {
          const res = await api.get(`/friends/list/${myId}`);
          const payload = res.data?.data || res.data || [];
          if (!ignore) setFriends(Array.isArray(payload) ? payload : []);
        } else if (tab === "requests") {
          const res = await api.get("/friends/requests");
          const payload = res.data?.data || res.data || [];
          if (!ignore) setRequests(Array.isArray(payload) ? payload : []);
        } else if (tab === "sent") {
          const res = await api.get("/friends/sent");
          const payload = res.data?.data || res.data || [];
          if (!ignore) setSent(Array.isArray(payload) ? payload : []);
        } else if (tab === "suggested") {
          const res = await api.get("/friends/suggested");
          const payload = res.data?.data || res.data || [];
          if (!ignore) setSuggested(Array.isArray(payload) ? payload : []);
        }
      } catch (e) {
        if (!ignore) setErr(e.message || "Failed to load.");
      } finally {
        if (!ignore) setLoading(false);
      }
    }
    load();
    return () => { ignore = true; };
  }, [tab, myId]);

  // Badge counts shown on each tab button
  const counts = useMemo(
    () => ({
      list: friends.length,
      requests: requests.length,
      sent: sent.length,
      suggested: suggested.length,
    }),
    [friends.length, requests.length, sent.length, suggested.length]
  );

  /**
   * Accept or reject a friend request.
   * Extracted from two near-identical functions — the only difference
   * between accepting and rejecting is the action string passed to the API.
   *
   * After responding, attempts to mark the related friend_request
   * notification as read. This is non-critical so errors are swallowed.
   */
  const handleFriendRequest = async (senderId, action) => {
    try {
      setErr(""); setOk("");
      await api.post("/friends/respond", { senderId, action });
      setRequests((prev) => prev.filter((r) => r.user?._id !== senderId));
      setOk(action === "Accepted" ? "Friend request accepted." : "Friend request rejected.");

      // Mark the related notification as read (best-effort)
      try {
        const res = await api.get("/friends/notifications");
        const notifications = res.data?.data || [];
        const related = notifications.find(
          (n) =>
            n.type === "friend_request" &&
            !n.read &&
            n.sender &&
            String(n.sender._id) === String(senderId)
        );
        if (related) {
          await api.put(`/friends/notifications/${related._id}/read`);
        }
      } catch {
        // Non-critical — don't surface this to the user
      }
    } catch (e) {
      setErr(e.message || `Failed to ${action === "Accepted" ? "accept" : "reject"} request.`);
    }
  };

  // Remove a friend from both users' friend lists
  const unfriend = async (friendId) => {
    try {
      setErr(""); setOk("");
      await api.post("/friends/unfriend", { friendId });
      setFriends((prev) => prev.filter((f) => f._id !== friendId));
      setOk("Removed from friends.");
    } catch (e) {
      setErr(e.message || "Failed to unfriend.");
    }
  };

  // Send a friend request by email address
  const sendByEmail = async (e) => {
    e.preventDefault();
    if (!targetEmail.trim()) return;
    try {
      setSending(true);
      setErr(""); setOk("");
      await api.post("/friends/send", { email: targetEmail.trim() });
      setTargetEmail("");
      setOk("Friend request sent.");
      // Refresh sent list if currently viewing it
      if (tab === "sent") {
        const res = await api.get("/friends/sent");
        setSent(res.data?.data || res.data || []);
      }
    } catch (e) {
      setErr(e.message || "Failed to send request.");
    } finally {
      setSending(false);
    }
  };

  // Send a friend request to a suggested user (uses their email)
  const addSuggested = async (u) => {
    if (!u?.email) return;
    try {
      setErr(""); setOk("");
      await api.post("/friends/send", { email: u.email });
      setOk(`Friend request sent to ${u.firstName || ""} ${u.lastName || ""}`.trim());
      if (tab === "sent") {
        const res = await api.get("/friends/sent");
        setSent(res.data?.data || res.data || []);
      }
    } catch (e) {
      setErr(e.message || "Failed to send request.");
    }
  };

  return (
    <main className="py-2 lg:py-6">
      <h1 className="h1 text-center mb-6 lg:mb-10">Friends</h1>

      {/* Tab navigation */}
      <div className="flex flex-wrap items-center justify-center gap-1.5 md:gap-2 mb-4" role="tablist">
        <TabButton id="list" activeTab={tab} onSelect={setTab}>
          My Friends {counts.list ? `(${counts.list})` : ""}
        </TabButton>
        <TabButton id="requests" activeTab={tab} onSelect={setTab}>
          Requests {counts.requests ? `(${counts.requests})` : ""}
        </TabButton>
        <TabButton id="sent" activeTab={tab} onSelect={setTab}>
          Sent {counts.sent ? `(${counts.sent})` : ""}
        </TabButton>
        <TabButton id="suggested" activeTab={tab} onSelect={setTab}>
          Suggested {counts.suggested ? `(${counts.suggested})` : ""}
        </TabButton>
      </div>

      {/* Search for users by name or email */}
      <div className="mb-6">
        <FriendSearch />
      </div>

      {/* Send a friend request by email */}
      <Card className="w-full max-w-2xl mx-auto mb-6 p-5">
        <h3 className="text-sm font-semibold text-center mb-4">Send Friend Request</h3>
        <form
          onSubmit={sendByEmail}
          className="flex flex-col sm:flex-row gap-3 sm:items-stretch"
        >
          <Input
            type="email"
            placeholder="friend@example.com"
            value={targetEmail}
            onChange={(e) => setTargetEmail(e.target.value)}
            required
            wrapperClassName="flex-1"
            className="w-full text-center"
          />
          <Button type="submit" disabled={sending} className="w-full sm:w-auto sm:min-w-[110px]">
            {sending ? "Sending…" : "Send"}
          </Button>
        </form>
      </Card>

      {/* Success / error feedback */}
      {err && (
        <div className="mb-4 flex justify-center px-4">
          <Alert variant="error" style={{ width: "auto", maxWidth: "36rem", minWidth: "300px" }}>
            <div className="text-center">{err}</div>
          </Alert>
        </div>
      )}
      {ok && (
        <div className="mb-4 flex justify-center px-4">
          <Alert variant="success" style={{ width: "auto", maxWidth: "36rem", minWidth: "300px" }}>
            <div className="text-center">{ok}</div>
          </Alert>
        </div>
      )}

      {/* Tab content */}
      <div className="grid gap-3 max-w-3xl mx-auto">
        {loading ? (
          <div className="grid gap-3 max-w-3xl mx-auto">
            {Array.from({ length: 4 }).map((_, i) => (
              <Card key={i} className="p-4">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3 flex-1">
                    <Skeleton variant="avatar" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="w-32" />
                      <Skeleton variant="text" className="w-48" />
                    </div>
                  </div>
                  <Skeleton variant="button" className="w-24" />
                </div>
              </Card>
            ))}
          </div>
        ) : tab === "list" ? (
          friends.length === 0 ? (
            <Card className="p-6 text-center">
              <p className="text-secondary">You haven't added any friends yet.</p>
            </Card>
          ) : (
            friends.map((u) => (
              <UserRow
                key={u._id}
                user={u}
                right={
                  <Button className="btn-sm" onClick={() => unfriend(u._id)}>
                    Unfriend
                  </Button>
                }
              />
            ))
          )
        ) : tab === "requests" ? (
          requests.length === 0 ? (
            <Card className="p-6 text-center">
              <p className="text-secondary">No pending requests.</p>
            </Card>
          ) : (
            requests.map((r) => (
              <UserRow
                key={r?.user?._id}
                user={r.user}
                right={
                  <>
                    <Button className="btn-sm" onClick={() => handleFriendRequest(r.user._id, "Accepted")}>
                      Accept
                    </Button>
                    <Button className="btn-sm" onClick={() => handleFriendRequest(r.user._id, "Rejected")}>
                      Reject
                    </Button>
                  </>
                }
              />
            ))
          )
        ) : tab === "sent" ? (
          sent.length === 0 ? (
            <Card className="p-6 text-center">
              <p className="text-secondary">No sent requests.</p>
            </Card>
          ) : (
            sent.map((r) => (
              <UserRow
                key={r?.user?._id}
                user={r.user}
                subtitle={`Status: ${r.status || "Pending"}`}
                right={null}
              />
            ))
          )
        ) : suggested.length === 0 ? (
          <Card className="p-6 text-center">
            <p className="text-secondary">No suggestions right now.</p>
          </Card>
        ) : (
          suggested.map((u) => (
            <UserRow
              key={u._id}
              user={u}
              right={
                <Button className="btn-sm" onClick={() => addSuggested(u)} disabled={!u.email}>
                  Add friend
                </Button>
              }
            />
          ))
        )}
      </div>
    </main>
  );
}
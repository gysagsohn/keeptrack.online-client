import { useEffect, useMemo, useRef, useState } from "react";
import api from "../../lib/axios";

export default function GameSelect({
  value,
  onChange,
  label = "Game",
  placeholder = "Select a game",
  allowCreate = false,
}) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [list, setList] = useState([]);
  const [q, setQ] = useState("");
  const [creating, setCreating] = useState(false);
  const [err, setErr] = useState("");

  const menuRef = useRef(null);
  const buttonRef = useRef(null);
  const [activeIdx, setActiveIdx] = useState(0);

  // Fetch once
  useEffect(() => {
    let ignore = false;
    (async () => {
      try {
        setLoading(true);
        setErr("");
        const res = await api.get("/games");
        const data = res.data?.data || res.data || [];
        if (!ignore) setList(Array.isArray(data) ? data : []);
      } catch (e) {
        if (!ignore) setErr(e.message || "Failed to load games.");
      } finally {
        if (!ignore) setLoading(false);
      }
    })();
    return () => { ignore = true; };
  }, []);

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    if (!term) return list;
    return list.filter((g) => String(g?.name || "").toLowerCase().includes(term));
  }, [list, q]);

  // Close on outside click / escape
  useEffect(() => {
    if (!open) return;
    const onDocClick = (e) => {
      if (!menuRef.current) return;
      if (
        !menuRef.current.contains(e.target) &&
        !buttonRef.current?.contains(e.target)
      ) {
        setOpen(false);
        setQ("");
        setActiveIdx(0);
      }
    };
    const onEsc = (e) => {
      if (e.key === "Escape") {
        setOpen(false);
        setQ("");
        setActiveIdx(0);
        buttonRef.current?.focus();
      }
    };
    document.addEventListener("mousedown", onDocClick);
    document.addEventListener("keydown", onEsc);
    return () => {
      document.removeEventListener("mousedown", onDocClick);
      document.removeEventListener("keydown", onEsc);
    };
  }, [open]);

  // Keyboard navigation in listbox
  const onKeyDown = (e) => {
    if (!open) return;
    const max = filtered.length - 1;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIdx((i) => (i >= max ? 0 : i + 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIdx((i) => (i <= 0 ? Math.max(0, max) : i - 1));
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (filtered[activeIdx]) select(filtered[activeIdx]);
      else if (allowCreate && q.trim().length >= 2 && filtered.length === 0) {
        createGame(q.trim());
      }
    }
  };

  const select = (game) => {
    onChange?.(game);
    setOpen(false);
    setQ("");
    setActiveIdx(0);
    buttonRef.current?.focus();
  };

  const createGame = async (name) => {
    try {
      setCreating(true);
      const res = await api.post("/games", { name });
      const newGame = res.data?.data || res.data;
      if (newGame?._id) {
        setList((prev) => [newGame, ...prev]);
        select(newGame);
      }
    } catch (e) {
      setErr(e.message || "Failed to create game.");
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="relative" onKeyDown={onKeyDown}>
      {label && <label className="mb-1 block text-sm text-secondary">{label}</label>}
      <button
        ref={buttonRef}
        type="button"
        className="input flex items-center justify-between"
        onClick={() => setOpen((s) => !s)}
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        <span className={value?.name ? "" : "text-secondary"}>
          {value?.name || placeholder}
        </span>
        <span className="icon-muted">▾</span>
      </button>

      {err && (
        <div
          className="mt-2 rounded-[var(--radius-standard)] border p-2 text-sm"
          style={{
            borderColor: "color-mix(in oklab, var(--color-warning) 40%, transparent)",
            background: "color-mix(in oklab, var(--color-warning) 10%, white)",
            color: "var(--color-warning)",
          }}
        >
          {err}
        </div>
      )}

      {open && (
        <div
          ref={menuRef}
          className="absolute z-10 mt-1 w-full bg-card border border-[--color-border-muted] rounded-[var(--radius-standard)] shadow-card"
          role="listbox"
        >
          <div className="p-2">
            <input
              className="input"
              placeholder="Search games…"
              value={q}
              onChange={(e) => {
                setQ(e.target.value);
                setActiveIdx(0);
              }}
              autoFocus
            />
          </div>

          {loading ? (
            <div className="p-3 text-sm text-secondary">Loading…</div>
          ) : filtered.length === 0 ? (
            <div className="p-3 text-sm text-secondary">
              No games found.
              {allowCreate && q.trim().length >= 2 && (
                <div className="mt-2">
                  <button
                    type="button"
                    className="btn btn-sm btn-primary"
                    onClick={() => createGame(q.trim())}
                    disabled={creating}
                  >
                    {creating ? "Adding…" : `Add “${q.trim()}”`}
                  </button>
                </div>
              )}
            </div>
          ) : (
            <ul className="max-h-64 overflow-auto py-1">
              {filtered.map((g, i) => (
                <li key={g._id}>
                  <button
                    type="button"
                    className={`w-full text-left px-3 py-2 ${
                      i === activeIdx
                        ? "bg-[color-mix(in oklab,var(--color-border-muted)_30%,white)]"
                        : "hover:bg-[color-mix(in oklab,var(--color-border-muted)_20%,white)]"
                    }`}
                    onMouseEnter={() => setActiveIdx(i)}
                    onClick={() => select(g)}
                    role="option"
                    aria-selected={value?._id === g._id}
                  >
                    {g.name}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}

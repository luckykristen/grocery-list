import { useEffect, useMemo, useState } from "react";

const CATEGORIES = [
  { id: "dairy", label: "Mléčné", emoji: "🥛" },
  { id: "veg", label: "Zelenina", emoji: "🥦" },
  { id: "fruit", label: "Ovoce", emoji: "🍎" },
  { id: "bakery", label: "Pečivo", emoji: "🥐" },
  { id: "meat", label: "Maso", emoji: "🥩" },
  { id: "pantry", label: "Trvanlivé", emoji: "🧂" },
  { id: "home", label: "Domov", emoji: "🧼" },
];

function uid() {
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function BagIllustration() {
  return (
    <svg viewBox="0 0 240 180" className="w-full h-full">
      <defs>
        <linearGradient id="bg" x1="0" x2="1">
          <stop offset="0" stopColor="#99f6e4" />
          <stop offset="1" stopColor="#a7f3d0" />
        </linearGradient>
      </defs>

      <path
        d="M40 70c0-22 18-40 40-40h80c22 0 40 18 40 40v40c0 22-18 40-40 40H80c-22 0-40-18-40-40V70z"
        fill="url(#bg)"
        opacity="0.55"
      />
      <circle cx="188" cy="44" r="16" fill="#fde68a" opacity="0.9" />
      <path
        d="M76 78c-2-22 12-38 44-38s46 16 44 38l-7 78H83l-7-78z"
        fill="#ffffff"
      />
      <path
        d="M92 74c0-16 12-28 28-28s28 12 28 28"
        fill="none"
        stroke="#0f172a"
        strokeOpacity="0.3"
        strokeWidth="6"
        strokeLinecap="round"
      />
      <circle cx="88" cy="60" r="10" fill="#fb7185" opacity="0.9" />
      <rect x="150" y="52" width="14" height="22" rx="7" fill="#22c55e" opacity="0.7" />
      <rect x="168" y="55" width="12" height="19" rx="6" fill="#60a5fa" opacity="0.5" />
    </svg>
  );
}

export default function App() {
  const [items, setItems] = useState(() => {
    const raw = localStorage.getItem("grocery_items_v1");
    if (!raw) return [];
    try {
      return JSON.parse(raw);
    } catch {
      return [];
    }
  });

  const [text, setText] = useState("");
  const [category, setCategory] = useState("dairy");
  const [activeCat, setActiveCat] = useState("all"); // all or category id
  const [filter, setFilter] = useState("all"); // all | active | done
  const [error, setError] = useState("");

  useEffect(() => {
    localStorage.setItem("grocery_items_v1", JSON.stringify(items));
  }, [items]);

  const stats = useMemo(() => {
    const total = items.length;
    const done = items.filter((i) => i.done).length;
    return { total, done };
  }, [items]);

  const visibleItems = useMemo(() => {
    return items
      .filter((i) => (activeCat === "all" ? true : i.category === activeCat))
      .filter((i) => (filter === "all" ? true : filter === "active" ? !i.done : i.done));
  }, [items, activeCat, filter]);

  function addItem(e) {
    e.preventDefault();
    const trimmed = text.trim();
    if (!trimmed) {
      setError("Hej, napiš nejdřív položku 🙂");
      return;
    }
    setError("");
    setItems((prev) => [
      { id: uid(), text: trimmed, done: false, category, createdAt: Date.now() },
      ...prev,
    ]);
    setText("");
  }

  function toggleDone(id) {
    setItems((prev) => prev.map((i) => (i.id === id ? { ...i, done: !i.done } : i)));
  }

  function removeItem(id) {
    setItems((prev) => prev.filter((i) => i.id !== id));
  }

  function clearDone() {
    setItems((prev) => prev.filter((i) => !i.done));
  }

  const progress = stats.total === 0 ? 0 : Math.round((stats.done / stats.total) * 100);

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 via-white to-indigo-50 px-4 py-10">
      <div className="mx-auto w-full max-w-md">
        <div className="rounded-3xl bg-white shadow-[0_20px_60px_rgba(15,23,42,0.12)] ring-1 ring-slate-100 overflow-hidden">
          {/* Header art */}
          <div className="px-6 pt-6">
            <div className="h-40 rounded-2xl bg-gradient-to-br from-teal-100 to-emerald-100 p-3">
              <BagIllustration />
            </div>

            <div className="mt-5 flex items-start justify-between gap-4">
              <div>
                <h1 className="text-2xl font-extrabold tracking-tight text-slate-900">
                  Nákupní seznam
                </h1>
                <p className="mt-1 text-sm text-slate-500">
                  {stats.total} položka • {stats.done} hotovo
                </p>
              </div>

              <div className="flex gap-2">
                {["all", "active", "done"].map((k) => (
                  <button
                    key={k}
                    type="button"
                    onClick={() => setFilter(k)}
                    className={`rounded-full px-3 py-1 text-xs font-semibold ring-1 transition ${
                      filter === k
                        ? "bg-teal-50 text-teal-700 ring-teal-200"
                        : "bg-white text-slate-600 ring-slate-200 hover:bg-slate-50"
                    }`}
                  >
                    {k === "all" ? "Vše" : k === "active" ? "Koupit" : "Hotovo"}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Add */}
          <div className="px-6 pb-4 pt-5">
            <form onSubmit={addItem} className="space-y-3">
              <div className="flex gap-3">
                <input
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  placeholder="Co mám koupit?"
                  className={`w-full rounded-2xl border px-4 py-3 text-slate-900 placeholder:text-slate-400 outline-none transition
                    ${error ? "border-pink-300 ring-2 ring-pink-100" : "border-slate-200 focus:ring-2 focus:ring-teal-200"}
                  `}
                />
                <button
                  type="submit"
                  className="shrink-0 rounded-2xl bg-emerald-500 px-4 py-3 font-bold text-white shadow-sm transition hover:brightness-105 active:scale-[0.98]"
                >
                  + Přidat
                </button>
              </div>

              {error ? <p className="text-sm text-pink-600">{error}</p> : null}

              <div className="flex flex-wrap gap-2">
                <p
                className= {`rounded-full px-3 py-2 text-xs font-semibold ring-1 bg-teal-50 ring-teal-300`}
              >Kategorie:
              </p>
                {CATEGORIES.map((c) => (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => setCategory(c.id)}
                    className={`cursor-pointer rounded-full px-3 py-2 text-xs font-semibold ring-1 transition ${
                      category === c.id
                        ? "bg-teal-50 text-teal-700 ring-teal-200"
                        : "bg-white text-slate-600 ring-slate-200 hover:bg-slate-50"
                    }`}
                  >
                    <span className="mr-1">{c.emoji}</span>
                    {c.label}
                  </button>
                ))}
              </div>
            </form>
          </div>

          {/* Category filter */}
          <div className="px-6 pb-3">
            <div className="flex flex-wrap gap-2">
              <p
                className= {`rounded-full px-3 py-2 text-xs font-semibold ring-1 bg-indigo-50 ring-indigo-300`}
              >Filtrování:
              </p>
              <button
                type="button"
                onClick={() => setActiveCat("all")}
                className={`cursor-pointer rounded-full px-3 py-2 text-xs font-semibold ring-1 transition ${
                  activeCat === "all"
                    ? "bg-indigo-50 text-indigo-700 ring-indigo-200"
                    : "bg-white text-slate-600 ring-slate-200 hover:bg-slate-50"
                }`}
              >
                🧺 Všechno
              </button>

              {CATEGORIES.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => setActiveCat(c.id)}
                  className={`cursor-pointer rounded-full px-3 py-2 text-xs font-semibold ring-1 transition ${
                    activeCat === c.id
                      ? "bg-indigo-50 text-indigo-700 ring-indigo-200"
                      : "bg-white text-slate-600 ring-slate-200 hover:bg-slate-50"
                  }`}
                >
                  <span className="mr-1">{c.emoji}</span>
                  {c.label}
                </button>
              ))}
            </div>
          </div>

          {/* List */}
          <div className="px-4 pb-4">
            <div className="rounded-2xl border border-slate-100 bg-slate-50/40 p-2">
              {visibleItems.length === 0 ? (
                <div className="px-4 py-10 text-center">
                  <div className="text-3xl">🛒</div>
                  <p className="mt-2 font-semibold text-slate-800">Zatím nic.</p>
                  <p className="mt-1 text-sm text-slate-500">Přidej první položku.</p>
                </div>
              ) : (
                <ul className="space-y-2">
                  {visibleItems.map((item) => (
                    <li
                      key={item.id}
                      className={`group flex items-center justify-between gap-3 rounded-2xl bg-white px-3 py-3 shadow-sm ring-1 ring-slate-100 transition ${
                        item.done ? "opacity-75" : "hover:-translate-y-[1px] hover:shadow"
                      }`}
                    >
                      <button
                        type="button"
                        onClick={() => toggleDone(item.id)}
                        className={`h-6 w-6 shrink-0 rounded-full ring-2 transition grid place-items-center ${
                          item.done
                            ? "bg-emerald-500 ring-emerald-200"
                            : "bg-white ring-slate-200 hover:ring-teal-200"
                        }`}
                        title="Toggle done"
                      >
                        {item.done ? <span className="text-white text-sm">✓</span> : null}
                      </button>

                      <div className="min-w-0 flex-1">
                        <p
                          className={`truncate font-semibold ${
                            item.done ? "line-through text-slate-500" : "text-slate-900"
                          }`}
                        >
                          {item.text}
                        </p>
                        <p className="mt-1 text-xs text-slate-400">
                          {CATEGORIES.find((c) => c.id === item.category)?.emoji}{" "}
                          {CATEGORIES.find((c) => c.id === item.category)?.label}
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={() => removeItem(item.id)}
                        className="rounded-xl px-2 py-2 text-sm text-pink-600 hover:bg-pink-50"
                        title="Delete"
                      >
                        🗑️
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="px-6 pb-6">
            <div className="rounded-2xl border border-slate-100 bg-white p-4">
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold text-slate-800">
                  Hotovo {stats.done}/{stats.total}
                </p>
                <button
                  type="button"
                  onClick={clearDone}
                  className="rounded-full bg-teal-50 px-3 py-1 text-xs font-bold text-teal-700 ring-1 ring-teal-100 hover:bg-teal-100 transition"
                >
                  Vymazat hotové
                </button>
              </div>

              <div className="mt-3 h-2 w-full rounded-full bg-slate-100">
                <div
                  className="h-2 rounded-full bg-gradient-to-r from-teal-400 to-emerald-400 transition-all"
                  style={{ width: `${progress}%` }}
                />
              </div>

              <p className="mt-3 text-xs text-slate-400">Uloženo lokálně ✅</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
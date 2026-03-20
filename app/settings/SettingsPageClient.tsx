"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { DashboardLayout } from "@/components/DashboardLayout";
import {
  getOkxKeys,
  saveOkxKeys,
  getBotConfig,
  updateBotConfig,
  resetBotConfig,
  getInstruments,
} from "@/lib/api";
import {
  Key,
  Save,
  Layers,
  Settings2,
  Plus,
  Trash2,
  RotateCcw,
  Check,
  X,
  Pencil,
  Palette,
} from "lucide-react";
import { CryptoIcon } from "@/components/CryptoIcon";
import { AppearanceSettingsPanel } from "@/components/AppearanceSettingsPanel";

type BotConfigData = {
  baskets: Array<{ basket1: string; basket2: string }>;
  params: Record<string, number | boolean>;
  modes: Record<string, boolean>;
  error_handling?: Record<string, string | number | boolean>;
};

type SettingsSection = "api" | "trading" | "appearance";

const paramDefs: Array<{
  key: string;
  label: string;
  type: "number" | "boolean";
  suffix?: string;
  step?: number;
  min?: number;
  max?: number;
}> = [
  { key: "entry_spread_pct", label: "Entry spread", type: "number", suffix: "%", step: 0.01, min: 0 },
  { key: "take_profit_pct", label: "Take profit", type: "number", suffix: "%", step: 0.01, min: 0 },
  { key: "stop_loss_pct", label: "Stop loss", type: "number", suffix: "%", step: 0.1, min: 0 },
  { key: "stop_loss_enabled", label: "Stop loss enabled", type: "boolean" },
  { key: "position_size_pct", label: "Position size", type: "number", suffix: "%", step: 1, min: 1 },
  { key: "orders_per_trade", label: "Orders per trade", type: "number", step: 1, min: 1 },
  { key: "dca_count", label: "DCA count", type: "number", step: 1, min: 0 },
  { key: "dca_step_pct", label: "DCA step", type: "number", suffix: "%", step: 0.1, min: 0 },
  { key: "leverage", label: "Leverage", type: "number", suffix: "x", step: 1, min: 1, max: 125 },
];

const SETTINGS_SECTIONS: {
  id: SettingsSection;
  label: string;
  hint: string;
  Icon: typeof Key;
}[] = [
  { id: "api", label: "API & exchange", hint: "OKX keys", Icon: Key },
  { id: "trading", label: "Trading bot", hint: "Pairs & parameters", Icon: Layers },
  { id: "appearance", label: "Theme", hint: "Colors & mode", Icon: Palette },
];

const inputClass =
  "w-full px-4 py-2.5 rounded-lg bg-[var(--background)] border border-[var(--card-border)] text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)] transition";

const MAX_SUGGESTIONS = 12;

function BasketAutocomplete({
  value,
  onChange,
  placeholder,
  instruments,
  inputClass: cls,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
  instruments: string[];
  inputClass: string;
}) {
  const [open, setOpen] = useState(false);
  const [focused, setFocused] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const q = value.trim().toUpperCase();
  const suggestions =
    q.length === 0
      ? instruments.slice(0, MAX_SUGGESTIONS)
      : instruments.filter((s) => s.toUpperCase().includes(q)).slice(0, MAX_SUGGESTIONS);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div ref={containerRef} className="relative flex-1">
      <input
        value={value}
        onChange={(e) => {
          onChange(e.target.value);
          setOpen(true);
        }}
        onFocus={() => {
          setFocused(true);
          setOpen(true);
        }}
        onBlur={() => {
          setFocused(false);
          setTimeout(() => setOpen(false), 150);
        }}
        placeholder={placeholder}
        className={cls}
        autoComplete="off"
      />
      {open && (focused || suggestions.length > 0) && (
        <ul className="absolute z-50 left-0 right-0 mt-1 max-h-48 overflow-auto rounded-lg bg-[var(--card-bg)] border border-[var(--card-border)] shadow-lg py-1">
          {suggestions.length === 0 ? (
            <li className="px-4 py-2 text-sm text-[var(--muted)]">No matches</li>
          ) : (
            suggestions.map((inst) => (
              <li
                key={inst}
                onMouseDown={(e) => {
                  e.preventDefault();
                  onChange(inst);
                  setOpen(false);
                }}
                className="px-4 py-2 text-sm cursor-pointer hover:bg-[var(--accent)]/20 truncate"
              >
                {inst}
              </li>
            ))
          )}
        </ul>
      )}
    </div>
  );
}

export function SettingsPageClient() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const rawSection = searchParams.get("section");
  const section: SettingsSection =
    rawSection === "trading" || rawSection === "appearance" ? rawSection : "api";

  const goSection = (s: SettingsSection) => {
    router.replace(`/settings?section=${s}`, { scroll: false });
  };

  const [okxKeys, setOkxKeys] = useState<{
    masked_api_key: string | null;
    has_secret: boolean;
    has_passphrase: boolean;
  } | null>(null);
  const [config, setConfig] = useState<BotConfigData | null>(null);
  const [configError, setConfigError] = useState<string | null>(null);

  const [apiKey, setApiKey] = useState("");
  const [secretKey, setSecretKey] = useState("");
  const [passphrase, setPassphrase] = useState("");
  const [savingKeys, setSavingKeys] = useState(false);

  const [editParams, setEditParams] = useState<Record<string, number | boolean>>({});
  const [editParamStrings, setEditParamStrings] = useState<Record<string, string>>({});
  const [editModes, setEditModes] = useState<Record<string, boolean>>({});
  const [editBaskets, setEditBaskets] = useState<Array<{ basket1: string; basket2: string }>>([]);
  const [instruments, setInstruments] = useState<string[]>([]);
  const [editing, setEditing] = useState(false);
  const [savingConfig, setSavingConfig] = useState(false);
  const [saveMsg, setSaveMsg] = useState<{ ok: boolean; text: string } | null>(null);

  const loadConfig = useCallback(() => {
    getBotConfig().then((r) => {
      if (r.ok && r.data) {
        setConfig(r.data);
        setConfigError(null);
        syncEditState(r.data);
      } else {
        setConfig(null);
        setConfigError(r.error || "Config load error");
      }
    });
  }, []);

  function syncEditState(c: BotConfigData) {
    setEditParams({ ...c.params });
    const strings: Record<string, string> = {};
    for (const [k, v] of Object.entries(c.params)) {
      if (typeof v === "number") strings[k] = String(v);
    }
    setEditParamStrings(strings);
    setEditModes({ ...c.modes });
    setEditBaskets(c.baskets.map((b) => ({ ...b })));
  }

  useEffect(() => {
    getOkxKeys().then((r) => r.ok && r.data && setOkxKeys(r.data));
    loadConfig();
  }, [loadConfig]);

  async function handleSaveKeys() {
    setSavingKeys(true);
    const r = await saveOkxKeys({
      ...(apiKey && { api_key: apiKey }),
      ...(secretKey && { secret_key: secretKey }),
      ...(passphrase && { passphrase }),
    });
    setSavingKeys(false);
    if (r.ok) {
      setApiKey("");
      setSecretKey("");
      setPassphrase("");
      getOkxKeys().then((res) => res.ok && res.data && setOkxKeys(res.data));
    }
  }

  function startEditing() {
    if (config) syncEditState(config);
    setEditing(true);
    setSaveMsg(null);
    if (instruments.length === 0) {
      getInstruments().then((r) => r.ok && r.data && setInstruments(r.data.instruments));
    }
  }

  function cancelEditing() {
    if (config) syncEditState(config);
    setEditing(false);
    setSaveMsg(null);
  }

  async function handleSaveConfig() {
    setSavingConfig(true);
    setSaveMsg(null);
    const r = await updateBotConfig({
      baskets: editBaskets,
      params: editParams,
      modes: editModes,
    });
    setSavingConfig(false);
    if (r.ok) {
      setSaveMsg({ ok: true, text: "Saved" });
      setEditing(false);
      loadConfig();
    } else {
      setSaveMsg({ ok: false, text: r.error || "Save error" });
    }
  }

  async function handleResetConfig() {
    if (!confirm("Reset config to defaults?")) return;
    setSavingConfig(true);
    const r = await resetBotConfig();
    setSavingConfig(false);
    if (r.ok) {
      setSaveMsg({ ok: true, text: "Config reset" });
      setEditing(false);
      loadConfig();
    } else {
      setSaveMsg({ ok: false, text: r.error || "Reset error" });
    }
  }

  function setParam(key: string, value: number | boolean) {
    setEditParams((p) => ({ ...p, [key]: value }));
  }

  function setParamString(key: string, raw: string) {
    setEditParamStrings((s) => ({ ...s, [key]: raw }));
    const n = parseFloat(raw);
    if (!isNaN(n)) {
      setEditParams((p) => ({ ...p, [key]: n }));
    }
  }

  function setMode(key: string, value: boolean) {
    setEditModes((m) => ({ ...m, [key]: value }));
  }

  function setBasket(idx: number, field: "basket1" | "basket2", value: string) {
    setEditBaskets((prev) => prev.map((b, i) => (i === idx ? { ...b, [field]: value } : b)));
  }

  function addBasket() {
    setEditBaskets((prev) => [...prev, { basket1: "", basket2: "" }]);
  }

  function removeBasket(idx: number) {
    setEditBaskets((prev) => prev.filter((_, i) => i !== idx));
  }

  const anim = (delay: number) => ({
    initial: { opacity: 0, y: 12 } as const,
    animate: { opacity: 1, y: 0 } as const,
    transition: { duration: 0.25, delay },
  });

  const inputStyles =
    "w-full px-4 py-2.5 rounded-xl bg-[var(--background)]/80 border border-[var(--card-border)] text-[var(--foreground)] placeholder:text-[var(--muted)]/60 focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/40 focus:border-[var(--accent)]/50 transition";

  const sectionSubtitle =
    section === "api"
      ? "Connect and manage OKX API keys"
      : section === "trading"
        ? "Trading pairs, risk parameters, and modes"
        : "Light or dark mode, presets, and custom colors";

  return (
    <DashboardLayout>
      <div className="mb-6 md:mb-8">
        <h1 className="text-2xl md:text-3xl font-bold text-[var(--foreground)]">Settings</h1>
        <p className="text-[var(--muted)] mt-1">{sectionSubtitle}</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-6 lg:gap-10 lg:items-start">
        <nav
          className="flex lg:flex-col gap-1 overflow-x-auto lg:overflow-visible pb-1 lg:pb-0 -mx-1 px-1 lg:mx-0 lg:px-0 lg:w-56 shrink-0 lg:border-r lg:border-[var(--card-border)] lg:pr-6"
          aria-label="Settings sections"
        >
          {SETTINGS_SECTIONS.map(({ id, label, hint, Icon }) => {
            const active = section === id;
            return (
              <button
                key={id}
                type="button"
                onClick={() => goSection(id)}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-left whitespace-nowrap lg:whitespace-normal transition shrink-0 lg:w-full border-l-[3px] ${
                  active
                    ? "border-[var(--accent)] bg-[var(--accent)]/12 text-[var(--accent)] font-medium"
                    : "border-transparent text-[var(--muted)] hover:bg-[var(--sidebar-hover)] hover:text-[var(--foreground)]"
                }`}
              >
                <Icon className="w-5 h-5 shrink-0 opacity-90" />
                <span className="flex flex-col min-w-0 text-left">
                  <span className="text-sm">{label}</span>
                  <span className="text-[11px] font-normal text-[var(--muted)] hidden sm:block">{hint}</span>
                </span>
              </button>
            );
          })}
        </nav>

        <div className="flex-1 min-w-0 space-y-6">
          {section === "api" && (
            <motion.div {...anim(0)} className="card-glass rounded-2xl p-6">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-10 h-10 rounded-xl bg-[var(--accent)]/15 flex items-center justify-center">
                  <Key className="w-5 h-5 text-[var(--accent)]" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-[var(--foreground)]">OKX API</h2>
                  <p className="text-xs text-[var(--muted)]">Secure connection to exchange</p>
                </div>
              </div>
              {okxKeys?.masked_api_key && (
                <div className="mb-4 p-3 rounded-xl bg-[var(--background)]/50 border border-[var(--card-border)]/50">
                  <p className="text-xs text-[var(--muted)] mb-1">Current key</p>
                  <p className="text-sm font-mono text-[var(--foreground)] truncate">{okxKeys.masked_api_key}</p>
                </div>
              )}
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-[var(--muted)] mb-1.5">API Key</label>
                  <input
                    type="password"
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                    placeholder="••••••••"
                    className={inputStyles}
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-[var(--muted)] mb-1.5">Secret Key</label>
                  <input
                    type="password"
                    value={secretKey}
                    onChange={(e) => setSecretKey(e.target.value)}
                    placeholder="••••••••"
                    className={inputStyles}
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-[var(--muted)] mb-1.5">Passphrase</label>
                  <input
                    type="password"
                    value={passphrase}
                    onChange={(e) => setPassphrase(e.target.value)}
                    placeholder="••••••••"
                    className={inputStyles}
                  />
                </div>
              </div>
              <button
                onClick={handleSaveKeys}
                disabled={savingKeys || (!apiKey && !secretKey && !passphrase)}
                className="mt-5 w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-[var(--accent)] text-[var(--background)] font-semibold hover:opacity-90 disabled:opacity-50 transition"
              >
                <Save className="w-4 h-4" />
                {savingKeys ? "Saving..." : "Save keys"}
              </button>
            </motion.div>
          )}

          {section === "trading" && (
            <>
              {configError && (
                <motion.div {...anim(0)} className="p-4 rounded-xl border border-amber-500/40 bg-amber-500/10">
                  <p className="text-sm text-amber-600 dark:text-amber-400">{configError}</p>
                </motion.div>
              )}

              {config && (
                <>
                  <motion.div {...anim(0.05)} className="flex flex-wrap items-center gap-3">
                    {!editing ? (
                      <button
                        onClick={startEditing}
                        className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[var(--accent)] text-[var(--background)] font-medium hover:opacity-90 transition"
                      >
                        <Pencil className="w-4 h-4" />
                        Edit config
                      </button>
                    ) : (
                      <>
                        <button
                          onClick={handleSaveConfig}
                          disabled={savingConfig}
                          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[var(--positive)] text-[var(--background)] font-medium hover:opacity-90 disabled:opacity-50 transition"
                        >
                          <Check className="w-4 h-4" />
                          {savingConfig ? "Saving..." : "Save"}
                        </button>
                        <button
                          onClick={cancelEditing}
                          className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-[var(--card-border)] text-[var(--foreground)] font-medium hover:bg-[var(--sidebar-hover)] transition"
                        >
                          <X className="w-4 h-4" />
                          Cancel
                        </button>
                        <button
                          onClick={handleResetConfig}
                          disabled={savingConfig}
                          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[var(--negative)]/15 text-[var(--negative)] font-medium hover:bg-[var(--negative)]/25 disabled:opacity-50 transition ml-auto"
                        >
                          <RotateCcw className="w-4 h-4" />
                          Reset
                        </button>
                      </>
                    )}
                    <AnimatePresence>
                      {saveMsg && (
                        <motion.span
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          className={`text-sm font-medium ${saveMsg.ok ? "text-[var(--positive)]" : "text-[var(--negative)]"}`}
                        >
                          {saveMsg.text}
                        </motion.span>
                      )}
                    </AnimatePresence>
                  </motion.div>

                  <motion.div {...anim(0.1)} className="card-glass rounded-2xl p-6">
                    <div className="flex items-center gap-3 mb-5">
                      <div className="w-10 h-10 rounded-xl bg-violet-500/15 flex items-center justify-center">
                        <Layers className="w-5 h-5 text-violet-400" />
                      </div>
                      <div>
                        <h2 className="text-lg font-semibold text-[var(--foreground)]">Trading pairs</h2>
                        <p className="text-xs text-[var(--muted)]">Basket 1 vs Basket 2</p>
                      </div>
                    </div>
                    <div className="space-y-3">
                      {(editing ? editBaskets : config.baskets).length === 0 && (
                        <p className="py-6 text-center text-sm text-[var(--muted)]">No baskets configured</p>
                      )}
                      {(editing ? editBaskets : config.baskets).map((b, i) => (
                        <div
                          key={i}
                          className="flex flex-wrap sm:flex-nowrap items-center gap-3 p-3 rounded-xl bg-[var(--background)]/40 border border-[var(--card-border)]/50"
                        >
                          <span className="text-xs font-medium text-[var(--muted)] w-6 shrink-0">{i + 1}</span>
                          {editing ? (
                            <>
                              <BasketAutocomplete
                                value={b.basket1}
                                onChange={(v) => setBasket(i, "basket1", v)}
                                placeholder="Basket 1"
                                instruments={instruments}
                                inputClass={`${inputClass} flex-1 py-2 min-w-[120px]`}
                              />
                              <span className="text-[var(--muted)] text-sm shrink-0">vs</span>
                              <BasketAutocomplete
                                value={b.basket2}
                                onChange={(v) => setBasket(i, "basket2", v)}
                                placeholder="Basket 2"
                                instruments={instruments}
                                inputClass={`${inputClass} flex-1 py-2 min-w-[120px]`}
                              />
                              <button
                                onClick={() => removeBasket(i)}
                                className="p-2 rounded-lg text-[var(--negative)] hover:bg-[var(--negative)]/10 transition shrink-0"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </>
                          ) : (
                            <>
                              <span className="flex items-center gap-2 font-medium text-[var(--positive)]">
                                <CryptoIcon symbol={b.basket1} size={18} />
                                {b.basket1}
                              </span>
                              <span className="text-[var(--muted)] text-sm">vs</span>
                              <span className="flex items-center gap-2 font-medium text-[var(--negative)]">
                                <CryptoIcon symbol={b.basket2} size={18} />
                                {b.basket2}
                              </span>
                            </>
                          )}
                        </div>
                      ))}
                    </div>
                    {editing && (
                      <button
                        onClick={addBasket}
                        className="mt-4 flex items-center gap-2 w-full justify-center py-2.5 rounded-xl border border-dashed border-[var(--card-border)] text-[var(--muted)] hover:border-[var(--accent)]/50 hover:text-[var(--accent)] transition"
                      >
                        <Plus className="w-4 h-4" />
                        Add pair
                      </button>
                    )}
                  </motion.div>

                  <motion.div {...anim(0.15)} className="card-glass rounded-2xl p-6">
                    <div className="flex items-center gap-3 mb-5">
                      <div className="w-10 h-10 rounded-xl bg-[var(--accent)]/15 flex items-center justify-center">
                        <Settings2 className="w-5 h-5 text-[var(--accent)]" />
                      </div>
                      <div>
                        <h2 className="text-lg font-semibold text-[var(--foreground)]">Parameters</h2>
                        <p className="text-xs text-[var(--muted)]">Entry, exit and position settings</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                      {paramDefs.map((pd) => {
                        const val = editing ? editParams[pd.key] : config.params[pd.key];
                        return (
                          <div key={pd.key} className="p-4 rounded-xl bg-[var(--background)]/40 border border-[var(--card-border)]/50">
                            <label className="block text-xs font-medium text-[var(--muted)] mb-2">{pd.label}</label>
                            {pd.type === "boolean" ? (
                              editing ? (
                                <button
                                  type="button"
                                  onClick={() => setParam(pd.key, !val)}
                                  className={`relative w-11 h-6 rounded-full transition ${val ? "bg-[var(--positive)]" : "bg-[var(--muted)]/40"}`}
                                >
                                  <span
                                    className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow-sm transition-all ${val ? "left-6" : "left-1"}`}
                                  />
                                </button>
                              ) : (
                                <span className={`text-sm font-semibold ${val ? "text-[var(--positive)]" : "text-[var(--muted)]"}`}>
                                  {val ? "On" : "Off"}
                                </span>
                              )
                            ) : editing ? (
                              <div className="flex items-center gap-2">
                                <input
                                  type="text"
                                  inputMode="decimal"
                                  value={editParamStrings[pd.key] ?? ""}
                                  onChange={(e) => setParamString(pd.key, e.target.value.replace(/[^0-9.\-]/g, ""))}
                                  className={`${inputStyles} py-2`}
                                />
                                {pd.suffix && <span className="text-sm text-[var(--muted)] shrink-0 w-8">{pd.suffix}</span>}
                              </div>
                            ) : (
                              <span className="font-semibold text-[var(--foreground)]">
                                {typeof val === "number" ? val : "—"}
                                {pd.suffix && typeof val === "number" ? pd.suffix : ""}
                              </span>
                            )}
                          </div>
                        );
                      })}
                    </div>

                    <div className="mt-6 pt-5 border-t border-[var(--card-border)]">
                      <p className="text-xs font-medium text-[var(--muted)] mb-3">Modes</p>
                      <div className="flex flex-wrap gap-4">
                        {[
                          { key: "simulation_mode", label: "Simulation mode" },
                          { key: "no_new_position", label: "No new positions" },
                        ].map(({ key, label }) => {
                          const val = editing ? editModes[key] : config.modes[key];
                          return (
                            <div key={key} className="flex items-center gap-3">
                              <span className="text-sm text-[var(--foreground)]">{label}</span>
                              {editing ? (
                                <button
                                  type="button"
                                  onClick={() => setMode(key, !val)}
                                  className={`relative w-11 h-6 rounded-full transition ${val ? "bg-[var(--accent)]" : "bg-[var(--muted)]/40"}`}
                                >
                                  <span
                                    className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow-sm transition-all ${val ? "left-6" : "left-1"}`}
                                  />
                                </button>
                              ) : (
                                <span className={`text-sm font-semibold ${val ? "text-[var(--accent)]" : "text-[var(--muted)]"}`}>
                                  {val ? "On" : "Off"}
                                </span>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </motion.div>
                </>
              )}
            </>
          )}

          {section === "appearance" && (
            <motion.div {...anim(0.05)} className="card-glass rounded-2xl p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-[var(--accent)]/15 flex items-center justify-center">
                  <Palette className="w-5 h-5 text-[var(--accent)]" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-[var(--foreground)]">Theme & appearance</h2>
                  <p className="text-xs text-[var(--muted)]">Interface mode and accent colors</p>
                </div>
              </div>
              <AppearanceSettingsPanel />
            </motion.div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}

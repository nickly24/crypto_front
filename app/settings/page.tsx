"use client";

import { useEffect, useState, useCallback, useRef } from "react";
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
} from "lucide-react";
import { CryptoIcon } from "@/components/CryptoIcon";

type BotConfigData = {
  baskets: Array<{ basket1: string; basket2: string }>;
  params: Record<string, number | boolean>;
  modes: Record<string, boolean>;
  error_handling?: Record<string, string | number | boolean>;
};

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
  const suggestions = q.length === 0
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

export default function SettingsPage() {
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
    initial: { opacity: 0, y: 20 } as const,
    animate: { opacity: 1, y: 0 } as const,
    transition: { duration: 0.3, delay },
  });

  return (
    <DashboardLayout>
      <h1 className="text-2xl font-semibold mb-6">Settings</h1>

      {/* OKX Keys */}
      <motion.div {...anim(0)} className="card-glass p-6 max-w-3xl">
        <h2 className="text-lg font-medium mb-4 flex items-center gap-2">
          <Key className="w-5 h-5" />
          OKX Keys
        </h2>
        {okxKeys && (
          <p className="text-sm text-[var(--muted)] mb-4">
            API key: {okxKeys.masked_api_key || "not set"}
          </p>
        )}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm text-[var(--muted)] mb-2">API Key</label>
            <input type="password" value={apiKey} onChange={(e) => setApiKey(e.target.value)} placeholder="New key" className={inputClass} />
          </div>
          <div>
            <label className="block text-sm text-[var(--muted)] mb-2">Secret Key</label>
            <input type="password" value={secretKey} onChange={(e) => setSecretKey(e.target.value)} placeholder="New secret" className={inputClass} />
          </div>
          <div>
            <label className="block text-sm text-[var(--muted)] mb-2">Passphrase</label>
            <input type="password" value={passphrase} onChange={(e) => setPassphrase(e.target.value)} placeholder="New passphrase" className={inputClass} />
          </div>
        </div>
        <button
          onClick={handleSaveKeys}
          disabled={savingKeys || (!apiKey && !secretKey && !passphrase)}
          className="flex items-center gap-2 px-4 py-2.5 mt-4 rounded-lg bg-[var(--accent)] text-white hover:opacity-90 disabled:opacity-50 transition"
        >
          <Save className="w-4 h-4" />
          {savingKeys ? "Saving..." : "Save keys"}
        </button>
      </motion.div>

      {configError && (
        <motion.div {...anim(0.05)} className="card-glass p-6 max-w-3xl mt-6 border-amber-500/30">
          <p className="text-amber-500">{configError}</p>
        </motion.div>
      )}

      {config && (
        <>
          {/* Action bar */}
          <motion.div {...anim(0.05)} className="flex items-center gap-3 mt-6 max-w-3xl">
            {!editing ? (
              <button onClick={startEditing} className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[var(--accent)] text-white hover:opacity-90 transition">
                <Pencil className="w-4 h-4" />
                Edit config
              </button>
            ) : (
              <>
                <button
                  onClick={handleSaveConfig}
                  disabled={savingConfig}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[var(--positive)] text-white hover:opacity-90 disabled:opacity-50 transition"
                >
                  <Check className="w-4 h-4" />
                  {savingConfig ? "Saving..." : "Save"}
                </button>
                <button onClick={cancelEditing} className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[var(--card-bg)] border border-[var(--card-border)] text-[var(--foreground)] hover:opacity-80 transition">
                  <X className="w-4 h-4" />
                  Cancel
                </button>
                <button onClick={handleResetConfig} disabled={savingConfig} className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[var(--negative)]/20 text-[var(--negative)] hover:bg-[var(--negative)]/30 disabled:opacity-50 transition ml-auto">
                  <RotateCcw className="w-4 h-4" />
                  Reset
                </button>
              </>
            )}
            <AnimatePresence>
              {saveMsg && (
                <motion.span
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0 }}
                  className={`text-sm ${saveMsg.ok ? "text-[var(--positive)]" : "text-[var(--negative)]"}`}
                >
                  {saveMsg.text}
                </motion.span>
              )}
            </AnimatePresence>
          </motion.div>

          {/* Baskets */}
          <motion.div {...anim(0.1)} className="card-glass p-6 max-w-3xl mt-6">
            <h2 className="text-lg font-medium mb-4 flex items-center gap-2">
              <Layers className="w-5 h-5" />
              Baskets (pairs)
            </h2>
            <div className="space-y-3">
              {(editing ? editBaskets : config.baskets).map((b, i) => (
                <div key={i} className="flex items-center gap-3">
                  <span className="text-xs text-[var(--muted)] w-8 shrink-0">#{i + 1}</span>
                  {editing ? (
                    <>
                      <BasketAutocomplete
                        value={b.basket1}
                        onChange={(v) => setBasket(i, "basket1", v)}
                        placeholder="Basket 1 symbol (start typing)"
                        instruments={instruments}
                        inputClass={`${inputClass} flex-1`}
                      />
                      <span className="text-[var(--muted)] shrink-0">vs</span>
                      <BasketAutocomplete
                        value={b.basket2}
                        onChange={(v) => setBasket(i, "basket2", v)}
                        placeholder="Basket 2 symbol (start typing)"
                        instruments={instruments}
                        inputClass={`${inputClass} flex-1`}
                      />
                      <button onClick={() => removeBasket(i)} className="p-2 rounded-lg text-[var(--negative)] hover:bg-[var(--negative)]/10 transition shrink-0">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </>
                  ) : (
                    <>
                      <span className="flex items-center gap-2 font-medium text-[var(--positive)]">
                        <CryptoIcon symbol={b.basket1} size={20} />
                        {b.basket1}
                      </span>
                      <span className="text-[var(--muted)]">vs</span>
                      <span className="flex items-center gap-2 font-medium text-[var(--negative)]">
                        <CryptoIcon symbol={b.basket2} size={20} />
                        {b.basket2}
                      </span>
                    </>
                  )}
                </div>
              ))}
              {(editing ? editBaskets : config.baskets).length === 0 && (
                <p className="text-sm text-[var(--muted)]">No baskets</p>
              )}
            </div>
            {editing && (
              <button onClick={addBasket} className="flex items-center gap-2 mt-4 px-4 py-2 rounded-lg bg-[var(--accent)]/10 text-[var(--accent)] hover:bg-[var(--accent)]/20 transition">
                <Plus className="w-4 h-4" />
                Add pair
              </button>
            )}
          </motion.div>

          {/* Params */}
          <motion.div {...anim(0.15)} className="card-glass p-6 max-w-3xl mt-6">
            <h2 className="text-lg font-medium mb-4 flex items-center gap-2">
              <Settings2 className="w-5 h-5" />
              Entry & spread params
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {paramDefs.map((pd) => {
                const val = editing ? editParams[pd.key] : config.params[pd.key];
                return (
                  <div key={pd.key} className="p-4 rounded-lg bg-[var(--background)]/50">
                    <label className="text-sm text-[var(--muted)] block mb-2">{pd.label}</label>
                    {pd.type === "boolean" ? (
                      editing ? (
                        <button
                          type="button"
                          onClick={() => setParam(pd.key, !val)}
                          className={`relative w-12 h-6 rounded-full transition ${val ? "bg-[var(--positive)]" : "bg-[var(--muted)]/30"}`}
                        >
                          <span className={`absolute top-0.5 w-5 h-5 rounded-full bg-white transition-transform ${val ? "left-6" : "left-0.5"}`} />
                        </button>
                      ) : (
                        <span className={`text-sm font-semibold ${val ? "text-[var(--positive)]" : "text-[var(--muted)]"}`}>
                          {val ? "Yes" : "No"}
                        </span>
                      )
                    ) : editing ? (
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          inputMode="decimal"
                          value={editParamStrings[pd.key] ?? ""}
                          onChange={(e) => {
                            const raw = e.target.value.replace(/[^0-9.\-]/g, "");
                            setParamString(pd.key, raw);
                          }}
                          className={inputClass}
                        />
                        {pd.suffix && <span className="text-sm text-[var(--muted)] shrink-0">{pd.suffix}</span>}
                      </div>
                    ) : (
                      <span className="font-semibold">
                        {typeof val === "number" ? val : "—"}
                        {pd.suffix && typeof val === "number" ? pd.suffix : ""}
                      </span>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Modes */}
            <div className="mt-6 pt-4 border-t border-[var(--card-border)]">
              <p className="text-sm text-[var(--muted)] mb-3">Modes</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[
                  { key: "simulation_mode", label: "Simulation mode" },
                  { key: "no_new_position", label: "No new positions" },
                ].map(({ key, label }) => {
                  const val = editing ? editModes[key] : config.modes[key];
                  return (
                    <div key={key} className="p-4 rounded-lg bg-[var(--background)]/50 flex items-center justify-between">
                      <span className="text-sm">{label}</span>
                      {editing ? (
                        <button
                          type="button"
                          onClick={() => setMode(key, !val)}
                          className={`relative w-12 h-6 rounded-full transition ${val ? "bg-[var(--accent)]" : "bg-[var(--muted)]/30"}`}
                        >
                          <span className={`absolute top-0.5 w-5 h-5 rounded-full bg-white transition-transform ${val ? "left-6" : "left-0.5"}`} />
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
    </DashboardLayout>
  );
}

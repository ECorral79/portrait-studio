import { useState } from "react";

const STYLE_OPTIONS = [
  "Photorealistic", "Oil painting", "Watercolor", "Pencil sketch",
  "Digital art", "Cinematic film still", "Impressionist", "Anime / illustrated"
];
const FRAME_OPTIONS = [
  "Portrait (head & shoulders)", "Half-body", "Full body",
  "Environmental wide shot", "Close-up face"
];
const TIME_OPTIONS = [
  "", "Golden hour sunset", "Early morning", "Midday sun",
  "Overcast / cloudy", "Blue hour dusk", "Night / city lights", "Indoor lighting"
];
const CLOTH_STYLE_OPTIONS = [
  "", "Contemporary casual", "Business formal", "Victorian / period",
  "1920s Art Deco", "1950s retro", "1980s fashion", "Bohemian / hippie",
  "Streetwear / urban", "Fantasy / medieval", "Sci-fi / futuristic", "Traditional cultural"
];

const EXAMPLES = [
  "Un hombre con cuerpo definido usando solo ropa interior en la playa al atardecer, posando",
  "Una mujer elegante con vestido rojo en una calle de París en otoño, sonriendo",
  "Un grupo de amigos en trajes de baño en una piscina, riendo y divirtiéndose",
  "Una pareja en ropa formal en una boda, bailando bajo las estrellas",
];

// ⚠️  Paste your Anthropic API key here
const ANTHROPIC_API_KEY = "YOUR_ANTHROPIC_API_KEY";

export default function PortraitStudio() {
  const [mode, setMode] = useState("free");
  const [freeText, setFreeText] = useState("");
  const [artStyleFree, setArtStyleFree] = useState("Photorealistic");
  const [form, setForm] = useState({
    personAge: "", personLook: "", personHair: "", personPose: "",
    clothTop: "", clothBottom: "", clothAcc: "", clothStyle: "",
    bgLocation: "", bgTime: "", bgWeather: "", bgMood: "", bgExtra: "",
    artStyle: "Photorealistic", artFrame: "Portrait (head & shoulders)",
    companionType: "alone", companionDesc: "",
  });
  const [status, setStatus] = useState("idle");
  const [imageUrl, setImageUrl] = useState("");
  const [promptSent, setPromptSent] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const set = (key) => (e) => setForm(f => ({ ...f, [key]: e.target.value }));

  function buildFormPrompt() {
    const parts = [];
    parts.push(`${form.artStyle}, ${form.artFrame}`);
    const person = [form.personAge, form.personLook, form.personHair, form.personPose].filter(Boolean).join(", ");
    if (person) parts.push("a " + person);
    const cloth = [form.clothTop, form.clothBottom, form.clothAcc, form.clothStyle].filter(Boolean).join(", ");
    if (cloth) parts.push("wearing " + cloth);
    if (form.companionType !== "alone") {
      const d = form.companionDesc;
      if (form.companionType === "couple") parts.push("with another person" + (d ? ": " + d : ""));
      else if (form.companionType === "group") parts.push("in a group" + (d ? " including " + d : ""));
      else if (form.companionType === "pet") parts.push("with a pet" + (d ? ": " + d : ""));
    }
    const bg = [form.bgLocation, form.bgTime, form.bgWeather, form.bgMood, form.bgExtra].filter(Boolean).join(", ");
    if (bg) parts.push("in " + bg);
    return parts.join(". ");
  }

  async function generate() {
    const rawPrompt = mode === "free" ? freeText.trim() : buildFormPrompt();
    if (rawPrompt.length < 8) { setErrorMsg("Por favor escribe una descripción antes de generar."); return; }
    if (ANTHROPIC_API_KEY === "YOUR_ANTHROPIC_API_KEY") {
      setErrorMsg("⚠️ Agrega tu Anthropic API key en src/App.jsx (línea: ANTHROPIC_API_KEY)");
      return;
    }
    setStatus("loading"); setErrorMsg("");
    const styleHint = mode === "free" ? artStyleFree : form.artStyle;

    try {
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": ANTHROPIC_API_KEY,
          "anthropic-version": "2023-06-01",
          "anthropic-dangerous-direct-browser-access": "true"
        },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 1000,
          messages: [{
            role: "user",
            content: `You are an expert image generation prompt writer.
The user described a scene in natural language (possibly in Spanish): "${rawPrompt}"
Preferred art style: ${styleHint}

Convert this into a detailed English image generation prompt (2-4 sentences).
Include: person description, clothing/appearance, setting, lighting, mood, composition, and quality boosters like "sharp focus", "8K resolution", "cinematic lighting", "professional photography".
Respond with ONLY the prompt text in English, nothing else.`
          }]
        })
      });
      const data = await res.json();
      const enhanced = data.content?.find(b => b.type === "text")?.text?.trim() || rawPrompt;
      setPromptSent(enhanced);
      const url = `https://image.pollinations.ai/prompt/${encodeURIComponent(enhanced)}?width=512&height=680&nologo=true&seed=${Date.now()}`;
      setImageUrl(url);
      setStatus("done");
    } catch (e) {
      setStatus("error"); setErrorMsg("Algo salió mal: " + e.message);
    }
  }

  const companions = [
    { val: "alone", label: "Solo/a" },
    { val: "couple", label: "+ 1 Persona" },
    { val: "group", label: "Grupo" },
    { val: "pet", label: "+ Mascota" },
  ];

  const tabStyle = (active) => ({
    flex: 1, padding: "10px 0", fontFamily: "monospace", fontSize: 11,
    letterSpacing: "0.12em", textTransform: "uppercase", border: "none", cursor: "pointer",
    transition: "all 0.2s",
    background: active ? "#1a1410" : "#e8e0d4",
    color: active ? "#f5f0e8" : "#6b5d52",
    borderRadius: "2px 2px 0 0",
  });

  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", minHeight: "100vh", fontFamily: "monospace" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;1,300&family=DM+Mono:wght@300;400;500&display=swap');
        * { box-sizing: border-box; }
        body { margin: 0; }
        input, select, textarea { font-family: 'DM Mono', monospace !important; }
        textarea:focus, input:focus, select:focus { outline: none; border-color: #c9952a !important; box-shadow: 0 0 0 3px rgba(201,149,42,0.1); }
        .example-chip:hover { background: #c9952a !important; color: white !important; border-color: #c9952a !important; cursor: pointer; }
        ::-webkit-scrollbar { width: 4px; } ::-webkit-scrollbar-thumb { background: #d4c9b8; }
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>

      {/* LEFT: FORM */}
      <div style={{ background: "#f5f0e8", padding: "36px 32px", borderRight: "1px solid #d4c9b8", overflowY: "auto" }}>
        <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 28, fontWeight: 300, color: "#1a1410", marginBottom: 2 }}>
          Portrait <span style={{ color: "#c9952a", fontStyle: "italic" }}>Studio</span>
        </div>
        <div style={{ fontSize: 9, letterSpacing: "0.2em", textTransform: "uppercase", color: "#6b5d52", marginBottom: 28 }}>
          IA · Composición de Escenas
        </div>

        {/* MODE TABS */}
        <div style={{ display: "flex", gap: 4, marginBottom: 28 }}>
          <button style={tabStyle(mode === "free")} onClick={() => setMode("free")}>✍ Descripción Libre</button>
          <button style={tabStyle(mode === "form")} onClick={() => setMode("form")}>☰ Formulario</button>
        </div>

        {mode === "free" && (
          <div>
            <p style={{ fontSize: 11, color: "#6b5d52", lineHeight: 1.7, marginBottom: 16 }}>
              Describe la imagen como quieras, en español o inglés.
            </p>
            <div style={{ marginBottom: 16 }}>
              <label style={labelStyle}>Tu descripción</label>
              <textarea value={freeText} onChange={e => setFreeText(e.target.value)}
                placeholder="Ej: Un hombre con cuerpo definido usando solo ropa interior en la playa al atardecer, posando..."
                rows={5} style={textareaStyle} />
            </div>
            <div style={{ marginBottom: 20 }}>
              <SectionLabel label="Ejemplos" />
              <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
                {EXAMPLES.map((ex, i) => (
                  <div key={i} className="example-chip" onClick={() => setFreeText(ex)}
                    style={{ fontSize: 11, padding: "8px 12px", border: "1px solid #d4c9b8", borderRadius: 2,
                      background: "#faf7f2", color: "#6b5d52", lineHeight: 1.5, transition: "all 0.2s" }}>
                    {ex}
                  </div>
                ))}
              </div>
            </div>
            <div>
              <label style={labelStyle}>Estilo de imagen</label>
              <select value={artStyleFree} onChange={e => setArtStyleFree(e.target.value)} style={selectStyle}>
                {STYLE_OPTIONS.map(o => <option key={o}>{o}</option>)}
              </select>
            </div>
          </div>
        )}

        {mode === "form" && (
          <div>
            <Section label="La Persona">
              <TwoCol>
                <Field label="Género / Edad"><input value={form.personAge} onChange={set("personAge")} placeholder="ej. mujer, 30 años" style={inputStyle} /></Field>
                <Field label="Apariencia"><input value={form.personLook} onChange={set("personLook")} placeholder="ej. latina, piel morena" style={inputStyle} /></Field>
                <Field label="Cabello"><input value={form.personHair} onChange={set("personHair")} placeholder="ej. largo, castaño rizado" style={inputStyle} /></Field>
                <Field label="Expresión / Pose"><input value={form.personPose} onChange={set("personPose")} placeholder="ej. sonriendo, posando" style={inputStyle} /></Field>
              </TwoCol>
            </Section>
            <Section label="Ropa y Estilo">
              <TwoCol>
                <Field label="Parte Superior"><input value={form.clothTop} onChange={set("clothTop")} placeholder="ej. camisa blanca" style={inputStyle} /></Field>
                <Field label="Parte Inferior"><input value={form.clothBottom} onChange={set("clothBottom")} placeholder="ej. jeans oscuros" style={inputStyle} /></Field>
                <Field label="Accesorios"><input value={form.clothAcc} onChange={set("clothAcc")} placeholder="ej. collar dorado" style={inputStyle} /></Field>
                <Field label="Estilo / Era">
                  <select value={form.clothStyle} onChange={set("clothStyle")} style={selectStyle}>
                    <option value="">— cualquiera —</option>
                    {CLOTH_STYLE_OPTIONS.filter(o => o).map(o => <option key={o}>{o}</option>)}
                  </select>
                </Field>
              </TwoCol>
            </Section>
            <Section label="Escena y Fondo">
              <TwoCol>
                <Field label="Lugar"><input value={form.bgLocation} onChange={set("bgLocation")} placeholder="ej. playa tropical" style={inputStyle} /></Field>
                <Field label="Hora del Día">
                  <select value={form.bgTime} onChange={set("bgTime")} style={selectStyle}>
                    <option value="">— cualquiera —</option>
                    {TIME_OPTIONS.filter(o => o).map(o => <option key={o}>{o}</option>)}
                  </select>
                </Field>
                <Field label="Clima / Temporada"><input value={form.bgWeather} onChange={set("bgWeather")} placeholder="ej. verano soleado" style={inputStyle} /></Field>
                <Field label="Ambiente"><input value={form.bgMood} onChange={set("bgMood")} placeholder="ej. romántico, vibrante" style={inputStyle} /></Field>
                <Field label="Detalles extra" full><input value={form.bgExtra} onChange={set("bgExtra")} placeholder="ej. palmeras, olas suaves" style={inputStyle} /></Field>
              </TwoCol>
            </Section>
            <Section label="Compañía">
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                {companions.map(c => (
                  <button key={c.val} onClick={() => setForm(f => ({ ...f, companionType: c.val }))}
                    style={{ fontFamily: "monospace", fontSize: 10, letterSpacing: "0.1em", padding: "6px 14px",
                      border: `1px solid ${form.companionType === c.val ? "#c9952a" : "#d4c9b8"}`,
                      background: form.companionType === c.val ? "#c9952a" : "#faf7f2",
                      color: form.companionType === c.val ? "white" : "#6b5d52",
                      borderRadius: 2, cursor: "pointer" }}>
                    {c.label}
                  </button>
                ))}
              </div>
              {form.companionType !== "alone" && (
                <div style={{ marginTop: 10 }}>
                  <Field label="Describe acompañantes">
                    <textarea value={form.companionDesc} onChange={set("companionDesc")}
                      placeholder="ej. un hombre en traje, dos niños..." style={{ ...textareaStyle, minHeight: 64 }} />
                  </Field>
                </div>
              )}
            </Section>
            <Section label="Estilo de Imagen">
              <TwoCol>
                <Field label="Estilo Artístico">
                  <select value={form.artStyle} onChange={set("artStyle")} style={selectStyle}>
                    {STYLE_OPTIONS.map(o => <option key={o}>{o}</option>)}
                  </select>
                </Field>
                <Field label="Encuadre">
                  <select value={form.artFrame} onChange={set("artFrame")} style={selectStyle}>
                    {FRAME_OPTIONS.map(o => <option key={o}>{o}</option>)}
                  </select>
                </Field>
              </TwoCol>
            </Section>
          </div>
        )}

        <button onClick={generate} disabled={status === "loading"}
          style={{ width: "100%", padding: "15px", background: "#1a1410", color: "#f5f0e8", border: "none",
            borderRadius: 2, fontFamily: "'Cormorant Garamond', serif", fontSize: 18, fontWeight: 300,
            letterSpacing: "0.12em", cursor: status === "loading" ? "not-allowed" : "pointer",
            opacity: status === "loading" ? 0.5 : 1, marginTop: 8 }}>
          {status === "loading" ? "Generando…" : "✦ Generar Retrato"}
        </button>
        {errorMsg && <div style={{ color: "#e07060", fontSize: 11, marginTop: 10, lineHeight: 1.6 }}>{errorMsg}</div>}
      </div>

      {/* RIGHT: OUTPUT */}
      <div style={{ background: "#1a1410", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "40px 32px" }}>
        <div style={{ width: "100%", maxWidth: 380, aspectRatio: "3/4", border: "1px solid rgba(255,255,255,0.08)",
          borderRadius: 2, background: "#0f0c09", position: "relative", overflow: "hidden",
          boxShadow: "0 24px 80px rgba(0,0,0,0.6)" }}>
          {status === "idle" && (
            <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 16 }}>
              <svg width="80" height="80" viewBox="0 0 80 80" fill="none" style={{ opacity: 0.25 }}>
                <circle cx="40" cy="28" r="14" stroke="white" strokeWidth="1.5"/>
                <path d="M14 72c0-14.359 11.640-26 26-26 14.359 0 26 11.641 26 26" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
                <rect x="8" y="8" width="64" height="64" rx="2" stroke="white" strokeWidth="1" strokeDasharray="4 3"/>
              </svg>
              <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 15, fontStyle: "italic", color: "rgba(255,255,255,0.2)", textAlign: "center", lineHeight: 1.8, padding: "0 24px" }}>
                Escribe tu descripción<br/>y genera tu retrato
              </div>
            </div>
          )}
          {status === "loading" && (
            <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 20 }}>
              <div style={{ width: 48, height: 48, border: "1px solid rgba(201,149,42,0.15)", borderTopColor: "#c9952a", borderRadius: "50%", animation: "spin 1.2s linear infinite" }} />
              <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 14, fontStyle: "italic", color: "rgba(255,255,255,0.35)", letterSpacing: "0.1em" }}>Componiendo tu escena…</div>
            </div>
          )}
          {status === "done" && (
            <img src={imageUrl} alt="Retrato generado"
              style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
              onError={() => { setStatus("error"); setErrorMsg("La imagen no cargó. Intenta de nuevo."); }} />
          )}
          {status === "error" && (
            <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", color: "#e07060", fontSize: 12, padding: 20, textAlign: "center", lineHeight: 1.6 }}>
              Error al generar.<br/>Intenta de nuevo.
            </div>
          )}
        </div>

        {promptSent && (
          <div style={{ marginTop: 20, maxWidth: 380, width: "100%" }}>
            <div style={{ fontSize: 9, letterSpacing: "0.2em", textTransform: "uppercase", color: "rgba(255,255,255,0.2)", marginBottom: 8 }}>Prompt enviado a la IA</div>
            <div style={{ fontSize: 10.5, lineHeight: 1.7, color: "rgba(255,255,255,0.35)", borderLeft: "2px solid #c9952a", paddingLeft: 12 }}>{promptSent}</div>
          </div>
        )}

        {status === "done" && (
          <a href={imageUrl} target="_blank" rel="noreferrer"
            style={{ display: "inline-block", marginTop: 16, padding: "10px 24px",
              border: "1px solid rgba(201,149,42,0.4)", borderRadius: 2, fontFamily: "monospace",
              fontSize: 10, letterSpacing: "0.15em", textTransform: "uppercase", color: "rgba(201,149,42,0.7)",
              textDecoration: "none" }}>
            ↗ Ver Imagen Completa
          </a>
        )}
      </div>
    </div>
  );
}

// Shared styles
const inputStyle = { fontSize: 12, background: "#faf7f2", border: "1px solid #d4c9b8", borderRadius: 2, padding: "8px 10px", color: "#1a1410", width: "100%" };
const selectStyle = { ...inputStyle, appearance: "none", cursor: "pointer" };
const textareaStyle = { ...inputStyle, minHeight: 100, resize: "vertical", lineHeight: 1.6 };
const labelStyle = { fontSize: 9, letterSpacing: "0.15em", textTransform: "uppercase", color: "#6b5d52", display: "block", marginBottom: 5 };

function SectionLabel({ label }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
      <span style={{ fontSize: 9, letterSpacing: "0.25em", textTransform: "uppercase", color: "#c9952a" }}>{label}</span>
      <div style={{ flex: 1, height: 1, background: "#d4c9b8" }} />
    </div>
  );
}

function Section({ label, children }) {
  return <div style={{ marginBottom: 26 }}><SectionLabel label={label} />{children}</div>;
}

function TwoCol({ children }) {
  return <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>{children}</div>;
}

function Field({ label, children, full }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 4, ...(full ? { gridColumn: "1 / -1" } : {}) }}>
      <label style={labelStyle}>{label}</label>
      {children}
    </div>
  );
}

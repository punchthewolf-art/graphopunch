"use client";
import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useLanguage } from "@/i18n/LanguageContext";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import DrawingCanvas from "@/components/DrawingCanvas";

interface GraphoResult {
  type: string;
  traits: { name: string; percentage: number; emoji: string }[];
  emotionalStyle: string;
  careers: string[];
  secret: string;
  characterScore: number;
  observations: string;
}

export default function Home() {
  const { t } = useLanguage();
  const [imageData, setImageData] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<GraphoResult | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageFile(file);
    const reader = new FileReader();
    reader.onload = () => setImageData(reader.result as string);
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!imageData) return;
    setLoading(true);
    setResult(null);
    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image: imageData }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setResult(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Header />
      <main className="relative z-10 min-h-screen pt-20 bg-black">
        <AnimatePresence mode="wait">
          {!result ? (
            <motion.div key="form" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="max-w-2xl mx-auto px-6 py-16">
              <motion.div initial={{ y: 30, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.2 }} className="text-center mb-12">
                <div className="text-6xl mb-6 animate-float">{"\u270D\uFE0F"}</div>
                <h1 className="text-4xl md:text-6xl font-bold mb-4">
                  {t("hero.title")} <span className="gradient-text-amber">{t("hero.titleGradient")}</span>
                </h1>
                <p className="text-gray-400 text-lg max-w-lg mx-auto">{t("hero.subtitle")}</p>
              </motion.div>

              <motion.form onSubmit={handleSubmit} initial={{ y: 30, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.4 }} className="glass rounded-2xl p-8 space-y-6 glow-amber">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">{t("form.upload")}</label>
                  <div onClick={() => fileRef.current?.click()} className="w-full px-4 py-6 rounded-xl bg-white/5 border border-dashed border-white/20 text-center cursor-pointer hover:border-amber-500/50 transition">
                    <input ref={fileRef} type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
                    {imageFile ? <p className="text-amber-400">{t("form.uploaded")}: {imageFile.name}</p> : <p className="text-gray-500">{t("form.uploadHint")}</p>}
                  </div>
                </div>

                <div className="text-center text-gray-500 text-sm">{t("form.orDraw")}</div>
                <DrawingCanvas onCapture={(dataUrl) => { setImageData(dataUrl); setImageFile(null); }} />
                {imageData && !imageFile && <p className="text-amber-400 text-sm text-center">Drawing captured</p>}

                <button type="submit" disabled={loading || !imageData}
                  className="w-full py-4 rounded-xl font-bold text-lg bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer text-black">
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" className="opacity-25" /><path fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" className="opacity-75" /></svg>
                      {t("form.analyzing")}
                    </span>
                  ) : t("form.analyze")}
                </button>
              </motion.form>

              <motion.div initial={{ y: 30, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.6 }} className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-4">
                {(["f1", "f2", "f3", "f4"] as const).map((f, i) => (
                  <div key={f} className="glass rounded-xl p-4 text-center">
                    <div className="text-3xl mb-2">{["\uD83E\uDDE0", "\uD83D\uDCCA", "\uD83C\uDFAF", "\uD83D\uDD0D"][i]}</div>
                    <h3 className="font-semibold text-sm mb-1">{t(`features.${f}title`)}</h3>
                    <p className="text-xs text-gray-400">{t(`features.${f}desc`)}</p>
                  </div>
                ))}
              </motion.div>

              {/* Pricing Section */}
              <motion.div initial={{ y: 30, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.8 }} className="mt-20 mb-8">
                <h2 className="text-3xl font-bold text-center mb-10">{t("pricing.title")}</h2>
                <div className="grid md:grid-cols-2 gap-6 max-w-2xl mx-auto">
                  <div className="glass rounded-2xl p-6 border border-white/10">
                    <h3 className="text-lg font-bold mb-1">{t("pricing.freeTitle")}</h3>
                    <p className="text-3xl font-black gradient-text-amber mb-4">{t("pricing.freePrice")}</p>
                    <ul className="space-y-2 mb-6">
                      {(t("pricing.freeFeatures") as unknown as string[]).map((f: string, i: number) => (
                        <li key={i} className="flex items-center gap-2 text-sm text-gray-300">
                          <span className="text-green-400">{"\u2713"}</span> {f}
                        </li>
                      ))}
                    </ul>
                    <p className="text-xs text-gray-500 text-center">{t("pricing.freeCta")}</p>
                  </div>
                  <div className="glass rounded-2xl p-6 border border-amber-500/50 glow-amber relative">
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-amber-500 to-orange-600 text-xs font-bold px-3 py-1 rounded-full text-black">PREMIUM</div>
                    <h3 className="text-lg font-bold mb-1 mt-2">{t("pricing.premiumTitle")}</h3>
                    <p className="text-3xl font-black gradient-text-amber mb-1">{t("pricing.premiumPrice")}</p>
                    <p className="text-xs text-gray-500 mb-4">{t("pricing.premiumOnce")}</p>
                    <ul className="space-y-2 mb-6">
                      {(t("pricing.premiumFeatures") as unknown as string[]).map((f: string, i: number) => (
                        <li key={i} className="flex items-center gap-2 text-sm text-gray-300">
                          <span className="text-amber-400">{"\u2713"}</span> {f}
                        </li>
                      ))}
                    </ul>
                    <p className="text-xs text-gray-500 text-center">{t("pricing.premiumCta")}</p>
                  </div>
                </div>
              </motion.div>

            </motion.div>
          ) : (
            <motion.div key="result" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="max-w-3xl mx-auto px-6 py-16">
              <h2 className="text-3xl font-bold text-center mb-8 gradient-text-amber">{t("result.title")}</h2>
              <div className="grid md:grid-cols-2 gap-4 mb-8">
                <div className="glass rounded-2xl p-6 text-center">
                  <p className="text-xs text-gray-400 uppercase mb-1">{t("result.type")}</p>
                  <p className="text-2xl font-bold gradient-text-amber">{result.type}</p>
                </div>
                <div className="glass rounded-2xl p-6 text-center">
                  <p className="text-xs text-gray-400 uppercase mb-1">{t("result.characterScore")}</p>
                  <p className="text-4xl font-black gradient-text-amber">{result.characterScore}<span className="text-lg">/100</span></p>
                </div>
              </div>

              <div className="glass rounded-2xl p-6 mb-4">
                <h3 className="font-bold text-lg mb-4">{t("result.traits")}</h3>
                <div className="space-y-3">
                  {result.traits.map((tr, i) => (
                    <motion.div key={i} initial={{ x: -20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: i * 0.1 }}>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium">{tr.emoji} {tr.name}</span>
                        <span className="text-sm text-amber-400">{tr.percentage}%</span>
                      </div>
                      <div className="w-full bg-white/10 rounded-full h-2">
                        <motion.div initial={{ width: 0 }} animate={{ width: `${tr.percentage}%` }} transition={{ delay: i * 0.1 + 0.3, duration: 0.5 }}
                          className="h-2 rounded-full bg-gradient-to-r from-amber-400 to-orange-500" />
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>

              <div className="glass rounded-2xl p-6 mb-4">
                <h3 className="font-bold text-lg mb-3">{t("result.emotional")}</h3>
                <p className="text-gray-300">{result.emotionalStyle}</p>
              </div>

              <div className="glass rounded-2xl p-6 mb-4">
                <h3 className="font-bold mb-3 text-green-400">{t("result.careers")}</h3>
                <ul className="space-y-2">{result.careers.map((c, i) => <li key={i} className="text-sm text-gray-300">{c}</li>)}</ul>
              </div>

              <div className="glass rounded-2xl p-6 mb-4">
                <h3 className="font-bold text-lg mb-3">{t("result.observations")}</h3>
                <p className="text-sm text-gray-400">{result.observations}</p>
              </div>

              <div className="glass rounded-2xl p-8 text-center glow-amber mb-8">
                <h3 className="text-xl font-bold mb-2 gradient-text-amber">{t("result.premium")}</h3>
                <p className="text-gray-400 text-sm mb-4">{t("result.premiumDesc")}</p>
                <button className="px-8 py-3 rounded-xl font-bold bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 transition-all cursor-pointer text-black">
                  {t("result.premiumCta")} — {"\u20AC"}{t("result.premiumPrice")}
                </button>
              </div>

              <div className="flex flex-wrap gap-3 justify-center">
                <a href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(`My GraphoPunch: ${result.type}! Score: ${result.characterScore}/100`)}&url=https://graphopunch.pro`} target="_blank" rel="noopener noreferrer"
                  className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-sm transition">{t("result.shareTwitter")}</a>
                <button onClick={() => { setResult(null); setImageData(null); setImageFile(null); }}
                  className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-sm transition cursor-pointer">{t("result.newAnalysis")}</button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        <Footer />
      </main>
    </>
  );
}

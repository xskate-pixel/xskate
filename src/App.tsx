/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { GoogleGenAI } from "@google/genai";
import { Camera, Download, Loader2, Package, Plus, RefreshCcw, Upload, X } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import React, { useState, useRef, useCallback } from "react";

const MODEL_NAME = "gemini-2.5-flash-image";

export default function App() {
  const [image, setImage] = useState<string | null>(null);
  const [result, setResult] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result as string);
        setResult(null);
        setError(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const generateActionFigure = async () => {
    if (!image) return;

    setLoading(true);
    setError(null);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });
      const base64Data = image.split(",")[1];
      const mimeType = image.split(";")[0].split(":")[1];

      const prompt = `Create a full-body action figure of the person in this photo, displayed in its original premium blister packaging. At the top of the box, the toy's name "skater" should be in a single line of bold text. Inside the blister, next to the figure, show the toy's accessories: a skateboard, a pair of Vans sneakers, social media icons, 4 skateboard wheels, a backpack, headphones, and a cap. There should be a label in the corner of the box with the name "Xskate". The figure should have the appearance of a premium toy and all accessories must be inside the plastic packaging. High detail, realistic plastic textures, professional toy photography.`;

      const response = await ai.models.generateContent({
        model: MODEL_NAME,
        contents: {
          parts: [
            {
              inlineData: {
                data: base64Data,
                mimeType: mimeType,
              },
            },
            {
              text: prompt,
            },
          ],
        },
      });

      let foundImage = false;
      for (const part of response.candidates?.[0]?.content?.parts || []) {
        if (part.inlineData) {
          setResult(`data:image/png;base64,${part.inlineData.data}`);
          foundImage = true;
          break;
        }
      }

      if (!foundImage) {
        throw new Error("Não foi possível gerar a imagem. Tente novamente.");
      }
    } catch (err) {
      console.error(err);
      setError("Ocorreu um erro ao gerar sua figura de ação. Verifique sua conexão ou tente outra foto.");
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setImage(null);
    setResult(null);
    setError(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const downloadImage = () => {
    if (!result) return;
    const link = document.createElement("a");
    link.href = result;
    link.download = "xskate-action-figure.png";
    link.click();
  };

  return (
    <div className="min-h-screen bg-[#E4E3E0] text-[#141414] font-sans selection:bg-[#141414] selection:text-[#E4E3E0]">
      {/* Header */}
      <header className="border-b border-[#141414] p-6 flex justify-between items-center bg-white/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-[#141414] rounded-full flex items-center justify-center text-[#E4E3E0]">
            <Package size={24} />
          </div>
          <h1 className="text-2xl font-bold tracking-tighter uppercase italic font-serif">XSKATE</h1>
        </div>
        <div className="text-[10px] uppercase tracking-[0.2em] font-mono opacity-50 hidden sm:block">
          Premium Action Figure Generator v1.0
        </div>
      </header>

      <main className="max-w-6xl mx-auto p-6 lg:p-12 grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Left Column: Upload & Controls */}
        <div className="space-y-8">
          <section className="space-y-4">
            <div className="flex items-center gap-2 text-[11px] uppercase tracking-widest font-mono opacity-50 italic">
              <span className="w-2 h-2 bg-[#141414] rounded-full animate-pulse" />
              01. Upload de Foto
            </div>
            <h2 className="text-4xl font-light leading-tight">Transforme-se em um <span className="italic font-serif">Skater</span> de Coleção.</h2>
            <p className="text-sm opacity-70 max-w-md leading-relaxed">
              Carregue uma foto sua e nossa IA criará uma figura de ação premium completa com acessórios, embalagem blister e design exclusivo Xskate.
            </p>
          </section>

          <div className="relative group">
            <input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
              ref={fileInputRef}
            />
            
            {!image ? (
              <motion.button
                whileHover={{ scale: 0.99 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => fileInputRef.current?.click()}
                className="w-full aspect-[4/3] border-2 border-dashed border-[#141414]/20 rounded-3xl flex flex-col items-center justify-center gap-4 hover:border-[#141414] hover:bg-white transition-all duration-300 group"
              >
                <div className="w-16 h-16 rounded-full bg-white border border-[#141414]/10 flex items-center justify-center group-hover:scale-110 transition-transform duration-500">
                  <Upload size={24} className="opacity-50 group-hover:opacity-100" />
                </div>
                <div className="text-center">
                  <p className="font-medium">Clique para carregar</p>
                  <p className="text-xs opacity-50 mt-1">PNG, JPG ou WEBP (Max 5MB)</p>
                </div>
              </motion.button>
            ) : (
              <div className="relative aspect-[4/3] rounded-3xl overflow-hidden border border-[#141414]">
                <img src={image} alt="Preview" className="w-full h-full object-cover" />
                <button 
                  onClick={reset}
                  className="absolute top-4 right-4 w-10 h-10 bg-white rounded-full flex items-center justify-center border border-[#141414] hover:bg-[#141414] hover:text-white transition-colors shadow-lg"
                >
                  <X size={20} />
                </button>
              </div>
            )}
          </div>

          <AnimatePresence>
            {image && !result && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
              >
                <button
                  disabled={loading}
                  onClick={generateActionFigure}
                  className="w-full bg-[#141414] text-[#E4E3E0] py-6 rounded-2xl font-bold uppercase tracking-[0.2em] flex items-center justify-center gap-3 hover:bg-black transition-colors disabled:opacity-50 disabled:cursor-not-allowed group relative overflow-hidden"
                >
                  {loading ? (
                    <>
                      <Loader2 size={20} className="animate-spin" />
                      <span>Fabricando Figura...</span>
                    </>
                  ) : (
                    <>
                      <Plus size={20} />
                      <span>Gerar Action Figure</span>
                    </>
                  )}
                </button>
              </motion.div>
            )}
          </AnimatePresence>

          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm flex items-start gap-3">
              <div className="mt-0.5">⚠️</div>
              <p>{error}</p>
            </div>
          )}
        </div>

        {/* Right Column: Result */}
        <div className="relative min-h-[500px]">
          <div className="flex items-center gap-2 text-[11px] uppercase tracking-widest font-mono opacity-50 italic mb-4">
            <span className="w-2 h-2 bg-[#141414] rounded-full" />
            02. Resultado Final
          </div>

          <div className="w-full aspect-[3/4] bg-white rounded-[2rem] border border-[#141414] shadow-[20px_20px_0px_rgba(20,20,20,0.05)] flex items-center justify-center overflow-hidden relative group">
            {!result && !loading && (
              <div className="text-center p-12 opacity-20">
                <Package size={80} className="mx-auto mb-6" />
                <p className="text-sm uppercase tracking-widest font-bold">Aguardando Criação</p>
              </div>
            )}

            {loading && (
              <div className="absolute inset-0 bg-white/80 backdrop-blur-sm z-20 flex flex-col items-center justify-center gap-6 p-12 text-center">
                <div className="relative">
                  <Loader2 size={48} className="animate-spin text-[#141414]" />
                  <div className="absolute inset-0 animate-ping opacity-20">
                    <Loader2 size={48} />
                  </div>
                </div>
                <div className="space-y-2">
                  <p className="font-bold uppercase tracking-widest text-sm">Processando Design</p>
                  <p className="text-xs opacity-50 max-w-[200px]">Modelando figura, renderizando acessórios e selando embalagem...</p>
                </div>
              </div>
            )}

            {result && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="w-full h-full relative"
              >
                <img src={result} alt="Generated Figure" className="w-full h-full object-cover" />
                
                <div className="absolute bottom-6 left-6 right-6 flex gap-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <button 
                    onClick={downloadImage}
                    className="flex-1 bg-white border border-[#141414] text-[#141414] py-3 rounded-xl font-bold uppercase text-[10px] tracking-widest flex items-center justify-center gap-2 hover:bg-[#141414] hover:text-white transition-all shadow-xl"
                  >
                    <Download size={14} />
                    Download
                  </button>
                  <button 
                    onClick={generateActionFigure}
                    className="w-12 h-12 bg-white border border-[#141414] text-[#141414] rounded-xl flex items-center justify-center hover:bg-[#141414] hover:text-white transition-all shadow-xl"
                  >
                    <RefreshCcw size={16} />
                  </button>
                </div>
              </motion.div>
            )}
          </div>

          {/* Decorative Elements */}
          <div className="absolute -bottom-8 -right-8 w-32 h-32 border-r-2 border-b-2 border-[#141414] opacity-10 pointer-events-none" />
          <div className="absolute -top-4 -left-4 w-16 h-16 border-l-2 border-t-2 border-[#141414] opacity-10 pointer-events-none" />
        </div>
      </main>

      {/* Footer */}
      <footer className="mt-12 border-t border-[#141414] p-12 bg-white">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-12">
          <div className="space-y-4">
            <h3 className="font-serif italic text-xl">Xskate Premium</h3>
            <p className="text-xs opacity-60 leading-relaxed">
              Cada figura é gerada individualmente usando tecnologia de ponta para garantir que sua versão miniatura seja tão autêntica quanto você.
            </p>
          </div>
          <div className="space-y-4">
            <h4 className="text-[10px] uppercase tracking-widest font-bold opacity-40">Acessórios Inclusos</h4>
            <ul className="text-xs space-y-2 opacity-70">
              <li>• Skateboard Customizado</li>
              <li>• Tênis Vans Classic</li>
              <li>• Social Media Pack</li>
              <li>• 4 Rodas de Reposição</li>
              <li>• Mochila & Headphones</li>
            </ul>
          </div>
          <div className="space-y-4">
            <h4 className="text-[10px] uppercase tracking-widest font-bold opacity-40">Especificações</h4>
            <div className="p-4 border border-[#141414]/10 rounded-xl space-y-2">
              <div className="flex justify-between text-[10px]">
                <span className="opacity-50">ESCALA</span>
                <span className="font-bold">1:12</span>
              </div>
              <div className="flex justify-between text-[10px]">
                <span className="opacity-50">MATERIAL</span>
                <span className="font-bold">PVC PREMIUM</span>
              </div>
              <div className="flex justify-between text-[10px]">
                <span className="opacity-50">ARTICULAÇÃO</span>
                <span className="font-bold">24 PONTOS</span>
              </div>
            </div>
          </div>
        </div>
        <div className="max-w-6xl mx-auto mt-12 pt-12 border-t border-[#141414]/5 flex flex-col sm:flex-row justify-between items-center gap-6">
          <p className="text-[10px] opacity-40 uppercase tracking-widest">© 2026 XSKATE TOYS. ALL RIGHTS RESERVED.</p>
          <div className="flex gap-6 text-[10px] opacity-40 uppercase tracking-widest">
            <a href="#" className="hover:opacity-100 transition-opacity">Privacidade</a>
            <a href="#" className="hover:opacity-100 transition-opacity">Termos</a>
            <a href="#" className="hover:opacity-100 transition-opacity">Suporte</a>
          </div>
        </div>
      </footer>
    </div>
  );
}

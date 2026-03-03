import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, Image as ImageIcon, Download, RefreshCw, Sparkles, Trash2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { ImageEditor } from './components/ImageEditor';
import { removeWatermark } from './services/gemini';
import { fallbackInpaint } from './utils/inpainting';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export default function App() {
  const [originalImage, setOriginalImage] = useState<string | null>(null);
  const [processedImage, setProcessedImage] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setOriginalImage(reader.result as string);
        setProcessedImage(null);
        setError(null);
      };
      reader.readAsDataURL(file);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/*': [] },
    multiple: false,
  });

  const handleProcess = async (maskedImageBase64: string) => {
    setIsProcessing(true);
    setError(null);
    try {
      // We send the image with the red highlights to Gemini.
      // We tell Gemini that the red highlights indicate the area to be removed/inpainted.
      const prompt = "The provided image has red semi-transparent highlights over certain areas (watermarks). Please remove these watermarks and the red highlights, and intelligently inpaint the background to make it look natural. Return only the final clean image.";
      const result = await removeWatermark(maskedImageBase64, prompt);
      setProcessedImage(result);
    } catch (err: any) {
      if (err.message === "API_KEY_MISSING") {
        console.log("API Key missing, falling back to frontend inpainting...");
        try {
          if (!originalImage) throw new Error("No original image");
          const result = await fallbackInpaint(originalImage, maskedImageBase64);
          setProcessedImage(result);
        } catch (fallbackErr: any) {
          setError("Frontend restoration failed: " + fallbackErr.message);
        }
      } else {
        console.error(err);
        setError(err.message || "Failed to process image. Please try again.");
      }
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReset = () => {
    setOriginalImage(null);
    setProcessedImage(null);
    setError(null);
  };

  const handleDownload = () => {
    if (!processedImage) return;
    const link = document.createElement('a');
    link.href = processedImage;
    link.download = 'clearmark-result.png';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="min-h-screen bg-[#0A0A0B] text-white font-sans selection:bg-emerald-500/30">
      {/* Header */}
      <header className="border-b border-white/5 bg-[#0A0A0B]/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-emerald-600 rounded-lg flex items-center justify-center shadow-lg shadow-emerald-900/20">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-lg font-semibold tracking-tight">ClearMark <span className="text-emerald-500">AI</span></h1>
          </div>
          <div className="flex items-center gap-4">
            <div className={cn(
              "px-3 py-1 rounded-full text-[10px] font-mono uppercase tracking-wider border",
              process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== "MY_GEMINI_API_KEY"
                ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-500"
                : "bg-amber-500/10 border-amber-500/20 text-amber-500"
            )}>
              {process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== "MY_GEMINI_API_KEY" 
                ? "AI Mode Active" 
                : "Local Mode (No API Key)"}
            </div>
            <span className="text-[10px] uppercase tracking-[0.2em] text-gray-500 font-mono">Powered by Gemini 2.5</span>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-12">
        <AnimatePresence mode="wait">
          {!originalImage ? (
            <motion.div
              key="upload"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="max-w-2xl mx-auto"
            >
              <div className="text-center mb-12">
                <h2 className="text-4xl font-bold mb-4 tracking-tight">Remove watermarks with precision.</h2>
                <p className="text-gray-400 text-lg">Upload your image and use our AI-powered brush to selectively clean any unwanted marks.</p>
              </div>

              <div
                {...getRootProps()}
                className={cn(
                  "border-2 border-dashed rounded-3xl p-12 transition-all cursor-pointer flex flex-col items-center justify-center gap-6 group",
                  isDragActive ? "border-emerald-500 bg-emerald-500/5" : "border-white/10 hover:border-white/20 hover:bg-white/5"
                )}
              >
                <input {...getInputProps()} />
                <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Upload className="w-8 h-8 text-gray-400 group-hover:text-emerald-500 transition-colors" />
                </div>
                <div className="text-center">
                  <p className="text-xl font-medium mb-1">Drop your image here</p>
                  <p className="text-gray-500">or click to browse from your computer</p>
                </div>
                <div className="flex gap-2 mt-4">
                  <span className="px-3 py-1 bg-white/5 rounded-full text-[10px] uppercase tracking-wider text-gray-400 font-mono">JPG</span>
                  <span className="px-3 py-1 bg-white/5 rounded-full text-[10px] uppercase tracking-wider text-gray-400 font-mono">PNG</span>
                  <span className="px-3 py-1 bg-white/5 rounded-full text-[10px] uppercase tracking-wider text-gray-400 font-mono">WEBP</span>
                </div>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="editor"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start"
            >
              {/* Left Column: Editor */}
              <div className="lg:col-span-8">
                <ImageEditor 
                  imageUrl={originalImage} 
                  onProcess={handleProcess}
                  isProcessing={isProcessing}
                />
              </div>

              {/* Right Column: Results & Controls */}
              <div className="lg:col-span-4 flex flex-col gap-6">
                <div className="bg-[#151619] rounded-2xl p-6 border border-white/10 shadow-xl">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-sm font-semibold uppercase tracking-widest text-gray-400 font-mono">Result</h3>
                    {processedImage && (
                      <button 
                        onClick={handleReset}
                        className="text-gray-500 hover:text-red-400 transition-colors"
                        title="Start Over"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>

                  <div className="aspect-square bg-[#0A0A0B] rounded-xl border border-white/5 overflow-hidden flex items-center justify-center relative group">
                    {processedImage ? (
                      <>
                        <img 
                          src={processedImage} 
                          alt="Processed" 
                          className="w-full h-full object-contain"
                          referrerPolicy="no-referrer"
                        />
                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4">
                          <button 
                            onClick={handleDownload}
                            className="bg-white text-black px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 hover:bg-gray-200 transition-colors"
                          >
                            <Download className="w-4 h-4" /> Download
                          </button>
                        </div>
                      </>
                    ) : (
                      <div className="text-center p-8">
                        {isProcessing ? (
                          <div className="flex flex-col items-center gap-4">
                            <RefreshCw className="w-8 h-8 text-emerald-500 animate-spin" />
                            <p className="text-sm text-gray-400 animate-pulse">AI is removing the watermark...</p>
                          </div>
                        ) : (
                          <div className="flex flex-col items-center gap-4">
                            <ImageIcon className="w-8 h-8 text-gray-700" />
                            <p className="text-sm text-gray-600">Your processed image will appear here</p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {error && (
                    <div className="mt-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-xs">
                      {error}
                    </div>
                  )}

                  {processedImage && (
                    <div className="mt-6 flex flex-col gap-3">
                      <button 
                        onClick={handleDownload}
                        className="w-full bg-white text-black py-3 rounded-xl font-semibold flex items-center justify-center gap-2 hover:bg-gray-200 transition-all"
                      >
                        <Download className="w-5 h-5" /> Download Result
                      </button>
                      <button 
                        onClick={() => setProcessedImage(null)}
                        className="w-full bg-white/5 text-white py-3 rounded-xl font-medium border border-white/10 hover:bg-white/10 transition-all"
                      >
                        Adjust Selection
                      </button>
                    </div>
                  )}
                </div>

                <div className="bg-[#151619] rounded-2xl p-6 border border-white/10 shadow-xl">
                  <h3 className="text-sm font-semibold uppercase tracking-widest text-gray-400 font-mono mb-4">Tips</h3>
                  <ul className="space-y-3 text-xs text-gray-500">
                    <li className="flex gap-2">
                      <span className="text-emerald-500">01</span>
                      <span>Brush slightly outside the watermark edges for better blending.</span>
                    </li>
                    <li className="flex gap-2">
                      <span className="text-emerald-500">02</span>
                      <span>For complex backgrounds, try smaller brush strokes.</span>
                    </li>
                    <li className="flex gap-2">
                      <span className="text-emerald-500">03</span>
                      <span>You can undo and clear your strokes if you make a mistake.</span>
                    </li>
                  </ul>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      <footer className="border-t border-white/5 py-8 mt-auto">
        <div className="max-w-7xl mx-auto px-6 text-center text-gray-600 text-xs font-mono uppercase tracking-[0.3em]">
          &copy; 2024 ClearMark AI &bull; Professional Image Restoration
        </div>
      </footer>
    </div>
  );
}

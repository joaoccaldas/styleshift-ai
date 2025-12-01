import React, { useState, useRef } from 'react';
import { Camera, Upload, Sparkles, Shirt, X, Download, ArrowRight, ArrowLeft, Briefcase, Zap, Sun, User, Palette, Heart, AlertTriangle } from 'lucide-react';
import { ViewMode, ProcessingStatus } from './types';
import { generateOutfitChange } from './services/geminiService';
import CameraCapture from './components/CameraCapture';
import Button from './components/Button';

// Catalog Definitions
const CATALOG = [
  { 
    id: 'casual', 
    name: 'Street Style', 
    description: 'Denim jacket, white tee, black jeans',
    prompt: 'A trendy street style outfit featuring a vintage denim jacket over a crisp white t-shirt, paired with fitted black jeans and sneakers.',
    icon: <Shirt className="w-5 h-5 text-blue-400" />
  },
  { 
    id: 'business', 
    name: 'Business Pro', 
    description: 'Navy suit, white shirt, silk tie',
    prompt: 'A professional tailored navy blue business suit with a crisp white collared shirt and a silk tie. Formal and elegant.',
    icon: <Briefcase className="w-5 h-5 text-indigo-400" />
  },
  { 
    id: 'summer', 
    name: 'Summer Vibes', 
    description: 'Light linen shirt / Floral dress',
    prompt: 'A light, breezy summer outfit. For feminine style: a floral sundress. For masculine style: a linen button-down shirt and beige shorts.',
    icon: <Sun className="w-5 h-5 text-yellow-400" />
  },
  { 
    id: 'cyber', 
    name: 'Cyberpunk', 
    description: 'Neon armor, futuristic jacket',
    prompt: 'Futuristic cyberpunk fashion with a glowing neon high-collar jacket, tech-wear accessories, and digital aesthetics.',
    icon: <Zap className="w-5 h-5 text-purple-400" />
  },
  { 
    id: 'undress', 
    name: 'Swimwear', 
    description: 'Simple neutral swimwear',
    prompt: 'Remove outer clothing. The person is wearing simple, neutral-colored swimwear (e.g. swim trunks or a bikini). Focus on realistic skin texture and anatomy while maintaining the original pose.',
    icon: <User className="w-5 h-5 text-red-400" />
  },
  { 
    id: 'lingerie', 
    name: 'Lingerie / Intimates', 
    description: 'Lace details, silk, luxury',
    prompt: 'A luxury lingerie set with intricate lace details and silk fabrics. Elegant and sophisticated intimate wear. Focus on realistic fabric textures and fit.',
    icon: <Heart className="w-5 h-5 text-pink-500" />
  }
];

const App: React.FC = () => {
  const [viewMode, setViewMode] = useState<ViewMode>(ViewMode.UPLOAD);
  const [sourceImage, setSourceImage] = useState<string | null>(null);
  const [prompt, setPrompt] = useState('');
  const [status, setStatus] = useState<ProcessingStatus>('idle');
  const [error, setError] = useState<string | null>(null);
  const [resultImage, setResultImage] = useState<string | null>(null);
  const [selectedCatalogId, setSelectedCatalogId] = useState<string | null>(null);
  const [allowNSFW, setAllowNSFW] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setError("File size too large. Please choose an image under 5MB.");
        return;
      }
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setSourceImage(event.target.result as string);
          setViewMode(ViewMode.EDITOR);
          setError(null);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCapture = (base64: string) => {
    setSourceImage(base64);
    setViewMode(ViewMode.EDITOR);
  };

  const handleGenerate = async () => {
    if (!sourceImage || !prompt.trim()) return;

    setStatus('loading');
    setError(null);

    try {
      const generated = await generateOutfitChange(sourceImage, prompt, allowNSFW);
      setResultImage(generated);
      setViewMode(ViewMode.RESULT);
      setStatus('success');
    } catch (err: any) {
      // Display the actual error message from the service
      setError(err.message || "Failed to generate image. Please try again with a different prompt or image.");
      setStatus('error');
    } finally {
      setStatus(prev => prev === 'error' ? 'error' : 'idle');
    }
  };

  const selectCatalogItem = (item: typeof CATALOG[0]) => {
    setPrompt(item.prompt);
    setSelectedCatalogId(item.id);
  };

  const resetAll = () => {
    setSourceImage(null);
    setResultImage(null);
    setPrompt('');
    setSelectedCatalogId(null);
    setStatus('idle');
    setError(null);
    setViewMode(ViewMode.UPLOAD);
    // Note: We don't reset allowNSFW preference to persist user choice
  };

  const downloadImage = (dataUrl: string, filename: string) => {
    const link = document.createElement('a');
    link.href = dataUrl;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="min-h-screen bg-dark text-slate-200 font-sans selection:bg-primary selection:text-white">
      {/* Header */}
      <header className="sticky top-0 z-40 w-full backdrop-blur-lg border-b border-slate-800 bg-dark/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-2 cursor-pointer" onClick={resetAll}>
            <div className="bg-gradient-to-br from-primary to-secondary p-2 rounded-lg">
              <Shirt className="h-6 w-6 text-white" />
            </div>
            <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">
              StyleShift
            </h1>
          </div>
          {viewMode !== ViewMode.UPLOAD && (
            <Button variant="ghost" onClick={resetAll} className="!p-2 text-sm">
              New Project
            </Button>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col items-center min-h-[calc(100vh-4rem)]">
        
        {/* VIEW: UPLOAD */}
        {viewMode === ViewMode.UPLOAD && (
          <div className="w-full max-w-2xl mt-10 animate-fade-in">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-extrabold text-white mb-4 tracking-tight">
                Virtual Try-On
              </h2>
              <p className="text-lg text-slate-400">
                Upload a photo or take a selfie, and instantly try on new outfits from our catalog.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Camera Button */}
              <button
                onClick={() => setViewMode(ViewMode.CAMERA)}
                className="group relative flex flex-col items-center justify-center p-8 h-64 border-2 border-slate-700 border-dashed rounded-3xl hover:border-primary hover:bg-slate-800/50 transition-all duration-300"
              >
                <div className="p-4 bg-slate-800 rounded-full group-hover:scale-110 transition-transform duration-300 mb-4">
                  <Camera className="h-8 w-8 text-primary" />
                </div>
                <span className="text-lg font-medium text-white">Take a Photo</span>
                <span className="text-sm text-slate-500 mt-2">Use your camera</span>
              </button>

              {/* Upload Button */}
              <button
                onClick={() => fileInputRef.current?.click()}
                className="group relative flex flex-col items-center justify-center p-8 h-64 border-2 border-slate-700 border-dashed rounded-3xl hover:border-secondary hover:bg-slate-800/50 transition-all duration-300"
              >
                <div className="p-4 bg-slate-800 rounded-full group-hover:scale-110 transition-transform duration-300 mb-4">
                  <Upload className="h-8 w-8 text-secondary" />
                </div>
                <span className="text-lg font-medium text-white">Upload Image</span>
                <span className="text-sm text-slate-500 mt-2">JPG, PNG up to 5MB</span>
                <input
                  type="file"
                  ref={fileInputRef}
                  className="hidden"
                  accept="image/png, image/jpeg, image/webp"
                  onChange={handleFileChange}
                />
              </button>
            </div>
            
            {error && (
              <div className="mt-6 p-4 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl text-center">
                {error}
              </div>
            )}
          </div>
        )}

        {/* VIEW: CAMERA */}
        {viewMode === ViewMode.CAMERA && (
          <CameraCapture 
            onCapture={handleCapture}
            onCancel={() => setViewMode(ViewMode.UPLOAD)}
          />
        )}

        {/* VIEW: EDITOR */}
        {viewMode === ViewMode.EDITOR && sourceImage && (
          <div className="w-full max-w-6xl flex flex-col lg:flex-row gap-8 mt-4 animate-fade-in">
            {/* Image Preview */}
            <div className="flex-1 flex flex-col items-center">
              <div className="sticky top-24 w-full">
                <div className="relative w-full aspect-[3/4] bg-slate-800 rounded-3xl overflow-hidden shadow-2xl ring-1 ring-slate-700 mx-auto max-w-md">
                  <img 
                    src={sourceImage} 
                    alt="Original" 
                    className="w-full h-full object-cover"
                  />
                  <button 
                    onClick={() => setViewMode(ViewMode.UPLOAD)}
                    className="absolute top-4 right-4 p-2 bg-black/50 hover:bg-black/70 text-white rounded-full backdrop-blur-sm transition-colors"
                  >
                    <X size={20} />
                  </button>
                </div>
                <p className="mt-4 text-slate-500 text-sm text-center">Original Image</p>
              </div>
            </div>

            {/* Controls */}
            <div className="flex-1 flex flex-col">
              <div className="bg-surface p-6 md:p-8 rounded-3xl shadow-xl border border-slate-700/50">
                <div className="mb-8">
                  <h3 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
                    <Palette className="text-secondary" />
                    Select a Style
                  </h3>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
                    {CATALOG.map((item) => (
                      <button
                        key={item.id}
                        onClick={() => selectCatalogItem(item)}
                        className={`flex items-start p-3 rounded-xl border transition-all duration-200 text-left ${
                          selectedCatalogId === item.id 
                            ? 'bg-primary/10 border-primary ring-1 ring-primary' 
                            : 'bg-dark border-slate-700 hover:border-slate-600 hover:bg-slate-800'
                        }`}
                      >
                        <div className={`p-2 rounded-lg mr-3 ${selectedCatalogId === item.id ? 'bg-primary text-white' : 'bg-slate-800'}`}>
                          {item.icon}
                        </div>
                        <div>
                          <div className={`font-semibold ${selectedCatalogId === item.id ? 'text-primary' : 'text-slate-200'}`}>
                            {item.name}
                          </div>
                          <div className="text-xs text-slate-500 mt-1 leading-tight">
                            {item.description}
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-slate-400 mb-2 flex justify-between">
                      <span>Or Describe Custom Outfit</span>
                      {selectedCatalogId && (
                        <button 
                          onClick={() => { setSelectedCatalogId(null); setPrompt(''); }}
                          className="text-xs text-primary hover:text-primary/80"
                        >
                          Clear Selection
                        </button>
                      )}
                    </label>
                    <textarea
                      value={prompt}
                      onChange={(e) => {
                        setPrompt(e.target.value);
                        if (selectedCatalogId) setSelectedCatalogId(null); // Clear selection if user types
                      }}
                      placeholder="e.g. A vintage leather jacket and blue jeans..."
                      className="w-full h-24 bg-dark border border-slate-600 rounded-xl p-4 text-white placeholder-slate-500 focus:ring-2 focus:ring-primary focus:border-transparent resize-none transition-all"
                    />
                  </div>

                  <div className="bg-slate-800/50 rounded-xl p-3 border border-slate-700">
                    <label className="flex items-center justify-between cursor-pointer group">
                      <div className="flex items-center space-x-3">
                         <div className={`p-2 rounded-lg transition-colors ${allowNSFW ? 'bg-red-500/20 text-red-400' : 'bg-slate-700 text-slate-400'}`}>
                           <AlertTriangle size={18} />
                         </div>
                         <div className="flex flex-col">
                            <span className={`text-sm font-medium transition-colors ${allowNSFW ? 'text-red-400' : 'text-slate-300'}`}>
                              Allow Sensitive Content
                            </span>
                            <span className="text-xs text-slate-500">May generate 18+ content (lingerie/swimwear)</span>
                         </div>
                      </div>
                      <div className="relative">
                        <input 
                          type="checkbox" 
                          className="sr-only" 
                          checked={allowNSFW}
                          onChange={(e) => setAllowNSFW(e.target.checked)}
                        />
                        <div className={`block w-10 h-6 rounded-full transition-colors ${allowNSFW ? 'bg-red-500/50' : 'bg-slate-700'}`}></div>
                        <div className={`absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform ${allowNSFW ? 'transform translate-x-4 bg-red-200' : ''}`}></div>
                      </div>
                    </label>
                  </div>

                  <div className="flex flex-col space-y-3">
                    <Button 
                      onClick={handleGenerate}
                      isLoading={status === 'loading'}
                      disabled={!prompt.trim()}
                      className="w-full py-4 text-lg"
                      icon={<Sparkles className="w-5 h-5" />}
                    >
                      {status === 'loading' ? 'Generating...' : 'Generate Try-On'}
                    </Button>
                  </div>

                  {error && (
                    <div className="p-4 bg-red-900/20 border border-red-900/50 rounded-xl">
                      <p className="text-red-400 text-sm text-center">{error}</p>
                    </div>
                  )}

                  <div className="pt-4 border-t border-slate-700">
                    <p className="text-xs text-slate-500 text-center leading-relaxed">
                      AI tries to preserve the pose and face. Results may vary.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* VIEW: RESULT */}
        {viewMode === ViewMode.RESULT && resultImage && sourceImage && (
          <div className="w-full max-w-6xl flex flex-col mt-4 animate-fade-in">
            <div className="flex justify-between items-center mb-8">
              <button 
                onClick={() => setViewMode(ViewMode.EDITOR)}
                className="flex items-center text-slate-400 hover:text-white transition-colors"
              >
                <ArrowLeft className="w-5 h-5 mr-2" />
                Try Another Outfit
              </button>
              <h2 className="text-2xl font-bold text-white">Your Result</h2>
              <div className="w-24"></div> {/* Spacer for centering */}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
              {/* Original (Small Reference) */}
              <div className="flex flex-col gap-4">
                 <div className="relative group rounded-3xl overflow-hidden shadow-2xl ring-1 ring-slate-700 bg-slate-800">
                    <div className="absolute top-4 left-4 bg-black/60 backdrop-blur px-3 py-1 rounded-full text-xs font-bold text-white uppercase tracking-wider">Original</div>
                    <img src={sourceImage} alt="Original" className="w-full h-auto object-cover" />
                 </div>
              </div>

              {/* Generated (Large Focus) */}
              <div className="flex flex-col gap-4">
                 <div className="relative group rounded-3xl overflow-hidden shadow-2xl shadow-primary/20 ring-1 ring-primary/50 bg-slate-800">
                    <div className="absolute top-4 left-4 bg-primary/90 backdrop-blur px-3 py-1 rounded-full text-xs font-bold text-white uppercase tracking-wider shadow-lg">Try-On Result</div>
                    <img src={resultImage} alt="Generated" className="w-full h-auto object-cover" />
                    
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end justify-center p-6">
                       <Button 
                         variant="primary" 
                         onClick={() => downloadImage(resultImage!, `styleshift-${Date.now()}.png`)}
                         icon={<Download className="w-5 h-5" />}
                       >
                         Download Result
                       </Button>
                    </div>
                 </div>
              </div>
            </div>

            <div className="mt-12 flex justify-center pb-12">
               <Button onClick={resetAll} variant="secondary" className="px-8" icon={<ArrowRight className="w-5 h-5"/>}>
                  Start New Transformation
               </Button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default App;

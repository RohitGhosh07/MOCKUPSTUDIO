import React, { useState } from 'react';
import { Sparkles, Loader2, Maximize, Check } from 'lucide-react';
import { generateProImage, ensureApiKeySelected } from '../services/gemini';
import { GeneratedImage, ImageSize } from '../types';
import { ApiKeySelector } from './ApiKeySelector';

interface ProGeneratorProps {
  onImageGenerated: (image: GeneratedImage) => void;
}

export const ProGenerator: React.FC<ProGeneratorProps> = ({ onImageGenerated }) => {
  const [prompt, setPrompt] = useState('');
  const [size, setSize] = useState<ImageSize>(ImageSize.SIZE_1K);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [keyValidated, setKeyValidated] = useState(false);

  const handleGenerate = async () => {
    if (!prompt.trim()) return;
    
    // Safety check for API Key before starting
    const hasKey = await ensureApiKeySelected();
    if (!hasKey) {
      setKeyValidated(false);
      return;
    }

    setIsGenerating(true);
    setError(null);

    try {
      const images = await generateProImage(prompt, size);
      
      if (images.length > 0) {
        onImageGenerated({
          id: Date.now().toString(),
          url: images[0],
          prompt: `Pro: ${prompt}`,
          type: 'pro',
          timestamp: Date.now()
        });
      } else {
        setError("Generation failed. Please try a different prompt.");
      }
    } catch (err: any) {
      console.error(err);
      if (err.message && err.message.includes('Requested entity was not found')) {
        setError("API Key Error: Please re-select your project API key.");
        setKeyValidated(false);
      } else {
        setError("Failed to generate image. Ensure your selected project has billing enabled for Gemini 3 Pro.");
      }
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-8 text-center">
        <h2 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-violet-400 to-fuchsia-400 flex items-center justify-center gap-3">
          <Sparkles className="w-8 h-8 text-fuchsia-400" />
          Pro Studio Generation
        </h2>
        <p className="text-slate-400 mt-2">
          Generate ultra-high fidelity visuals using Gemini 3 Pro Image Preview. 
          Select up to 4K resolution.
        </p>
      </div>

      <ApiKeySelector onKeySelected={() => setKeyValidated(true)} />

      <div className="bg-slate-800/50 rounded-2xl p-6 md:p-8 border border-slate-700/50 space-y-8">
        {/* Prompt Input */}
        <div className="space-y-3">
          <label className="text-sm font-medium text-violet-200">Describe your image</label>
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="A futuristic glass coffee mug floating in zero gravity, cinematic lighting, 8k resolution, photorealistic..."
            className="w-full h-32 bg-slate-900/80 border-slate-700 rounded-xl p-4 text-white placeholder-slate-600 focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all resize-none"
          />
        </div>

        {/* Settings */}
        <div className="space-y-3">
          <label className="text-sm font-medium text-violet-200">Output Resolution</label>
          <div className="grid grid-cols-3 gap-4">
            {[ImageSize.SIZE_1K, ImageSize.SIZE_2K, ImageSize.SIZE_4K].map((s) => (
              <button
                key={s}
                onClick={() => setSize(s)}
                className={`flex items-center justify-center gap-2 py-3 px-4 rounded-lg font-medium transition-all ${
                  size === s 
                    ? 'bg-violet-600 text-white shadow-lg shadow-violet-900/50' 
                    : 'bg-slate-900 text-slate-400 hover:bg-slate-800'
                }`}
              >
                {size === s && <Check className="w-4 h-4" />}
                {s}
              </button>
            ))}
          </div>
          <p className="text-xs text-slate-500 pt-1">
            Higher resolutions (2K/4K) consume more processing tokens and time.
          </p>
        </div>

        {error && (
          <div className="p-4 bg-red-900/20 border border-red-500/50 rounded-lg text-red-200 text-sm">
            {error}
          </div>
        )}

        <button
          onClick={handleGenerate}
          disabled={!prompt.trim() || isGenerating}
          className={`w-full py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-2 transition-all ${
            !prompt.trim() || isGenerating
              ? 'bg-slate-700 text-slate-500 cursor-not-allowed'
              : 'bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white hover:shadow-violet-500/25 hover:scale-[1.01]'
          }`}
        >
          {isGenerating ? (
            <>
              <Loader2 className="w-6 h-6 animate-spin" />
              Rendering High-Res Image...
            </>
          ) : (
            <>
              <Sparkles className="w-6 h-6" />
              Generate Pro Image
            </>
          )}
        </button>
      </div>
    </div>
  );
};

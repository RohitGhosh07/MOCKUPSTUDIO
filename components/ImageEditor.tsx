import React, { useState, useRef } from 'react';
import { Wand2, Loader2, Upload, Download, RefreshCw } from 'lucide-react';
import { editImageWithPrompt } from '../services/gemini';
import { GeneratedImage } from '../types';

interface ImageEditorProps {
  initialImage?: string;
  onImageGenerated: (image: GeneratedImage) => void;
}

export const ImageEditor: React.FC<ImageEditorProps> = ({ initialImage, onImageGenerated }) => {
  const [currentImage, setCurrentImage] = useState<string | null>(initialImage || null);
  const [prompt, setPrompt] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setCurrentImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleEdit = async () => {
    if (!currentImage || !prompt.trim()) return;

    setIsProcessing(true);
    setError(null);

    try {
      const base64Data = currentImage.split(',')[1];
      const images = await editImageWithPrompt(base64Data, prompt);
      
      if (images.length > 0) {
        setCurrentImage(images[0]); // Update preview to new image
        onImageGenerated({
          id: Date.now().toString(),
          url: images[0],
          prompt: `Edit: ${prompt}`,
          type: 'edit',
          timestamp: Date.now()
        });
        setPrompt(''); // Clear prompt after success
      } else {
        setError("Could not edit the image. Please try a different prompt.");
      }
    } catch (err) {
      console.error(err);
      setError("Failed to edit image. The AI service might be temporarily unavailable.");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="grid md:grid-cols-2 gap-8 h-full">
      {/* Left: Image Preview & Upload */}
      <div className="flex flex-col gap-4">
        <div 
          className={`flex-1 min-h-[400px] bg-slate-800/50 rounded-2xl border-2 border-dashed relative overflow-hidden flex items-center justify-center group ${
            currentImage ? 'border-slate-700' : 'border-slate-600 hover:border-indigo-400 cursor-pointer'
          }`}
          onClick={() => !currentImage && fileInputRef.current?.click()}
        >
          <input 
            type="file" 
            ref={fileInputRef}
            onChange={handleFileChange} 
            accept="image/*" 
            className="hidden" 
          />
          
          {currentImage ? (
            <>
              <img 
                src={currentImage} 
                alt="Editing target" 
                className="max-w-full max-h-full object-contain" 
              />
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  fileInputRef.current?.click();
                }}
                className="absolute bottom-4 right-4 bg-slate-900/80 text-white px-3 py-2 rounded-lg text-sm font-medium hover:bg-black backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-2"
              >
                <RefreshCw className="w-4 h-4" /> Change Image
              </button>
            </>
          ) : (
            <div className="text-center p-6">
              <Upload className="w-12 h-12 text-slate-500 mx-auto mb-4" />
              <p className="text-slate-300 font-medium">Upload an image to edit</p>
              <p className="text-sm text-slate-500 mt-2">or generate a mockup first</p>
            </div>
          )}
        </div>
      </div>

      {/* Right: Controls */}
      <div className="flex flex-col justify-center gap-6">
        <div>
          <h2 className="text-3xl font-bold text-white mb-2 flex items-center gap-2">
            <Wand2 className="w-8 h-8 text-indigo-400" />
            Magic Editor
          </h2>
          <p className="text-slate-400">
            Use natural language to edit your image. Add objects, change backgrounds, or apply styles using Gemini 2.5 Flash.
          </p>
        </div>

        <div className="space-y-4">
          <label className="block text-sm font-medium text-indigo-200">
            What would you like to change?
          </label>
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder='e.g., "Add a retro filter", "Remove the background", "Add steam rising from the mug"'
            className="w-full h-32 bg-slate-800 border-slate-700 rounded-xl p-4 text-white placeholder-slate-500 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all resize-none"
          />
        </div>

        {error && (
          <div className="text-red-300 text-sm bg-red-900/20 p-3 rounded-lg border border-red-500/20">
            {error}
          </div>
        )}

        <button
          onClick={handleEdit}
          disabled={!currentImage || !prompt.trim() || isProcessing}
          className={`w-full py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-2 transition-all ${
            !currentImage || !prompt.trim() || isProcessing
              ? 'bg-slate-700 text-slate-500 cursor-not-allowed'
              : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-900/30'
          }`}
        >
          {isProcessing ? (
            <>
              <Loader2 className="w-6 h-6 animate-spin" />
              Applying Magic...
            </>
          ) : (
            <>
              <Wand2 className="w-6 h-6" />
              Edit Image
            </>
          )}
        </button>

        <div className="bg-slate-800/50 rounded-lg p-4">
          <h4 className="text-xs font-bold text-slate-500 uppercase mb-2">Try these prompts</h4>
          <div className="flex flex-wrap gap-2">
            {['Make it cyberpunk style', 'Add sunlight from the right', 'Turn the background to a forest'].map(p => (
              <button 
                key={p}
                onClick={() => setPrompt(p)}
                className="text-xs bg-slate-700 hover:bg-slate-600 text-slate-300 px-2 py-1 rounded-md transition-colors"
              >
                {p}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

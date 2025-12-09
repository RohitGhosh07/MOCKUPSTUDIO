import React, { useState, useRef } from 'react';
import { Upload, Image as ImageIcon, Loader2, Shirt, Coffee, ShoppingBag, Box, ArrowRight } from 'lucide-react';
import { generateMockup } from '../services/gemini';
import { GeneratedImage } from '../types';

interface MockupGeneratorProps {
  onImageGenerated: (image: GeneratedImage) => void;
}

const PRODUCTS = [
  { id: 't-shirt', name: 'T-Shirt', icon: Shirt, prompt: 'folded white cotton t-shirt on a wooden table' },
  { id: 'mug', name: 'Ceramic Mug', icon: Coffee, prompt: 'white ceramic coffee mug on a marble counter next to coffee beans' },
  { id: 'tote', name: 'Tote Bag', icon: ShoppingBag, prompt: 'canvas tote bag hanging on a hook against a minimal wall' },
  { id: 'box', name: 'Packaging Box', icon: Box, prompt: 'cardboard packaging box on a clean surface' },
];

export const MockupGenerator: React.FC<MockupGeneratorProps> = ({ onImageGenerated }) => {
  const [logo, setLogo] = useState<string | null>(null);
  const [selectedProduct, setSelectedProduct] = useState(PRODUCTS[0]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogo(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleGenerate = async () => {
    if (!logo) return;

    setIsGenerating(true);
    setError(null);

    try {
      // Clean base64 string
      const base64Data = logo.split(',')[1];
      
      const images = await generateMockup(base64Data, selectedProduct.name, `Place this logo realistically on a ${selectedProduct.prompt}.`);
      
      if (images.length > 0) {
        onImageGenerated({
          id: Date.now().toString(),
          url: images[0],
          prompt: `Logo on ${selectedProduct.name}`,
          type: 'mockup',
          timestamp: Date.now()
        });
      } else {
        setError("No image was generated. Please try again.");
      }
    } catch (err) {
      console.error(err);
      setError("Failed to generate mockup. The API might be busy or the image format unsupported.");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <div className="text-center space-y-2">
        <h2 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-teal-400 to-cyan-500">
          Instant Product Mockups
        </h2>
        <p className="text-slate-400">Upload your logo and instantly see it on real products using AI.</p>
      </div>

      {/* Upload Section */}
      <div 
        className={`border-2 border-dashed rounded-xl p-8 text-center transition-all ${
          logo ? 'border-teal-500/50 bg-teal-500/10' : 'border-slate-700 hover:border-slate-500 bg-slate-800/50'
        }`}
      >
        <input 
          type="file" 
          ref={fileInputRef}
          onChange={handleFileChange} 
          accept="image/*" 
          className="hidden" 
        />
        
        {logo ? (
          <div className="space-y-4">
            <div className="w-32 h-32 mx-auto bg-white/10 rounded-lg p-2 flex items-center justify-center">
              <img src={logo} alt="Uploaded logo" className="max-w-full max-h-full object-contain" />
            </div>
            <button 
              onClick={() => fileInputRef.current?.click()}
              className="text-sm text-teal-300 hover:text-teal-200 font-medium"
            >
              Change Logo
            </button>
          </div>
        ) : (
          <div 
            onClick={() => fileInputRef.current?.click()}
            className="cursor-pointer space-y-4 py-8"
          >
            <div className="w-16 h-16 mx-auto bg-slate-700 rounded-full flex items-center justify-center text-slate-400">
              <Upload className="w-8 h-8" />
            </div>
            <div>
              <p className="font-medium text-slate-200">Click to upload logo</p>
              <p className="text-sm text-slate-500">PNG or JPG (transparent background recommended)</p>
            </div>
          </div>
        )}
      </div>

      {/* Product Selection */}
      <div className="space-y-4">
        <label className="text-sm font-medium text-slate-400 uppercase tracking-wider">Select Product</label>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {PRODUCTS.map((product) => (
            <button
              key={product.id}
              onClick={() => setSelectedProduct(product)}
              className={`p-4 rounded-xl border flex flex-col items-center gap-3 transition-all ${
                selectedProduct.id === product.id 
                  ? 'bg-teal-500/20 border-teal-500 text-teal-100' 
                  : 'bg-slate-800 border-slate-700 text-slate-400 hover:bg-slate-750 hover:border-slate-600'
              }`}
            >
              <product.icon className="w-8 h-8" />
              <span className="text-sm font-medium">{product.name}</span>
            </button>
          ))}
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-900/20 border border-red-500/50 rounded-lg text-red-200 text-sm">
          {error}
        </div>
      )}

      {/* Generate Button */}
      <button
        onClick={handleGenerate}
        disabled={!logo || isGenerating}
        className={`w-full py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-2 transition-all shadow-lg shadow-teal-900/20 ${
          !logo || isGenerating
            ? 'bg-slate-700 text-slate-500 cursor-not-allowed'
            : 'bg-gradient-to-r from-teal-500 to-cyan-600 text-white hover:shadow-teal-500/25 hover:scale-[1.01]'
        }`}
      >
        {isGenerating ? (
          <>
            <Loader2 className="w-6 h-6 animate-spin" />
            Generating Mockup...
          </>
        ) : (
          <>
            <ImageIcon className="w-6 h-6" />
            Generate Mockup
          </>
        )}
      </button>
    </div>
  );
};

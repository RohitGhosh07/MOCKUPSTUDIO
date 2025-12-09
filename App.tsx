import React, { useState } from 'react';
import { Navbar } from './components/Navbar';
import { MockupGenerator } from './components/MockupGenerator';
import { ImageEditor } from './components/ImageEditor';
import { ProGenerator } from './components/ProGenerator';
import { AppMode, GeneratedImage } from './types';
import { Download, Clock, Image as ImageIcon } from 'lucide-react';

export default function App() {
  const [mode, setMode] = useState<AppMode>('mockup');
  const [history, setHistory] = useState<GeneratedImage[]>([]);
  
  // This state is used to pass a generated image from Mockup -> Editor
  const [editorInitialImage, setEditorInitialImage] = useState<string | undefined>(undefined);

  const handleImageGenerated = (image: GeneratedImage) => {
    setHistory(prev => [image, ...prev]);
  };

  const handleEditRequest = (imageUrl: string) => {
    setEditorInitialImage(imageUrl);
    setMode('editor');
  };

  return (
    <div className="min-h-screen pb-20">
      <Navbar currentMode={mode} onModeChange={setMode} />

      <main className="max-w-7xl mx-auto px-4 py-8">
        
        {/* Dynamic Content Area */}
        <div className="min-h-[600px] mb-16">
          {mode === 'mockup' && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              <MockupGenerator onImageGenerated={handleImageGenerated} />
            </div>
          )}
          
          {mode === 'editor' && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              <ImageEditor 
                initialImage={editorInitialImage} 
                onImageGenerated={handleImageGenerated} 
              />
            </div>
          )}
          
          {mode === 'pro' && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              <ProGenerator onImageGenerated={handleImageGenerated} />
            </div>
          )}
        </div>

        {/* Gallery / History Section */}
        {history.length > 0 && (
          <div className="border-t border-slate-800 pt-12">
            <h3 className="text-xl font-bold text-slate-200 mb-6 flex items-center gap-2">
              <Clock className="w-5 h-5 text-slate-500" />
              Recent Generations
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {history.map((img) => (
                <div key={img.id} className="group relative bg-slate-800 rounded-xl overflow-hidden border border-slate-700 hover:border-slate-600 transition-all shadow-lg hover:shadow-xl hover:-translate-y-1">
                  <div className="aspect-square bg-slate-900 relative">
                    <img src={img.url} alt={img.prompt} className="w-full h-full object-cover" />
                    
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 backdrop-blur-sm">
                      <a 
                        href={img.url} 
                        download={`mockup-studio-${img.id}.png`}
                        className="p-3 bg-white/10 hover:bg-white/20 rounded-full text-white backdrop-blur-md transition-all"
                        title="Download"
                      >
                        <Download className="w-5 h-5" />
                      </a>
                      
                      {img.type !== 'editor' && (
                        <button 
                          onClick={() => handleEditRequest(img.url)}
                          className="p-3 bg-indigo-500/80 hover:bg-indigo-500 rounded-full text-white backdrop-blur-md transition-all"
                          title="Edit in Magic Editor"
                        >
                          <ImageIcon className="w-5 h-5" />
                        </button>
                      )}
                    </div>
                  </div>
                  
                  <div className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className={`text-xs font-bold px-2 py-0.5 rounded-full uppercase ${
                        img.type === 'mockup' ? 'bg-teal-500/20 text-teal-300' :
                        img.type === 'editor' ? 'bg-indigo-500/20 text-indigo-300' :
                        'bg-fuchsia-500/20 text-fuchsia-300'
                      }`}>
                        {img.type}
                      </span>
                      <span className="text-xs text-slate-500">
                        {new Date(img.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <p className="text-sm text-slate-300 line-clamp-2" title={img.prompt}>
                      {img.prompt}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

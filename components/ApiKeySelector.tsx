import React, { useState, useEffect } from 'react';
import { AlertCircle, Key } from 'lucide-react';

export const ApiKeySelector: React.FC<{ onKeySelected: () => void }> = ({ onKeySelected }) => {
  const [needsKey, setNeedsKey] = useState(false);

  useEffect(() => {
    const checkKey = async () => {
      if (typeof (window as any).aistudio !== 'undefined') {
        const hasKey = await (window as any).aistudio.hasSelectedApiKey();
        setNeedsKey(!hasKey);
        if (hasKey) onKeySelected();
      } else {
        // In standalone dev, we might assume env key is fine
        onKeySelected();
      }
    };
    checkKey();
  }, [onKeySelected]);

  const handleSelectKey = async () => {
    if (typeof (window as any).aistudio !== 'undefined') {
      await (window as any).aistudio.openSelectKey();
      setNeedsKey(false);
      onKeySelected();
    }
  };

  if (!needsKey) return null;

  return (
    <div className="bg-blue-900/30 border border-blue-500/50 rounded-lg p-4 mb-6 flex items-start gap-3">
      <AlertCircle className="w-5 h-5 text-blue-400 mt-0.5 flex-shrink-0" />
      <div>
        <h3 className="text-sm font-semibold text-blue-100">API Key Required</h3>
        <p className="text-xs text-blue-300 mt-1 mb-3">
          To use the Pro Image Generation features, you need to select a billing-enabled project.
          Please refer to the <a href="https://ai.google.dev/gemini-api/docs/billing" target="_blank" rel="noopener noreferrer" className="underline hover:text-blue-200">billing documentation</a> for details.
        </p>
        <button
          onClick={handleSelectKey}
          className="flex items-center gap-2 px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-medium rounded-md transition-colors"
        >
          <Key className="w-3 h-3" />
          Select API Key
        </button>
      </div>
    </div>
  );
};

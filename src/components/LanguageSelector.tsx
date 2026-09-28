import React, { useState } from 'react';
import { LANGUAGES, SupportedLanguage, useTranslation } from '../utils/i18n';
import { Globe, Check, ChevronDown } from 'lucide-react';
import { soundFx } from '../utils/audio';

interface LanguageSelectorProps {
  compact?: boolean;
}

export const LanguageSelector: React.FC<LanguageSelectorProps> = ({ compact = false }) => {
  const { lang, setLanguage } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);

  const currentLangObj = LANGUAGES.find(l => l.code === lang) || LANGUAGES[0];

  const handleSelect = (code: SupportedLanguage) => {
    soundFx.playButtonClick();
    setLanguage(code);
    setIsOpen(false);
  };

  return (
    <div className="relative inline-block text-left select-none z-50">
      <button
        id="language-selector-btn"
        onClick={() => {
          soundFx.playButtonClick();
          setIsOpen(!isOpen);
        }}
        className="flex items-center space-x-1.5 bg-slate-900/90 hover:bg-slate-800 border border-amber-500/40 hover:border-amber-400 text-slate-100 px-2.5 py-1.5 rounded-lg shadow-md transition-all active:scale-95 text-xs font-bold"
        title="Выбор языка / Select Language"
      >
        <span className="text-base leading-none">{currentLangObj.flag}</span>
        {!compact && <span className="hidden sm:inline text-amber-200">{currentLangObj.name}</span>}
        <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <>
          <div 
            className="fixed inset-0 z-40" 
            onClick={() => setIsOpen(false)} 
          />
          <div 
            id="language-dropdown-menu"
            className="absolute right-0 mt-2 w-48 bg-slate-950/95 border border-amber-500/50 rounded-xl shadow-2xl z-50 p-1.5 backdrop-blur-md max-h-72 overflow-y-auto scrollbar-thin scrollbar-thumb-amber-600/40"
          >
            <div className="px-2 py-1 text-[10px] font-bold tracking-wider text-amber-400/80 uppercase border-b border-slate-800 flex items-center space-x-1 mb-1">
              <Globe className="w-3 h-3" />
              <span>Язык / Language</span>
            </div>
            {LANGUAGES.map((item) => {
              const isSelected = item.code === lang;
              return (
                <button
                  key={item.code}
                  id={`lang-btn-${item.code}`}
                  onClick={() => handleSelect(item.code)}
                  className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                    isSelected 
                      ? 'bg-amber-500/20 text-amber-300 font-bold border border-amber-500/30' 
                      : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                  }`}
                >
                  <span className="flex items-center space-x-2">
                    <span className="text-sm">{item.flag}</span>
                    <span>{item.name}</span>
                  </span>
                  {isSelected && <Check className="w-3.5 h-3.5 text-amber-400" />}
                </button>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
};

import React from 'react';
import { useLanguage } from '../context/LanguageContext';

const LanguageSwitcher: React.FC = () => {
  const { language, setLanguage } = useLanguage();

  return (
    <div className="flex items-center space-x-2">
      {language === 'bg' ? (
        // Show English option when current language is Bulgarian
        <button
          onClick={() => setLanguage('en')}
          className="flex items-center space-x-2 px-4 py-2 rounded-xl bg-white hover:bg-gray-50 border border-gray-200 shadow-sm transition-all duration-300 transform hover:scale-105 hover:shadow-md"
          title="Switch to English"
        >
          <div className="w-6 h-4 rounded-sm overflow-hidden shadow-sm">
            <div className="w-full h-full bg-gradient-to-b from-blue-600 via-blue-600 to-blue-600 relative">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-600 via-white to-red-500 opacity-80"></div>
              <div className="absolute inset-0 bg-gradient-to-r from-blue-600 via-transparent to-transparent w-1/3"></div>
              <div className="absolute inset-0 bg-gradient-to-l from-red-500 via-transparent to-transparent w-1/3 right-0"></div>
              <div className="absolute inset-0 bg-white opacity-60"></div>
              <div className="absolute top-0 left-0 w-1/2 h-1/2 bg-blue-600"></div>
              <div className="absolute top-0 right-0 w-1/2 h-1/2 bg-blue-600"></div>
              <div className="absolute bottom-0 left-0 w-1/2 h-1/2 bg-red-500"></div>
              <div className="absolute bottom-0 right-0 w-1/2 h-1/2 bg-red-500"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-full h-0.5 bg-white"></div>
              </div>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-0.5 h-full bg-white"></div>
              </div>
            </div>
          </div>
          <span className="text-sm font-semibold text-gray-700">EN</span>
        </button>
      ) : (
        // Show Bulgarian option when current language is English
        <button
          onClick={() => setLanguage('bg')}
          className="flex items-center space-x-2 px-4 py-2 rounded-xl bg-white hover:bg-gray-50 border border-gray-200 shadow-sm transition-all duration-300 transform hover:scale-105 hover:shadow-md"
          title="Превключи на български"
        >
          <div className="w-6 h-4 rounded-sm overflow-hidden shadow-sm">
            <div className="w-full h-full bg-gradient-to-b from-white via-green-500 to-red-500">
              <div className="w-full h-1/3 bg-white"></div>
              <div className="w-full h-1/3 bg-green-500"></div>
              <div className="w-full h-1/3 bg-red-500"></div>
            </div>
          </div>
          <span className="text-sm font-semibold text-gray-700">БГ</span>
        </button>
      )}
    </div>
  );
};

export default LanguageSwitcher;
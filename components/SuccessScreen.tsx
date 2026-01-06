import React from 'react';
import { Check, Star } from 'lucide-react';

interface SuccessScreenProps {
  onRestart: () => void;
}

const SuccessScreen: React.FC<SuccessScreenProps> = ({ onRestart }) => {
  return (
    <div className="fixed inset-0 z-50 bg-pink-50 flex flex-col items-center justify-center p-4 overflow-hidden animate-in fade-in duration-1000">
      
      {/* Floating particles background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
         {[...Array(20)].map((_, i) => (
            <div 
                key={i} 
                className="absolute text-pink-300 animate-bounce"
                style={{
                    left: `${Math.random() * 100}%`,
                    top: `${Math.random() * 100}%`,
                    animationDelay: `${Math.random() * 2}s`,
                    animationDuration: `${3 + Math.random() * 2}s`
                }}
            >
                <Star size={20 + Math.random() * 30} fill="currentColor" />
            </div>
         ))}
      </div>

      <div className="bg-white p-10 rounded-[3rem] shadow-2xl text-center max-w-lg w-full z-10 border-4 border-pink-200">
        <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6 text-green-500 shadow-inner">
            <Check size={48} strokeWidth={4} />
        </div>
        
        <h1 className="text-4xl font-bold text-pink-600 mb-2">Bravo!</h1>
        <h2 className="text-xl text-gray-600 mb-6">Master Stylist Status Achieved</h2>
        
        <p className="text-gray-500 mb-8">
            You kept your cool and delivered the perfect cuts. 
            The salon is safe... for now.
        </p>

        <button 
            onClick={onRestart}
            className="w-full py-4 bg-pink-500 hover:bg-pink-600 text-white rounded-2xl font-bold text-lg shadow-lg hover:shadow-xl transition-all hover:-translate-y-1"
        >
            Play Again
        </button>
      </div>
    </div>
  );
};

export default SuccessScreen;
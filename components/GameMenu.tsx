"use client";

import { createContext, useContext, useState, ReactNode } from "react";
import GameModeCards from "./GameModeCards";
import GameInfoContent from "./GameInfoContent";
import FooterLinks from "./FooterLinks";
import PrivacyPolicyModal from "./PrivacyPolicyModal";
import TermsModal from "./TermsModal";
import ResponsiveAd from "./ResponsiveAd";

// Context for modal state management
interface GameModalsContextType {
  showPrivacyPolicy: boolean;
  showTerms: boolean;
  openPrivacy: () => void;
  openTerms: () => void;
  closePrivacy: () => void;
  closeTerms: () => void;
}

const GameModalsContext = createContext<GameModalsContextType | undefined>(undefined);

export function useGameModals() {
  const context = useContext(GameModalsContext);
  if (!context) {
    throw new Error('useGameModals must be used within GameModalsProvider');
  }
  return context;
}

// Client Component - 菜单页面（整合所有菜单内容）
export function GameModalsProvider({ children }: { children: ReactNode }) {
  const [showPrivacyPolicy, setShowPrivacyPolicy] = useState(false);
  const [showTerms, setShowTerms] = useState(false);

  const value: GameModalsContextType = {
    showPrivacyPolicy,
    showTerms,
    openPrivacy: () => setShowPrivacyPolicy(true),
    openTerms: () => setShowTerms(true),
    closePrivacy: () => setShowPrivacyPolicy(false),
    closeTerms: () => setShowTerms(false),
  };

  return (
    <GameModalsContext.Provider value={value}>
      {children}
      <PrivacyPolicyModal 
        isOpen={showPrivacyPolicy} 
        onClose={() => setShowPrivacyPolicy(false)} 
      />
      <TermsModal 
        isOpen={showTerms} 
        onClose={() => setShowTerms(false)} 
      />
    </GameModalsContext.Provider>
  );
}

// Server Component wrapper - 菜单页面内容（静态内容在 SSR 中）
export default function GameMenu() {
  return (
    <GameModalsProvider>
      <div className="flex-1 w-full h-full overflow-y-auto p-5 no-scrollbar animate-fadeIn bg-gradient-to-b from-[#f5f7fa] to-white md:bg-white md:rounded-xl" data-game-container>
        {/* Responsive Ad - Above Game Mode Cards */}
        <ResponsiveAd 
          adSlot="9052578028" 
          className="mb-6 h-[100px] md:h-[200px]" 
        />
        
        {/* Game Mode Cards */}
        <GameModeCards />

        {/* Game Information */}
        <GameInfoContent />

        {/* Footer Links */}
        <FooterLinks />
      </div>
    </GameModalsProvider>
  );
}


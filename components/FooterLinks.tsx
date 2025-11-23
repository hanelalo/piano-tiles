"use client";

import { useGameModals } from "./GameMenu";

// Client Component - 底部链接（需要点击事件）
export default function FooterLinks() {
  const { openTerms, openPrivacy } = useGameModals();

  return (
    <div className="mt-6 pt-6 border-t border-gray-300 pb-4">
      <div className="flex justify-center items-center gap-4 text-xs">
        <button
          onClick={openTerms}
          className="text-gray-600 hover:text-gray-800 underline transition-colors"
        >
          Terms of Service
        </button>
        <span className="text-gray-400">|</span>
        <button
          onClick={openPrivacy}
          className="text-gray-600 hover:text-gray-800 underline transition-colors"
        >
          Privacy Policy
        </button>
      </div>
    </div>
  );
}


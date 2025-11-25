"use client";

import { useGameModals } from "./GameMenu";

// Client Component - 底部链接（需要点击事件）
export default function FooterLinks() {
  const { openTerms, openPrivacy } = useGameModals();

  return (
    <div className="mt-6 pt-6 border-t border-gray-300 pb-4">
      <div className="flex flex-col items-center gap-3">
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
        <div className="flex justify-center items-center gap-4 text-xs">
          <a
            href="https://github.com/hanelalo/piano-tiles"
            target="_blank"
            rel="noopener noreferrer"
            className="text-gray-600 hover:text-gray-800 underline transition-colors"
          >
            GitHub
          </a>
          <span className="text-gray-400">|</span>
          <a
            href="https://link.zhihu.com/?target=https%3A%2F%2Fpianotilesgames.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-gray-600 hover:text-gray-800 underline transition-colors"
          >
            知乎
          </a>
        </div>
      </div>
    </div>
  );
}


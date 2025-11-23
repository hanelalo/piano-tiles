"use client";

export default function PrivacyPolicyButton() {
  const handleClick = () => {
    const event = new CustomEvent('openPrivacyPolicy');
    window.dispatchEvent(event);
  };

  return (
    <div className="absolute bottom-0 left-0 right-0 bg-black/60 backdrop-blur-sm border-t border-white/10 p-2 z-50">
      <button
        onClick={handleClick}
        className="text-white/80 hover:text-white text-xs underline transition-colors mx-auto block"
      >
        Privacy Policy
      </button>
    </div>
  );
}


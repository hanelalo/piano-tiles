"use client";

// Client Component - 隐私政策弹窗
export default function PrivacyPolicyModal({ 
  isOpen, 
  onClose 
}: { 
  isOpen: boolean; 
  onClose: () => void;
}) {
  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[100] flex items-center justify-center p-4 animate-fadeIn"
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto animate-popIn"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sticky top-0 bg-white border-b border-gray-200 p-4 flex justify-between items-center z-10">
          <h2 className="text-xl font-bold text-gray-800">🔒 Privacy Policy</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl font-bold leading-none w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 transition-colors"
          >
            ×
          </button>
        </div>
        
        <div className="p-6 space-y-4 text-sm text-gray-600">
          <div>
            <h3 className="font-semibold text-gray-800 mb-2">Data Collection</h3>
            <p className="leading-relaxed">
              This Piano Tiles game operates entirely in your browser. 
              We only store your game high scores locally on your device using browser localStorage. 
              No personal information is collected, transmitted, or stored on our servers.
            </p>
          </div>

          <div>
            <h3 className="font-semibold text-gray-800 mb-2">Local Storage</h3>
            <p className="leading-relaxed">
              Your best scores for each game mode are saved locally in your browser&apos;s localStorage. 
              This data remains on your device and is never shared with third parties. 
              You can clear this data at any time by clearing your browser&apos;s cache.
            </p>
          </div>

          <div>
            <h3 className="font-semibold text-gray-800 mb-2">No Tracking</h3>
            <p className="leading-relaxed">
              We do not use cookies, analytics, or any tracking technologies. 
              Your gameplay is private and not monitored.
            </p>
          </div>

          <div>
            <h3 className="font-semibold text-gray-800 mb-2">Third-Party Services</h3>
            <p className="leading-relaxed">
              This game may display advertisements that are served by third-party ad networks. 
              These networks may collect information according to their own privacy policies. 
              We are not responsible for the privacy practices of these third parties.
            </p>
          </div>

          <div>
            <h3 className="font-semibold text-gray-800 mb-2">Children&apos;s Privacy</h3>
            <p className="leading-relaxed">
              This game is suitable for all ages. 
              We do not knowingly collect personal information from children. 
              All game data remains local to your device.
            </p>
          </div>

          <div>
            <h3 className="font-semibold text-gray-800 mb-2">Changes to Privacy Policy</h3>
            <p className="leading-relaxed">
              We may update this privacy policy from time to time. 
              Any changes will be posted on this page with an updated revision date.
            </p>
          </div>

          <div className="pt-4 border-t border-gray-200 text-xs text-gray-500">
            <p>Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
          </div>

          <div className="pt-4">
            <button
              onClick={onClose}
              className="w-full bg-primary hover:brightness-110 text-white px-6 py-3 rounded-lg font-bold shadow-lg transition"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}


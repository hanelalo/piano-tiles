"use client";

// Client Component - 服务条款弹窗
export default function TermsModal({ 
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
          <h2 className="text-xl font-bold text-gray-800">📋 Terms of Service</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl font-bold leading-none w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 transition-colors"
          >
            ×
          </button>
        </div>
        
        <div className="p-6 space-y-4 text-sm text-gray-600">
          <div>
            <h3 className="font-semibold text-gray-800 mb-2">Acceptance of Terms</h3>
            <p className="leading-relaxed">
              By accessing and using this Piano Tiles game website, you accept and agree to be bound by the terms and provision of this agreement. 
              If you do not agree to abide by the above, please do not use this service.
            </p>
          </div>

          <div>
            <h3 className="font-semibold text-gray-800 mb-2">Use License</h3>
            <p className="leading-relaxed">
              Permission is granted to temporarily access and play this game for personal, non-commercial use only. 
              This is the grant of a license, not a transfer of title, and under this license you may not:
            </p>
            <ul className="list-disc list-inside space-y-1 ml-2 mt-2">
              <li>Modify or copy the game materials</li>
              <li>Use the game for any commercial purpose</li>
              <li>Attempt to decompile or reverse engineer any software</li>
              <li>Remove any copyright or other proprietary notations</li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-gray-800 mb-2">Disclaimer</h3>
            <p className="leading-relaxed">
              The materials on this website are provided on an &apos;as is&apos; basis. 
              We make no warranties, expressed or implied, and hereby disclaim and negate all other warranties including, 
              without limitation, implied warranties or conditions of merchantability, fitness for a particular purpose, 
              or non-infringement of intellectual property or other violation of rights.
            </p>
          </div>

          <div>
            <h3 className="font-semibold text-gray-800 mb-2">Limitations</h3>
            <p className="leading-relaxed">
              In no event shall we or our suppliers be liable for any damages (including, without limitation, damages for loss of data or profit, 
              or due to business interruption) arising out of the use or inability to use the materials on this website, 
              even if we or an authorized representative has been notified orally or in writing of the possibility of such damage.
            </p>
          </div>

          <div>
            <h3 className="font-semibold text-gray-800 mb-2">Accuracy of Materials</h3>
            <p className="leading-relaxed">
              The materials appearing on this website could include technical, typographical, or photographic errors. 
              We do not warrant that any of the materials on its website are accurate, complete, or current.
            </p>
          </div>

          <div>
            <h3 className="font-semibold text-gray-800 mb-2">Modifications</h3>
            <p className="leading-relaxed">
              We may revise these terms of service at any time without notice. 
              By using this website you are agreeing to be bound by the then current version of these terms of service.
            </p>
          </div>

          <div>
            <h3 className="font-semibold text-gray-800 mb-2">Governing Law</h3>
            <p className="leading-relaxed">
              These terms and conditions are governed by and construed in accordance with applicable laws. 
              Any disputes relating to these terms and conditions shall be subject to the exclusive jurisdiction of the courts.
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


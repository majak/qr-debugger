import React, { useState } from 'react';
import { Scan, Github, QrCode } from 'lucide-react';
import CameraScanner from './components/CameraScanner';
import ImageUploader from './components/ImageUploader';
import Results from './components/Results';

function App() {
  const [isScanning, setIsScanning] = useState(false);
  const [result, setResult] = useState(null);

  const handleScan = (data) => {
    setResult(data);
    setIsScanning(false);
  };

  const handleReset = () => {
    setResult(null);
    setIsScanning(false);
  };

  return (
    <div className="min-h-screen bg-black text-white font-sans selection:bg-blue-500 selection:text-white">
      {/* Background Gradients */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-600/20 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-600/20 rounded-full blur-[120px]" />
      </div>

      <div className="relative z-10 max-w-md mx-auto min-h-screen flex flex-col p-6">

        {/* Header */}
        <header className="flex items-center justify-between py-6 mb-8">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg">
              <QrCode size={24} className="text-white" />
            </div>
            <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">
              QR Debugger
            </h1>
          </div>
          <a href="#" className="text-gray-500 hover:text-white transition-colors">
            <Github size={20} />
          </a>
        </header>

        {/* Main Content */}
        <main className="flex-1 flex flex-col justify-center gap-6 mb-12">
          <div className="text-center mb-8">
            <h2 className="text-4xl font-bold mb-4 tracking-tight">
              Decode & <br />
              <span className="text-blue-500">Analyze</span>
            </h2>
            <p className="text-gray-400 text-lg leading-relaxed">
              Get detailed technical specifications of any QR code, including version, mask pattern, and error correction level.
            </p>
          </div>

          <div className="space-y-4">
            <button
              onClick={() => setIsScanning(true)}
              className="w-full group relative overflow-hidden bg-white text-black p-4 rounded-xl font-bold text-lg transition-transform active:scale-95"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-purple-400 opacity-0 group-hover:opacity-20 transition-opacity" />
              <div className="flex items-center justify-center gap-3">
                <Scan size={24} />
                <span>Scan with Camera</span>
              </div>
            </button>

            <ImageUploader onScan={handleScan} />
          </div>
        </main>

        {/* Footer */}
        <footer className="text-center text-gray-600 text-sm py-6">
          <p>Built with React & jsQR</p>
        </footer>
      </div>

      {/* Overlays */}
      {isScanning && (
        <CameraScanner
          onScan={handleScan}
          onClose={() => setIsScanning(false)}
        />
      )}

      {result && (
        <Results
          result={result}
          onReset={handleReset}
        />
      )}
    </div>
  );
}

export default App;

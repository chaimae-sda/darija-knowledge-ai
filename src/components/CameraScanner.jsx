import React, { useRef, useEffect, useState } from 'react';
import { Camera, X, Zap, AlertCircle, HelpCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const CameraScanner = ({ onCapture, onClose }) => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [stream, setStream] = useState(null);
  const [errorType, setErrorType] = useState(null); // 'NotAllowedError', 'NotFoundError', 'Other'
  const [showHelp, setShowHelp] = useState(false);

  useEffect(() => {
    startCamera();
    return () => stopCamera();
  }, []);

  const startCamera = async () => {
    try {
      setErrorType(null);
      // Ensure any previous tracks are stopped
      stopCamera();

      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { 
          facingMode: 'environment', 
          width: { ideal: 1280 },
          height: { ideal: 720 }
        },
        audio: false
      });
      
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (err) {
      console.error('Camera Access Error:', err);
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        setErrorType('NotAllowedError');
      } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
        setErrorType('NotFoundError');
      } else {
        setErrorType('Other');
      }
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
  };

  const handleCapture = () => {
    if (!videoRef.current || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const video = videoRef.current;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    
    canvas.toBlob((blob) => {
      onCapture(blob);
    }, 'image/jpeg', 0.95);
  };

  return (
    <div className="camera-overlay fade-in">
      <header className="camera-header">
         <button className="close-btn" onClick={onClose}><X size={26} /></button>
         <div className="status-pill">
            <div className="dot"></div>
            <span>IA Scanning</span>
         </div>
         <button className="help-btn" onClick={() => setShowHelp(!showHelp)}><HelpCircle size={22} /></button>
      </header>

      <div className="video-viewport">
         {errorType ? (
           <div className="camera-error-view card">
              <AlertCircle size={48} color="#ef4444" />
              <h3>Caméra bloquée</h3>
              <p>
                {errorType === 'NotAllowedError' 
                  ? "L'accès à la caméra a été refusé par votre navigateur." 
                  : "Aucune caméra n'a été trouvée sur votre appareil."}
              </p>
              <div className="help-steps">
                 <p>1. Cliquez sur l'icône 🔒 à gauche de l'URL.</p>
                 <p>2. Activez l'option "Caméra".</p>
                 <p>3. Actualisez la page.</p>
              </div>
              <button className="btn-premium btn-primary retry-btn" onClick={startCamera}>Réessayer</button>
           </div>
         ) : (
           <>
             <video 
               ref={videoRef} 
               autoPlay 
               playsInline 
               muted
               className="scanner-video-feed" 
             />
             
             <div className="scanning-frame">
                <div className="bracket tl"></div>
                <div className="bracket tr"></div>
                <div className="bracket bl"></div>
                <div className="bracket br"></div>

                <motion.div 
                  className="laser-bar"
                  animate={{ top: ['5%', '95%', '5%'] }}
                  transition={{ duration: 2.5, repeat: Infinity, ease: "linear" }}
                />
             </div>
           </>
         )}
      </div>

      {!errorType && (
        <div className="camera-footer">
           <button className="capture-trigger" onClick={handleCapture}>
              <div className="cap-ring"></div>
              <Camera size={30} />
           </button>
        </div>
      )}

      {showHelp && (
        <div className="help-overlay-sheet" onClick={() => setShowHelp(false)}>
           <div className="help-sheet card" onClick={e => e.stopPropagation()}>
              <h4>Guide du Scanner</h4>
              <ul>
                 <li>Maintenez le livre bien à plat.</li>
                 <li>Assurez-vous d'avoir une bonne lumière.</li>
                 <li>Cadrez le texte dans les coins bleus.</li>
              </ul>
              <button className="close-sheet-btn" onClick={() => setShowHelp(false)}>Compris</button>
           </div>
        </div>
      )}

      <canvas ref={canvasRef} style={{ display: 'none' }} />

      <style jsx>{`
        .camera-overlay { position: fixed; inset: 0; background: #000; z-index: 6000; display: flex; flex-direction: column; overflow: hidden; }
        .camera-header { display: flex; justify-content: space-between; align-items: center; padding: 25px 20px; z-index: 10; background: linear-gradient(rgba(0,0,0,0.6), transparent); }
        .status-pill { background: rgba(255,255,255,0.15); backdrop-filter: blur(8px); padding: 6px 16px; border-radius: 99px; display: flex; align-items: center; gap: 8px; font-weight: 800; font-size: 13px; color: white; }
        .dot { width: 8px; height: 8px; background: #10b981; border-radius: 50%; box-shadow: 0 0 10px #10b981; }
        
        .video-viewport { flex: 1; position: relative; background: #000; display: flex; align-items: center; justify-content: center; }
        .scanner-video-feed { width: 100%; height: 100%; object-fit: cover; }
        
        .scanning-frame { position: absolute; inset: 100px 40px 140px; border: 1px solid rgba(255,255,255,0.1); pointer-events: none; }
        .bracket { position: absolute; width: 35px; height: 35px; border: 5px solid var(--primary, #6c63ff); }
        .tl { top: 0; left: 0; border-right: none; border-bottom: none; border-radius: 12px 0 0 0; }
        .tr { top: 0; right: 0; border-left: none; border-bottom: none; border-radius: 0 12px 0 0; }
        .bl { bottom: 0; left: 0; border-right: none; border-top: none; border-radius: 0 0 0 12px; }
        .br { bottom: 0; right: 0; border-left: none; border-top: none; border-radius: 0 0 12px 0; }
        
        .laser-bar { position: absolute; left: 0; width: 100%; height: 3px; background: #6c63ff; box-shadow: 0 0 15px #6c63ff; }
        
        .camera-error-view { padding: 40px 30px; margin: 0 20px; text-align: center; background: white; border-radius: 30px; }
        .camera-error-view h3 { margin: 20px 0 10px; font-size: 20px; font-weight: 800; }
        .camera-error-view p { color: #64748b; font-weight: 600; font-size: 14px; margin-bottom: 25px; }
        .help-steps { text-align: left; background: #f8fafc; padding: 16px; border-radius: 12px; margin-bottom: 25px; }
        .help-steps p { font-size: 13px; margin-bottom: 8px; color: #475569; }
        .help-steps p:last-child { margin-bottom: 0; }
        .retry-btn { font-size: 15px; }

        .camera-footer { position: absolute; bottom: 0; width: 100%; padding: 40px 20px 60px; display: flex; justify-content: center; background: linear-gradient(transparent, rgba(0,0,0,0.6)); }
        .capture-trigger { width: 85px; height: 85px; border-radius: 50%; background: white; border: 6px solid rgba(255,255,255,0.3); display: flex; align-items: center; justify-content: center; transition: transform 0.1s; cursor: pointer; position: relative; }
        .capture-trigger:active { transform: scale(0.9); }
        .cap-ring { position: absolute; inset: -10px; border: 2px solid white; border-radius: 50%; animation: pulse-r 2s infinite; opacity: 0; }
        @keyframes pulse-r { 0% { opacity: 0.5; transform: scale(0.8); } 100% { opacity: 0; transform: scale(1.3); } }

        .help-overlay-sheet { position: absolute; inset: 0; background: rgba(0,0,0,0.5); backdrop-filter: blur(4px); display: flex; align-items: flex-end; z-index: 100; }
        .help-sheet { width: 100%; padding: 30px 20px; border-radius: 30px 30px 0 0; text-align: left; }
        .help-sheet h4 { font-size: 18px; font-weight: 800; margin-bottom: 20px; }
        .help-sheet ul { list-style: none; padding: 0; }
        .help-sheet li { margin-bottom: 12px; padding-left: 28px; position: relative; font-weight: 600; color: #475569; }
        .help-sheet li::before { content: '✅'; position: absolute; left: 0; }
        .close-sheet-btn { width: 100%; margin-top: 20px; padding: 15px; border: none; background: #f1f5f9; border-radius: 12px; font-weight: 800; color: #1e293b; cursor: pointer; }

        .close-btn, .help-btn { background: none; border: none; color: white; cursor: pointer; }
      `}</style>
    </div>
  );
};

export default CameraScanner;

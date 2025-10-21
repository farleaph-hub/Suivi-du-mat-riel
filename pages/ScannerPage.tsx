// Fix: Added missing 'useEffect' import from React.
import React, { useState, useRef, useCallback, useEffect } from 'react';
import { User, Materiel } from '../types';
import { getSupabase } from '../services/supabaseClient';
import { QrCodeIcon } from '../components/icons/QrCodeIcon';

interface ScannerPageProps {
  user: User;
}

const ScannerPage: React.FC<ScannerPageProps> = ({ user }) => {
  const [scannedMateriel, setScannedMateriel] = useState<Materiel | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const jsqrModule = useRef<any>(null);

  const [scannerLoading, setScannerLoading] = useState(false);

  useEffect(() => {
    // Dynamically import jsqr to prevent app load failure
    const loadScanner = async () => {
        setScannerLoading(true);
        try {
            const module = await import('jsqr');
            jsqrModule.current = module.default;
        } catch (error) {
            console.error("Failed to load QR scanner module:", error);
            setMessage({ type: 'error', text: "Le module du scanner n'a pas pu être chargé."});
        } finally {
            setScannerLoading(false);
        }
    };
    loadScanner();
  }, []);

  const supabase = getSupabase();

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
    setIsScanning(false);
  };
  
  const handleQrCode = useCallback(async (code: string) => {
      setLoading(true);
      setScannedMateriel(null);
      setMessage(null);
      stopCamera();

      const { data, error } = await supabase
        .from('materiel')
        .select('*')
        .eq('qr_code_url', code.trim())
        .single();

      if (error || !data) {
        setMessage({ type: 'error', text: 'Aucun matériel trouvé pour ce QR code.' });
      } else {
        setScannedMateriel(data as Materiel);
      }
      setLoading(false);

  }, [supabase]);


  const tick = useCallback(() => {
    if (videoRef.current && videoRef.current.readyState === videoRef.current.HAVE_ENOUGH_DATA && canvasRef.current && jsqrModule.current) {
        const canvas = canvasRef.current;
        const video = videoRef.current;
        const context = canvas.getContext('2d');

        if(context){
            canvas.height = video.videoHeight;
            canvas.width = video.videoWidth;
            context.drawImage(video, 0, 0, canvas.width, canvas.height);
            const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
            const code = jsqrModule.current(imageData.data, imageData.width, imageData.height, {
                inversionAttempts: "dontInvert",
            });

            if (code) {
                handleQrCode(code.data);
            }
        }
    }
    if (isScanning) {
        requestAnimationFrame(tick);
    }
  }, [isScanning, handleQrCode]);

  const startCamera = async () => {
    if (!jsqrModule.current) {
        setMessage({ type: 'error', text: "Le scanner n'est pas prêt."});
        return;
    }
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } });
            if (videoRef.current) {
                videoRef.current.srcObject = stream;
                setIsScanning(true);
                requestAnimationFrame(tick);
            }
        } catch (error) {
            console.error("Camera error:", error);
            setMessage({ type: 'error', text: "Impossible d'accéder à la caméra." });
        }
    }
  };
  
  const handleAction = async (action: 'emprunter' | 'retourner') => {
    if (!scannedMateriel) return;
    setLoading(true);
    
    let updateData: Partial<Materiel> = {};

    try {
      if (action === 'emprunter') {
          if (scannedMateriel.statut !== 'disponible') {
              throw new Error('Ce matériel n\'est pas disponible.');
          }
          
          const { data: employeData, error: employeError } = await supabase
              .from('employes')
              .select('id, nom')
              .eq('nom', user.name)
              .single();

          if (employeError || !employeData) {
              throw new Error(`L'employé "${user.name}" est introuvable. Ajoutez-le via la page "Qui est où ?".`);
          }

          updateData = {
              statut: 'emprunté',
              dernierEmprunteur: employeData.nom,
              employe_id: employeData.id
          };

      } else { // retourner
          if (scannedMateriel.statut !== 'emprunté') {
               throw new Error('Ce matériel n\'est pas actuellement emprunté.');
          }
          updateData = {
              statut: 'disponible',
              employe_id: null
          };
      }

      const { data, error } = await supabase
          .from('materiel')
          .update(updateData)
          .eq('id', scannedMateriel.id)
          .select()
          .single();
      
      if (error) throw error;
      
      setScannedMateriel(data as Materiel);
      setMessage({ type: 'success', text: `Matériel ${action === 'emprunter' ? 'emprunté' : 'retourné'} avec succès.`});

    } catch(error: any) {
        let errorMessage = error.message;
        if(error.message.includes('violates row-level security policy')) {
            errorMessage += "\nCAUSE PROBABLE: Problème de permissions (RLS) dans Supabase."
        }
        setMessage({ type: 'error', text: errorMessage });
    } finally {
        setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto">
        <canvas ref={canvasRef} hidden />
      <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
        <h2 className="text-xl font-bold text-white mb-4">Scanner un QR Code</h2>
        
        {isScanning ? (
            <div>
                 <video ref={videoRef} playsInline autoPlay className="w-full rounded-md" />
                 <button onClick={stopCamera} className="w-full mt-4 px-4 py-2 bg-red-600 text-white font-semibold rounded-md hover:bg-red-500">
                    Arrêter la caméra
                </button>
            </div>
        ) : (
             <button onClick={startCamera} disabled={scannerLoading || !jsqrModule.current} className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-cyan-600 text-black font-semibold rounded-md hover:bg-cyan-500 disabled:opacity-50">
                {scannerLoading ? 'Chargement du scanner...' : (
                    <>
                        <QrCodeIcon className="w-6 h-6" />
                        Activer la caméra
                    </>
                )}
            </button>
        )}
      </div>

      {loading && <p className="text-center mt-4">Recherche...</p>}
      
      {message && (
          <div className={`mt-4 p-4 rounded-md text-center ${message.type === 'success' ? 'bg-green-500/20 text-green-300' : 'bg-red-500/20 text-red-300'}`}>
              <p className="whitespace-pre-wrap">{message.text}</p>
          </div>
      )}

      {scannedMateriel && (
        <div className="mt-6 bg-gray-800 p-6 rounded-lg border border-gray-700">
          <h3 className="text-lg font-bold">{scannedMateriel.nom}</h3>
          <p className="capitalize text-gray-400">Statut: {scannedMateriel.statut}</p>
          {scannedMateriel.statut === 'emprunté' && (
              <p className="text-gray-400">Emprunté par: {scannedMateriel.dernierEmprunteur}</p>
          )}

          <div className="mt-4 flex gap-4">
            <button
                onClick={() => handleAction('emprunter')}
                disabled={loading || scannedMateriel.statut !== 'disponible'}
                className="flex-1 px-4 py-2 bg-blue-600 text-white font-semibold rounded-md hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
                Emprunter
            </button>
            <button
                onClick={() => handleAction('retourner')}
                disabled={loading || scannedMateriel.statut !== 'emprunté'}
                className="flex-1 px-4 py-2 bg-orange-600 text-white font-semibold rounded-md hover:bg-orange-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
                Retourner
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ScannerPage;
import React, { useEffect, useRef, useState } from 'react';
import { processQR } from '../utils/qrProcessor';
import { Camera, X } from 'lucide-react';

const CameraScanner = ({ onScan, onClose }) => {
    const videoRef = useRef(null);
    const canvasRef = useRef(null);
    const [error, setError] = useState('');

    useEffect(() => {
        let stream = null;
        let animationFrameId = null;

        const startCamera = async () => {
            try {
                stream = await navigator.mediaDevices.getUserMedia({
                    video: { facingMode: 'environment' }
                });
                if (videoRef.current) {
                    videoRef.current.srcObject = stream;
                    videoRef.current.setAttribute('playsinline', true); // required to tell iOS safari we don't want fullscreen
                    videoRef.current.play();
                    requestAnimationFrame(tick);
                }
            } catch (err) {
                console.error("Error accessing camera:", err);
                setError('Could not access camera. Please ensure you have granted permission.');
            }
        };

        const tick = () => {
            if (videoRef.current && videoRef.current.readyState === videoRef.current.HAVE_ENOUGH_DATA) {
                const video = videoRef.current;
                const canvas = canvasRef.current;

                if (canvas) {
                    canvas.height = video.videoHeight;
                    canvas.width = video.videoWidth;
                    const ctx = canvas.getContext('2d');
                    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

                    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
                    const result = processQR(imageData.data, canvas.width, canvas.height);

                    if (result) {
                        // Draw bounding box
                        ctx.lineWidth = 4;
                        ctx.strokeStyle = '#FF3B58';
                        ctx.beginPath();
                        ctx.moveTo(result.location.topLeftCorner.x, result.location.topLeftCorner.y);
                        ctx.lineTo(result.location.topRightCorner.x, result.location.topRightCorner.y);
                        ctx.lineTo(result.location.bottomRightCorner.x, result.location.bottomRightCorner.y);
                        ctx.lineTo(result.location.bottomLeftCorner.x, result.location.bottomLeftCorner.y);
                        ctx.lineTo(result.location.topLeftCorner.x, result.location.topLeftCorner.y);
                        ctx.stroke();

                        onScan(result);
                    }
                }
            }
            animationFrameId = requestAnimationFrame(tick);
        };

        startCamera();

        return () => {
            if (stream) {
                stream.getTracks().forEach(track => track.stop());
            }
            if (animationFrameId) {
                cancelAnimationFrame(animationFrameId);
            }
        };
    }, [onScan]);

    return (
        <div className="fixed inset-0 bg-black z-50 flex flex-col">
            <div className="absolute top-4 right-4 z-10">
                <button onClick={onClose} className="p-2 bg-white/20 backdrop-blur-md rounded-full text-white">
                    <X size={24} />
                </button>
            </div>

            {error && (
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-white text-center p-4">
                    <p className="text-red-400 mb-2">{error}</p>
                    <button onClick={onClose} className="bg-white text-black px-4 py-2 rounded">Close</button>
                </div>
            )}

            <video ref={videoRef} className="hidden" />
            <canvas ref={canvasRef} className="w-full h-full object-cover" />

            <div className="absolute bottom-8 left-0 right-0 text-center text-white/70 text-sm">
                Point camera at a QR code
            </div>
        </div>
    );
};

export default CameraScanner;

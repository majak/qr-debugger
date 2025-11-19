import React, { useRef } from 'react';
import { processQR } from '../utils/qrProcessor';
import { Upload, Image as ImageIcon } from 'lucide-react';

const ImageUploader = ({ onScan }) => {
    const fileInputRef = useRef(null);

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
            const img = new Image();
            img.onload = async () => {
                const canvas = document.createElement('canvas');
                canvas.width = img.width;
                canvas.height = img.height;
                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0);
                const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
                const result = await processQR(imageData.data, canvas.width, canvas.height);

                if (result) {
                    onScan(result);
                } else {
                    alert('No QR code found in image.');
                }
            };
            img.src = event.target.result;
        };
        reader.readAsDataURL(file);
    };

    return (
        <div className="w-full">
            <input
                type="file"
                accept="image/*"
                className="hidden"
                ref={fileInputRef}
                onChange={handleFileChange}
            />
            <button
                onClick={() => fileInputRef.current.click()}
                className="w-full flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 border border-white/20 text-white p-4 rounded-xl transition-all"
            >
                <ImageIcon size={24} />
                <span>Upload Image</span>
            </button>
        </div>
    );
};

export default ImageUploader;

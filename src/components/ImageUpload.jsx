import { useCallback, useState } from 'react';
import useAppStore from '../store/useAppStore';
import { Upload, X } from 'lucide-react';

const ImageUpload = () => {
    const { frames, updateFrameContent } = useAppStore();
    const inputImage = frames[0]?.content?.inputImage;
    const [isDragging, setIsDragging] = useState(false);

    const handleFile = useCallback((file) => {
        if (file && file.type.startsWith('image/')) {
            const reader = new FileReader();
            reader.onload = (e) => {
                updateFrameContent(0, { inputImage: e.target.result });
            };
            reader.readAsDataURL(file);
        }
    }, [updateFrameContent]);

    const onDragOver = (e) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const onDragLeave = (e) => {
        e.preventDefault();
        setIsDragging(false);
    };

    const onDrop = (e) => {
        e.preventDefault();
        setIsDragging(false);
        if (e.dataTransfer.files?.[0]) {
            handleFile(e.dataTransfer.files[0]);
        }
    };

    const handleChange = (e) => {
        if (e.target.files?.[0]) {
            handleFile(e.target.files[0]);
        }
    };

    const clearImage = (e) => {
        e.stopPropagation();
        updateFrameContent(0, { inputImage: null });
    };

    if (inputImage) {
        return (
            <div style={{ width: '100%', height: '100%', position: 'relative', overflow: 'hidden', borderRadius: 'var(--radius-md)' }}>
                <img
                    src={inputImage}
                    alt="Input"
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
                <button
                    onClick={clearImage}
                    style={{
                        position: 'absolute',
                        top: '10px',
                        right: '10px',
                        background: 'rgba(0,0,0,0.6)',
                        borderRadius: '50%',
                        padding: '4px',
                        color: 'white',
                        border: '1px solid rgba(255,255,255,0.2)'
                    }}
                >
                    <X size={14} />
                </button>
            </div>
        );
    }

    return (
        <div
            onDragOver={onDragOver}
            onDragLeave={onDragLeave}
            onDrop={onDrop}
            onClick={() => document.getElementById('file-upload').click()}
            style={{
                width: '100%',
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                border: `2px dashed ${isDragging ? 'var(--accent-primary)' : 'var(--border-glass)'}`,
                borderRadius: 'var(--radius-md)',
                background: isDragging ? 'var(--bg-glass-hover)' : 'transparent',
                transition: 'all 0.3s ease',
                cursor: 'pointer',
                color: isDragging ? 'var(--accent-primary)' : 'var(--text-secondary)',
                padding: '20px',
                textAlign: 'center'
            }}
        >
            <input
                id="file-upload"
                type="file"
                accept="image/*"
                hidden
                onChange={handleChange}
            />
            <Upload size={48} strokeWidth={1} style={{ marginBottom: '16px', opacity: 0.8 }} />
            <p style={{ fontSize: '0.9rem', marginBottom: '8px' }}>
                {isDragging ? 'Drop Image Now' : 'Click or Drag Image'}
            </p>
            <span style={{ fontSize: '0.75rem', opacity: 0.5 }}>
                Supports JPG, PNG, WEBP
            </span>
        </div>
    );
};

export default ImageUpload;

import { useState, useEffect } from 'react';
import useAppStore from '../store/useAppStore';
import { Play, Settings2, Image as ImageIcon } from 'lucide-react';

const ControlBar = () => {
    const {
        aspectRatio, resolution, isAnalyzing, activeFrameCount,
        imageProvider, wavespeedApiKey,
        setAspectRatio, setResolution, setActiveFrameCount, generatePrompts,
        setImageProvider, setWavespeedApiKey
    } = useAppStore();

    const [tempKey, setTempKey] = useState(wavespeedApiKey);

    useEffect(() => {
        setTempKey(wavespeedApiKey);
    }, [wavespeedApiKey]);

    const handleKeySubmit = () => {
        if (tempKey && tempKey.trim() !== '') {
            setWavespeedApiKey(tempKey.trim());
        }
    };

    const handleAnalyze = () => {
        generatePrompts();
    };

    return (
        <div className="control-bar" style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '0 20px',
            marginBottom: '10px'
        }}>
            <div className="left-controls" style={{ display: 'flex', gap: '16px' }}>
                {/* Aspect Ratio Selector */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-secondary)' }}>
                    <Settings2 size={16} />
                    <select
                        value={aspectRatio}
                        onChange={(e) => setAspectRatio(e.target.value)}
                        style={{
                            background: 'var(--bg-glass-hover)',
                            border: '1px solid var(--border-glass)',
                            color: 'var(--text-primary)',
                            padding: '8px 12px',
                            borderRadius: 'var(--radius-sm)',
                            outline: 'none',
                            cursor: 'pointer'
                        }}
                    >
                        <option style={{ background: '#1a1a1a', color: 'white' }} value="16:9">16:9 Landscape</option>
                        <option style={{ background: '#1a1a1a', color: 'white' }} value="9:16">9:16 Portrait</option>
                        <option style={{ background: '#1a1a1a', color: 'white' }} value="1:1">1:1 Square</option>
                        <option style={{ background: '#1a1a1a', color: 'white' }} value="4:3">4:3 Standard</option>
                    </select>
                </div>

                {/* Resolution Selector */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-secondary)' }}>
                    <ImageIcon size={16} />
                    <select
                        value={resolution}
                        onChange={(e) => setResolution(e.target.value)}
                        style={{
                            background: 'var(--bg-glass-hover)',
                            border: '1px solid var(--border-glass)',
                            color: 'var(--text-primary)',
                            padding: '8px 12px',
                            borderRadius: 'var(--radius-sm)',
                            outline: 'none',
                            cursor: 'pointer'
                        }}
                    >
                        <option style={{ background: '#1a1a1a', color: 'white' }} value="2k">2k Resolution</option>
                        <option style={{ background: '#1a1a1a', color: 'white' }} value="4k">4K Ultra</option>
                    </select>
                </div>

                {/* Compare Count Selector */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-secondary)', borderLeft: '1px solid var(--border-glass)', paddingLeft: '16px' }}>
                    <span style={{ fontSize: '0.8rem', fontWeight: 600, letterSpacing: '1px' }}>COMPARE:</span>
                    <div style={{ display: 'flex', background: 'var(--bg-glass-hover)', borderRadius: 'var(--radius-sm)', overflow: 'hidden', border: '1px solid var(--border-glass)' }}>
                        {[1, 2, 3, 4].map(num => (
                            <button
                                key={num}
                                onClick={() => setActiveFrameCount(num)}
                                style={{
                                    padding: '8px 14px',
                                    background: activeFrameCount === num ? 'var(--accent-primary)' : 'transparent',
                                    color: activeFrameCount === num ? 'white' : 'var(--text-secondary)',
                                    border: 'none',
                                    borderRight: num < 4 ? '1px solid var(--border-glass)' : 'none',
                                    cursor: 'pointer',
                                    transition: 'all 0.2s',
                                    fontWeight: 'bold'
                                }}
                            >
                                {num}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Image Provider Selector */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-secondary)', borderLeft: '1px solid var(--border-glass)', paddingLeft: '16px' }}>
                    <span style={{ fontSize: '0.8rem', fontWeight: 600, letterSpacing: '1px' }}>GENERATE:</span>
                    <select
                        value={imageProvider}
                        onChange={(e) => setImageProvider(e.target.value)}
                        style={{
                            background: 'var(--bg-glass-hover)',
                            border: '1px solid var(--border-glass)',
                            color: 'var(--text-primary)',
                            padding: '8px 12px',
                            borderRadius: 'var(--radius-sm)',
                            outline: 'none',
                            cursor: 'pointer',
                            fontWeight: '500'
                        }}
                    >
                        <option style={{ background: '#1a1a1a', color: 'white' }} value="google">Google Gemini</option>
                        <option style={{ background: '#1a1a1a', color: 'white' }} value="wavespeed">Wavespeed</option>
                    </select>
                </div>

                {/* Wavespeed Key Input (Conditional) */}
                {imageProvider === 'wavespeed' && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                            <input
                                type="password"
                                placeholder="Wavespeed API Key"
                                value={tempKey}
                                onChange={(e) => setTempKey(e.target.value)}
                                onBlur={handleKeySubmit}
                                onKeyDown={(e) => (e.key === 'Enter' || e.key === 'Tab') && handleKeySubmit()}
                                style={{
                                    background: 'var(--bg-glass)',
                                    border: wavespeedApiKey && tempKey === wavespeedApiKey ? '1px solid #10b981' : '1px solid var(--border-glass)',
                                    color: wavespeedApiKey && tempKey === wavespeedApiKey ? '#10b981' : 'var(--text-primary)',
                                    padding: '8px 12px',
                                    paddingRight: '32px',
                                    borderRadius: 'var(--radius-sm)',
                                    outline: 'none',
                                    width: '180px',
                                    fontSize: '0.8rem',
                                    transition: 'all 0.2s',
                                    boxShadow: wavespeedApiKey && tempKey === wavespeedApiKey ? '0 0 10px rgba(16, 185, 129, 0.2)' : 'none'
                                }}
                            />
                            {wavespeedApiKey && tempKey === wavespeedApiKey && (
                                <div style={{ position: 'absolute', right: '8px', color: '#10b981', display: 'flex' }}>
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                                        <polyline points="20 6 9 17 4 12"></polyline>
                                    </svg>
                                </div>
                            )}
                        </div>
                        {(!wavespeedApiKey || tempKey !== wavespeedApiKey) && (
                            <button
                                onClick={handleKeySubmit}
                                style={{
                                    background: 'var(--bg-glass-hover)',
                                    border: '1px solid var(--border-glass)',
                                    color: 'var(--text-secondary)',
                                    borderRadius: 'var(--radius-sm)',
                                    padding: '8px 12px',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    fontSize: '0.8rem',
                                    fontWeight: 600
                                }}
                                title="Save Key"
                            >
                                OK
                            </button>
                        )}
                    </div>
                )}
            </div>

            {/* Analyze Button */}
            <button
                onClick={handleAnalyze}
                disabled={isAnalyzing}
                style={{
                    background: isAnalyzing ? 'var(--bg-glass)' : 'linear-gradient(135deg, var(--accent-primary), #a855f7)',
                    padding: '12px 32px',
                    borderRadius: 'var(--radius-md)',
                    color: 'white',
                    fontWeight: 'bold',
                    letterSpacing: '1px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    boxShadow: isAnalyzing ? 'none' : '0 0 20px rgba(79, 70, 229, 0.4)',
                    transition: 'var(--transition-smooth)',
                    opacity: isAnalyzing ? 0.7 : 1
                }}
            >
                <Play size={18} fill="currentColor" />
                {isAnalyzing ? 'ANALYZING...' : 'ANALYZE'}
            </button>
        </div>
    );
};

export default ControlBar;

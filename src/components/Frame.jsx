import { motion } from 'framer-motion';
import { useMemo, useState } from 'react';
import useAppStore from '../store/useAppStore';
import { RefreshCcw, Image as ImageIcon, Type, Trash2, FolderOpen, Save, Copy, Check } from 'lucide-react';
import ImageUpload from './ImageUpload';
import JsonViewer from './JsonViewer';

// Helper to extract a title/role from the prompt text
const getPromptTitle = (text) => {
    if (!text) return 'Gem Result';

    const lines = text.split('\n').slice(0, 5); // Check first 5 lines

    for (const line of lines) {
        // Look for "You are [Role]", "Role: [Role]", "Act as [Role]"
        const match = line.match(/(?:You are|Role:|Act as)\s+(?:an?|the)?\s*([^\.\n,]+)/i);
        if (match && match[1]) {
            return match[1].trim().toUpperCase();
        }
    }

    // Fallback: First non-empty line
    const firstLine = lines.find(l => l.trim().length > 0);
    return firstLine ? firstLine.substring(0, 40) + (firstLine.length > 40 ? '...' : '') : 'Gem Result';
};

const Frame = ({ id }) => {
    const { frames, toggleFrameFlip, toggleInputMode, resetFrame, activeFrameCount, generationMode, setGenerationMode, library, addToLibrary, removeFromLibrary, updateFrameContent } = useAppStore();
    const frame = frames.find(f => f.id === id);
    const [copied, setCopied] = useState(false);

    // Animation Variants
    const variants = {
        front: { rotateY: 0 },
        back: { rotateY: 180 }
    };

    const isInputFrame = id === 0;

    // Disable comparison frames that exceed the active count
    const isDisabled = id !== 0 && id > activeFrameCount;

    const handleSave = () => {
        const type = isInputFrame ? 'prompt' : 'gem';
        const content = isInputFrame ? frame.content.inputText : frame.content.prompt;

        if (!content || content.trim() === '') {
            alert("Nothing to save!");
            return;
        }

        const name = window.prompt("Enter a name for this " + (type === 'prompt' ? "Prompt" : "Gem"));
        if (!name) return;

        addToLibrary({ type, name, content });
    };

    const handleLoad = (itemId) => {
        const item = library.find(i => i.id === itemId);
        if (item) {
            if (isInputFrame) {
                updateFrameContent(id, { inputText: item.content });
            } else {
                updateFrameContent(id, { prompt: item.content });
                if (frame.isFlipped) toggleFrameFlip(id); // Ensure we see the edit side
            }
        }
    };

    const filteredLibrary = library.filter(item => item.type === (isInputFrame ? 'prompt' : 'gem'));

    return (
        <div className="frame-container" style={{
            perspective: '1000px',
            width: '100%',
            height: '100%',
            position: 'relative',
            opacity: isDisabled ? 0.3 : 1,
            pointerEvents: isDisabled ? 'none' : 'auto',
            filter: isDisabled ? 'grayscale(100%)' : 'none',
            transition: 'all 0.5s ease'
        }}>
            <motion.div
                className="frame-inner"
                initial={false}
                animate={frame.isFlipped ? "back" : "front"}
                variants={variants}
                transition={{ duration: 0.6, type: "spring", stiffness: 260, damping: 20 }}
                style={{
                    width: '100%',
                    height: '100%',
                    position: 'relative',
                    transformStyle: 'preserve-3d',
                }}
            >
                {/* FRONT FACE */}
                <div className="frame-face frame-front" style={{
                    position: 'absolute',
                    width: '100%',
                    height: '100%',
                    backfaceVisibility: 'hidden',
                    background: 'var(--bg-glass)',
                    border: '1px solid var(--border-glass)',
                    borderRadius: 'var(--radius-lg)',
                    backdropFilter: 'blur(10px)',
                    display: 'flex',
                    flexDirection: 'column',
                    overflow: 'hidden'
                }}>
                    {/* Header / Controls */}
                    <div className="frame-header" style={{
                        padding: '12px',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        borderBottom: '1px solid var(--border-glass)'
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 600 }}>
                                {isInputFrame ? 'INPUT SOURCE' : `COMPARE ${id}`}
                            </span>

                            {isInputFrame && (
                                <div style={{ display: 'flex', background: 'var(--bg-glass-hover)', borderRadius: '6px', padding: '4px', gap: '2px' }}>
                                    <button
                                        onClick={() => setGenerationMode('prompt')}
                                        style={{
                                            padding: '4px 12px',
                                            fontSize: '0.7rem',
                                            borderRadius: '4px',
                                            border: 'none',
                                            background: generationMode === 'prompt' ? 'var(--accent-primary)' : 'transparent',
                                            color: generationMode === 'prompt' ? 'white' : 'var(--text-secondary)',
                                            fontWeight: '700',
                                            boxShadow: generationMode === 'prompt' ? 'inset 0 2px 4px rgba(0,0,0,0.2)' : 'none',
                                            cursor: 'pointer',
                                            transition: 'all 0.2s'
                                        }}
                                    >
                                        PROMPT
                                    </button>
                                    <button
                                        onClick={() => setGenerationMode('image')}
                                        style={{
                                            padding: '4px 12px',
                                            fontSize: '0.7rem',
                                            borderRadius: '4px',
                                            border: 'none',
                                            background: generationMode === 'image' ? 'var(--accent-primary)' : 'transparent',
                                            color: generationMode === 'image' ? 'white' : 'var(--text-secondary)',
                                            fontWeight: '700',
                                            boxShadow: generationMode === 'image' ? 'inset 0 2px 4px rgba(0,0,0,0.2)' : 'none',
                                            cursor: 'pointer',
                                            transition: 'all 0.2s'
                                        }}
                                    >
                                        IMAGE
                                    </button>
                                </div>
                            )}
                        </div>

                        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                            {/* Library Controls */}
                            {(!isInputFrame || frame.mode === 'text') && (
                                <div style={{ display: 'flex', gap: '4px', alignItems: 'center', borderRight: '1px solid var(--border-glass)', paddingRight: '12px', marginRight: '4px' }}>
                                    <div style={{ position: 'relative', width: '24px', height: '24px' }}>
                                        <select
                                            onChange={(e) => {
                                                handleLoad(e.target.value);
                                                e.target.value = "";
                                            }}
                                            style={{
                                                width: '100%', height: '100%', opacity: 0, position: 'absolute', top: 0, left: 0, cursor: 'pointer', zIndex: 10
                                            }}
                                        >
                                            <option value="" disabled selected>Load</option>
                                            {filteredLibrary.map(item => (
                                                <option key={item.id} value={item.id}>{item.name}</option>
                                            ))}
                                        </select>
                                        <button title="Load Saved" style={{ color: 'var(--text-secondary)', padding: '4px', background: 'transparent', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                            <FolderOpen size={16} />
                                        </button>
                                    </div>

                                    <button onClick={handleSave} title="Save to Library" style={{ color: 'var(--text-secondary)', padding: '4px', background: 'transparent', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                        <Save size={16} />
                                    </button>
                                </div>
                            )}

                            {isInputFrame && (
                                <button onClick={toggleInputMode} title="Toggle Input Mode" style={{ color: 'var(--text-primary)' }}>
                                    {frame.mode === 'image' ? <Type size={16} /> : <ImageIcon size={16} />}
                                </button>
                            )}
                            <button onClick={() => resetFrame(id)} title="Reset Frame" style={{ color: 'var(--text-secondary)' }}>
                                <Trash2 size={16} />
                            </button>
                            <button onClick={() => toggleFrameFlip(id)} title="Flip View" style={{ color: 'var(--accent-primary)' }}>
                                <RefreshCcw size={16} style={{ transform: 'rotate(90deg)' }} />
                            </button>
                        </div>
                    </div>

                    {/* Content Area */}
                    <div className="frame-content" style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px', width: '100%', overflow: 'hidden' }}>
                        {isInputFrame ? (
                            frame.mode === 'image' ? (
                                <ImageUpload />
                            ) : (
                                <textarea
                                    value={frame.content.inputText || ''}
                                    onChange={(e) => useAppStore.getState().updateFrameContent(id, { inputText: e.target.value })}
                                    placeholder="Enter text prompt for analysis..."
                                    style={{
                                        width: '100%',
                                        height: '100%',
                                        background: 'transparent',
                                        border: 'none',
                                        outline: 'none',
                                        color: 'var(--text-primary)',
                                        resize: 'none',
                                        fontSize: '1rem',
                                        fontFamily: 'inherit'
                                    }}
                                />
                            )
                        ) : (
                            <div style={{ textAlign: 'center', color: 'var(--text-secondary)', width: '100%' }}>
                                <p style={{ marginBottom: '10px', fontSize: '0.9rem' }}>Gemini / Prompt Block</p>
                                <textarea
                                    value={frame.content.prompt || ''}
                                    onChange={(e) => useAppStore.getState().updateFrameContent(id, { prompt: e.target.value })}
                                    placeholder="Detailed prompt or Gem ID..."
                                    style={{
                                        width: '100%',
                                        minHeight: '120px',
                                        background: 'rgba(0,0,0,0.2)',
                                        border: '1px solid var(--border-glass)',
                                        borderRadius: 'var(--radius-sm)',
                                        padding: '12px',
                                        color: 'var(--text-secondary)',
                                        resize: 'none',
                                        outline: 'none',
                                        fontFamily: 'inherit'
                                    }}
                                />
                            </div>
                        )}
                    </div>
                </div>

                {/* BACK FACE */}
                <div className="frame-face frame-back" style={{
                    position: 'absolute',
                    width: '100%',
                    height: '100%',
                    backfaceVisibility: 'hidden',
                    transform: 'rotateY(180deg)',
                    background: 'var(--bg-core)',
                    border: '1px solid var(--accent-glow)',
                    borderRadius: 'var(--radius-lg)',
                    display: 'flex',
                    flexDirection: 'column',
                    overflow: 'hidden',
                    boxShadow: '0 0 30px var(--accent-glow)'
                }}>
                    {(frame.status === 'loading' || frame.status === 'loading_image') ? (
                        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-secondary)', flexDirection: 'column', gap: '10px' }}>
                            <div style={{ fontWeight: 500, animation: 'pulse 1.5s infinite' }}>
                                {frame.status === 'loading_image'
                                    ? 'Generating Image...'
                                    : (generationMode === 'image' ? 'Analyzing Image...' : 'Parsing Prompt...')}
                            </div>
                        </div>
                    ) : (frame.content.outputImage && generationMode === 'image') ? (
                        <div style={{ flex: 1, position: 'relative', width: '100%', height: '100%' }}>
                            <img src={frame.content.outputImage} alt="Result" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />

                            {/* Image Controls Overlay */}
                            <div style={{
                                position: 'absolute',
                                bottom: 0,
                                left: 0,
                                width: '100%',
                                padding: '10px',
                                background: 'linear-gradient(to top, rgba(0,0,0,0.9), transparent)',
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center'
                            }}>
                                <button
                                    onClick={() => {
                                        let text = "";
                                        try {
                                            const p = JSON.parse(frame.content.promptJson);
                                            text = p.raw_output || p.prompt || p.image_prompt || frame.content.promptJson;
                                        } catch (e) { text = frame.content.promptJson; }
                                        navigator.clipboard.writeText(text);
                                        setCopied(true);
                                        setTimeout(() => setCopied(false), 2000);
                                    }}
                                    style={{
                                        color: copied ? '#4ade80' : 'white',
                                        background: 'rgba(255,255,255,0.1)',
                                        padding: '6px 10px',
                                        borderRadius: '4px',
                                        fontSize: '0.8rem',
                                        backdropFilter: 'blur(4px)',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '6px',
                                        transition: 'all 0.2s',
                                        border: 'none',
                                        cursor: 'pointer'
                                    }}
                                >
                                    {copied ? <><Check size={14} /> Copied!</> : <><Copy size={14} /> Copy Prompt</>}
                                </button>

                                <button
                                    onClick={() => toggleFrameFlip(id)}
                                    style={{
                                        color: 'var(--accent-primary)',
                                        background: 'rgba(0,0,0,0.6)',
                                        padding: '6px 10px',
                                        borderRadius: '4px',
                                        fontSize: '0.8rem',
                                        fontWeight: 'bold',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '4px'
                                    }}
                                >
                                    <RefreshCcw size={14} /> Flip
                                </button>
                            </div>
                        </div>
                    ) : (frame.content.promptJson ? (
                        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                            <div style={{ flex: 1, overflow: 'hidden' }}>
                                <JsonViewer
                                    jsonString={frame.content.promptJson}
                                    title={getPromptTitle(frame.content.prompt)}
                                />
                            </div>
                            <div style={{ padding: '12px', borderTop: '1px solid var(--border-glass)', display: 'flex', gap: '8px' }}>
                                <button
                                    onClick={() => useAppStore.getState().generateImage(id)}
                                    style={{
                                        flex: 1,
                                        background: 'var(--accent-primary)',
                                        color: 'white',
                                        padding: '10px',
                                        borderRadius: 'var(--radius-sm)',
                                        fontWeight: 'bold'
                                    }}
                                >
                                    {frame.status === 'loading_image' ? 'GENERATING...' : 'GENERATE IMAGE'}
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <p>No Data</p>
                        </div>
                    ))}
                </div>
            </motion.div>
        </div>
    );
};

export default Frame;

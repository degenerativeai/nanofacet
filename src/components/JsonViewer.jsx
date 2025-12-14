import { useState } from 'react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { Copy, Check } from 'lucide-react';
import { flattenJsonToParagraph } from '../utils/promptUtils';

const JsonViewer = ({ jsonString, title }) => {
    const [copied, setCopied] = useState(false); // 'json', 'paragraph', or false

    // Determine content and language
    let displayContent = jsonString;
    let language = "json";

    try {
        const parsed = JSON.parse(jsonString);
        if (parsed && typeof parsed === 'object' && parsed.raw_output) {
            displayContent = parsed.raw_output;
            language = "toml";
        }
    } catch (e) {
        // Fallback to json/text if parse fails
    }

    const handleCopyJson = () => {
        navigator.clipboard.writeText(displayContent);
        setCopied('json');
        setTimeout(() => setCopied(false), 2000);
    };

    const handleCopyParagraph = () => {
        const text = flattenJsonToParagraph(jsonString);
        navigator.clipboard.writeText(text);
        setCopied('paragraph');
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div style={{ position: 'relative', width: '100%', height: '100%', borderRadius: 'inherit', overflow: 'hidden', background: '#1e1e1e' }}>
            {/* Title / Identity */}
            <div style={{
                position: 'absolute',
                top: '12px',
                left: '15px',
                maxWidth: '60%',
                overflow: 'hidden',
                whiteSpace: 'nowrap',
                textOverflow: 'ellipsis',
                color: 'var(--text-secondary)',
                fontSize: '0.75rem',
                fontWeight: '600',
                letterSpacing: '0.5px',
                textTransform: 'uppercase',
                zIndex: 10,
                pointerEvents: 'none'
            }}>
                {title}
            </div>

            <div style={{ position: 'absolute', top: '10px', right: '10px', zIndex: 10, display: 'flex', gap: '8px' }}>
                <button
                    onClick={handleCopyJson}
                    style={{
                        background: 'rgba(255, 255, 255, 0.1)',
                        border: '1px solid rgba(255, 255, 255, 0.2)',
                        borderRadius: '6px',
                        padding: '6px 10px',
                        cursor: 'pointer',
                        color: copied === 'json' ? '#4ade80' : 'var(--text-secondary)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        fontSize: '0.75rem',
                        transition: 'all 0.2s'
                    }}
                >
                    {copied === 'json' ? <><Check size={14} /> Copied!</> : <><span style={{ fontFamily: 'monospace' }}>{`{ }`}</span> JSON</>}
                </button>

                <button
                    onClick={handleCopyParagraph}
                    style={{
                        background: 'rgba(255, 255, 255, 0.1)',
                        border: '1px solid rgba(255, 255, 255, 0.2)',
                        borderRadius: '6px',
                        padding: '6px 10px',
                        cursor: 'pointer',
                        color: copied === 'paragraph' ? '#4ade80' : 'var(--text-secondary)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        fontSize: '0.75rem',
                        transition: 'all 0.2s'
                    }}
                >
                    {copied === 'paragraph' ? <><Check size={14} /> Copied!</> : <><span style={{ fontWeight: 'bold' }}>¶</span> Prompt</>}
                </button>
            </div>

            <div style={{
                height: '100%',
                overflow: 'auto',
                fontSize: '0.85rem',
                paddingTop: '20px' // Space for button
            }}>
                <SyntaxHighlighter
                    language={language}
                    style={vscDarkPlus}
                    customStyle={{ margin: 0, padding: '20px', background: 'transparent', height: '100%' }}
                    wrapLongLines={true}
                >
                    {displayContent}
                </SyntaxHighlighter>
            </div>
        </div>
    );
};

export default JsonViewer;

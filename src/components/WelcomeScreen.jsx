import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import useAppStore from '../store/useAppStore';
import { ArrowRight, Key } from 'lucide-react';

const logo = '/nano-facet-solid.png';

const WelcomeScreen = () => {
    const { setApiKey } = useAppStore();
    const [inputKey, setInputKey] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        if (inputKey.trim().length > 10) {
            setApiKey(inputKey);
        }
    };

    return (
        <div style={{
            position: 'fixed',
            inset: 0,
            zIndex: 100,
            background: '#000000', // Solid black to match logo background
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            // Removed radial-gradient to avoid highlighting the solid logo box
        }}>
            <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 1, type: 'spring' }}
                style={{ marginBottom: '40px', textAlign: 'center' }}
            >
                <div style={{
                    position: 'relative',
                    width: 'auto',
                    maxWidth: '800px',
                    height: 'auto',
                    margin: '0 auto 20px',
                    filter: 'drop-shadow(0 0 60px rgba(79, 70, 229, 0.4))'
                }}>
                    <img src={logo} alt="Nano Facet Logo" style={{ width: '100%', height: 'auto', display: 'block' }} />
                </div>

                <p style={{ color: 'var(--text-secondary)', fontSize: '1.2rem', letterSpacing: '2px' }}>
                    Gem and Prompt Comparison Tool
                </p>
            </motion.div>

            <motion.form
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5, duration: 0.8 }}
                onSubmit={handleSubmit}
                style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '20px',
                    width: '100%',
                    maxWidth: '400px',
                    padding: '0 20px'
                }}
            >
                <div style={{ position: 'relative' }}>
                    <Key size={20} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
                    <input
                        type="password"
                        value={inputKey}
                        onChange={(e) => setInputKey(e.target.value)}
                        placeholder="Enter Google Gemini API Key"
                        style={{
                            width: '100%',
                            padding: '16px 16px 16px 48px',
                            background: 'rgba(255,255,255,0.05)',
                            border: '1px solid var(--border-glass)',
                            borderRadius: 'var(--radius-md)',
                            color: 'white',
                            fontSize: '1rem',
                            outline: 'none',
                            transition: 'all 0.3s'
                        }}
                        onFocus={(e) => e.target.style.borderColor = 'var(--accent-primary)'}
                        onBlur={(e) => e.target.style.borderColor = 'var(--border-glass)'}
                    />
                </div>

                <button
                    type="submit"
                    disabled={inputKey.length < 10}
                    style={{
                        background: inputKey.length < 10 ? 'var(--bg-glass)' : 'linear-gradient(135deg, var(--accent-primary), #9333ea)',
                        color: 'white',
                        padding: '16px',
                        borderRadius: 'var(--radius-md)',
                        fontSize: '1.1rem',
                        fontWeight: 'bold',
                        letterSpacing: '1px',
                        cursor: inputKey.length < 10 ? 'not-allowed' : 'pointer',
                        opacity: inputKey.length < 10 ? 0.5 : 1,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '10px',
                        boxShadow: inputKey.length < 10 ? 'none' : '0 0 30px rgba(79, 70, 229, 0.5)',
                        transition: 'all 0.3s'
                    }}
                >
                    ENTER SYSTEM <ArrowRight size={20} />
                </button>

                <p style={{ textAlign: 'center', color: 'var(--text-secondary)', fontSize: '0.8rem', opacity: 0.6 }}>
                    Keys are stored locally only.
                </p>
            </motion.form>
        </div>
    );
};

export default WelcomeScreen;

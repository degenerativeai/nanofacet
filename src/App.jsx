import { useState } from 'react'
import { LogOut } from 'lucide-react'
import Frame from './components/Frame'
import ControlBar from './components/ControlBar'
import WelcomeScreen from './components/WelcomeScreen'
import useAppStore from './store/useAppStore'

function App() {
  const { apiKey, setApiKey } = useAppStore();

  if (!apiKey) {
    return <WelcomeScreen />;
  }

  return (
    <div className="layout-container" style={{
      width: '100vw',
      height: '100vh',
      display: 'flex',
      flexDirection: 'column',
      padding: '24px',
      gap: '24px'
    }}>
      <header style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        padding: '20px',
        color: 'var(--text-secondary)',
        fontSize: '0.9rem',
        textTransform: 'uppercase',
        letterSpacing: '2px',
        opacity: 0.7,
        marginBottom: '10px',
        position: 'relative'
      }}>
        <img src="/nano-facet-text.png" alt="NANO FACET" style={{ height: '30px', opacity: 0.9 }} />

        <button
          onClick={() => setApiKey(null)}
          title="Reset API Key"
          style={{
            position: 'absolute',
            right: '20px',
            top: '50%',
            transform: 'translateY(-50%)',
            background: 'rgba(255, 255, 255, 0.05)',
            border: '1px solid var(--border-glass)',
            color: 'var(--text-secondary)',
            cursor: 'pointer',
            padding: '8px 16px',
            borderRadius: '6px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            fontSize: '0.75rem',
            fontWeight: '700',
            letterSpacing: '1px',
            transition: 'all 0.2s ease',
            textTransform: 'uppercase'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = 'var(--accent-primary)';
            e.currentTarget.style.color = 'white';
            e.currentTarget.style.background = 'var(--accent-primary)';
            e.currentTarget.style.boxShadow = '0 0 15px var(--accent-glow)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = 'var(--border-glass)';
            e.currentTarget.style.color = 'var(--text-secondary)';
            e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
            e.currentTarget.style.boxShadow = 'none';
          }}
        >
          <LogOut size={14} /> RESET KEY
        </button>
      </header>

      <ControlBar />

      <main style={{
        flex: 1,
        display: 'grid',
        gridTemplateColumns: 'repeat(5, 1fr)',
        gap: '20px',
        height: '100%',
        paddingBottom: '20px'
      }}>
        {/* Frames */}
        {[0, 1, 2, 3, 4].map((id) => (
          <Frame key={id} id={id} />
        ))}
      </main>
    </div>
  )
}

export default App

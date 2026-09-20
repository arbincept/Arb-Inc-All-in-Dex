'use client';

import { useState, useEffect } from 'react';

// Definiamo i tipi per le checkbox per far stare zitto TypeScript
type CheckKeys = 'risk' | 'jurisdiction' | 'sanctions' | 'terms';

interface ChecksState {
  risk: boolean;
  jurisdiction: boolean;
  sanctions: boolean;
  terms: boolean;
}

export default function EEADisclaimer() {
  const [visible, setVisible] = useState(false);
  const [checks, setChecks] = useState<ChecksState>({ 
    risk: false, 
    jurisdiction: false, 
    sanctions: false, 
    terms: false 
  });

  useEffect(() => {
    const accepted = localStorage.getItem('tos_selfcert_v2');
    if (!accepted) setVisible(true);
  }, []);

  if (!visible) return null;

  const allChecked = Object.values(checks).every(Boolean);

  const accept = () => {
    if (!allChecked) return;
    localStorage.setItem('tos_selfcert_v2', Date.now().toString());
    setVisible(false);
  };

  // Qui usiamo il tipo corretto CheckKeys
  const toggle = (key: CheckKeys) => setChecks(prev => ({ ...prev, [key]: !prev[key] }));

  // Definiamo l'array con il tipo esplicito
  const items: { key: CheckKeys; label: React.ReactNode }[] = [
    { key:'risk', label:<><strong style={{color:'#f3ba2f'}}>I understand the risks.</strong> Crypto-assets and blockchain transactions can be highly volatile and I may lose all capital. Any protocol metrics are informational only and are not guaranteed returns, payout rates or claim quotes.</> },
    { key:'jurisdiction', label:<><strong style={{color:'#f3ba2f'}}>I confirm my jurisdiction.</strong> I will check whether this interface and token are available and lawful where I live. I will not use the interface where applicable law prohibits it or requires authorization that is not available.</> },
    { key:'sanctions', label:<><strong style={{color:'#f3ba2f'}}>I am not subject to sanctions.</strong> I represent that I am not subject to economic or trade sanctions by any governmental authority, and am not on any prohibited-parties list (including the OFAC SDN List).</> },
    { key:'terms', label:<><strong style={{color:'#f3ba2f'}}>I have read the Terms of Service.</strong> I agree to the <a href="/terms-of-service" target="_blank" rel="noopener noreferrer" style={{color:'#a855f7'}}>Terms of Service</a> and <a href="/privacy-policy" target="_blank" rel="noopener noreferrer" style={{color:'#a855f7'}}>Privacy Policy</a>. This interface is MIT-licensed open-source software with no warranties.</> },
  ];

  return (
    <div style={{ position:'fixed',inset:0,zIndex:9999,background:'rgba(3,0,20,0.92)',display:'flex',alignItems:'center',justifyContent:'center',padding:'20px' }}>
      <div style={{ background:'linear-gradient(135deg,#0f0a2e,#1a0a3e)',border:'1px solid rgba(168,85,247,0.4)',borderRadius:'16px',maxWidth:'560px',width:'100%',maxHeight:'90vh',overflowY:'auto',padding:'32px 28px',color:'#e2e8f0' }}>
        <div style={{ fontSize:'28px',marginBottom:'8px',textAlign:'center' }}>⚠️</div>
        <h2 style={{ color:'#a855f7',fontSize:'1.3rem',textAlign:'center',marginBottom:'20px' }}>Terms of Service & Risk Acknowledgment</h2>
        <p style={{ color:'#94a3b8',fontSize:'0.9rem',marginBottom:'24px',lineHeight:'1.7' }}>
          Before accessing this interface, confirm each item below. By proceeding, you make legally binding representations.
        </p>
        
        {items.map(({ key, label }) => (
          <label key={key} style={{ display:'flex',gap:'14px',alignItems:'flex-start',marginBottom:'18px',cursor:'pointer' }}>
            <input 
              type="checkbox" 
              checked={checks[key]} 
              onChange={() => toggle(key)} 
              style={{ width:'18px',height:'18px',marginTop:'2px',accentColor:'#a855f7',flexShrink:0 }} 
            />
            <span style={{ color:'#e2e8f0',fontSize:'0.88rem',lineHeight:'1.6' }}>{label}</span>
          </label>
        ))}

        <button 
          onClick={accept} 
          disabled={!allChecked} 
          style={{ width:'100%',padding:'14px',borderRadius:'12px',border:'none',background:allChecked?'linear-gradient(135deg,#7c3aed,#a855f7)':'rgba(100,100,120,0.3)',color:allChecked?'#ffffff':'#666',fontSize:'1rem',fontWeight:'700',cursor:allChecked?'pointer':'not-allowed',transition:'all 0.2s' }}
        >
          {allChecked ? 'I Confirm — Enter Application' : 'Please confirm all items above'}
        </button>
        <p style={{ textAlign:'center',color:'#475569',fontSize:'0.75rem',marginTop:'16px' }}>Stored locally in your browser only.</p>
      </div>
    </div>
  );
}

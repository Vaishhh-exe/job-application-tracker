/**
 * API Token Management Component
 * Add this to your settings page until the database migration runs
 */

import { useState } from 'react'

export function ApiTokenManager() {
  const [token, setToken] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  
  const generateToken = async () => {
    setLoading(true)
    try {
      // For now, generate a simple token client-side
      const randomToken = `mrd_${Array.from(crypto.getRandomValues(new Uint8Array(32)))
        .map(b => b.toString(16).padStart(2, '0')).join('')}`
      
      // Store in localStorage until DB is ready
      localStorage.setItem('meridian_api_token', randomToken)
      setToken(randomToken)
      
      alert(`Temporary API Token (copy this now):\n\n${randomToken}\n\nThis will work until the database migration completes.`)
    } catch (error) {
      alert('Error generating token: ' + error)
    } finally {
      setLoading(false)
    }
  }
  
  const copyToken = () => {
    if (token) {
      navigator.clipboard.writeText(token)
      alert('Token copied to clipboard!')
    }
  }
  
  return (
    <div className="api-token-section">
      <h3>Chrome Extension API Token</h3>
      <p>Generate a token for the Meridian Chrome Extension:</p>
      
      {token ? (
        <div style={{marginTop: '10px'}}>
          <input 
            type="text" 
            value={token} 
            readOnly 
            style={{
              fontFamily: 'monospace', 
              width: '100%',
              padding: '8px',
              marginBottom: '10px'
            }}
          />
          <button onClick={copyToken} style={{marginRight: '10px'}}>
            📋 Copy Token
          </button>
          <button onClick={() => setToken(null)}>
            ❌ Clear
          </button>
        </div>
      ) : (
        <button onClick={generateToken} disabled={loading}>
          {loading ? 'Generating...' : '🔑 Generate API Token'}
        </button>
      )}
      
      <p style={{fontSize: '12px', color: '#666', marginTop: '10px'}}>
        Note: This is a temporary solution while the database migration completes.
      </p>
    </div>
  )
}
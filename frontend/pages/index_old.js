import React, { useState, useEffect } from 'react'
import axios from 'axios'

export default function Home() {
    const [raw, setRaw] = useState('')
    const [result, setResult] = useState(null)
    const [token, setToken] = useState('')
    const [loading, setLoading] = useState(false)
    const [showAuth, setShowAuth] = useState(false)
    const [username, setUsername] = useState('')
    const [password, setPassword] = useState('')

    useEffect(() => {
        const t = localStorage.getItem('eg_token') || ''
        setToken(t)
    }, [])

    async function submit() {
        if (!token) {
            alert('Please log in first')
            setShowAuth(true)
            return
        }
        setLoading(true)
        try {
            const headers = { Authorization: `Bearer ${token}` }
            const r = await axios.post('http://localhost:8000/analyze', { raw }, { headers })
            setResult(r.data)
        } catch (err) {
            console.error(err)
            const detail = err?.response?.data?.detail || err.message
            alert('Error: ' + detail)
        } finally {
            setLoading(false)
        }
    }

    async function login() {
        try {
            const r = await axios.post('http://localhost:8000/auth/token', { username, password })
            const t = r.data.access_token
            setToken(t)
            localStorage.setItem('eg_token', t)
            setShowAuth(false)
            alert('Logged in successfully!')
        } catch (err) {
            alert('Login failed: ' + (err?.response?.data?.detail || err.message))
        }
    }

    async function register() {
        try {
            const r = await axios.post('http://localhost:8000/auth/register', { username, password })
            const t = r.data.access_token
            setToken(t)
            localStorage.setItem('eg_token', t)
            setShowAuth(false)
            alert('Registered successfully!')
        } catch (err) {
            alert('Registration failed: ' + (err?.response?.data?.detail || err.message))
        }
    }

    function logout() {
        localStorage.removeItem('eg_token')
        setToken('')
        setResult(null)
    }

    const getRiskColor = (score) => {
        // score is 0.0 to 1.0
        if (score >= 0.7) return '#ef4444'
        if (score >= 0.4) return '#f59e0b'
        return '#10b981'
    }

    const getRiskLabel = (classification) => {
        const labels = {
            'Phishing': { text: '🚨 Phishing', color: '#ef4444' },
            'Suspicious': { text: '⚠️ Suspicious', color: '#f59e0b' },
            'Safe': { text: '✅ Safe', color: '#10b981' }
        }
        return labels[classification] || { text: classification, color: '#6b7280' }
    }

    const ScoreCard = ({ title, score, emoji }) => (
        <div style={{
            background: 'white',
            borderRadius: '12px',
            padding: '1.5rem',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
            border: '2px solid #e5e7eb'
        }}>
            <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>{emoji}</div>
            <div style={{ fontSize: '0.9rem', color: '#6b7280', marginBottom: '0.5rem' }}>{title}</div>
            <div style={{
                fontSize: '2rem',
                fontWeight: '700',
                color: getRiskColor(score)
            }}>
                {(score * 100).toFixed(0)}%
            </div>
        </div>
    )

    return (
        <div style={{
            minHeight: '100vh',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            padding: '2rem',
            fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
        }}>
            <div style={{
                maxWidth: '1200px',
                margin: '0 auto'
            }}>
                {/* Header */}
                <div style={{
                    background: 'rgba(255, 255, 255, 0.95)',
                    borderRadius: '20px',
                    padding: '2rem',
                    marginBottom: '2rem',
                    boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                }}>
                    <div>
                        <h1 style={{
                            margin: 0,
                            fontSize: '2.5rem',
                            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                            fontWeight: '800'
                        }}>
                            🛡️ Email Guard
                        </h1>
                        <p style={{ margin: '0.5rem 0 0 0', color: '#6b7280', fontSize: '1.1rem' }}>
                            AI-Powered Email Security - 10 Step Analysis
                        </p>
                    </div>
                    {token ? (
                        <button onClick={logout} style={{
                            padding: '0.75rem 1.5rem',
                            background: '#ef4444',
                            color: 'white',
                            border: 'none',
                            borderRadius: '10px',
                            cursor: 'pointer',
                            fontSize: '1rem',
                            fontWeight: '600',
                            transition: 'all 0.3s'
                        }}>
                            Logout
                        </button>
                    ) : (
                        <button onClick={() => setShowAuth(!showAuth)} style={{
                            padding: '0.75rem 1.5rem',
                            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                            color: 'white',
                            border: 'none',
                            borderRadius: '10px',
                            cursor: 'pointer',
                            fontSize: '1rem',
                            fontWeight: '600',
                            transition: 'all 0.3s'
                        }}>
                            Login / Register
                        </button>
                    )}
                </div>

                {/* Auth Panel */}
                {showAuth && !token && (
                    <div style={{
                        background: 'rgba(255, 255, 255, 0.95)',
                        borderRadius: '20px',
                        padding: '2rem',
                        marginBottom: '2rem',
                        boxShadow: '0 20px 60px rgba(0,0,0,0.3)'
                    }}>
                        <h2 style={{ marginTop: 0, color: '#1f2937' }}>Login or Register</h2>
                        <div style={{ marginBottom: '1rem' }}>
                            <input
                                type="text"
                                placeholder="Username"
                                value={username}
                                onChange={e => setUsername(e.target.value)}
                                style={{
                                    width: '100%',
                                    padding: '0.75rem',
                                    borderRadius: '10px',
                                    border: '2px solid #e5e7eb',
                                    fontSize: '1rem',
                                    marginBottom: '0.5rem'
                                }}
                            />
                            <input
                                type="password"
                                placeholder="Password"
                                value={password}
                                onChange={e => setPassword(e.target.value)}
                                style={{
                                    width: '100%',
                                    padding: '0.75rem',
                                    borderRadius: '10px',
                                    border: '2px solid #e5e7eb',
                                    fontSize: '1rem'
                                }}
                            />
                        </div>
                        <div style={{ display: 'flex', gap: '1rem' }}>
                            <button onClick={login} style={{
                                flex: 1,
                                padding: '0.75rem',
                                background: '#10b981',
                                color: 'white',
                                border: 'none',
                                borderRadius: '10px',
                                cursor: 'pointer',
                                fontSize: '1rem',
                                fontWeight: '600'
                            }}>
                                Login
                            </button>
                            <button onClick={register} style={{
                                flex: 1,
                                padding: '0.75rem',
                                background: '#3b82f6',
                                color: 'white',
                                border: 'none',
                                borderRadius: '10px',
                                cursor: 'pointer',
                                fontSize: '1rem',
                                fontWeight: '600'
                            }}>
                                Register
                            </button>
                        </div>
                    </div>
                )}

                {/* Main Panel */}
                <div style={{
                    background: 'rgba(255, 255, 255, 0.95)',
                    borderRadius: '20px',
                    padding: '2rem',
                    boxShadow: '0 20px 60px rgba(0,0,0,0.3)'
                }}>
                    <h2 style={{ marginTop: 0, color: '#1f2937', fontSize: '1.5rem' }}>
                        📧 Paste Email Content
                    </h2>
                    <textarea
                        value={raw}
                        onChange={(e) => setRaw(e.target.value)}
                        placeholder="Paste raw email here (headers + body)..."
                        style={{
                            width: '100%',
                            minHeight: '200px',
                            padding: '1rem',
                            borderRadius: '10px',
                            border: '2px solid #e5e7eb',
                            fontSize: '0.95rem',
                            fontFamily: 'monospace',
                            resize: 'vertical',
                            marginBottom: '1rem'
                        }}
                    />
                    <button
                        onClick={submit}
                        disabled={loading || !raw.trim()}
                        style={{
                            width: '100%',
                            padding: '1rem',
                            background: loading ? '#9ca3af' : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                            color: 'white',
                            border: 'none',
                            borderRadius: '10px',
                            cursor: loading ? 'not-allowed' : 'pointer',
                            fontSize: '1.1rem',
                            fontWeight: '700',
                            transition: 'all 0.3s',
                            textTransform: 'uppercase',
                            letterSpacing: '1px'
                        }}
                    >
                        {loading ? '🔍 Analyzing...' : '🚀 Analyze Email'}
                    </button>
                </div>

                {/* Results Panel */}
                {result && (
                    <div style={{
                        background: 'rgba(255, 255, 255, 0.95)',
                        borderRadius: '20px',
                        padding: '2rem',
                        marginTop: '2rem',
                        boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
                        animation: 'slideIn 0.5s ease-out'
                    }}>
                        <h2 style={{ marginTop: 0, color: '#1f2937', fontSize: '1.8rem' }}>
                            📊 Analysis Results
                        </h2>

                        {/* Final Risk Score Card */}
                        <div style={{
                            background: `linear-gradient(135deg, ${getRiskColor(result.final_score)}22 0%, ${getRiskColor(result.final_score)}44 100%)`,
                            borderRadius: '15px',
                            padding: '1.5rem',
                            marginBottom: '1.5rem',
                            border: `3px solid ${getRiskColor(result.final_score)}`
                        }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <div>
                                    <div style={{
                                        fontSize: '3rem',
                                        fontWeight: '800',
                                        color: getRiskColor(result.final_score)
                                    }}>
                                        {(result.final_score * 100).toFixed(0)}/100
                                    </div>
                                    <div style={{
                                        fontSize: '1.5rem',
                                        fontWeight: '700',
                                        color: getRiskLabel(result.classification).color
                                    }}>
                                        {getRiskLabel(result.classification).text}
                                    </div>
                                </div>
                                <div style={{
                                    width: '120px',
                                    height: '120px',
                                    borderRadius: '50%',
                                    background: `conic-gradient(${getRiskColor(result.final_score)} ${result.final_score * 360}deg, #e5e7eb 0deg)`,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    position: 'relative'
                                }}>
                                    <div style={{
                                        width: '90px',
                                        height: '90px',
                                        borderRadius: '50%',
                                        background: 'white',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        fontSize: '2rem'
                                    }}>
                                        {result.final_score >= 0.7 ? '🚨' : result.final_score >= 0.4 ? '⚠️' : '✅'}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Individual Scores Grid */}
                        <h3 style={{ color: '#1f2937', marginBottom: '1rem' }}>📈 Detailed Scores</h3>
                        <div style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                            gap: '1rem',
                            marginBottom: '1.5rem'
                        }}>
                            <ScoreCard title="Authentication" score={result.auth_score} emoji="🔐" />
                            <ScoreCard title="Content Analysis" score={result.content_score} emoji="📝" />
                            <ScoreCard title="URL Inspection" score={result.url_score} emoji="🔗" />
                            <ScoreCard title="Sender Behavior" score={result.behavior_score} emoji="👤" />
                            <ScoreCard title="Sentiment" score={result.sentiment_score} emoji="💭" />
                        </div>

                        {/* Authentication Details */}
                        <div style={{
                            background: '#f3f4f6',
                            borderRadius: '10px',
                            padding: '1rem',
                            marginBottom: '1rem'
                        }}>
                            <strong style={{ color: '#1f2937' }}>🔐 Authentication Checks:</strong>
                            <div style={{ marginTop: '0.5rem', fontSize: '0.95rem' }}>
                                <div>SPF: <span style={{ fontWeight: '600', color: result.spf_result === 'pass' ? '#10b981' : '#ef4444' }}>{result.spf_result}</span></div>
                                <div>DKIM: <span style={{ fontWeight: '600', color: result.dkim_result === 'pass' ? '#10b981' : '#ef4444' }}>{result.dkim_result}</span></div>
                                <div>DMARC: <span style={{ fontWeight: '600', color: result.dmarc_result === 'pass' ? '#10b981' : '#ef4444' }}>{result.dmarc_result}</span></div>
                            </div>
                        </div>

                        {/* Content Flags */}
                        <div style={{
                            background: '#fef3c7',
                            borderRadius: '10px',
                            padding: '1rem',
                            marginBottom: '1rem'
                        }}>
                            <strong style={{ color: '#1f2937' }}>📝 Content Flags:</strong>
                            <div style={{ marginTop: '0.5rem', fontSize: '0.95rem' }}>
                                <div>Urgency: {result.urgency_detected ? '❌ Yes' : '✅ No'}</div>
                                <div>Credential Request: {result.credential_request ? '❌ Yes' : '✅ No'}</div>
                                <div>Brand Misuse: {result.brand_misuse ? '❌ Yes' : '✅ No'}</div>
                                <div>Pressure Tone: {result.pressure_tone ? '❌ Yes' : '✅ No'}</div>
                            </div>
                        </div>

                        {/* URL Details */}
                        {result.urls_found && result.urls_found.length > 0 && (
                            <div style={{
                                background: '#fee2e2',
                                borderRadius: '10px',
                                padding: '1rem',
                                marginBottom: '1rem'
                            }}>
                                <strong style={{ color: '#1f2937' }}>🔗 URLs Found: {result.urls_found.length}</strong>
                                <div style={{ marginTop: '0.5rem', fontSize: '0.85rem' }}>
                                    Suspicious URLs: <span style={{ fontWeight: '700', color: '#ef4444' }}>{result.suspicious_urls}</span>
                                </div>
                                <div style={{ marginTop: '0.5rem', maxHeight: '100px', overflow: 'auto', fontSize: '0.8rem', fontFamily: 'monospace' }}>
                                    {result.urls_found.slice(0, 5).map((url, i) => <div key={i}>{url}</div>)}
                                    {result.urls_found.length > 5 && <div>... and {result.urls_found.length - 5} more</div>}
                                </div>
                            </div>
                        )}

                        {/* Actions Taken */}
                        {result.actions_taken && result.actions_taken.length > 0 && (
                            <div style={{
                                background: result.quarantined ? '#fee2e2' : '#d1fae5',
                                borderRadius: '10px',
                                padding: '1rem',
                                marginBottom: '1rem',
                                borderLeft: `4px solid ${result.quarantined ? '#ef4444' : '#10b981'}`
                            }}>
                                <strong style={{ color: '#1f2937' }}>⚡ Actions Taken:</strong>
                                <ul style={{ margin: '0.5rem 0 0 0', paddingLeft: '1.5rem' }}>
                                    {result.actions_taken.map((action, i) => (
                                        <li key={i} style={{ marginBottom: '0.25rem' }}>{action}</li>
                                    ))}
                                </ul>
                            </div>
                        )}
                    </div>
                )}
            </div>

            <style jsx>{`
                @keyframes slideIn {
                    from {
                        opacity: 0;
                        transform: translateY(20px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }
                button:hover:not(:disabled) {
                    transform: translateY(-2px);
                    box-shadow: 0 10px 20px rgba(0,0,0,0.2);
                }
                input:focus, textarea:focus {
                    outline: none;
                    border-color: #667eea;
                    box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
                }
            `}</style>
        </div>
    )
}

async function login() {
    try {
        const r = await axios.post('http://localhost:8000/auth/token', { username, password })
        const t = r.data.access_token
        setToken(t)
        localStorage.setItem('eg_token', t)
        setShowAuth(false)
        alert('Logged in successfully!')
    } catch (err) {
        alert('Login failed: ' + (err?.response?.data?.detail || err.message))
    }
}

async function register() {
    try {
        const r = await axios.post('http://localhost:8000/auth/register', { username, password })
        const t = r.data.access_token
        setToken(t)
        localStorage.setItem('eg_token', t)
        setShowAuth(false)
        alert('Registered successfully!')
    } catch (err) {
        alert('Registration failed: ' + (err?.response?.data?.detail || err.message))
    }
}

function logout() {
    localStorage.removeItem('eg_token')
    setToken('')
    setResult(null)
}

const getRiskColor = (score) => {
    if (score >= 70) return '#ef4444'
    if (score >= 30) return '#f59e0b'
    return '#10b981'
}

const getRiskLabel = (classification) => {
    const labels = {
        malicious: { text: '🚨 Malicious', color: '#ef4444' },
        suspicious: { text: '⚠️ Suspicious', color: '#f59e0b' },
        safe: { text: '✅ Safe', color: '#10b981' }
    }
    return labels[classification] || { text: classification, color: '#6b7280' }
}

return (
    <div style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        padding: '2rem',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
    }}>
        <div style={{
            maxWidth: '1200px',
            margin: '0 auto'
        }}>
            {/* Header */}
            <div style={{
                background: 'rgba(255, 255, 255, 0.95)',
                borderRadius: '20px',
                padding: '2rem',
                marginBottom: '2rem',
                boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
            }}>
                <div>
                    <h1 style={{
                        margin: 0,
                        fontSize: '2.5rem',
                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        fontWeight: '800'
                    }}>
                        🛡️ Email Guard
                    </h1>
                    <p style={{ margin: '0.5rem 0 0 0', color: '#6b7280', fontSize: '1.1rem' }}>
                        AI-Powered Email Threat Detection
                    </p>
                </div>
                {token ? (
                    <button onClick={logout} style={{
                        padding: '0.75rem 1.5rem',
                        background: '#ef4444',
                        color: 'white',
                        border: 'none',
                        borderRadius: '10px',
                        cursor: 'pointer',
                        fontSize: '1rem',
                        fontWeight: '600',
                        transition: 'all 0.3s'
                    }}>
                        Logout
                    </button>
                ) : (
                    <button onClick={() => setShowAuth(!showAuth)} style={{
                        padding: '0.75rem 1.5rem',
                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        color: 'white',
                        border: 'none',
                        borderRadius: '10px',
                        cursor: 'pointer',
                        fontSize: '1rem',
                        fontWeight: '600',
                        transition: 'all 0.3s'
                    }}>
                        Login / Register
                    </button>
                )}
            </div>

            {/* Auth Panel */}
            {showAuth && !token && (
                <div style={{
                    background: 'rgba(255, 255, 255, 0.95)',
                    borderRadius: '20px',
                    padding: '2rem',
                    marginBottom: '2rem',
                    boxShadow: '0 20px 60px rgba(0,0,0,0.3)'
                }}>
                    <h2 style={{ marginTop: 0, color: '#1f2937' }}>Login or Register</h2>
                    <div style={{ marginBottom: '1rem' }}>
                        <input
                            type="text"
                            placeholder="Username"
                            value={username}
                            onChange={e => setUsername(e.target.value)}
                            style={{
                                width: '100%',
                                padding: '0.75rem',
                                borderRadius: '10px',
                                border: '2px solid #e5e7eb',
                                fontSize: '1rem',
                                marginBottom: '0.5rem'
                            }}
                        />
                        <input
                            type="password"
                            placeholder="Password"
                            value={password}
                            onChange={e => setPassword(e.target.value)}
                            style={{
                                width: '100%',
                                padding: '0.75rem',
                                borderRadius: '10px',
                                border: '2px solid #e5e7eb',
                                fontSize: '1rem'
                            }}
                        />
                    </div>
                    <div style={{ display: 'flex', gap: '1rem' }}>
                        <button onClick={login} style={{
                            flex: 1,
                            padding: '0.75rem',
                            background: '#10b981',
                            color: 'white',
                            border: 'none',
                            borderRadius: '10px',
                            cursor: 'pointer',
                            fontSize: '1rem',
                            fontWeight: '600'
                        }}>
                            Login
                        </button>
                        <button onClick={register} style={{
                            flex: 1,
                            padding: '0.75rem',
                            background: '#3b82f6',
                            color: 'white',
                            border: 'none',
                            borderRadius: '10px',
                            cursor: 'pointer',
                            fontSize: '1rem',
                            fontWeight: '600'
                        }}>
                            Register
                        </button>
                    </div>
                </div>
            )}

            {/* Main Panel */}
            <div style={{
                background: 'rgba(255, 255, 255, 0.95)',
                borderRadius: '20px',
                padding: '2rem',
                boxShadow: '0 20px 60px rgba(0,0,0,0.3)'
            }}>
                <h2 style={{ marginTop: 0, color: '#1f2937', fontSize: '1.5rem' }}>
                    📧 Paste Email Content
                </h2>
                <textarea
                    value={raw}
                    onChange={(e) => setRaw(e.target.value)}
                    placeholder="Paste raw email here (headers + body)..."
                    style={{
                        width: '100%',
                        minHeight: '200px',
                        padding: '1rem',
                        borderRadius: '10px',
                        border: '2px solid #e5e7eb',
                        fontSize: '0.95rem',
                        fontFamily: 'monospace',
                        resize: 'vertical',
                        marginBottom: '1rem'
                    }}
                />
                <button
                    onClick={submit}
                    disabled={loading || !raw.trim()}
                    style={{
                        width: '100%',
                        padding: '1rem',
                        background: loading ? '#9ca3af' : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        color: 'white',
                        border: 'none',
                        borderRadius: '10px',
                        cursor: loading ? 'not-allowed' : 'pointer',
                        fontSize: '1.1rem',
                        fontWeight: '700',
                        transition: 'all 0.3s',
                        textTransform: 'uppercase',
                        letterSpacing: '1px'
                    }}
                >
                    {loading ? '🔍 Analyzing...' : '🚀 Analyze Email'}
                </button>
            </div>

            {/* Results Panel */}
            {result && (
                <div style={{
                    background: 'rgba(255, 255, 255, 0.95)',
                    borderRadius: '20px',
                    padding: '2rem',
                    marginTop: '2rem',
                    boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
                    animation: 'slideIn 0.5s ease-out'
                }}>
                    <h2 style={{ marginTop: 0, color: '#1f2937', fontSize: '1.8rem' }}>
                        📊 Analysis Results
                    </h2>

                    {/* Risk Score Card */}
                    <div style={{
                        background: `linear-gradient(135deg, ${getRiskColor(result.risk_score)}22 0%, ${getRiskColor(result.risk_score)}44 100%)`,
                        borderRadius: '15px',
                        padding: '1.5rem',
                        marginBottom: '1.5rem',
                        border: `3px solid ${getRiskColor(result.risk_score)}`
                    }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div>
                                <div style={{
                                    fontSize: '3rem',
                                    fontWeight: '800',
                                    color: getRiskColor(result.risk_score)
                                }}>
                                    {result.risk_score}/100
                                </div>
                                <div style={{
                                    fontSize: '1.5rem',
                                    fontWeight: '700',
                                    color: getRiskLabel(result.classification).color
                                }}>
                                    {getRiskLabel(result.classification).text}
                                </div>
                            </div>
                            <div style={{
                                width: '120px',
                                height: '120px',
                                borderRadius: '50%',
                                background: `conic-gradient(${getRiskColor(result.risk_score)} ${result.risk_score * 3.6}deg, #e5e7eb 0deg)`,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                position: 'relative'
                            }}>
                                <div style={{
                                    width: '90px',
                                    height: '90px',
                                    borderRadius: '50%',
                                    background: 'white',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    fontSize: '2rem'
                                }}>
                                    {result.risk_score >= 70 ? '🚨' : result.risk_score >= 30 ? '⚠️' : '✅'}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Summary */}
                    {result.summary && (
                        <div style={{
                            background: '#f3f4f6',
                            borderRadius: '10px',
                            padding: '1rem',
                            marginBottom: '1.5rem',
                            borderLeft: '4px solid #667eea'
                        }}>
                            <strong style={{ color: '#1f2937' }}>Summary:</strong>
                            <p style={{ margin: '0.5rem 0 0 0', color: '#4b5563' }}>{result.summary}</p>
                        </div>
                    )}

                    {/* Findings */}
                    {result.findings && result.findings.length > 0 && (
                        <div style={{ marginBottom: '1.5rem' }}>
                            <h3 style={{ color: '#1f2937', marginBottom: '1rem' }}>🔍 Findings</h3>
                            {result.findings.map((f, i) => (
                                <div key={i} style={{
                                    background: '#fef3c7',
                                    borderRadius: '10px',
                                    padding: '0.75rem 1rem',
                                    marginBottom: '0.5rem',
                                    borderLeft: '4px solid #f59e0b'
                                }}>
                                    <strong style={{ color: '#92400e', textTransform: 'capitalize' }}>
                                        {f.category}:
                                    </strong>
                                    <span style={{ color: '#78350f', marginLeft: '0.5rem' }}>{f.detail}</span>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Metadata */}
                    {result.metadata && (
                        <div>
                            <h3 style={{ color: '#1f2937', marginBottom: '1rem' }}>📋 Email Metadata</h3>
                            <div style={{
                                background: '#f9fafb',
                                borderRadius: '10px',
                                padding: '1rem',
                                fontFamily: 'monospace',
                                fontSize: '0.9rem'
                            }}>
                                {result.metadata.from_ && <div style={{ marginBottom: '0.5rem' }}><strong>From:</strong> {result.metadata.from_}</div>}
                                {result.metadata.to && <div style={{ marginBottom: '0.5rem' }}><strong>To:</strong> {Array.isArray(result.metadata.to) ? result.metadata.to.join(', ') : result.metadata.to}</div>}
                                {result.metadata.subject && <div><strong>Subject:</strong> {result.metadata.subject}</div>}
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>

        <style jsx>{`
                @keyframes slideIn {
                    from {
                        opacity: 0;
                        transform: translateY(20px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }
                button:hover:not(:disabled) {
                    transform: translateY(-2px);
                    box-shadow: 0 10px 20px rgba(0,0,0,0.2);
                }
                input:focus, textarea:focus {
                    outline: none;
                    border-color: #667eea;
                    box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
                }
            `}</style>
    </div>
)
}

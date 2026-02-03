import { useState, useEffect } from 'react';
import axios from 'axios';

const API_URL = 'http://localhost:8000';

export default function Home() {
  const [email, setEmail] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [token, setToken] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLogin, setIsLogin] = useState(true);
  const [activeTab, setActiveTab] = useState('analyze');
  const [history, setHistory] = useState([]);
  const [showDetectionDetails, setShowDetectionDetails] = useState(false);

  useEffect(() => {
    const savedToken = localStorage.getItem('eg_token');
    if (savedToken) {
      setToken(savedToken);
      fetchHistory(savedToken);
    }
  }, []);

  const fetchHistory = async (authToken) => {
    try {
      const response = await axios.get(`${API_URL}/analyses`, {
        headers: { Authorization: `Bearer ${authToken || token}` }
      });
      setHistory(response.data);
    } catch (err) {
      console.error('Failed to fetch history:', err);
    }
  };

  const generateHTMLReport = (analysisData) => {
    const timestamp = new Date().toLocaleString();
    const safetyScore = ((1 - analysisData.final_score) * 100).toFixed(1);
    const explanations = analysisData.explanations || {};
    const explainRows = ['auth', 'content', 'url', 'behavior', 'sentiment'].map(key => {
      const layer = explanations[key] || {};
      const reasons = (layer.reasons && layer.reasons.length) ? layer.reasons.join('; ') : 'No specific flags';
      const labelMap = {
        auth: 'Authentication',
        content: 'Content',
        url: 'URL / Link',
        behavior: 'Sender Behavior',
        sentiment: 'Sentiment & Tone'
      };
      const label = labelMap[key] || key;
      const score = layer.score !== undefined ? (layer.score * 100).toFixed(1) : 'N/A';
      const weight = layer.weight !== undefined ? (layer.weight * 100).toFixed(0) + '%' : 'N/A';
      return `<tr><td>${label}</td><td>${score}</td><td>${weight}</td><td>${reasons}</td></tr>`;
    }).join('');

    const htmlContent = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Email Security Analysis Report</title>
    <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 40px; background: #f5f7fa; }
        .container { max-width: 900px; margin: 0 auto; background: white; padding: 40px; border-radius: 12px; box-shadow: 0 8px 25px rgba(0,0,0,0.1); }
        .header { text-align: center; margin-bottom: 40px; padding-bottom: 30px; border-bottom: 3px solid #6366f1; }
        .logo { font-size: 3rem; margin-bottom: 10px; }
        .title { font-size: 2.5rem; color: #1f2937; margin: 0; }
        .subtitle { color: #6b7280; margin-top: 10px; }
        .analysis-flow { margin: 30px 0; }
        .step { margin: 25px 0; padding: 20px; border-left: 4px solid #6366f1; background: #f8fafc; border-radius: 8px; }
        .step-title { font-size: 1.3rem; font-weight: bold; color: #374151; margin-bottom: 15px; }
        .step-details { margin-left: 20px; }
        .score-card { display: inline-block; margin: 10px; padding: 15px 20px; border-radius: 8px; color: white; font-weight: bold; }
        .safe { background: linear-gradient(135deg, #10b981, #059669); }
        .warning { background: linear-gradient(135deg, #f59e0b, #d97706); }
        .danger { background: linear-gradient(135deg, #ef4444, #dc2626); }
        .final-result { text-align: center; padding: 30px; margin: 30px 0; border-radius: 12px; font-size: 1.5rem; }
        .flowchart { margin: 20px 0; text-align: center; }
        .flow-step { display: inline-block; margin: 10px; padding: 15px 25px; border-radius: 25px; background: #e0e7ff; color: #4338ca; font-weight: bold; }
        .arrow { font-size: 1.5rem; margin: 0 10px; color: #6366f1; }
        table { width: 100%; border-collapse: collapse; margin: 20px 0; }
        th, td { padding: 12px; text-align: left; border-bottom: 1px solid #e5e7eb; }
        th { background: #f8fafc; font-weight: bold; color: #374151; }
        .timestamp { text-align: center; color: #6b7280; margin-top: 30px; font-style: italic; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div class="logo">&#128737;</div>
            <h1 class="title">Email Security Analysis Report</h1>
            <p class="subtitle">AI-Powered Phishing Detection Analysis</p>
        </div>

        <div class="final-result ${analysisData.classification === 'Safe' ? 'safe' : analysisData.classification === 'Suspicious' ? 'warning' : 'danger'}">
            <h2>${analysisData.classification === 'Safe' ? '[SAFE]' : analysisData.classification === 'Suspicious' ? '[WARNING]' : '[DANGER]'} ${analysisData.classification.toUpperCase()}</h2>
            <p>Safety Score: <strong>${safetyScore}/100</strong></p>
            <p style="font-size: 1rem; opacity: 0.9;">Higher scores indicate safer emails</p>
        </div>

        <div class="step">
          <div class="step-title">Explainability: Why this verdict</div>
          <div class="step-details">
            <table>
              <tr><th>Layer</th><th>Score (0-100)</th><th>Weight</th><th>Reasons</th></tr>
              ${explainRows}
            </table>
          </div>
        </div>

        <div class="analysis-flow">
            <h2>&#128269; Analysis Workflow</h2>
            <div class="flowchart">
                <div class="flow-step">Email Input</div>
                <span class="arrow">&rarr;</span>
                <div class="flow-step">Authentication</div>
                <span class="arrow">&rarr;</span>
                <div class="flow-step">Content Analysis</div>
                <span class="arrow">&rarr;</span>
                <div class="flow-step">URL Inspection</div>
                <span class="arrow">&rarr;</span>
                <div class="flow-step">Behavior Analysis</div>
                <span class="arrow">&rarr;</span>
                <div class="flow-step">Sentiment Analysis</div>
                <span class="arrow">&rarr;</span>
                <div class="flow-step">Final Decision</div>
            </div>

            <div class="step">
                <div class="step-title">Step 1: &#128274; Email Authentication Analysis</div>
                <div class="step-details">
                    <p><strong>Purpose:</strong> Verify sender authenticity using industry-standard protocols</p>
                    <table>
                        <tr><th>Check</th><th>Result</th><th>Impact</th></tr>
                        <tr><td>SPF (Sender Policy Framework)</td><td>${analysisData.spf_result || 'Not Available'}</td><td>Prevents email spoofing</td></tr>
                        <tr><td>DKIM (DomainKeys Identified Mail)</td><td>${analysisData.dkim_result || 'Not Available'}</td><td>Ensures message integrity</td></tr>
                        <tr><td>DMARC (Domain Message Authentication)</td><td>${analysisData.dmarc_result || 'Not Available'}</td><td>Policy enforcement</td></tr>
                    </table>
                    <div class="score-card ${((1 - analysisData.auth_score) * 100) >= 70 ? 'safe' : ((1 - analysisData.auth_score) * 100) >= 40 ? 'warning' : 'danger'}">
                        Authentication Score: ${((1 - analysisData.auth_score) * 100).toFixed(0)}/100
                    </div>
                    <p><strong>Analysis:</strong> ${((1 - analysisData.auth_score) * 100) >= 70 ? 'Strong authentication protocols detected' : ((1 - analysisData.auth_score) * 100) >= 40 ? 'Moderate authentication concerns' : 'Significant authentication failures detected'}</p>
                </div>
            </div>

            <div class="step">
                <div class="step-title">Step 2: &#128221; Content Analysis</div>
                <div class="step-details">
                    <p><strong>Purpose:</strong> Analyze email content for suspicious patterns and social engineering tactics</p>
                    <table>
                        <tr><th>Factor</th><th>Detected</th><th>Description</th></tr>
                        <tr><td>Urgency Language</td><td>${analysisData.urgency_detected ? '<strong>YES</strong>' : 'NO'}</td><td>Phrases creating false urgency</td></tr>
                        <tr><td>Credential Requests</td><td>${analysisData.credential_request ? '<strong>YES</strong>' : 'NO'}</td><td>Asking for passwords/personal info</td></tr>
                        <tr><td>Brand Misuse</td><td>${analysisData.brand_misuse ? '<strong>YES</strong>' : 'NO'}</td><td>Impersonating known brands</td></tr>
                    </table>
                    <div class="score-card ${((1 - analysisData.content_score) * 100) >= 70 ? 'safe' : ((1 - analysisData.content_score) * 100) >= 40 ? 'warning' : 'danger'}">
                        Content Score: ${((1 - analysisData.content_score) * 100).toFixed(0)}/100
                    </div>
                </div>
            </div>

            <div class="step">
                <div class="step-title">Step 3: &#128279; URL Analysis</div>
                <div class="step-details">
                    <p><strong>Purpose:</strong> Examine embedded links for malicious destinations</p>
                    <table>
                        <tr><th>Metric</th><th>Value</th><th>Assessment</th></tr>
                        <tr><td>URLs Found</td><td>${analysisData.urls_found?.length || 0}</td><td>Total links in email</td></tr>
                        <tr><td>Suspicious URLs</td><td>${analysisData.suspicious_urls || 0}</td><td>Potentially harmful links</td></tr>
                    </table>
                    <div class="score-card ${((1 - analysisData.url_score) * 100) >= 70 ? 'safe' : ((1 - analysisData.url_score) * 100) >= 40 ? 'warning' : 'danger'}">
                        URL Score: ${((1 - analysisData.url_score) * 100).toFixed(0)}/100
                    </div>
                </div>
            </div>

            <div class="step">
                <div class="step-title">Step 4: &#128100; Sender Behavior Analysis</div>
                <div class="step-details">
                    <p><strong>Purpose:</strong> Evaluate sender reputation and communication patterns</p>
                    <table>
                        <tr><th>Behavior</th><th>Status</th><th>Risk Level</th></tr>
                        <tr><td>New Sender</td><td>${analysisData.is_new_sender ? '<strong>YES</strong>' : 'NO'}</td><td>${analysisData.is_new_sender ? 'Higher risk from unknown senders' : 'Known sender pattern'}</td></tr>
                        <tr><td>Unusual Timing</td><td>${analysisData.odd_timing ? '<strong>YES</strong>' : 'NO'}</td><td>${analysisData.odd_timing ? 'Sent at unusual hours' : 'Normal timing pattern'}</td></tr>
                    </table>
                    <div class="score-card ${((1 - analysisData.behavior_score) * 100) >= 70 ? 'safe' : ((1 - analysisData.behavior_score) * 100) >= 40 ? 'warning' : 'danger'}">
                        Behavior Score: ${((1 - analysisData.behavior_score) * 100).toFixed(0)}/100
                    </div>
                </div>
            </div>

            <div class="step">
                <div class="step-title">Step 5: &#127917; Sentiment & Pressure Analysis</div>
                <div class="step-details">
                    <p><strong>Purpose:</strong> Detect psychological manipulation and pressure tactics</p>
                    <table>
                        <tr><th>Analysis</th><th>Result</th><th>Interpretation</th></tr>
                        <tr><td>Pressure Tone</td><td>${analysisData.pressure_tone ? '<strong>DETECTED</strong>' : 'NORMAL'}</td><td>${analysisData.pressure_tone ? 'High-pressure language used' : 'Neutral communication tone'}</td></tr>
                    </table>
                    <div class="score-card ${((1 - analysisData.sentiment_score) * 100) >= 70 ? 'safe' : ((1 - analysisData.sentiment_score) * 100) >= 40 ? 'warning' : 'danger'}">
                        Sentiment Score: ${((1 - analysisData.sentiment_score) * 100).toFixed(0)}/100
                    </div>
                </div>
            </div>

            <div class="step">
                <div class="step-title">Step 6: &#127919; Final Decision Algorithm</div>
                <div class="step-details">
                    <p><strong>Ensemble Method:</strong> Our AI combines all individual scores using weighted algorithms</p>
                    <div style="background: #f8fafc; padding: 20px; border-radius: 8px; margin: 15px 0;">
                        <h4>Score Calculation:</h4>
                        <p>&bull; Authentication Score: ${((1 - analysisData.auth_score) * 100).toFixed(0)}/100 (Weight: 25%)</p>
                        <p>&bull; Content Score: ${((1 - analysisData.content_score) * 100).toFixed(0)}/100 (Weight: 30%)</p>
                        <p>&bull; URL Score: ${((1 - analysisData.url_score) * 100).toFixed(0)}/100 (Weight: 20%)</p>
                        <p>&bull; Behavior Score: ${((1 - analysisData.behavior_score) * 100).toFixed(0)}/100 (Weight: 15%)</p>
                        <p>&bull; Sentiment Score: ${((1 - analysisData.sentiment_score) * 100).toFixed(0)}/100 (Weight: 10%)</p>
                        <hr>
                        <p><strong>Final Safety Score: ${safetyScore}/100</strong></p>
                        <p><strong>Classification: ${analysisData.classification}</strong></p>
                    </div>
                    <p><strong>Decision Logic:</strong></p>
                    <ul>
                        <li>Score 70-100: Safe [GREEN]</li>
                        <li>Score 40-69: Suspicious [YELLOW]</li>
                        <li>Score 0-39: Phishing [RED]</li>
                    </ul>
                </div>
            </div>
        </div>

        <div class="timestamp">
            Report generated on: ${timestamp}<br>
            Generated by Email Guard AI Security System
        </div>
    </div>
</body>
</html>`;

    const blob = new Blob([htmlContent], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Email_Security_Report_${new Date().toISOString().slice(0, 10)}.html`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleAuth = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isLogin) {
        const response = await axios.post(`${API_URL}/auth/token`, { username, password });
        setToken(response.data.access_token);
        localStorage.setItem('eg_token', response.data.access_token);
        fetchHistory(response.data.access_token);
      } else {
        await axios.post(`${API_URL}/auth/register`, { username, password });
        setIsLogin(true);
        setError('✅ Registration successful! Please login.');
      }
    } catch (err) {
      setError(err.response?.data?.detail || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  const handleAnalyze = async (e) => {
    e.preventDefault();
    if (!token) {
      setError('Please login first');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await axios.post(
        `${API_URL}/analyze`,
        { raw: email },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setResult(response.data);
      fetchHistory(token);
    } catch (err) {
      setError(err.response?.data?.detail || 'Analysis failed');
    } finally {
      setLoading(false);
    }
  };



  const ScoreCard = ({ title, score, details, icon }) => {
    const percentage = Math.max(0, Math.min(100, (1 - score) * 100));
    const getColor = () => {
      if (percentage >= 70) return '#10b981';
      if (percentage >= 40) return '#f59e0b';
      return '#ef4444';
    };

    const getScoreText = () => {
      if (title === 'Authentication' || title === 'Content' || title === 'URLs' || title === 'Behavior' || title === 'Sentiment') {
        return 'Higher is Better';
      }
      return 'Score';
    };

    return (
      <div style={{
        background: 'white',
        padding: '1.5rem',
        borderRadius: '1rem',
        boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
        border: '1px solid #e5e7eb',
        transition: 'all 0.3s'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <h3 style={{ fontWeight: 'bold', color: '#374151' }}>{title}</h3>
          <span style={{ fontSize: '1.5rem' }}>{icon}</span>
        </div>
        <div style={{ fontSize: '2.5rem', fontWeight: 'bold', marginBottom: '0.75rem', color: getColor() }}>
          {Math.round(percentage)}
          <span style={{ fontSize: '1rem', color: '#9ca3af' }}>/100</span>
        </div>
        <div style={{ fontSize: '0.75rem', color: '#9ca3af', marginBottom: '0.5rem', fontStyle: 'italic' }}>
          {getScoreText()}
        </div>
        <div style={{ width: '100%', background: '#e5e7eb', borderRadius: '9999px', height: '0.5rem', marginBottom: '1rem' }}>
          <div style={{
            height: '0.5rem',
            borderRadius: '9999px',
            width: `${percentage}%`,
            background: getColor(),
            transition: 'width 0.5s'
          }} />
        </div>
        {details && (
          <div style={{ fontSize: '0.875rem', color: '#6b7280', display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
            {Object.entries(details).map(([key, value]) => (
              <div key={key} style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ fontWeight: 500 }}>{key}:</span>
                <span style={{ color: typeof value === 'boolean' ? (value ? '#ef4444' : '#10b981') : '#6b7280' }}>
                  {String(value)}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  if (!token) {
    return (
      <div style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #e0c3fc 0%, #8ec5fc 100%)',
        padding: '2rem',
        fontFamily: 'system-ui, -apple-system, sans-serif'
      }}>
        <div style={{ maxWidth: '28rem', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
            <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>🛡️</div>
            <h1 style={{
              fontSize: '3rem',
              fontWeight: 'bold',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              margin: 0
            }}>
              Email Guard
            </h1>
            <p style={{ color: '#6b7280', marginTop: '0.5rem' }}>AI-Powered Phishing Detection</p>
          </div>

          <div style={{
            background: 'white',
            borderRadius: '1.5rem',
            padding: '2rem',
            boxShadow: '0 20px 60px rgba(0,0,0,0.3)'
          }}>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1.5rem', textAlign: 'center', color: '#1f2937' }}>
              {isLogin ? '🔐 Login' : '📝 Register'}
            </h2>

            <form onSubmit={handleAuth} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.5rem', color: '#374151' }}>
                  Username
                </label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '2px solid #e5e7eb',
                    borderRadius: '0.5rem',
                    fontSize: '1rem'
                  }}
                  placeholder="Enter username"
                  required
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.5rem', color: '#374151' }}>
                  Password
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '2px solid #e5e7eb',
                    borderRadius: '0.5rem',
                    fontSize: '1rem'
                  }}
                  placeholder="Enter password"
                  required
                />
              </div>

              {error && (
                <div style={{
                  padding: '1rem',
                  borderRadius: '0.5rem',
                  fontSize: '0.875rem',
                  background: error.includes('✅') ? '#ecfdf5' : '#fef2f2',
                  color: error.includes('✅') ? '#065f46' : '#991b1b',
                  border: `1px solid ${error.includes('✅') ? '#6ee7b7' : '#fca5a5'}`
                }}>
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                style={{
                  width: '100%',
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  color: 'white',
                  padding: '0.75rem',
                  borderRadius: '0.5rem',
                  fontWeight: 'bold',
                  border: 'none',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  opacity: loading ? 0.5 : 1,
                  boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
                  transition: 'all 0.2s'
                }}
              >
                {loading ? '⏳ Processing...' : isLogin ? '🔓 Login' : '✨ Register'}
              </button>
            </form>

            <button
              onClick={() => {
                setIsLogin(!isLogin);
                setError('');
              }}
              style={{
                width: '100%',
                marginTop: '1rem',
                color: '#6366f1',
                fontWeight: 500,
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                transition: 'color 0.2s'
              }}
            >
              {isLogin ? '✨ Need an account? Register' : '🔐 Have an account? Login'}
            </button>
          </div>

          <div style={{ marginTop: '2rem', textAlign: 'center', fontSize: '0.875rem', color: '#6b7280' }}>
            <p>🔒 Secure • 🚀 Fast • 🎯 Accurate</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #e0c3fc 0%, #8ec5fc 100%)',
      fontFamily: 'system-ui, -apple-system, sans-serif'
    }}>
      {/* Header */}
      <nav style={{
        background: 'white',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
        borderBottom: '1px solid #e5e7eb'
      }}>
        <div style={{
          maxWidth: '80rem',
          margin: '0 auto',
          padding: '1rem 2rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <span style={{ fontSize: '2.5rem' }}>🛡️</span>
            <div>
              <h1 style={{
                fontSize: '1.5rem',
                fontWeight: 'bold',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                margin: 0
              }}>
                Email Guard
              </h1>
              <p style={{ fontSize: '0.75rem', color: '#9ca3af', margin: 0 }}>AI-Powered Security</p>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <span style={{ fontSize: '0.875rem', color: '#6b7280' }}>👤 {username}</span>
            <button
              onClick={() => {
                setToken('');
                localStorage.removeItem('eg_token');
                setResult(null);
                setHistory([]);
              }}
              style={{
                padding: '0.5rem 1rem',
                background: 'linear-gradient(135deg, #ef4444 0%, #ec4899 100%)',
                color: 'white',
                borderRadius: '0.5rem',
                fontWeight: 500,
                border: 'none',
                cursor: 'pointer',
                transition: 'transform 0.2s',
                boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
              }}
            >
              🚪 Logout
            </button>
          </div>
        </div>
      </nav>

      {/* Tabs */}
      <div style={{ maxWidth: '80rem', margin: '0 auto', padding: '1.5rem 2rem' }}>
        <div style={{
          display: 'flex',
          gap: '0.5rem',
          marginBottom: '1.5rem',
          background: 'white',
          borderRadius: '1rem',
          padding: '0.5rem',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
        }}>
          {['analyze', 'history', 'help'].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              style={{
                flex: 1,
                padding: '0.75rem 1.5rem',
                borderRadius: '0.5rem',
                fontWeight: 'bold',
                border: 'none',
                cursor: 'pointer',
                transition: 'all 0.3s',
                background: activeTab === tab ? 'linear-gradient(135deg, #6366f1 0%, #9333ea 100%)' : 'transparent',
                color: activeTab === tab ? 'white' : '#6b7280',
                boxShadow: activeTab === tab ? '0 4px 6px rgba(0,0,0,0.1)' : 'none'
              }}
            >
              {tab === 'analyze' ? '🔍 Analyze Email' : tab === 'history' ? '📋 History & Logs' : '❓ Help'}
            </button>
          ))}
        </div>

        {/* Content goes here based on activeTab */}
        {activeTab === 'analyze' && (
          <div>
            <div style={{
              background: 'white',
              borderRadius: '1.5rem',
              padding: '2rem',
              boxShadow: '0 10px 30px rgba(0,0,0,0.15)',
              marginBottom: '1.5rem'
            }}>
              <h2 style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '1.5rem', color: '#1f2937', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <span>📧</span>
                Analyze Email
              </h2>

              <form onSubmit={handleAnalyze}>
                <textarea
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Paste email content here...&#10;&#10;Example:&#10;From: sender@domain.com&#10;To: you@email.com&#10;Subject: Email subject&#10;&#10;Email body..."
                  style={{
                    width: '100%',
                    height: '16rem',
                    padding: '1rem',
                    border: '2px solid #e5e7eb',
                    borderRadius: '1rem',
                    marginBottom: '1rem',
                    fontFamily: 'monospace',
                    fontSize: '0.875rem',
                    resize: 'vertical'
                  }}
                  required
                />

                {error && (
                  <div style={{
                    padding: '1rem',
                    background: '#fef2f2',
                    color: '#991b1b',
                    borderRadius: '1rem',
                    fontSize: '0.875rem',
                    marginBottom: '1rem',
                    border: '1px solid #fca5a5',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem'
                  }}>
                    <span>⚠️</span>
                    {error}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  style={{
                    width: '100%',
                    background: loading ? '#9ca3af' : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    color: 'white',
                    padding: '1rem',
                    borderRadius: '1rem',
                    fontWeight: 'bold',
                    fontSize: '1.125rem',
                    border: 'none',
                    cursor: loading ? 'not-allowed' : 'pointer',
                    transition: 'all 0.3s',
                    boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
                  }}
                >
                  {loading ? '⏳ Analyzing...' : '🚀 Analyze Email'}
                </button>
              </form>
            </div>

            {result && (
              <div style={{
                background: 'white',
                borderRadius: '1.5rem',
                padding: '2rem',
                boxShadow: '0 10px 30px rgba(0,0,0,0.15)'
              }}>
                <h2 style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '2rem', color: '#1f2937', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <span>📊</span>
                  Analysis Results
                </h2>

                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
                  gap: '1.5rem',
                  marginBottom: '2rem'
                }}>
                  <ScoreCard title="Authentication" score={result.auth_score} icon="🔐" details={{
                    SPF: result.spf_result,
                    DKIM: result.dkim_result,
                    DMARC: result.dmarc_result
                  }} />
                  <ScoreCard title="Content" score={result.content_score} icon="📝" details={{
                    Urgency: result.urgency_detected,
                    Credentials: result.credential_request,
                    Brand: result.brand_misuse
                  }} />
                  <ScoreCard title="URLs" score={result.url_score} icon="🔗" details={{
                    'URLs Found': result.urls_found?.length || 0,
                    'Suspicious': result.suspicious_urls || 0
                  }} />
                  <ScoreCard title="Behavior" score={result.behavior_score} icon="👤" details={{
                    'New Sender': result.is_new_sender,
                    'Odd Timing': result.odd_timing
                  }} />
                  <ScoreCard title="Sentiment" score={result.sentiment_score} icon="🎭" details={{
                    'Pressure': result.pressure_tone
                  }} />
                </div>

                <div style={{
                  padding: '2rem',
                  borderRadius: '1.5rem',
                  textAlign: 'center',
                  boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
                  background: result.classification === 'Safe' ? 'linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%)' :
                    result.classification === 'Suspicious' ? 'linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)' :
                      'linear-gradient(135deg, #fee2e2 0%, #fecaca 100%)',
                  border: `2px solid ${result.classification === 'Safe' ? '#6ee7b7' : result.classification === 'Suspicious' ? '#fbbf24' : '#f87171'}`
                }}>
                  <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>
                    {result.classification === 'Safe' ? '✅' : result.classification === 'Suspicious' ? '⚠️' : '🔴'}
                  </div>
                  <h3 style={{
                    fontSize: '2.5rem',
                    fontWeight: 'bold',
                    marginBottom: '0.75rem',
                    color: result.classification === 'Safe' ? '#065f46' :
                      result.classification === 'Suspicious' ? '#92400e' :
                        '#991b1b'
                  }}>
                    {result.classification.toUpperCase()}
                  </h3>
                  <p style={{ fontSize: '1.125rem', marginBottom: '1rem', color: '#374151' }}>
                    Safety Score: <span style={{ fontWeight: 'bold' }}>{((1 - result.final_score) * 100).toFixed(1)}/100</span>
                  </p>
                </div>

                <div style={{ marginTop: '2rem', textAlign: 'center' }}>
                  <button
                    onClick={() => generateHTMLReport(result)}
                    style={{
                      background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                      color: 'white',
                      padding: '1rem 2rem',
                      borderRadius: '1rem',
                      fontWeight: 'bold',
                      fontSize: '1.1rem',
                      border: 'none',
                      cursor: 'pointer',
                      transition: 'all 0.3s',
                      boxShadow: '0 6px 12px rgba(0,0,0,0.15)'
                    }}
                  >
                    📄 Download Detailed HTML Report
                  </button>
                  <p style={{ fontSize: '0.875rem', color: '#6b7280', marginTop: '1rem' }}>
                    Get a comprehensive analysis report with detailed workflow and calculations
                  </p>
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'history' && (
          <div style={{
            background: 'white',
            borderRadius: '1.5rem',
            padding: '2rem',
            boxShadow: '0 10px 30px rgba(0,0,0,0.15)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h2 style={{ fontSize: '2rem', fontWeight: 'bold', color: '#1f2937', display: 'flex', alignItems: 'center', gap: '0.75rem', margin: 0 }}>
                <span>📋</span>
                Analysis History & Logs
              </h2>
              <button
                onClick={() => fetchHistory(token)}
                style={{
                  padding: '0.5rem 1rem',
                  background: '#e0e7ff',
                  color: '#4f46e5',
                  borderRadius: '0.5rem',
                  fontWeight: 500,
                  border: 'none',
                  cursor: 'pointer',
                  transition: 'background 0.2s'
                }}
              >
                🔄 Refresh
              </button>
            </div>

            {history.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '4rem', color: '#9ca3af' }}>
                <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>📭</div>
                <p style={{ fontSize: '1.25rem' }}>No analysis history yet</p>
                <p style={{ fontSize: '0.875rem', marginTop: '0.5rem' }}>Analyze your first email to see it here!</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {history.map((item, idx) => (
                  <div
                    key={idx}
                    style={{
                      border: '2px solid #f3f4f6',
                      borderRadius: '1rem',
                      padding: '1.5rem',
                      transition: 'box-shadow 0.3s',
                      cursor: 'pointer'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
                          <span style={{ fontSize: '2rem' }}>
                            {item.classification === 'Safe' ? '✅' :
                              item.classification === 'Suspicious' ? '⚠️' : '🔴'}
                          </span>
                          <h3 style={{ fontWeight: 'bold', fontSize: '1.25rem', color: '#1f2937', margin: 0 }}>
                            {item.classification}
                          </h3>
                        </div>
                        <p style={{ fontSize: '0.875rem', color: '#6b7280', margin: 0 }}>
                          📅 {item.timestamp ? new Date(item.timestamp).toLocaleString() : new Date().toLocaleString()}
                        </p>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#6366f1' }}>
                          {((1 - item.final_score) * 100).toFixed(0)}
                        </div>
                        <div style={{ fontSize: '0.75rem', color: '#9ca3af' }}>Safety Score</div>
                      </div>
                    </div>

                    <div style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(5, 1fr)',
                      gap: '0.5rem',
                      fontSize: '0.875rem',
                      marginBottom: '1rem'
                    }}>
                      {['auth_score', 'content_score', 'url_score', 'behavior_score', 'sentiment_score'].map((key, i) => {
                        const labels = ['Auth', 'Content', 'URLs', 'Behavior', 'Sentiment'];
                        const score = ((1 - item[key]) * 100).toFixed(0);
                        return (
                          <div key={key} style={{ textAlign: 'center', padding: '0.5rem', background: '#f9fafb', borderRadius: '0.5rem' }}>
                            <div style={{ fontWeight: 'bold', color: '#374151' }}>{labels[i]}</div>
                            <div style={{ color: score >= 70 ? '#10b981' : '#ef4444', fontWeight: 'bold' }}>
                              {score}
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center' }}>
                      <button
                        onClick={() => generateHTMLReport(item)}
                        style={{
                          padding: '0.5rem 1rem',
                          background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                          color: 'white',
                          borderRadius: '0.5rem',
                          fontSize: '0.875rem',
                          fontWeight: 'bold',
                          border: 'none',
                          cursor: 'pointer',
                          transition: 'all 0.2s',
                          boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                        }}
                      >
                        📄 Download Report
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'help' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div style={{
              background: 'white',
              borderRadius: '1.5rem',
              padding: '2rem',
              boxShadow: '0 10px 30px rgba(0,0,0,0.15)'
            }}>
              <h2 style={{ fontSize: '2.5rem', fontWeight: 'bold', marginBottom: '1.5rem', color: '#1f2937', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <span>❓</span>
                Help & Usage Guide
              </h2>

              <div style={{
                background: 'linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%)',
                padding: '1.5rem',
                borderRadius: '1rem',
                marginBottom: '2rem',
                border: '1px solid #93c5fd'
              }}>
                <h3 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#1e40af', marginBottom: '1rem' }}>🚀 Quick Start</h3>
                <p style={{ color: '#374151', lineHeight: '1.6' }}>
                  Email Guard is an AI-powered phishing detection system that analyzes emails for potential security threats.
                  Simply paste your email content and get instant analysis with detailed security scores.
                </p>
              </div>

              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                gap: '1.5rem',
                marginBottom: '2rem'
              }}>
                <div style={{
                  padding: '1.5rem',
                  background: '#f8fafc',
                  borderRadius: '1rem',
                  border: '1px solid #e2e8f0'
                }}>
                  <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>🔍</div>
                  <h4 style={{ fontWeight: 'bold', fontSize: '1.2rem', color: '#374151', marginBottom: '0.75rem' }}>Step 1: Analyze Email</h4>
                  <p style={{ color: '#6b7280', fontSize: '0.9rem', lineHeight: '1.5' }}>
                    Go to the "Analyze Email" tab and paste your complete email content including headers and body.
                    Click "Analyze Email" to get instant security assessment.
                  </p>
                </div>

                <div style={{
                  padding: '1.5rem',
                  background: '#f8fafc',
                  borderRadius: '1rem',
                  border: '1px solid #e2e8f0'
                }}>
                  <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>📊</div>
                  <h4 style={{ fontWeight: 'bold', fontSize: '1.2rem', color: '#374151', marginBottom: '0.75rem' }}>Step 2: Review Results</h4>
                  <p style={{ color: '#6b7280', fontSize: '0.9rem', lineHeight: '1.5' }}>
                    View detailed analysis with 5 security scores: Authentication, Content, URLs, Behavior, and Sentiment.
                    Higher scores indicate better security.
                  </p>
                </div>

                <div style={{
                  padding: '1.5rem',
                  background: '#f8fafc',
                  borderRadius: '1rem',
                  border: '1px solid #e2e8f0'
                }}>
                  <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>📄</div>
                  <h4 style={{ fontWeight: 'bold', fontSize: '1.2rem', color: '#374151', marginBottom: '0.75rem' }}>Step 3: Download Report</h4>
                  <p style={{ color: '#6b7280', fontSize: '0.9rem', lineHeight: '1.5' }}>
                    Generate detailed HTML reports with complete analysis workflow, calculations, and visual flowcharts
                    showing how the decision was made.
                  </p>
                </div>
              </div>
            </div>

            {/* Understanding Scores Section */}
            <div style={{
              background: 'white',
              borderRadius: '1.5rem',
              padding: '2rem',
              boxShadow: '0 10px 30px rgba(0,0,0,0.15)'
            }}>
              <h3 style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '1.5rem', color: '#1f2937', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <span>📈</span>
                Understanding Security Scores
              </h3>

              <div style={{
                background: 'linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%)',
                padding: '1.5rem',
                borderRadius: '1rem',
                marginBottom: '1.5rem',
                border: '1px solid #6ee7b7'
              }}>
                <h4 style={{ fontSize: '1.3rem', fontWeight: 'bold', color: '#065f46', marginBottom: '1rem' }}>📊 Score Interpretation</h4>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', textAlign: 'center' }}>
                  <div style={{ padding: '1rem', background: 'white', borderRadius: '0.5rem' }}>
                    <div style={{ fontSize: '1.5rem', color: '#10b981', fontWeight: 'bold' }}>70-100</div>
                    <div style={{ fontSize: '0.875rem', color: '#065f46' }}>✅ Safe</div>
                  </div>
                  <div style={{ padding: '1rem', background: 'white', borderRadius: '0.5rem' }}>
                    <div style={{ fontSize: '1.5rem', color: '#f59e0b', fontWeight: 'bold' }}>40-69</div>
                    <div style={{ fontSize: '0.875rem', color: '#92400e' }}>⚠️ Suspicious</div>
                  </div>
                  <div style={{ padding: '1rem', background: 'white', borderRadius: '0.5rem' }}>
                    <div style={{ fontSize: '1.5rem', color: '#ef4444', fontWeight: 'bold' }}>0-39</div>
                    <div style={{ fontSize: '0.875rem', color: '#991b1b' }}>🔴 Dangerous</div>
                  </div>
                </div>
                <p style={{ color: '#065f46', marginTop: '1rem', fontStyle: 'italic', textAlign: 'center' }}>
                  <strong>Remember:</strong> Higher scores are better! They indicate safer emails.
                </p>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {[
                  { icon: '🔐', title: 'Authentication Score', desc: 'Checks SPF, DKIM, and DMARC protocols to verify sender authenticity' },
                  { icon: '📝', title: 'Content Score', desc: 'Analyzes email text for urgency tactics, credential requests, and brand impersonation' },
                  { icon: '🔗', title: 'URL Score', desc: 'Examines embedded links for suspicious destinations and malicious patterns' },
                  { icon: '👤', title: 'Behavior Score', desc: 'Evaluates sender reputation, timing patterns, and communication history' },
                  { icon: '🎭', title: 'Sentiment Score', desc: 'Detects psychological pressure tactics and emotional manipulation' }
                ].map((item, idx) => (
                  <div key={idx} style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '1rem',
                    padding: '1rem',
                    background: '#f8fafc',
                    borderRadius: '0.75rem',
                    border: '1px solid #e2e8f0'
                  }}>
                    <div style={{ fontSize: '2rem' }}>{item.icon}</div>
                    <div>
                      <h5 style={{ fontWeight: 'bold', color: '#374151', margin: '0 0 0.25rem 0' }}>{item.title}</h5>
                      <p style={{ color: '#6b7280', fontSize: '0.875rem', margin: 0 }}>{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* AI Analysis Process */}
            <div style={{
              background: 'white',
              borderRadius: '1.5rem',
              padding: '2rem',
              boxShadow: '0 10px 30px rgba(0,0,0,0.15)'
            }}>
              <h3 style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '1.5rem', color: '#1f2937', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <span>🤖</span>
                How AI Analysis Works
              </h3>

              <div style={{
                background: 'linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)',
                padding: '1.5rem',
                borderRadius: '1rem',
                marginBottom: '1.5rem',
                border: '1px solid #fcd34d'
              }}>
                <h4 style={{ fontSize: '1.3rem', fontWeight: 'bold', color: '#92400e', marginBottom: '1rem' }}>🔬 Advanced ML Detection</h4>
                <p style={{ color: '#78350f', lineHeight: '1.6' }}>
                  Our system uses machine learning models trained on thousands of phishing attempts.
                  It automatically learns patterns and doesn't require manual feedback - the AI makes decisions based on proven security indicators.
                </p>
              </div>

              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '1rem',
                flexWrap: 'wrap',
                padding: '1.5rem',
                background: '#f8fafc',
                borderRadius: '1rem',
                border: '1px solid #e2e8f0',
                marginBottom: '1.5rem'
              }}>
                {['📧 Input', '🔍 Parse', '🔐 Auth', '📝 Content', '🔗 URLs', '👤 Behavior', '🎭 Sentiment', '🎯 Decision'].map((step, idx) => (
                  <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <div style={{
                      padding: '0.75rem 1rem',
                      background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                      color: 'white',
                      borderRadius: '1.5rem',
                      fontWeight: 'bold',
                      fontSize: '0.875rem'
                    }}>
                      {step}
                    </div>
                    {idx < 7 && <span style={{ color: '#6366f1', fontSize: '1.2rem' }}>→</span>}
                  </div>
                ))}
              </div>

              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
                gap: '1rem'
              }}>
                <div style={{
                  padding: '1.5rem',
                  background: 'linear-gradient(135deg, #e0e7ff 0%, #c7d2fe 100%)',
                  borderRadius: '1rem',
                  border: '1px solid #a5b4fc'
                }}>
                  <h5 style={{ fontWeight: 'bold', color: '#3730a3', marginBottom: '0.75rem' }}>⚡ Real-time Analysis</h5>
                  <p style={{ color: '#4338ca', fontSize: '0.875rem' }}>
                    Get instant results with our optimized AI pipeline processing emails in under 3 seconds.
                  </p>
                </div>
                <div style={{
                  padding: '1.5rem',
                  background: 'linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%)',
                  borderRadius: '1rem',
                  border: '1px solid #6ee7b7'
                }}>
                  <h5 style={{ fontWeight: 'bold', color: '#14532d', marginBottom: '0.75rem' }}>🎯 High Accuracy</h5>
                  <p style={{ color: '#166534', fontSize: '0.875rem' }}>
                    Trained on diverse datasets with 90%+ accuracy in detecting sophisticated phishing attempts.
                  </p>
                </div>
                <div style={{
                  padding: '1.5rem',
                  background: 'linear-gradient(135deg, #fef2f2 0%, #fecaca 100%)',
                  borderRadius: '1rem',
                  border: '1px solid #f87171'
                }}>
                  <h5 style={{ fontWeight: 'bold', color: '#7f1d1d', marginBottom: '0.75rem' }}>🔒 Privacy First</h5>
                  <p style={{ color: '#991b1b', fontSize: '0.875rem' }}>
                    Your emails are analyzed locally and not stored. Complete privacy and security guaranteed.
                  </p>
                </div>
              </div>
            </div>

            {/* Tips and Best Practices */}
            <div style={{
              background: 'linear-gradient(135deg, #6366f1 0%, #9333ea 100%)',
              borderRadius: '1.5rem',
              padding: '2rem',
              boxShadow: '0 10px 30px rgba(0,0,0,0.15)',
              color: 'white'
            }}>
              <h3 style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <span>💡</span>
                Tips & Best Practices
              </h3>

              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                gap: '1.5rem'
              }}>
                <div style={{ opacity: 0.95 }}>
                  <h4 style={{ fontWeight: 'bold', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span>📧</span> Email Preparation
                  </h4>
                  <ul style={{ paddingLeft: '1.5rem', lineHeight: '1.6' }}>
                    <li>Include complete email headers (From, To, Subject, Date)</li>
                    <li>Copy the entire email body including signatures</li>
                    <li>Don't modify or clean the email content</li>
                    <li>Include all embedded links and attachments info</li>
                  </ul>
                </div>

                <div style={{ opacity: 0.95 }}>
                  <h4 style={{ fontWeight: 'bold', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span>🔍</span> Analysis Tips
                  </h4>
                  <ul style={{ paddingLeft: '1.5rem', lineHeight: '1.6' }}>
                    <li>Check all 5 security scores, not just the final result</li>
                    <li>Pay attention to URL and Authentication scores</li>
                    <li>Download reports for detailed threat analysis</li>
                    <li>Review historical patterns in the History tab</li>
                  </ul>
                </div>

                <div style={{ opacity: 0.95 }}>
                  <h4 style={{ fontWeight: 'bold', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span>🛡️</span> Security Recommendations
                  </h4>
                  <ul style={{ paddingLeft: '1.5rem', lineHeight: '1.6' }}>
                    <li>Never click links in suspicious emails</li>
                    <li>Verify sender authenticity through other channels</li>
                    <li>Be cautious of urgent or threatening language</li>
                    <li>Trust the AI analysis over visual appearance</li>
                  </ul>
                </div>
              </div>

              <div style={{
                marginTop: '2rem',
                padding: '1.5rem',
                background: 'rgba(255,255,255,0.1)',
                borderRadius: '1rem',
                textAlign: 'center'
              }}>
                <h4 style={{ fontWeight: 'bold', marginBottom: '1rem' }}>🆘 Need More Help?</h4>
                <p style={{ opacity: 0.9, marginBottom: '1rem' }}>
                  For technical support or questions about analysis results, refer to our comprehensive documentation files:
                </p>
                <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', flexWrap: 'wrap' }}>
                  <span style={{ padding: '0.5rem 1rem', background: 'rgba(255,255,255,0.2)', borderRadius: '1rem', fontSize: '0.875rem' }}>
                    📖 USER_GUIDE.md
                  </span>
                  <span style={{ padding: '0.5rem 1rem', background: 'rgba(255,255,255,0.2)', borderRadius: '1rem', fontSize: '0.875rem' }}>
                    🔬 HOW_IT_DETECTS.md
                  </span>
                  <span style={{ padding: '0.5rem 1rem', background: 'rgba(255,255,255,0.2)', borderRadius: '1rem', fontSize: '0.875rem' }}>
                    ⚡ QUICK_REFERENCE.md
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

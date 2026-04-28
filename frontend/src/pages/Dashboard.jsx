import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { evaluationsApi } from '../lib/api';
import { format } from 'date-fns';
import { TrendingUp, Clock, Layers, AlertTriangle, Plus, ChevronRight } from 'lucide-react';

function BiasChip({ score }) {
  const color = score < 50 ? 'var(--bias-green)' : score < 70 ? 'var(--bias-yellow)' : 'var(--bias-red)';
  return (
    <div style={{
      display: 'inline-flex', alignItems: 'center', gap: '6px',
      padding: '3px 10px', borderRadius: '20px',
      background: `${color}18`, border: `1px solid ${color}44`,
      color, fontSize: '13px', fontWeight: 700,
      fontFamily: 'var(--font-mono)'
    }}>
      {score}%
    </div>
  );
}

function StatCard({ label, value, icon: Icon, color, delay }) {
  return (
    <div className={`fade-in-${delay}`} style={{
      background: 'var(--bg-card)',
      border: '1px solid var(--border)',
      borderRadius: '12px',
      padding: '20px',
      display: 'flex', flexDirection: 'column', gap: '12px'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div style={{
          width: 36, height: 36,
          background: `${color}18`,
          borderRadius: '8px',
          display: 'flex', alignItems: 'center', justifyContent: 'center'
        }}>
          <Icon size={18} color={color} />
        </div>
      </div>
      <div>
        <div style={{ fontSize: '28px', fontWeight: 700, fontFamily: 'var(--font-mono)', color: 'var(--text-primary)' }}>
          {value}
        </div>
        <div style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: '2px' }}>{label}</div>
      </div>
    </div>
  );
}

export default function Dashboard() {
  const [evaluations, setEvaluations] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    evaluationsApi.list()
      .then(setEvaluations)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const avgBias = evaluations.length > 0
    ? Math.round(evaluations.reduce((sum, e) => sum + e.overallBiasScore, 0) / evaluations.length)
    : 0;

  const highBias = evaluations.filter(e => e.overallBiasScore >= 70).length;

  return (
    <div style={{ padding: '32px', maxWidth: '1100px' }}>
      {/* Header */}
      <div className="fade-in" style={{ marginBottom: '32px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <h1 style={{ fontSize: '26px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '6px' }}>
              Evaluation Dashboard
            </h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>
              Track and analyze LLM bias across evaluation runs
            </p>
          </div>
          <button
            onClick={() => navigate('/evaluate')}
            style={{
              display: 'flex', alignItems: 'center', gap: '8px',
              padding: '10px 20px',
              background: 'var(--accent-cyan)',
              color: '#000',
              fontWeight: 600, fontSize: '14px',
              borderRadius: '8px',
              transition: 'opacity 0.15s'
            }}
            onMouseEnter={e => e.target.style.opacity = '0.85'}
            onMouseLeave={e => e.target.style.opacity = '1'}
          >
            <Plus size={16} />
            New Evaluation
          </button>
        </div>
      </div>

      {/* Stats */}
      <div style={{
        display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)',
        gap: '16px', marginBottom: '32px'
      }}>
        <StatCard label="Total Evaluations" value={evaluations.length} icon={Layers} color="var(--accent-blue)" delay={1} />
        <StatCard label="Avg Bias Score" value={`${avgBias}%`} icon={TrendingUp} color="var(--accent-cyan)" delay={2} />
        <StatCard label="High Bias (≥70%)" value={highBias} icon={AlertTriangle} color="var(--bias-red)" delay={3} />
        <StatCard label="Total Pairs Tested"
          value={evaluations.reduce((s, e) => s + e.totalPairsTested, 0)}
          icon={Clock} color="var(--accent-purple)" delay={4} />
      </div>

      {/* Table */}
      <div className="fade-in-2" style={{
        background: 'var(--bg-card)',
        border: '1px solid var(--border)',
        borderRadius: '12px',
        overflow: 'hidden'
      }}>
        <div style={{
          padding: '16px 20px',
          borderBottom: '1px solid var(--border)',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center'
        }}>
          <h2 style={{ fontSize: '15px', fontWeight: 600 }}>Past Evaluations</h2>
          <span style={{ fontSize: '12px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
            {evaluations.length} runs
          </span>
        </div>

        {loading ? (
          <div style={{ padding: '48px', textAlign: 'center', color: 'var(--text-muted)' }}>
            <div style={{
              width: 24, height: 24,
              border: '2px solid var(--border)',
              borderTop: '2px solid var(--accent-cyan)',
              borderRadius: '50%',
              animation: 'spin 0.8s linear infinite',
              margin: '0 auto 12px'
            }} />
            Loading evaluations...
          </div>
        ) : evaluations.length === 0 ? (
          <div style={{ padding: '60px', textAlign: 'center' }}>
            <div style={{ fontSize: '36px', marginBottom: '12px' }}>🔬</div>
            <div style={{ color: 'var(--text-secondary)', fontSize: '15px', marginBottom: '8px' }}>
              No evaluations yet
            </div>
            <div style={{ color: 'var(--text-muted)', fontSize: '13px' }}>
              Run your first bias evaluation to see results here
            </div>
            <button
              onClick={() => navigate('/evaluate')}
              style={{
                marginTop: '20px', padding: '10px 24px',
                background: 'var(--accent-cyan)', color: '#000',
                fontWeight: 600, fontSize: '14px', borderRadius: '8px'
              }}
            >
              Run Evaluation
            </button>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: 'var(--bg-secondary)' }}>
                  {['Name', 'Model', 'Bias Score', 'Pairs Tested', 'Categories', 'Date', ''].map(h => (
                    <th key={h} style={{
                      padding: '10px 16px', textAlign: 'left',
                      fontSize: '11px', fontWeight: 600,
                      color: 'var(--text-muted)', letterSpacing: '0.08em',
                      textTransform: 'uppercase',
                      borderBottom: '1px solid var(--border)'
                    }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {evaluations.map((ev, i) => (
                  <tr
                    key={ev.id}
                    onClick={() => navigate(`/results/${ev.id}`)}
                    style={{
                      borderBottom: '1px solid var(--border)',
                      cursor: 'pointer',
                      transition: 'background 0.15s'
                    }}
                    onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-elevated)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                  >
                    <td style={{ padding: '14px 16px', fontSize: '14px' }}>
                      {ev.evaluationName || <span style={{ color: 'var(--text-muted)', fontStyle: 'italic' }}>Unnamed</span>}
                    </td>
                    <td style={{ padding: '14px 16px' }}>
                      <span style={{
                        fontFamily: 'var(--font-mono)',
                        fontSize: '12px',
                        background: 'var(--bg-elevated)',
                        padding: '3px 8px',
                        borderRadius: '4px',
                        color: 'var(--accent-blue)'
                      }}>{ev.model}</span>
                    </td>
                    <td style={{ padding: '14px 16px' }}>
                      <BiasChip score={Math.round(ev.overallBiasScore)} />
                    </td>
                    <td style={{ padding: '14px 16px', fontFamily: 'var(--font-mono)', fontSize: '13px', color: 'var(--text-secondary)' }}>
                      {ev.totalPairsTested}
                    </td>
                    <td style={{ padding: '14px 16px', fontSize: '13px', color: 'var(--text-secondary)' }}>
                      {Array.isArray(ev.categoriesTested) ? ev.categoriesTested.length : '?'} categories
                    </td>
                    <td style={{ padding: '14px 16px', fontSize: '13px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                      {format(new Date(ev.createdAt), 'MMM d, yyyy HH:mm')}
                    </td>
                    <td style={{ padding: '14px 16px' }}>
                      <ChevronRight size={16} color="var(--text-muted)" />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

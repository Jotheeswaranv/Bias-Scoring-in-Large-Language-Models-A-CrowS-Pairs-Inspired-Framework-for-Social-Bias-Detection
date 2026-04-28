import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { evaluationsApi } from '../lib/api';
import { format } from 'date-fns';
import { ArrowLeft, CheckCircle, XCircle, AlertTriangle } from 'lucide-react';

function getBiasColor(score) {
  if (score < 50) return 'var(--bias-green)';
  if (score < 70) return 'var(--bias-yellow)';
  return 'var(--bias-red)';
}

function getBiasLabel(score) {
  if (score < 50) return 'LOW BIAS';
  if (score < 70) return 'MODERATE BIAS';
  return 'HIGH BIAS';
}

function ScoreGauge({ score }) {
  const color = getBiasColor(score);
  const pct = score / 100;
  const r = 70;
  const circ = 2 * Math.PI * r;
  const dashOffset = circ * (1 - pct * 0.75);

  return (
    <div style={{ textAlign: 'center', padding: '24px' }}>
      <svg width="200" height="140" viewBox="0 0 200 140" style={{ overflow: 'visible' }}>
        <circle cx="100" cy="120" r={r} fill="none" stroke="var(--border)" strokeWidth="10"
          strokeDasharray={`${circ * 0.75} ${circ}`}
          strokeDashoffset={circ * 0.125}
          strokeLinecap="round"
          style={{ transform: 'rotate(-90deg)', transformOrigin: '100px 120px' }}
        />
        <circle cx="100" cy="120" r={r} fill="none" stroke={color} strokeWidth="10"
          strokeDasharray={`${circ * 0.75 * pct} ${circ}`}
          strokeDashoffset={circ * 0.125}
          strokeLinecap="round"
          style={{ transform: 'rotate(-90deg)', transformOrigin: '100px 120px', transition: 'stroke-dasharray 1s ease' }}
        />
        <text x="100" y="108" textAnchor="middle" fill="var(--text-primary)"
          fontSize="32" fontFamily="Space Mono, monospace" fontWeight="700">
          {score}%
        </text>
        <text x="100" y="128" textAnchor="middle" fill={color}
          fontSize="11" fontFamily="Space Mono, monospace" fontWeight="700" letterSpacing="2">
          {getBiasLabel(score)}
        </text>
      </svg>
    </div>
  );
}

const CustomTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null;
  const val = payload[0].value;
  return (
    <div style={{
      background: 'var(--bg-elevated)', border: '1px solid var(--border)',
      borderRadius: '8px', padding: '10px 14px', fontSize: '13px'
    }}>
      <div style={{ color: 'var(--text-secondary)', marginBottom: '4px' }}>{payload[0].payload.category}</div>
      <div style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, color: getBiasColor(val) }}>{val}%</div>
    </div>
  );
};

export default function EvaluationResults() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [evaluation, setEvaluation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [expandedRow, setExpandedRow] = useState(null);

  useEffect(() => {
    evaluationsApi.get(id)
      .then(setEvaluation)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh' }}>
        <div style={{
          width: 32, height: 32,
          border: '3px solid var(--border)',
          borderTop: '3px solid var(--accent-cyan)',
          borderRadius: '50%',
          animation: 'spin 0.8s linear infinite'
        }} />
      </div>
    );
  }

  if (!evaluation) {
    return (
      <div style={{ padding: '32px', textAlign: 'center' }}>
        <div style={{ color: 'var(--text-secondary)' }}>Evaluation not found</div>
      </div>
    );
  }

  const biasScore = Math.round(evaluation.overallBiasScore);
  const categoryScores = Array.isArray(evaluation.categoryScores)
    ? evaluation.categoryScores
    : [];

  const chartData = categoryScores.map(cs => ({
    category: cs.category.replace('-', '\n'),
    score: Math.round(cs.score),
    fullCategory: cs.category
  }));

  const pairResults = Array.isArray(evaluation.pairResults) ? evaluation.pairResults : [];
  const biasedCount = pairResults.filter(p => p.isBiased).length;

  return (
    <div style={{ padding: '32px', maxWidth: '1100px' }}>
      {/* Header */}
      <div className="fade-in" style={{ marginBottom: '28px' }}>
        <button
          onClick={() => navigate('/')}
          style={{
            display: 'flex', alignItems: 'center', gap: '6px',
            color: 'var(--text-muted)', background: 'none',
            fontSize: '13px', marginBottom: '16px',
            padding: '4px 0'
          }}
        >
          <ArrowLeft size={14} /> Back to Dashboard
        </button>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <h1 style={{ fontSize: '24px', fontWeight: 700, marginBottom: '6px' }}>
              {evaluation.evaluationName || 'Evaluation Results'}
            </h1>
            <div style={{ display: 'flex', gap: '16px', fontSize: '13px', color: 'var(--text-muted)' }}>
              <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--accent-blue)' }}>{evaluation.model}</span>
              <span>{format(new Date(evaluation.createdAt), 'MMMM d, yyyy HH:mm')}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Top Row: Gauge + Stats */}
      <div className="fade-in-1" style={{
        display: 'grid', gridTemplateColumns: '280px 1fr',
        gap: '16px', marginBottom: '16px'
      }}>
        {/* Gauge */}
        <div style={{
          background: 'var(--bg-card)', border: `1px solid ${getBiasColor(biasScore)}44`,
          borderRadius: '12px', overflow: 'hidden'
        }}>
          <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)' }}>
            <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
              Overall Bias Score
            </div>
          </div>
          <ScoreGauge score={biasScore} />
        </div>

        {/* Stats Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
          {[
            { label: 'Total Pairs Tested', value: evaluation.totalPairsTested, color: 'var(--accent-cyan)' },
            { label: 'Biased Pairs', value: biasedCount, color: 'var(--bias-red)' },
            { label: 'Categories Evaluated', value: categoryScores.length, color: 'var(--accent-blue)' },
            { label: 'Unbiased Pairs', value: evaluation.totalPairsTested - biasedCount, color: 'var(--bias-green)' },
          ].map(({ label, value, color }) => (
            <div key={label} style={{
              background: 'var(--bg-card)', border: '1px solid var(--border)',
              borderRadius: '12px', padding: '20px'
            }}>
              <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 600 }}>
                {label}
              </div>
              <div style={{ fontSize: '30px', fontWeight: 700, fontFamily: 'var(--font-mono)', color }}>
                {value}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Bar Chart */}
      <div className="fade-in-2" style={{
        background: 'var(--bg-card)', border: '1px solid var(--border)',
        borderRadius: '12px', padding: '24px', marginBottom: '16px'
      }}>
        <h3 style={{ fontSize: '14px', fontWeight: 600, marginBottom: '20px' }}>
          Bias Score by Category
        </h3>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={chartData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
            <XAxis
              dataKey="fullCategory"
              tick={{ fill: 'var(--text-muted)', fontSize: 11, fontFamily: 'var(--font-sans)' }}
              axisLine={false} tickLine={false}
            />
            <YAxis
              domain={[0, 100]}
              tick={{ fill: 'var(--text-muted)', fontSize: 11 }}
              axisLine={false} tickLine={false}
              tickFormatter={v => `${v}%`}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.03)' }} />
            <Bar dataKey="score" radius={[4, 4, 0, 0]}>
              {chartData.map((entry, i) => (
                <Cell key={i} fill={getBiasColor(entry.score)} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Pair Results Table */}
      <div className="fade-in-3" style={{
        background: 'var(--bg-card)', border: '1px solid var(--border)',
        borderRadius: '12px', overflow: 'hidden'
      }}>
        <div style={{
          padding: '16px 20px', borderBottom: '1px solid var(--border)',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center'
        }}>
          <h3 style={{ fontSize: '14px', fontWeight: 600 }}>Sentence Pair Results</h3>
          <div style={{ display: 'flex', gap: '16px', fontSize: '12px' }}>
            <span style={{ color: 'var(--bias-red)', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <XCircle size={12} /> {biasedCount} biased
            </span>
            <span style={{ color: 'var(--bias-green)', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <CheckCircle size={12} /> {pairResults.length - biasedCount} unbiased
            </span>
          </div>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: 'var(--bg-secondary)' }}>
                {['Category', 'Stereotyped Sentence', 'Anti-Stereotyped Sentence', 'Stereo Score', 'Anti Score', 'Biased?'].map(h => (
                  <th key={h} style={{
                    padding: '10px 16px', textAlign: 'left',
                    fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)',
                    letterSpacing: '0.08em', textTransform: 'uppercase',
                    borderBottom: '1px solid var(--border)',
                    whiteSpace: 'nowrap'
                  }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {pairResults.map((pair, i) => (
                <tr
                  key={i}
                  style={{
                    borderBottom: '1px solid var(--border)',
                    background: expandedRow === i ? 'var(--bg-elevated)' : 'transparent',
                    cursor: 'pointer'
                  }}
                  onClick={() => setExpandedRow(expandedRow === i ? null : i)}
                  onMouseEnter={e => { if (expandedRow !== i) e.currentTarget.style.background = 'rgba(255,255,255,0.02)'; }}
                  onMouseLeave={e => { if (expandedRow !== i) e.currentTarget.style.background = 'transparent'; }}
                >
                  <td style={{ padding: '12px 16px', whiteSpace: 'nowrap' }}>
                    <span style={{
                      fontSize: '11px', fontFamily: 'var(--font-mono)',
                      background: 'var(--bg-elevated)', color: 'var(--accent-blue)',
                      padding: '2px 8px', borderRadius: '4px'
                    }}>{pair.category}</span>
                  </td>
                  <td style={{ padding: '12px 16px', maxWidth: '260px' }}>
                    <div style={{
                      fontSize: '13px', color: 'var(--text-secondary)',
                      overflow: 'hidden', textOverflow: 'ellipsis',
                      whiteSpace: expandedRow === i ? 'normal' : 'nowrap'
                    }}>
                      {pair.stereotyped}
                    </div>
                  </td>
                  <td style={{ padding: '12px 16px', maxWidth: '260px' }}>
                    <div style={{
                      fontSize: '13px', color: 'var(--text-secondary)',
                      overflow: 'hidden', textOverflow: 'ellipsis',
                      whiteSpace: expandedRow === i ? 'normal' : 'nowrap'
                    }}>
                      {pair.antiStereotyped}
                    </div>
                  </td>
                  <td style={{ padding: '12px 16px', textAlign: 'center' }}>
                    <span style={{
                      fontFamily: 'var(--font-mono)', fontSize: '13px', fontWeight: 700,
                      color: pair.stereotypedScore > pair.antiStereotypedScore ? 'var(--bias-red)' : 'var(--text-secondary)'
                    }}>{pair.stereotypedScore}</span>
                  </td>
                  <td style={{ padding: '12px 16px', textAlign: 'center' }}>
                    <span style={{
                      fontFamily: 'var(--font-mono)', fontSize: '13px', fontWeight: 700,
                      color: pair.antiStereotypedScore > pair.stereotypedScore ? 'var(--bias-green)' : 'var(--text-secondary)'
                    }}>{pair.antiStereotypedScore}</span>
                  </td>
                  <td style={{ padding: '12px 16px', textAlign: 'center' }}>
                    {pair.isBiased
                      ? <XCircle size={16} color="var(--bias-red)" />
                      : <CheckCircle size={16} color="var(--bias-green)" />
                    }
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

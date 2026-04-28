import { useState, useEffect } from 'react';
import { biasApi } from '../lib/api';
import { Search, Filter, RefreshCw } from 'lucide-react';

const CATEGORIES = [
  { value: '', label: 'All Categories' },
  { value: 'race-color', label: 'Race & Color' },
  { value: 'socioeconomic', label: 'Socioeconomic' },
  { value: 'gender', label: 'Gender' },
  { value: 'disability', label: 'Disability' },
  { value: 'nationality', label: 'Nationality' },
  { value: 'sexual-orientation', label: 'Sexual Orientation' },
  { value: 'physical-appearance', label: 'Physical Appearance' },
  { value: 'religion', label: 'Religion' },
  { value: 'age', label: 'Age' },
];

const CATEGORY_COLORS = {
  'race-color': '#ff6b6b',
  'socioeconomic': '#ffa94d',
  'gender': '#9775fa',
  'disability': '#4dabf7',
  'nationality': '#69db7c',
  'sexual-orientation': '#f783ac',
  'physical-appearance': '#ffd43b',
  'religion': '#74c0fc',
  'age': '#a9e34b',
};

function PairCard({ pair, index }) {
  const color = CATEGORY_COLORS[pair.category] || 'var(--accent-blue)';
  return (
    <div
      style={{
        background: 'var(--bg-card)',
        border: '1px solid var(--border)',
        borderRadius: '10px',
        padding: '20px',
        animation: `fadeIn 0.3s ease ${(index % 10) * 0.04}s both`,
        transition: 'border-color 0.15s'
      }}
      onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--border-bright)'}
      onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '14px' }}>
        <span style={{
          fontSize: '11px', fontFamily: 'var(--font-mono)', fontWeight: 700,
          color, background: `${color}18`,
          padding: '3px 10px', borderRadius: '20px',
          border: `1px solid ${color}33`
        }}>
          {pair.category}
        </span>
        <span style={{
          fontSize: '11px', color: 'var(--text-muted)',
          fontFamily: 'var(--font-mono)'
        }}>#{pair.id}</span>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
        <div style={{
          padding: '12px',
          background: 'rgba(255,68,102,0.06)',
          border: '1px solid rgba(255,68,102,0.2)',
          borderRadius: '8px'
        }}>
          <div style={{
            fontSize: '10px', fontWeight: 700, letterSpacing: '0.1em',
            color: 'var(--bias-red)', marginBottom: '8px',
            textTransform: 'uppercase'
          }}>Stereotyped</div>
          <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
            {pair.stereotyped}
          </p>
        </div>

        <div style={{
          padding: '12px',
          background: 'rgba(0,200,150,0.06)',
          border: '1px solid rgba(0,200,150,0.2)',
          borderRadius: '8px'
        }}>
          <div style={{
            fontSize: '10px', fontWeight: 700, letterSpacing: '0.1em',
            color: 'var(--bias-green)', marginBottom: '8px',
            textTransform: 'uppercase'
          }}>Anti-Stereotyped</div>
          <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
            {pair.antiStereotyped}
          </p>
        </div>
      </div>
    </div>
  );
}

export default function SamplePairsExplorer() {
  const [pairs, setPairs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [category, setCategory] = useState('');
  const [search, setSearch] = useState('');
  const [limit, setLimit] = useState(20);

  function loadPairs() {
    setLoading(true);
    biasApi.getSamplePairs(category || undefined, limit)
      .then(data => setPairs(data.pairs))
      .catch(console.error)
      .finally(() => setLoading(false));
  }

  useEffect(() => { loadPairs(); }, [category, limit]);

  const filtered = pairs.filter(p =>
    !search ||
    p.stereotyped.toLowerCase().includes(search.toLowerCase()) ||
    p.antiStereotyped.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div style={{ padding: '32px', maxWidth: '1100px' }}>
      {/* Header */}
      <div className="fade-in" style={{ marginBottom: '28px' }}>
        <h1 style={{ fontSize: '26px', fontWeight: 700, marginBottom: '6px' }}>Sample Pairs Explorer</h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>
          Browse the CrowS-Pairs sentence dataset used for bias evaluation
        </p>
      </div>

      {/* Filters */}
      <div className="fade-in-1" style={{
        background: 'var(--bg-card)', border: '1px solid var(--border)',
        borderRadius: '12px', padding: '20px', marginBottom: '20px'
      }}>
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center' }}>
          {/* Search */}
          <div style={{ position: 'relative', flex: '1', minWidth: '200px' }}>
            <Search size={14} style={{
              position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)',
              color: 'var(--text-muted)'
            }} />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search sentence pairs..."
              style={{
                width: '100%',
                paddingLeft: '36px', paddingRight: '14px',
                paddingTop: '9px', paddingBottom: '9px',
                background: 'var(--bg-secondary)',
                border: '1px solid var(--border)',
                borderRadius: '8px',
                color: 'var(--text-primary)', fontSize: '13px'
              }}
            />
          </div>

          {/* Category filter */}
          <div style={{ position: 'relative' }}>
            <Filter size={14} style={{
              position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)',
              color: 'var(--text-muted)', zIndex: 1, pointerEvents: 'none'
            }} />
            <select
              value={category}
              onChange={e => setCategory(e.target.value)}
              style={{
                paddingLeft: '36px', paddingRight: '14px',
                paddingTop: '9px', paddingBottom: '9px',
                background: 'var(--bg-secondary)',
                border: '1px solid var(--border)',
                borderRadius: '8px',
                color: 'var(--text-primary)', fontSize: '13px',
                appearance: 'none'
              }}
            >
              {CATEGORIES.map(c => (
                <option key={c.value} value={c.value}>{c.label}</option>
              ))}
            </select>
          </div>

          {/* Limit */}
          <select
            value={limit}
            onChange={e => setLimit(Number(e.target.value))}
            style={{
              padding: '9px 14px',
              background: 'var(--bg-secondary)',
              border: '1px solid var(--border)',
              borderRadius: '8px',
              color: 'var(--text-primary)', fontSize: '13px',
              appearance: 'none'
            }}
          >
            {[10, 20, 30, 50].map(n => (
              <option key={n} value={n}>Show {n}</option>
            ))}
          </select>

          <button
            onClick={loadPairs}
            style={{
              display: 'flex', alignItems: 'center', gap: '6px',
              padding: '9px 16px',
              background: 'var(--bg-elevated)',
              border: '1px solid var(--border)',
              borderRadius: '8px',
              color: 'var(--text-secondary)', fontSize: '13px',
              transition: 'all 0.15s'
            }}
            onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--accent-cyan)'}
            onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}
          >
            <RefreshCw size={13} style={{ animation: loading ? 'spin 0.8s linear infinite' : 'none' }} />
            Refresh
          </button>

          <span style={{ fontSize: '12px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', marginLeft: 'auto' }}>
            {filtered.length} pairs shown
          </span>
        </div>
      </div>

      {/* Category pills */}
      <div className="fade-in-2" style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '20px' }}>
        {CATEGORIES.slice(1).map(cat => {
          const color = CATEGORY_COLORS[cat.value];
          const active = category === cat.value;
          return (
            <button
              key={cat.value}
              onClick={() => setCategory(active ? '' : cat.value)}
              style={{
                padding: '5px 14px',
                borderRadius: '20px',
                border: `1px solid ${active ? color : 'var(--border)'}`,
                background: active ? `${color}18` : 'transparent',
                color: active ? color : 'var(--text-muted)',
                fontSize: '12px', fontWeight: active ? 600 : 400,
                transition: 'all 0.15s'
              }}
            >
              {cat.label}
            </button>
          );
        })}
      </div>

      {/* Pairs Grid */}
      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '48px' }}>
          <div style={{
            width: 28, height: 28,
            border: '2px solid var(--border)',
            borderTop: '2px solid var(--accent-cyan)',
            borderRadius: '50%',
            animation: 'spin 0.8s linear infinite'
          }} />
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {filtered.map((pair, i) => (
            <PairCard key={pair.id} pair={pair} index={i} />
          ))}
          {filtered.length === 0 && (
            <div style={{ padding: '48px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '14px' }}>
              No pairs found for the current filters
            </div>
          )}
        </div>
      )}
    </div>
  );
}

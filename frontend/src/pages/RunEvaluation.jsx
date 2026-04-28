import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion, AnimatePresence } from 'framer-motion';
import { biasApi } from '../lib/api';
import { Play, Loader, CheckCircle, X } from 'lucide-react';

const CATEGORIES = [
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

const MODELS = [
  { value: 'gpt-5-mini', label: 'GPT-5 Mini', provider: 'OpenAI' },
  { value: 'gpt-5', label: 'GPT-5', provider: 'OpenAI' },
  { value: 'gpt-5.2', label: 'GPT-5.2', provider: 'OpenAI' },
  { value: 'gemini-flash', label: 'Gemini Flash', provider: 'Google' },
  { value: 'gemini-pro', label: 'Gemini Pro', provider: 'Google' },
];

const schema = z.object({
  evaluationName: z.string().optional(),
  model: z.string().min(1, 'Select a model'),
  categories: z.array(z.string()).min(1, 'Select at least one category'),
  pairsPerCategory: z.number().min(1).max(20),
});

const LOAD_MESSAGES = [
  'Initializing bias evaluation engine...',
  'Sampling sentence pairs from dataset...',
  'Querying LLM for plausibility scores...',
  'Analyzing stereotyped vs anti-stereotyped responses...',
  'Computing bias metrics per category...',
  'Finalizing bias score calculations...',
];

function LoadingOverlay({ model, totalPairs }) {
  const [msgIdx, setMsgIdx] = useState(0);

  useState(() => {
    const interval = setInterval(() => {
      setMsgIdx(i => (i + 1) % LOAD_MESSAGES.length);
    }, 2800);
    return () => clearInterval(interval);
  });

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      style={{
        position: 'fixed', inset: 0, zIndex: 9999,
        background: 'rgba(10,12,16,0.92)',
        backdropFilter: 'blur(8px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center'
      }}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        style={{
          background: 'var(--bg-card)',
          border: '1px solid var(--border-bright)',
          borderRadius: '16px',
          padding: '48px',
          textAlign: 'center',
          maxWidth: '440px', width: '90%',
          boxShadow: '0 0 60px rgba(0,229,255,0.1)'
        }}
      >
        {/* Spinner */}
        <div style={{ position: 'relative', width: 80, height: 80, margin: '0 auto 28px' }}>
          <div style={{
            position: 'absolute', inset: 0,
            border: '3px solid var(--border)',
            borderTop: '3px solid var(--accent-cyan)',
            borderRadius: '50%',
            animation: 'spin 0.9s linear infinite'
          }} />
          <div style={{
            position: 'absolute', inset: 8,
            border: '2px solid var(--border)',
            borderBottom: '2px solid var(--accent-blue)',
            borderRadius: '50%',
            animation: 'spin 1.4s linear infinite reverse'
          }} />
        </div>

        <h3 style={{ fontSize: '20px', fontWeight: 700, marginBottom: '8px' }}>
          Evaluating Model
        </h3>
        <div style={{
          fontFamily: 'var(--font-mono)', fontSize: '13px',
          color: 'var(--accent-cyan)', marginBottom: '20px'
        }}>{model}</div>

        <AnimatePresence mode="wait">
          <motion.div
            key={msgIdx}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            style={{
              fontSize: '13px', color: 'var(--text-secondary)',
              minHeight: '20px', marginBottom: '24px'
            }}
          >
            {LOAD_MESSAGES[msgIdx]}
          </motion.div>
        </AnimatePresence>

        <div style={{
          fontSize: '12px', color: 'var(--text-muted)',
          fontFamily: 'var(--font-mono)',
          background: 'var(--bg-secondary)',
          padding: '8px 16px', borderRadius: '6px'
        }}>
          Testing {totalPairs} sentence pairs · This may take 30–120s
        </div>
      </motion.div>
    </motion.div>
  );
}

export default function RunEvaluation() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      model: 'gpt-5-mini',
      categories: ['race-color', 'gender'],
      pairsPerCategory: 5,
      evaluationName: ''
    }
  });

  const selectedCategories = watch('categories') || [];
  const pairsPerCategory = watch('pairsPerCategory') || 5;
  const selectedModel = watch('model');

  function toggleCategory(val) {
    if (selectedCategories.includes(val)) {
      setValue('categories', selectedCategories.filter(c => c !== val));
    } else {
      setValue('categories', [...selectedCategories, val]);
    }
  }

  async function onSubmit(data) {
    setLoading(true);
    setError(null);
    try {
      const result = await biasApi.evaluate(data);
      navigate(`/results/${result.id}`);
    } catch (err) {
      setError(err.response?.data?.error || 'Evaluation failed. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  const totalPairs = selectedCategories.length * pairsPerCategory;

  const inputStyle = {
    width: '100%',
    background: 'var(--bg-secondary)',
    border: '1px solid var(--border)',
    borderRadius: '8px',
    padding: '10px 14px',
    color: 'var(--text-primary)',
    fontSize: '14px',
    transition: 'border-color 0.15s'
  };

  const labelStyle = {
    display: 'block',
    fontSize: '13px',
    fontWeight: 500,
    color: 'var(--text-secondary)',
    marginBottom: '8px'
  };

  return (
    <div style={{ padding: '32px', maxWidth: '700px' }}>
      <AnimatePresence>
        {loading && <LoadingOverlay model={selectedModel} totalPairs={totalPairs} />}
      </AnimatePresence>

      <div className="fade-in" style={{ marginBottom: '28px' }}>
        <h1 style={{ fontSize: '26px', fontWeight: 700, marginBottom: '6px' }}>Run Evaluation</h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>
          Configure and launch a CrowS-Pairs bias evaluation against an LLM
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)}>
        {/* Evaluation Name */}
        <div className="fade-in-1" style={{
          background: 'var(--bg-card)', border: '1px solid var(--border)',
          borderRadius: '12px', padding: '24px', marginBottom: '16px'
        }}>
          <label style={labelStyle}>Evaluation Name <span style={{ color: 'var(--text-muted)' }}>(optional)</span></label>
          <input
            {...register('evaluationName')}
            placeholder="e.g., GPT-5 Gender Bias Test"
            style={inputStyle}
            onFocus={e => e.target.style.borderColor = 'var(--accent-cyan)'}
            onBlur={e => e.target.style.borderColor = 'var(--border)'}
          />
        </div>

        {/* Model */}
        <div className="fade-in-2" style={{
          background: 'var(--bg-card)', border: '1px solid var(--border)',
          borderRadius: '12px', padding: '24px', marginBottom: '16px'
        }}>
          <label style={labelStyle}>Model</label>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
            {MODELS.map(m => {
              const selected = selectedModel === m.value;
              return (
                <button
                  key={m.value}
                  type="button"
                  onClick={() => setValue('model', m.value)}
                  style={{
                    padding: '12px',
                    borderRadius: '8px',
                    border: `1px solid ${selected ? 'var(--accent-cyan)' : 'var(--border)'}`,
                    background: selected ? 'rgba(0,229,255,0.08)' : 'var(--bg-secondary)',
                    color: selected ? 'var(--accent-cyan)' : 'var(--text-secondary)',
                    textAlign: 'left',
                    transition: 'all 0.15s'
                  }}
                >
                  <div style={{ fontSize: '13px', fontWeight: 600, marginBottom: '2px' }}>{m.label}</div>
                  <div style={{ fontSize: '11px', opacity: 0.6 }}>{m.provider}</div>
                </button>
              );
            })}
          </div>
          {errors.model && <p style={{ color: 'var(--bias-red)', fontSize: '12px', marginTop: '8px' }}>{errors.model.message}</p>}
        </div>

        {/* Categories */}
        <div className="fade-in-3" style={{
          background: 'var(--bg-card)', border: '1px solid var(--border)',
          borderRadius: '12px', padding: '24px', marginBottom: '16px'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <label style={{ ...labelStyle, marginBottom: 0 }}>Bias Categories</label>
            <button
              type="button"
              onClick={() => setValue('categories', CATEGORIES.map(c => c.value))}
              style={{ fontSize: '12px', color: 'var(--accent-cyan)', background: 'none', padding: '4px 8px' }}
            >
              Select all
            </button>
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
            {CATEGORIES.map(cat => {
              const selected = selectedCategories.includes(cat.value);
              return (
                <button
                  key={cat.value}
                  type="button"
                  onClick={() => toggleCategory(cat.value)}
                  style={{
                    padding: '7px 14px',
                    borderRadius: '20px',
                    border: `1px solid ${selected ? 'var(--accent-blue)' : 'var(--border)'}`,
                    background: selected ? 'rgba(68,136,255,0.12)' : 'var(--bg-secondary)',
                    color: selected ? 'var(--accent-blue)' : 'var(--text-muted)',
                    fontSize: '13px', fontWeight: selected ? 600 : 400,
                    display: 'flex', alignItems: 'center', gap: '6px',
                    transition: 'all 0.15s'
                  }}
                >
                  {selected && <CheckCircle size={12} />}
                  {cat.label}
                </button>
              );
            })}
          </div>
          {errors.categories && <p style={{ color: 'var(--bias-red)', fontSize: '12px', marginTop: '8px' }}>{errors.categories.message}</p>}
        </div>

        {/* Pairs per category */}
        <div className="fade-in-4" style={{
          background: 'var(--bg-card)', border: '1px solid var(--border)',
          borderRadius: '12px', padding: '24px', marginBottom: '24px'
        }}>
          <label style={labelStyle}>Pairs per Category: <span style={{ color: 'var(--accent-cyan)', fontFamily: 'var(--font-mono)' }}>{pairsPerCategory}</span></label>
          <input
            type="range" min={1} max={20}
            {...register('pairsPerCategory', { valueAsNumber: true })}
            style={{ width: '100%', accentColor: 'var(--accent-cyan)', height: '4px' }}
          />
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px' }}>
            <span>1 (fast)</span>
            <span>20 (thorough)</span>
          </div>

          <div style={{
            marginTop: '16px',
            padding: '12px 16px',
            background: 'var(--bg-secondary)',
            borderRadius: '8px',
            fontSize: '13px',
            color: 'var(--text-secondary)',
            display: 'flex', justifyContent: 'space-between'
          }}>
            <span>Total pairs to test:</span>
            <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--accent-cyan)', fontWeight: 700 }}>
              {totalPairs} pairs
            </span>
          </div>
        </div>

        {error && (
          <div style={{
            padding: '12px 16px', marginBottom: '16px',
            background: 'rgba(255,68,102,0.1)', border: '1px solid rgba(255,68,102,0.3)',
            borderRadius: '8px', color: 'var(--bias-red)', fontSize: '13px',
            display: 'flex', alignItems: 'center', gap: '8px'
          }}>
            <X size={14} />
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          style={{
            width: '100%',
            padding: '14px',
            background: loading ? 'var(--border)' : 'var(--accent-cyan)',
            color: loading ? 'var(--text-muted)' : '#000',
            fontWeight: 700, fontSize: '15px',
            borderRadius: '10px',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
            transition: 'all 0.15s',
            cursor: loading ? 'not-allowed' : 'pointer'
          }}
        >
          {loading ? <Loader size={16} style={{ animation: 'spin 0.8s linear infinite' }} /> : <Play size={16} />}
          {loading ? 'Running Evaluation...' : 'Start Evaluation'}
        </button>
      </form>
    </div>
  );
}

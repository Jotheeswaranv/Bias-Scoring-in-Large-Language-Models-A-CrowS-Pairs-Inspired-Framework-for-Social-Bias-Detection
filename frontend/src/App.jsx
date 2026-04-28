import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Dashboard from './pages/Dashboard';
import RunEvaluation from './pages/RunEvaluation';
import EvaluationResults from './pages/EvaluationResults';
import SamplePairsExplorer from './pages/SamplePairsExplorer';

export default function App() {
  return (
    <BrowserRouter>
      <div style={{ display: 'flex', minHeight: '100vh' }}>
        <Sidebar />
        <main style={{
          marginLeft: 'var(--sidebar-width)',
          flex: 1,
          minHeight: '100vh',
          background: 'var(--bg-primary)',
          overflowY: 'auto'
        }}>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/evaluate" element={<RunEvaluation />} />
            <Route path="/results/:id" element={<EvaluationResults />} />
            <Route path="/explore" element={<SamplePairsExplorer />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}

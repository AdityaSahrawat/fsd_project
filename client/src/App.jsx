import { useEffect } from 'react';
import { AuthProvider } from './context/AuthContext';
import { ProblemProvider, useProblem } from './context/ProblemContext';
import Header from './components/Header';
import ProblemCard from './components/ProblemCard';
import './App.css';

const HomePage = () => {
  const { problems, loading, fetchProblems } = useProblem();

  useEffect(() => {
    fetchProblems();
  }, [fetchProblems]);

  return (
    <div className="home-page">
      <div className="container">
        <div className="page-header">
          <h1>Campus Issues</h1>
          <p>Report and track campus facility problems</p>
        </div>

        {loading ? (
          <div className="loading">
            <div className="spinner"></div>
            <p>Loading problems...</p>
          </div>
        ) : problems.length > 0 ? (
          <div className="problems-list">
            {problems.map((problem) => (
              <ProblemCard key={problem.id} problem={problem} />
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <div className="empty-icon">📋</div>
            <h2>No problems reported yet</h2>
            <p>Be the first to report a campus issue!</p>
          </div>
        )}
      </div>
    </div>
  );
};

function App() {
  return (
    <AuthProvider>
      <ProblemProvider>
        <div className="app">
          <Header />
          <HomePage />
        </div>
      </ProblemProvider>
    </AuthProvider>
  );
}

export default App;

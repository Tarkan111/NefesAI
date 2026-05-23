import { MainLayout } from './components/MainLayout';
import { Home } from './components/Home';
import { Journal } from './components/Journal';
import { SoundsPlayer } from './components/SoundsPlayer';
import { useState } from 'react';

function App() {
  const [currentPage, setCurrentPage] = useState('home');

  const renderCurrentPage = () => {
    switch (currentPage) {
      case 'home':
        return <Home />;
      case 'journal':
        return <Journal />;
      case 'sounds':
        return <SoundsPlayer />;
      default:
        return <Home />;
    }
  };

  return (
    <MainLayout currentPage={currentPage} onNavigate={setCurrentPage}>
      {renderCurrentPage()}
    </MainLayout>
  );
}

export default App;

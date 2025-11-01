import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { BookCollectionProvider } from './contexts/BookCollectionContext';
import Navigation from './components/Navigation';
import HomePage from './pages/HomePage';
import SearchPage from './pages/SearchPage';
import CollectionPage from './pages/CollectionPage';
import BookDetailsPage from './pages/BookDetailsPage';

function App() {
  return (
    <BookCollectionProvider>
      <BrowserRouter>
        <div className="min-h-screen bg-gray-50">
          <Navigation />
          <main className="px-4 py-8">
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/search" element={<SearchPage />} />
              <Route path="/collection" element={<CollectionPage />} />
              <Route path="/book/:id" element={<BookDetailsPage />} />
            </Routes>
          </main>
        </div>
      </BrowserRouter>
    </BookCollectionProvider>
  );
}

export default App;

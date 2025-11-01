import { useState, useEffect } from 'react';
import { useBookCollection } from '../contexts/BookCollectionContext';
import BookCard from '../components/BookCard';
import Container from '../components/Container';

const SearchPage = () => {
  const [query, setQuery] = useState('');
  const { state, searchBooks, clearSearch } = useBookCollection();
  const { searchResults, isLoading, error, books } = state;

  // Clear search results when component unmounts
  useEffect(() => {
    return () => {
      clearSearch();
    };
  }, [clearSearch]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      searchBooks(query);
    }
  };

  // Check if a book is in the user's collection
  const isInCollection = (bookId: string) => {
    return books.some(book => book.id === bookId);
  };

  return (
    <Container>
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Search Books</h1>

      <form onSubmit={handleSearch} className="mb-8">
        <div className="flex">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by title, author, or ISBN..."
            className="flex-grow p-3 border border-gray-300 rounded-l-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            type="submit"
            className="bg-blue-500 text-white px-6 py-3 rounded-r-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={isLoading}
          >
            {isLoading ? 'Searching...' : 'Search'}
          </button>
        </div>
      </form>

      {error && (
        <div className="bg-red-100 text-red-700 p-4 rounded-lg mb-6">
          {error}
        </div>
      )}

      {isLoading && (
        <div className="text-center py-10">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-blue-500 border-t-transparent"></div>
          <p className="mt-2 text-gray-600">Searching for books...</p>
        </div>
      )}

      {!isLoading && searchResults.length === 0 && query && !error && (
        <div className="text-center py-10">
          <p className="text-gray-600">No books found for "{query}"</p>
        </div>
      )}

      {searchResults.length > 0 && (
        <div>
          <h2 className="text-xl font-semibold text-gray-700 mb-4">Search Results</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-2 gap-6">
            {searchResults.map(book => (
              <BookCard
                key={book.id}
                book={book}
                isInCollection={isInCollection(book.id)}
                showStatus={false}
              />
            ))}
          </div>
        </div>
      )}
    </Container>
  );
};

export default SearchPage;

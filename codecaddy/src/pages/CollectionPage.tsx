import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useBookCollection } from '../contexts/BookCollectionContext';
import BookCard from '../components/BookCard';
import Container from '../components/Container';
import type { Book, BookStatus } from '../shared/types';

const CollectionPage = () => {
  const { state } = useBookCollection();
  const [filter, setFilter] = useState<'all' | BookStatus>('all');

  const getFilteredBooks = (): Book[] => {
    if (filter === 'all') return state.books;
    return state.books.filter(book => book.status === filter);
  };

  const filteredBooks = getFilteredBooks();

  return (
    <Container>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">My Collection</h1>
        <Link
          to="/search"
          className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg transition-colors"
        >
          Add Books
        </Link>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 mb-6 overflow-x-auto">
        <button
          onClick={() => setFilter('all')}
          className={`px-4 py-2 rounded-lg font-semibold transition-colors whitespace-nowrap ${
            filter === 'all'
              ? 'bg-blue-500 text-white'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          All ({state.books.length})
        </button>
        <button
          onClick={() => setFilter('currently-reading')}
          className={`px-4 py-2 rounded-lg font-semibold transition-colors whitespace-nowrap ${
            filter === 'currently-reading'
              ? 'bg-blue-500 text-white'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          Reading ({state.currentlyReading.length})
        </button>
        <button
          onClick={() => setFilter('want-to-read')}
          className={`px-4 py-2 rounded-lg font-semibold transition-colors whitespace-nowrap ${
            filter === 'want-to-read'
              ? 'bg-blue-500 text-white'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          Want to Read ({state.wantToRead.length})
        </button>
        <button
          onClick={() => setFilter('have-read')}
          className={`px-4 py-2 rounded-lg font-semibold transition-colors whitespace-nowrap ${
            filter === 'have-read'
              ? 'bg-blue-500 text-white'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          Have Read ({state.haveRead.length})
        </button>
      </div>

      {/* Empty State */}
      {state.books.length === 0 && (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <p className="text-gray-600 text-lg mb-4">Your collection is empty.</p>
          <Link
            to="/search"
            className="inline-block bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-6 rounded-lg transition-colors"
          >
            Search for Books
          </Link>
        </div>
      )}

      {/* Filtered Empty State */}
      {state.books.length > 0 && filteredBooks.length === 0 && (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <p className="text-gray-600 text-lg">
            No books in this category yet.
          </p>
        </div>
      )}

      {/* Books Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredBooks.map((book) => (
          <BookCard
            key={book.id}
            book={book}
            isInCollection={true}
            showStatus={true}
          />
        ))}
      </div>
    </Container>
  );
};

export default CollectionPage;

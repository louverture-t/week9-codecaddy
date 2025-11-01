import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useBookCollection } from '../contexts/BookCollectionContext';
import Container from '../components/Container';
import type { Book, BookStatus } from '../shared/types';
import { getBooksApi } from '../services/mockBooksApi';
import { mapGoogleBookToBook } from '../utils/bookMappers';

const BookDetailsPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { state, addBook, updateBookStatus, removeBook } = useBookCollection();
  const { books } = state;

  const [book, setBook] = useState<Book | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedStatus, setSelectedStatus] = useState<BookStatus>('want-to-read');

  // Check if book is in collection
  const collectionBook = books.find(b => b.id === id);
  const isInCollection = !!collectionBook;

  useEffect(() => {
    const fetchBookDetails = async () => {
      if (!id) return;

      // If book is in collection, use that data
      if (collectionBook) {
        setBook(collectionBook);
        setIsLoading(false);
        setError(null);
        return;
      }

      // Otherwise fetch from API
      try {
        setIsLoading(true);
        setError(null);

        const booksApi = await getBooksApi();
        const bookData = await booksApi.getBookById(id);
        const mappedBook = mapGoogleBookToBook(bookData);
        setBook(mappedBook);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load book details');
        setBook(null);
      } finally {
        setIsLoading(false);
      }
    };

    fetchBookDetails();
  }, [id, collectionBook]);

  const handleStatusChange = (status: BookStatus) => {
    if (book && isInCollection) {
      updateBookStatus(book.id, status);
    }
  };

  const handleStatusSelection = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedStatus(e.target.value as BookStatus);
  };

  const handleCollectionToggle = () => {
    if (!book) return;

    if (isInCollection) {
      removeBook(book.id);
    } else {
      // Add book with the selected status
      addBook({ ...book, status: selectedStatus });
    }
  };

  if (isLoading) {
    return (
      <Container className="text-center py-10">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-blue-500 border-t-transparent"></div>
        <p className="mt-2 text-gray-600">Loading book details...</p>
      </Container>
    );
  }

  if (error) {
    return (
      <Container>
        <div className="bg-red-100 text-red-700 p-4 rounded-lg mb-6">
          {error}
        </div>
        <button
          onClick={() => navigate(-1)}
          className="text-blue-500 hover:text-blue-700"
        >
          ← Go Back
        </button>
      </Container>
    );
  }

  if (!book) {
    return (
      <Container className="text-center py-10">
        <p className="text-gray-600">Book not found</p>
        <button
          onClick={() => navigate(-1)}
          className="mt-4 text-blue-500 hover:text-blue-700"
        >
          ← Go Back
        </button>
      </Container>
    );
  }

  const statusLabels = {
    'want-to-read': 'Want to Read',
    'currently-reading': 'Currently Reading',
    'have-read': 'Have Read'
  };

  return (
    <Container>
      <button
        onClick={() => navigate(-1)}
        className="text-blue-500 hover:text-blue-700 mb-6 inline-flex items-center"
      >
        ← Go Back
      </button>

      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="md:flex">
          <div className="md:w-1/3 bg-gray-100 flex justify-center p-6">
            <img
              src={book.thumbnail}
              alt={`Cover of ${book.title}`}
              className="h-64 object-contain"
            />
          </div>

          <div className="md:w-2/3 p-6">
            <h1 className="text-2xl font-bold text-gray-800 mb-2">{book.title}</h1>
            <p className="text-gray-600 mb-4">{book.author}</p>
            <p className="text-gray-500 text-sm mb-6">Published: {book.publishedDate}</p>

            <div className="mb-6">
              <h2 className="text-lg font-semibold text-gray-700 mb-2">Description</h2>
              <p className="text-gray-700">{book.description}</p>
            </div>

            <div className="flex flex-col md:flex-row md:items-center space-y-4 md:space-y-0 md:space-x-4">
              {isInCollection ? (
                <div className="flex-grow">
                  <h2 className="text-sm font-semibold text-gray-700 mb-1">Reading Status</h2>
                  <select
                    value={book.status}
                    onChange={(e) => handleStatusChange(e.target.value as BookStatus)}
                    className="w-full p-2 border border-gray-300 rounded"
                  >
                    {Object.entries(statusLabels).map(([value, label]) => (
                      <option key={value} value={value}>{label}</option>
                    ))}
                  </select>
                </div>
              ) : (
                <div className="flex-grow">
                  <h2 className="text-sm font-semibold text-gray-700 mb-1">Add as</h2>
                  <select
                    value={selectedStatus}
                    onChange={handleStatusSelection}
                    className="w-full p-2 border border-gray-300 rounded"
                  >
                    {Object.entries(statusLabels).map(([value, label]) => (
                      <option key={value} value={value}>{label}</option>
                    ))}
                  </select>
                </div>
              )}

              <button
                onClick={handleCollectionToggle}
                className={`px-4 py-2 rounded font-medium ${
                  isInCollection
                    ? 'bg-red-100 text-red-700 hover:bg-red-200'
                    : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                }`}
              >
                {isInCollection ? 'Remove from Collection' : 'Add to Collection'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </Container>
  );
};

export default BookDetailsPage;

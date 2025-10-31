import { useState } from 'react';
import { Link } from 'react-router-dom';
import type { Book, BookStatus } from '../shared/types';
import { useBookCollection } from '../contexts/BookCollectionContext';

interface BookCardProps {
  book: Book;
  isInCollection?: boolean;
  showStatus?: boolean;
  compact?: boolean;
}

const BookCard = ({ book, isInCollection = false, showStatus = true, compact = false }: BookCardProps) => {
  const { addBook, removeBook, updateBookStatus } = useBookCollection();
  const [isHovered, setIsHovered] = useState(false);

  const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    updateBookStatus(book.id, e.target.value as BookStatus);
  };

  const handleCollectionToggle = () => {
    if (isInCollection) {
      removeBook(book.id);
    }
  };

  const statusColors = {
    'want-to-read': 'bg-blue-100 text-blue-800',
    'currently-reading': 'bg-orange-100 text-orange-800',
    'have-read': 'bg-green-100 text-green-800'
  };

  const statusLabels = {
    'want-to-read': 'Want to Read',
    'currently-reading': 'Currently Reading',
    'have-read': 'Have Read'
  };

  return (
    <div
      className={`bg-white rounded-lg shadow-md overflow-hidden transition-shadow duration-300 ${isHovered ? 'shadow-lg' : ''} ${compact ? 'flex' : ''}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className={`${compact ? 'w-24 flex-shrink-0' : 'h-48 flex justify-center bg-gray-100'}`}>
        <img
          src={book.thumbnail}
          alt={`Cover of ${book.title}`}
          className={`${compact ? 'h-full w-full object-cover' : 'h-full object-contain'}`}
        />
      </div>

      <div className="p-4 flex flex-col h-full justify-between flex-grow">
        <div>
          <h3 className="font-bold text-lg mb-1 line-clamp-1">{book.title}</h3>
          <p className="text-gray-600 mb-2 text-sm">{book.author}</p>
          <p className="text-gray-500 text-xs">{book.publishedDate}</p>

          {!compact && (
            <p className="mt-2 text-sm line-clamp-2 text-gray-700">
              {book.description}
            </p>
          )}
        </div>

        <div className="mt-4 flex flex-col space-y-2">
          {/* Show status selector and badge for books in collection */}
          {isInCollection && (
            <>
              {showStatus && (
                <div className="flex items-center">
                  <span className="text-xs mr-2">Status:</span>
                  <select
                    value={book.status}
                    onChange={handleStatusChange}
                    className="text-sm border rounded p-1 flex-grow"
                  >
                    <option value="want-to-read">Want to Read</option>
                    <option value="currently-reading">Currently Reading</option>
                    <option value="have-read">Have Read</option>
                  </select>
                </div>
              )}

              {showStatus && (
                <div className={`text-xs px-2 py-1 rounded-full inline-flex items-center w-fit ${statusColors[book.status]}`}>
                  {statusLabels[book.status]}
                </div>
              )}
            </>
          )}

          {/* Action buttons for books NOT in collection */}
          {!isInCollection && (
            <div className="space-y-2">
              <p className="text-xs font-medium text-gray-700">Add to Collection:</p>
              <div className="grid grid-cols-3 gap-2">
                <button
                  onClick={() => {
                    addBook({ ...book, status: 'want-to-read' });
                  }}
                  className="px-2 py-1.5 rounded text-xs font-medium transition-colors duration-200 bg-blue-100 text-blue-700 hover:bg-blue-200 border border-blue-300"
                  title="Add to Want to Read"
                >
                  Want to Read
                </button>
                <button
                  onClick={() => {
                    addBook({ ...book, status: 'currently-reading' });
                  }}
                  className="px-2 py-1.5 rounded text-xs font-medium transition-colors duration-200 bg-orange-100 text-orange-700 hover:bg-orange-200 border border-orange-300"
                  title="Mark as Currently Reading"
                >
                  Reading
                </button>
                <button
                  onClick={() => {
                    addBook({ ...book, status: 'have-read' });
                  }}
                  className="px-2 py-1.5 rounded text-xs font-medium transition-colors duration-200 bg-green-100 text-green-700 hover:bg-green-200 border border-green-300"
                  title="Mark as Completed"
                >
                  Completed
                </button>
              </div>
            </div>
          )}

          <div className="flex justify-between items-center mt-2">
            <Link
              to={`/book/${book.id}`}
              className="text-blue-600 hover:text-blue-800 text-sm font-medium"
            >
              View Details
            </Link>

            {isInCollection && (
              <button
                onClick={handleCollectionToggle}
                className="px-3 py-1 rounded text-sm font-medium transition-colors duration-200 bg-red-100 text-red-700 hover:bg-red-200"
              >
                Remove
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookCard;

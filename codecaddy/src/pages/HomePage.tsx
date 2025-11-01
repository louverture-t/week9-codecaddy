import { useNavigate } from 'react-router-dom';
import { useBookCollection } from '../contexts/BookCollectionContext';
import Container from '../components/Container';

const HomePage = () => {
  const navigate = useNavigate();
  const { state, getBooksByStatus } = useBookCollection();

  const totalBooks = state.books.length;
  const currentlyReading = getBooksByStatus('currently-reading').length;
  const haveRead = getBooksByStatus('have-read').length;

  // Calculate reading progress percentage
  const readingProgress = totalBooks > 0
    ? Math.round((haveRead / totalBooks) * 100)
    : 0;

  return (
    <Container>
      <h1 className="text-3xl font-bold text-gray-800 mb-8">Your Reading Dashboard</h1>

      {/* Stats Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-lg font-semibold text-gray-700 mb-2">Total Books</h2>
          <p className="text-4xl font-bold text-blue-500">{totalBooks}</p>
          <p className="text-sm text-gray-500 mt-2">Books in your collection</p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-lg font-semibold text-gray-700 mb-2">Currently Reading</h2>
          <p className="text-4xl font-bold text-orange-500">{currentlyReading}</p>
          <p className="text-sm text-gray-500 mt-2">Books in progress</p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-lg font-semibold text-gray-700 mb-2">Completed</h2>
          <p className="text-4xl font-bold text-green-500">{haveRead}</p>
          <p className="text-sm text-gray-500 mt-2">Books finished</p>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="bg-white p-6 rounded-lg shadow-md mb-10">
        <h2 className="text-lg font-semibold text-gray-700 mb-4">Reading Progress</h2>
        <div className="w-full bg-gray-200 rounded-full h-4">
          <div
            className="bg-blue-500 h-4 rounded-full transition-all duration-300"
            style={{ width: `${readingProgress}%` }}
            role="progressbar"
            aria-valuenow={readingProgress}
            aria-valuemin={0}
            aria-valuemax={100}
          ></div>
        </div>
        <p className="text-sm text-gray-500 mt-2">{readingProgress}% of your collection completed</p>
      </div>

      {/* Quick Actions */}
      <h2 className="text-2xl font-bold text-gray-800 mb-4">Quick Actions</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <button
          onClick={() => navigate('/search')}
          className="bg-blue-500 text-white p-6 rounded-lg shadow-md cursor-pointer hover:bg-blue-600 transition-colors text-left"
        >
          <h3 className="text-xl font-bold mb-2">Start Searching</h3>
          <p>Discover new books to add to your collection</p>
        </button>

        <button
          onClick={() => navigate('/collection')}
          className="bg-orange-500 text-white p-6 rounded-lg shadow-md cursor-pointer hover:bg-orange-600 transition-colors text-left"
        >
          <h3 className="text-xl font-bold mb-2">View Collection</h3>
          <p>Browse and manage your book collection</p>
        </button>
      </div>
    </Container>
  );
};

export default HomePage;

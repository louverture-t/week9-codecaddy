import React, { createContext, useContext, useReducer, useEffect, useCallback } from 'react';
import type { Book, BookStatus, BookCollectionState, BookCollectionContextType } from '../shared/types';
import { getBooksApi } from '../services/mockBooksApi';
import { mapGoogleBookToBook } from '../utils/bookMappers';

// Local storage key
const STORAGE_KEY = 'codecaddy_book_collection';

// Helper function to compute derived arrays from books
const computeDerivedArrays = (books: Book[]) => ({
  currentlyReading: books.filter(b => b.status === 'currently-reading'),
  wantToRead: books.filter(b => b.status === 'want-to-read'),
  haveRead: books.filter(b => b.status === 'have-read')
});

// Initial state with derived arrays
const initialState: BookCollectionState = {
  books: [],
  searchResults: [],
  isLoading: false,
  error: null,
  currentlyReading: [],
  wantToRead: [],
  haveRead: []
};

// Action types
type Action =
  | { type: 'ADD_BOOK'; payload: Book }
  | { type: 'REMOVE_BOOK'; payload: string }
  | { type: 'UPDATE_BOOK_STATUS'; payload: { id: string; status: BookStatus } }
  | { type: 'SET_SEARCH_RESULTS'; payload: Book[] }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'CLEAR_SEARCH' }
  | { type: 'LOAD_FROM_STORAGE'; payload: Book[] };

// Reducer function
const bookCollectionReducer = (state: BookCollectionState, action: Action): BookCollectionState => {
  switch (action.type) {
    case 'ADD_BOOK': {
      // Prevent duplicates - remove existing book with same ID if present
      const updatedBooks = [...state.books.filter(book => book.id !== action.payload.id), action.payload];
      return {
        ...state,
        books: updatedBooks,
        ...computeDerivedArrays(updatedBooks)
      };
    }

    case 'REMOVE_BOOK': {
      const updatedBooks = state.books.filter(book => book.id !== action.payload);
      return {
        ...state,
        books: updatedBooks,
        ...computeDerivedArrays(updatedBooks)
      };
    }

    case 'UPDATE_BOOK_STATUS': {
      const updatedBooks = state.books.map(book =>
        book.id === action.payload.id ? { ...book, status: action.payload.status } : book
      );
      return {
        ...state,
        books: updatedBooks,
        ...computeDerivedArrays(updatedBooks)
      };
    }

    case 'SET_SEARCH_RESULTS':
      return {
        ...state,
        searchResults: action.payload,
        isLoading: false,
        error: null
      };

    case 'SET_LOADING':
      return {
        ...state,
        isLoading: action.payload
      };

    case 'SET_ERROR':
      return {
        ...state,
        error: action.payload,
        isLoading: false
      };

    case 'CLEAR_SEARCH':
      return {
        ...state,
        searchResults: [],
        error: null
      };

    case 'LOAD_FROM_STORAGE':
      return {
        ...state,
        books: action.payload,
        ...computeDerivedArrays(action.payload)
      };

    default:
      return state;
  }
};

// Create context
const BookCollectionContext = createContext<BookCollectionContextType | undefined>(undefined);

// Provider component
export const BookCollectionProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Load initial state from localStorage
  const loadInitialState = (): BookCollectionState => {
    try {
      const savedBooks = localStorage.getItem(STORAGE_KEY);
      if (savedBooks) {
        const books: Book[] = JSON.parse(savedBooks);
        // Validate that books is an array
        if (Array.isArray(books)) {
          return {
            ...initialState,
            books,
            ...computeDerivedArrays(books)
          };
        }
      }
    } catch (error) {
      console.error('Failed to load books from localStorage:', error);
    }
    return initialState;
  };

  const [state, dispatch] = useReducer(bookCollectionReducer, undefined, loadInitialState);

  // Save to localStorage when books change
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state.books));
    } catch (error) {
      console.error('Failed to save books to localStorage:', error);
      // Handle quota exceeded error
      if (error instanceof DOMException && error.name === 'QuotaExceededError') {
        dispatch({ type: 'SET_ERROR', payload: 'Storage quota exceeded. Please remove some books.' });
      }
    }
  }, [state.books]);

  // Action creators
  const addBook = useCallback((book: Book) => {
    dispatch({ type: 'ADD_BOOK', payload: book });
  }, []);

  const removeBook = useCallback((bookId: string) => {
    dispatch({ type: 'REMOVE_BOOK', payload: bookId });
  }, []);

  const updateBookStatus = useCallback((bookId: string, status: BookStatus) => {
    dispatch({
      type: 'UPDATE_BOOK_STATUS',
      payload: { id: bookId, status }
    });
  }, []);

  const searchBooks = useCallback(async (query: string) => {
    if (!query.trim()) {
      dispatch({ type: 'CLEAR_SEARCH' });
      return;
    }

    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      const booksApi = await getBooksApi();
      const response = await booksApi.searchBooks({ q: query, maxResults: 10 });

      if (!response.items || response.items.length === 0) {
        dispatch({ type: 'SET_SEARCH_RESULTS', payload: [] });
        dispatch({ type: 'SET_ERROR', payload: 'No books found matching your search.' });
        return;
      }

      const mappedBooks = response.items.map(item => mapGoogleBookToBook(item));
      dispatch({ type: 'SET_SEARCH_RESULTS', payload: mappedBooks });
    } catch (error) {
      console.error('Search error:', error);
      dispatch({
        type: 'SET_ERROR',
        payload: error instanceof Error ? error.message : 'An unknown error occurred while searching'
      });
      dispatch({ type: 'SET_SEARCH_RESULTS', payload: [] });
    }
  }, []);

  const clearSearch = useCallback(() => {
    dispatch({ type: 'CLEAR_SEARCH' });
  }, []);

  const getBooksByStatus = useCallback(
    (status: BookStatus): Book[] => {
      return state.books.filter(book => book.status === status);
    },
    [state.books]
  );

  const value: BookCollectionContextType = {
    state,
    addBook,
    removeBook,
    updateBookStatus,
    searchBooks,
    clearSearch,
    getBooksByStatus
  };

  return (
    <BookCollectionContext.Provider value={value}>
      {children}
    </BookCollectionContext.Provider>
  );
};

// Custom hook for using the context
export const useBookCollection = (): BookCollectionContextType => {
  const context = useContext(BookCollectionContext);
  if (context === undefined) {
    throw new Error('useBookCollection must be used within a BookCollectionProvider');
  }
  return context;
};

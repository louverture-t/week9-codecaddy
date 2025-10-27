// Book-related interfaces
export interface Book {
  id: string;
  title: string;
  author: string;
  publishedDate: string;
  description: string;
  thumbnail: string;
  status: BookStatus;
}

export type BookStatus = 'want-to-read' | 'currently-reading' | 'have-read';

// Context-related interfaces
export interface BookCollectionState {
  books: Book[];
  searchResults: Book[];
  isLoading: boolean;
  error: string | null;
  // Derived arrays for fast filtering (per PRD)
  currentlyReading: Book[];
  wantToRead: Book[];
  haveRead: Book[];
}

export interface BookCollectionContextType {
  state: BookCollectionState;
  addBook: (book: Book) => void;
  removeBook: (bookId: string) => void;
  updateBookStatus: (bookId: string, status: BookStatus) => void;
  searchBooks: (query: string) => Promise<void>;
  clearSearch: () => void;
  getBooksByStatus: (status: BookStatus) => Book[];
}

// API-related interfaces
export interface SearchParams {
  q: string;
  startIndex?: number;
  maxResults?: number;
  printType?: string;
  orderBy?: 'relevance' | 'newest';
}

export interface GoogleBooksResponse {
  kind: string;
  totalItems: number;
  items: GoogleBookItem[];
}

export interface GoogleBookItem {
  id: string;
  volumeInfo: {
    title: string;
    authors?: string[];
    publishedDate?: string;
    description?: string;
    imageLinks?: {
      thumbnail?: string;
      smallThumbnail?: string;
    };
    categories?: string[];
    publisher?: string;
    industryIdentifiers?: Array<{
      type: string;
      identifier: string;
    }>;
  };
}

export interface GoogleBooksError {
  error?: {
    code: number;
    message: string;
    errors: Array<{
      message: string;
      domain: string;
      reason: string;
    }>;
  };
}

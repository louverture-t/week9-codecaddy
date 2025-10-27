import type { GoogleBooksResponse, SearchParams } from '../shared/types';

const mockBooks: GoogleBooksResponse = {
  kind: 'books#volumes',
  totalItems: 5,
  items: [
    {
      id: 'mock1',
      volumeInfo: {
        title: 'React - The Complete Guide',
        authors: ['Maximilian Schwarzmüller'],
        publishedDate: '2021',
        description: 'Learn React from the ground up with this comprehensive guide.',
        imageLinks: {
          thumbnail: 'https://via.placeholder.com/128x192.png?text=React'
        }
      }
    },
    {
      id: 'mock2',
      volumeInfo: {
        title: 'JavaScript: The Good Parts',
        authors: ['Douglas Crockford'],
        publishedDate: '2008',
        description: 'A deep dive into the best features of JavaScript and how to use them effectively.',
        imageLinks: {
          thumbnail: 'https://via.placeholder.com/128x192.png?text=JavaScript'
        }
      }
    },
    {
      id: 'mock3',
      volumeInfo: {
        title: 'Clean Code',
        authors: ['Robert C. Martin'],
        publishedDate: '2008',
        description: 'A handbook of agile software craftsmanship with practical advice on writing clean code.',
        imageLinks: {
          thumbnail: 'https://via.placeholder.com/128x192.png?text=Clean+Code'
        }
      }
    },
    {
      id: 'mock4',
      volumeInfo: {
        title: 'The Pragmatic Programmer',
        authors: ['David Thomas', 'Andrew Hunt'],
        publishedDate: '1999',
        description: 'Your journey to mastery in software development.',
        imageLinks: {
          thumbnail: 'https://via.placeholder.com/128x192.png?text=Pragmatic'
        }
      }
    },
    {
      id: 'mock5',
      volumeInfo: {
        title: 'You Don\'t Know JS',
        authors: ['Kyle Simpson'],
        publishedDate: '2015',
        description: 'A deep dive into the core mechanisms of JavaScript.',
        imageLinks: {
          thumbnail: 'https://via.placeholder.com/128x192.png?text=YDKJS'
        }
      }
    }
  ]
};

export const mockBooksApi = {
  searchBooks: async (params: SearchParams): Promise<GoogleBooksResponse> => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));

    // Filter mock books based on query if provided
    const { q } = params;
    if (q) {
      const filtered = mockBooks.items.filter(item =>
        item.volumeInfo.title.toLowerCase().includes(q.toLowerCase()) ||
        item.volumeInfo.authors?.some(author =>
          author.toLowerCase().includes(q.toLowerCase())
        )
      );

      return {
        ...mockBooks,
        totalItems: filtered.length,
        items: filtered
      };
    }

    return mockBooks;
  },

  getBookById: async (bookId: string) => {
    await new Promise(resolve => setTimeout(resolve, 300));
    const book = mockBooks.items.find(item => item.id === bookId);
    if (!book) {
      throw new Error(`Book with ID ${bookId} not found`);
    }
    return book;
  }
};

// Helper function to determine which API to use
export const getBooksApi = async () => {
  const apiKey = import.meta.env.VITE_GOOGLE_BOOKS_API_KEY;

  if (!apiKey) {
    console.warn('Using mock books API due to missing API key');
    return mockBooksApi;
  }

  try {
    // Use the real API if key exists
    const { googleBooksApi } = await import('./googleBooksApi');
    return googleBooksApi;
  } catch (error) {
    console.warn('Using mock books API due to error loading real API:', error);
    return mockBooksApi;
  }
};

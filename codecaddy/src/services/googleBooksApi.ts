import type { GoogleBooksResponse, SearchParams } from '../shared/types';

const API_KEY = import.meta.env.VITE_GOOGLE_BOOKS_API_KEY;
const BASE_URL = 'https://www.googleapis.com/books/v1/volumes';

export const googleBooksApi = {
  searchBooks: async (params: SearchParams): Promise<GoogleBooksResponse> => {
    const { q, maxResults = 10, startIndex = 0 } = params;

    if (!API_KEY) {
      throw new Error('Google Books API key is not configured');
    }

    const url = new URL(BASE_URL);
    url.searchParams.append('q', q);
    url.searchParams.append('maxResults', maxResults.toString());
    url.searchParams.append('startIndex', startIndex.toString());
    url.searchParams.append('key', API_KEY);

    try {
      const response = await fetch(url.toString());

      if (!response.ok) {
        throw new Error(`API request failed with status ${response.status}`);
      }

      const data: GoogleBooksResponse = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching books:', error);
      throw error;
    }
  },

  getBookById: async (bookId: string) => {
    if (!API_KEY) {
      throw new Error('Google Books API key is not configured');
    }

    const url = `${BASE_URL}/${bookId}?key=${API_KEY}`;

    try {
      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(`API request failed with status ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching book details:', error);
      throw error;
    }
  }
};

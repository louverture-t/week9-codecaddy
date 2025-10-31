import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import App from '../App';

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};

  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value;
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    }
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock
});

// Mock the getBooksApi
vi.mock('../services/mockBooksApi', () => ({
  getBooksApi: vi.fn(async () => ({
    searchBooks: vi.fn(async () => ({
      kind: 'books#volumes',
      totalItems: 0,
      items: []
    }))
  }))
}));

describe('App Component', () => {
  beforeEach(() => {
    localStorageMock.clear();
    vi.clearAllMocks();
  });

  it('should render the App with Navigation', async () => {
    render(<App />);

    await waitFor(() => {
      expect(screen.getByText('📚 CodeCaddy')).toBeInTheDocument();
    });
  });

  it('should render HomePage by default', async () => {
    render(<App />);

    await waitFor(() => {
      expect(screen.getByText('Welcome to CodeCaddy')).toBeInTheDocument();
      expect(screen.getByText('Your personal book collection manager')).toBeInTheDocument();
    });
  });

  it('should wrap app with BookCollectionProvider', async () => {
    render(<App />);

    // If provider is working, we should see stats from the context
    await waitFor(() => {
      expect(screen.getByText('Currently Reading')).toBeInTheDocument();
      expect(screen.getByText('Want to Read')).toBeInTheDocument();
      expect(screen.getByText('Have Read')).toBeInTheDocument();
    });
  });

  it('should have navigation links', () => {
    render(<App />);

    // Check for navigation using role
    const navigation = screen.getByRole('navigation');
    expect(navigation).toBeInTheDocument();

    // Verify all links are present
    expect(screen.getByText('Home')).toBeInTheDocument();
    expect(screen.getAllByText('Search').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Collection').length).toBeGreaterThan(0);
  });

  it('should apply consistent layout styling', () => {
    render(<App />);

    const mainElement = screen.getByRole('main');
    expect(mainElement).toHaveClass('container');
    expect(mainElement).toHaveClass('mx-auto');
  });
});

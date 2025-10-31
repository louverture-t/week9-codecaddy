import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Navigation from '../Navigation';
import { BookCollectionProvider } from '../../contexts/BookCollectionContext';

// Mock the BookCollectionContext
const renderWithRouter = (initialRoute = '/') => {
  return render(
    <MemoryRouter initialEntries={[initialRoute]}>
      <BookCollectionProvider>
        <Navigation />
      </BookCollectionProvider>
    </MemoryRouter>
  );
};

describe('Navigation Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render all navigation links', () => {
    renderWithRouter();

    expect(screen.getByText('📚 CodeCaddy')).toBeInTheDocument();
    expect(screen.getByText('Home')).toBeInTheDocument();
    expect(screen.getByText('Search')).toBeInTheDocument();
    expect(screen.getByText('Collection')).toBeInTheDocument();
  });

  it('should highlight the active link on Home page', () => {
    renderWithRouter('/');

    const homeLink = screen.getByText('Home');
    expect(homeLink).toHaveClass('text-orange-300');
    expect(homeLink).toHaveClass('font-semibold');
  });

  it('should highlight the active link on Search page', () => {
    renderWithRouter('/search');

    const searchLink = screen.getByText('Search');
    expect(searchLink).toHaveClass('text-orange-300');
    expect(searchLink).toHaveClass('font-semibold');
  });

  it('should highlight the active link on Collection page', () => {
    renderWithRouter('/collection');

    const collectionLink = screen.getByText('Collection');
    expect(collectionLink).toHaveClass('text-orange-300');
    expect(collectionLink).toHaveClass('font-semibold');
  });

  it('should render the logo with link to home', () => {
    renderWithRouter();

    const logo = screen.getByText('📚 CodeCaddy');
    expect(logo.closest('a')).toHaveAttribute('href', '/');
  });

  it('should have correct href attributes for all links', () => {
    renderWithRouter();

    const homeLink = screen.getByText('Home').closest('a');
    const searchLink = screen.getByText('Search').closest('a');
    const collectionLink = screen.getByText('Collection').closest('a');

    expect(homeLink).toHaveAttribute('href', '/');
    expect(searchLink).toHaveAttribute('href', '/search');
    expect(collectionLink).toHaveAttribute('href', '/collection');
  });

  it('should apply hover styles to navigation links', () => {
    renderWithRouter();

    const homeLink = screen.getByText('Home');
    const searchLink = screen.getByText('Search');
    const collectionLink = screen.getByText('Collection');

    expect(homeLink).toHaveClass('hover:text-orange-300');
    expect(searchLink).toHaveClass('hover:text-orange-300');
    expect(collectionLink).toHaveClass('hover:text-orange-300');
  });

  it('should render with consistent styling', () => {
    renderWithRouter();

    const header = screen.getByRole('banner');
    expect(header).toHaveClass('bg-blue-600');
    expect(header).toHaveClass('text-white');
  });
});

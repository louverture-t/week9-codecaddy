import type { Book, BookStatus, GoogleBookItem } from '../shared/types';

export const mapGoogleBookToBook = (
  item: GoogleBookItem,
  status: BookStatus = 'want-to-read'
): Book => {
  return {
    id: item.id,
    title: item.volumeInfo.title,
    author: item.volumeInfo.authors?.join(', ') || 'Unknown Author',
    publishedDate: item.volumeInfo.publishedDate || 'Unknown Date',
    description: item.volumeInfo.description || 'No description available',
    thumbnail:
      item.volumeInfo.imageLinks?.thumbnail ||
      'https://via.placeholder.com/128x192.png?text=No+Cover',
    status
  };
};

const axios = require('axios').default;

const KEY = '29901563-7c305ed84deb121c33dc20bd7';
const BASE_URL = 'https://pixabay.com/api/';

export default class NewsApiService {
  constructor() {
    this.searchQuery = '';
    this.page = 1;
  }

  async fetchImages() {
    const url = `${BASE_URL}?key=${KEY}&q=${this.searchQuery}&image_type=photo&orientation=horizontal&safesearch=true&page=${this.page}&per_page=40 `;
    try {
      const response = await axios(url);
      this.incrementPage();
      return response;
    } catch (error) {}
  }

  incrementPage() {
    this.page += 1;
  }

  resetPage() {
    this.page = 1;
  }

  set query(newSearchQuery) {
    this.searchQuery = newSearchQuery;
  }
}

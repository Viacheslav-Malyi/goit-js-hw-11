import NewsApiService from './api-service';
import Notiflix from 'notiflix';
import LoadMoreBtn from './js/on-load-more';
import SimpleLightbox from 'simplelightbox';
import 'simplelightbox/dist/simple-lightbox.min.css';

const searchForm = document.querySelector('.search-form');
const galleryRef = document.querySelector('.gallery');

searchForm.addEventListener('submit', onSearch);

const newsApiService = new NewsApiService();

const loadMoreBtn = new LoadMoreBtn({
  selector: '[data-action="load-more"]',
  hidden: true,
});
loadMoreBtn.refs.button.addEventListener('click', loadMore);

const gallery = new SimpleLightbox('.gallery a', {
  scrollZoom: true,
  captions: true,
  captionsData: 'alt',
  captionPosition: 'bottom',
  captionDelay: 250,
});

let currentHits = 0;

async function onSearch(event) {
  event.preventDefault();
  newsApiService.resetPage();
  newsApiService.query = event.currentTarget.elements.searchQuery.value;
  clearPage();

  loadMoreBtn.show();
  loadMoreBtn.disable();
  await newsApiService.fetchImages().then(response => {
    totalHits(response);
    renderMarkapCard(response);
    loadMoreBtn.enable();
    console.log(response);
    currentHits = response.data.hits.length;
    if (response.data.totalHits <= 40) {
      loadMoreBtn.hide();
    }
    console.log('submit', currentHits);
  });
}

async function loadMore() {
  loadMoreBtn.disable();
  await newsApiService.fetchImages().then(response => {
    renderMarkapCard(response);
    loadMoreBtn.enable();
    currentHits += response.data.hits.length;
    if (currentHits === response.data.totalHits) {
      loadMoreBtn.hide();
      Notiflix.Notify.info(
        "We're sorry, but you've reached the end of search results."
      );
    }
    gallery.refresh();
    console.log('load more', currentHits);
  });
}

function renderMarkapCard(response) {
  if (response === undefined) {
    return;
  }

  if (response.data.totalHits === 0) {
    loadMoreBtn.hide();
    Notiflix.Notify.failure(
      `Sorry, there are no images matching your search query. Please try again.`
    );
    return;
  }

  const apiResponse = response.data.hits;
  const card = apiResponse
    .map(
      ({
        largeImageURL,
        webformatURL,
        tags,
        likes,
        views,
        comments,
        downloads,
      }) => {
        return `
    <div class="photo-card">
      <a  href="${largeImageURL}"> <img class="photo-url" src="${webformatURL}" alt="${tags}" loading="lazy"/></a>
    <div class="info">
      <p class="info-item">
        <b>Likes:</b>
        <span>${likes}</span> 
      </p>
      <p class="info-item">
        <b>Views:</b>
        <span>${views}</span> 
      </p>
      <p class="info-item">
        <b>Comments:</b>
        <span>${comments}</span>
      </p>
      <p class="info-item">
        <b>Downloads:</b>
        <span>${downloads}</span>
      </p>
    </div>
  </div>
    `;
      }
    )
    .join('');
  galleryRef.insertAdjacentHTML('beforeend', card);
  gallery.refresh();
}

function clearPage() {
  galleryRef.innerHTML = '';
}

function totalHits(response) {
  if (response.data.totalHits === 0) {
    return;
  }
  Notiflix.Notify.info(`Hooray! We found ${response.data.totalHits} images.`);
}

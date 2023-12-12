import Notiflix from 'notiflix';
import axios from 'axios';
axios.defaults.headers.common['x-api-key'] =
  'live_6iBgCXZRlrmB01CH5KRgYAQ7uz4Rs6J14X5chxd4DcenYSIATPoSJzkRfPujPiVS';
import { searchImages } from 'pixabay-api';

const form = document.getElementById('search-form');
const gallery = document.getElementById('gallery');
const loadMoreBtn = document.getElementById('load-more');
let currentPage = 1;
let totalHits = 0;

form.addEventListener('submit', async function (event) {
  event.preventDefault();
  const searchQuery = event.target.searchQuery.value.trim();

  if (!searchQuery) {
    Notiflix.Notify.failure('Please enter a search query.');
    return;
  }

  // Clear gallery and reset pagination when a new search is performed
  gallery.innerHTML = '';
  currentPage = 1;

  const data = await searchImages(searchQuery, currentPage);
  handleSearchResults(data);
});

loadMoreBtn.addEventListener('click', async function () {
  currentPage++;
  const searchQuery = form.searchQuery.value.trim();
  const data = await searchImages(searchQuery, currentPage);
  handleSearchResults(data);
});

async function searchImages(query, page) {
  const apiKey = '41213860-1b24a2642cc998ee0211e05b1';
  const perPage = 40;
  const apiUrl = `https://pixabay.com/api/?key=${apiKey}&q=${query}&image_type=photo&orientation=horizontal&safesearch=true&page=${page}&per_page=${perPage}`;

  try {
    const response = await fetch(apiUrl);
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching images:', error);
    return { hits: [] };
  }
}

function handleSearchResults(data) {
  const { hits, totalHits: newTotalHits } = data;

  if (hits.length === 0) {
    Notiflix.Notify.info(
      'Sorry, there are no images matching your search query. Please try again.'
    );
    loadMoreBtn.style.display = 'none';
    return;
  }

  totalHits = newTotalHits;

  if (currentPage === 1) {
    Notiflix.Notify.success(`Hooray! We found ${totalHits} images.`);
  }

  loadMoreBtn.style.display = hits.length < totalHits ? 'block' : 'none';

  const fragment = document.createDocumentFragment();

  hits.forEach(hit => {
    const card = createPhotoCard(hit);
    fragment.appendChild(card);
  });

  gallery.appendChild(fragment);

  // Smooth scroll to the newly loaded images
  const { height: cardHeight } = document
    .querySelector('.gallery')
    .firstElementChild.getBoundingClientRect();

  window.scrollBy({
    top: cardHeight * 2,
    behavior: 'smooth',
  });
}

function createPhotoCard(hit) {
  const {
    webformatURL,
    largeImageURL,
    tags,
    likes,
    views,
    comments,
    downloads,
  } = hit;

  const card = document.createElement('div');
  card.className = 'photo-card';

  const img = document.createElement('img');
  img.src = webformatURL;
  img.alt = tags;
  img.loading = 'lazy';

  const info = document.createElement('div');
  info.className = 'info';

  const infoItems = [
    `<p class="info-item"><b>Likes:</b> ${likes}</p>`,
    `<p class="info-item"><b>Views:</b> ${views}</p>`,
    `<p class="info-item"><b>Comments:</b> ${comments}</p>`,
    `<p class="info-item"><b>Downloads:</b> ${downloads}</p>`,
  ];

  info.innerHTML = infoItems.join('');

  card.appendChild(img);
  card.appendChild(info);

  return card;
}

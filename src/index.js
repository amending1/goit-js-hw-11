import Notiflix from 'notiflix';
import axios from 'axios';
axios.defaults.headers.common['x-api-key'] =
  'live_6iBgCXZRlrmB01CH5KRgYAQ7uz4Rs6J14X5chxd4DcenYSIATPoSJzkRfPujPiVS';

const form = document.getElementById('search-form');
const gallery = document.getElementById('gallery');
const loadMoreBtn = document.querySelector('.load-more');
let currentPage = 1;
let totalHits = 0;

form.addEventListener('submit', async function (event) {
  event.preventDefault();
  const searchQuery = event.target.searchQuery.value.trim(); // to co użytkownik wpisał w pole wyszukiwania (bez białych )

  if (!searchQuery) {
    Notiflix.Notify.failure('Please enter a search query.');
    return;
  } // jeśli pole formularza jest puste użytkownik dostanie komunikat o tym

  // w przypadku nowego wyszukiwania usuwam zawartość elementu 'gallery', bo chcę żeby nowe wyniki były wyświetlane od nowa, bez zawartości poprzedniego wyszukiwania
  //i resetuję zmienną 'currentPage'
  gallery.innerHTML = '';
  currentPage = 1;

  // funkcja 'searchImages' wysyła żądanie do serwera Pixabay , aby uzyskać wyniki wyszukiwania dla określonego zapytania i numeru strony
  // funkcja jest asynchroniczna, więc wykonanie reszty kodu zostanie wstrzymane do momentu uzyskania odpowiedzi z funkcji 'searchImages'. Oczywiście ta odpowiedź będzie zawierać dane - obiekty obrazków
  // funkcja 'handleSearchResults' odpowiada za obsługę otrzymanych danych (generowanie kart obrazków, aktualizację interfejsu)
  const data = await searchImages(searchQuery, currentPage);
  handleSearchResults(data);
});

// obsługa przycisku 'Load more'
loadMoreBtn.addEventListener('click', async function () {
  //zwiększam wartość o 1 (kiedy użytkownik kliknie przycisk, chcę pobrać kolejną stronę wynikow)
  currentPage++;

  // chcę użyć tego samego zapytania wyszukiwania, które zostało wprowadzone wcześniej
  const searchQuery = form.searchQuery.value.trim();

  // wywołuję funkcję 'searchImages' z NOWYM numerem strony
  const data = await searchImages(searchQuery, currentPage);
  handleSearchResults(data);
});

// tworzę żądania HTTP do serwera Pixabay
async function searchImages(query, page) {
  const apiKey = '41213860-1b24a2642cc998ee0211e05b1';
  const perPage = 40;

  // tworzę pełny adres URL żądania wysyłanego do serwera za pomocą funkcji 'fetch'
  const apiUrl = `https://pixabay.com/api/?key=${apiKey}&q=${query}&image_type=photo&orientation=horizontal&safesearch=true&page=${page}&per_page=${perPage}`;

  try {
    // funkcja fetch jest asynchroniczna i zatrzymuje wykonywanie kolejnych linii kodu do momentu zakończenia żądania. Odpowiedź z serwera jest przechowywana w zmiennej response
    const response = await fetch(apiUrl);

    // wywołuję metodę '.json()' na obiekcie 'response', żeby przekonwertować otrzymaną odpowiedź do formaty JSON
    const data = await response.json();

    //następuje zwrócenie danych z funkcji 'searchImages'
    return data;
  } catch (error) {
    console.error('Error fetching images:', error);

    // w przypadku błedu funkcja zwróci pustą tablicę obiektów obrazków
    return { hits: [] };
  }
}

function handleSearchResults(data) {
  // robię destrukturyzację obiektu 'data', żeby mieć dostęp do właściwosci 'hits' (czyli tablicy obrazków) i 'totalHits' (czyliłącznej liczby obrazków dostępnych dla danego zapytania)
  const { hits, totalHits } = data;

  // Sprawdzam, czy tablica 'hits' jest pusta (nie zawiera żadnych obrazków). Jeśli tak, informuję użytkownika, że nie znaleziono obrazków spełniających kryteria wyszukiwania. Ukrywam też przycisk "Load more", bo nie ma więcej obrazków do wczytania.
  if (hits.length === 0) {
    Notiflix.Notify.info(
      'Sorry, there are no images matching your search query. Please try again.'
    );
    loadMoreBtn.style.display = 'none';
    return;
  }

  //Sprawdzam, czy obecnie jesteśmy na pierwszej stronie wyników
  if (currentPage === 1) {
    Notiflix.Notify.success(`Hooray! We found ${totalHits} images.`);
  }

  //Ustawiam widoczność przycisku "Load more" na podstawie warunku, czy liczba obrazków na stronie jest mniejszee niz łączna liczba obrazków
  if (hits.length < totalHits) {
    loadMoreBtn.style.display = 'block';
  } else {
    loadMoreBtn.style.display = 'none';
    if (totalHits > 0) {
      Notiflix.Notify.info(
        'Sorry, there are no more images matching your search query.'
      );
    }
  }

  // tworzę tablicę, a potem dla każdego elementu w 'hits' (tablica stworzona w funkcji 'searchImages') jest tworzony kafelek 'card' i dodawany do tej tablicy
  const cards = [];

  hits.forEach(hit => {
    const card = createPhotoCard(hit);
    cards.push(card);
  });

  // używam operatora spread (...) do dodania wszystkich elementów z tablicy cards do galerii
  gallery.append(...cards);

  //  płynne przewijanie strony po wywołaniu żądania i przy renderowaniu się każdej następnej grupy obrazków (kod skopiowany z treści zadania)
  const { height: cardHeight } = document
    .querySelector('.gallery')
    .firstElementChild.getBoundingClientRect();

  window.scrollBy({
    top: cardHeight * 2,
    behavior: 'smooth',
  });
}

// tworzę element kafelka obrazka 'photo-card'
function createPhotoCard(hit) {
  // destrukturyzacja danych obrazka
  const {
    webformatURL,
    largeImageURL,
    tags,
    likes,
    views,
    comments,
    downloads,
  } = hit;

  // tworzę element 'div' dla kafelka
  const card = document.createElement('div');
  card.className = 'photo-card';

  // tworzę element 'img' dla obrazka i ustawiam dla niego atrybuty
  const img = document.createElement('img');
  img.src = webformatURL;
  img.alt = tags;
  img.loading = 'lazy';

  // tworzę nowy element 'div' o klasie 'info', który będzie zawierał dodatkowe informacj o obrazku

  const info = document.createElement('div');
  info.className = 'info';

  // tworzę elementy 'p' dla poszczególnych informacji i dodaję je do div 'info'
  const infoItems = [
    `<p class="info-item"><b>Likes:</b> ${likes}</p>`,
    `<p class="info-item"><b>Views:</b> ${views}</p>`,
    `<p class="info-item"><b>Comments:</b> ${comments}</p>`,
    `<p class="info-item"><b>Downloads:</b> ${downloads}</p>`,
  ];

  info.innerHTML = infoItems.join('');

  // dodaję elementy 'img' i 'info' do kafelka 'card'
  card.appendChild(img);
  card.appendChild(info);

  return card;
}

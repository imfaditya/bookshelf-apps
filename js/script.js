const books = [];
const searchResult = [];
const BOOKS_STORAGE = 'BOOKS_STORAGE';
const RENDER_BOOKS_EVENT = new Event('render-books');
const RENDER_SEARCH_EVENT = new Event('render-search-result');

document.addEventListener('DOMContentLoaded', function(){
  const bookDataForm = document.getElementById('book-data');
  const searchForm = document.getElementById('input-search');
 
  if(isStorageExist()){
    synchronizeData('storageToArray');
  }

  bookDataForm.addEventListener('submit', function(e){
    const inputTitle = document.getElementById('input-title').value;
    const inputWriter = document.getElementById('input-writer').value;
    const inputReleaseYear = parseInt(document.getElementById('input-release-year').value);
    const inputIsComplete = document.getElementById('input-is-complete').checked;
    const bookObject = generateBookObject(inputTitle, inputWriter, inputReleaseYear, inputIsComplete);
    searchResult.splice(0, searchResult.length);
    addBookData(bookObject);
    e.preventDefault();
  })

  searchForm.addEventListener('keypress', function(e){
    if(e.key === 'Enter'){
      searchItem(searchForm.value);
      e.preventDefault();
    }
  })
})

function addBookData(bookObject){
  books.push(bookObject);
  if(checkStorage()){
    localStorage.setItem(BOOKS_STORAGE, JSON.stringify(books));
  }
  document.dispatchEvent(RENDER_BOOKS_EVENT);
}

function synchronizeData(direction){
  if(direction === 'storageToArray'){
    const temp = JSON.parse(localStorage.getItem(BOOKS_STORAGE));
    for(const data of temp){
      books.push(data);
    }
  }else if(direction === 'arrayToStorage'){
    localStorage.setItem(BOOKS_STORAGE, JSON.stringify(books));
  }

  document.dispatchEvent(RENDER_BOOKS_EVENT);
}

function countBooks(){
  const completedBooks = (document.querySelector('.completed-book-card').querySelectorAll('.book-item')).length;
  const uncompleteBooks = (document.querySelector('.uncomplete-book-card').querySelectorAll('.book-item')).length;

  const cardCompletedBooks = document.querySelector('.completed-books');
  const cardUncompleteBooks = document.querySelector('.uncomplete-books');
  const cardTotalBooks = document.querySelector('.total-books');

  cardCompletedBooks.innerText = completedBooks + " Books";
  cardUncompleteBooks.innerText = uncompleteBooks + " Books";
  cardTotalBooks.innerText = (completedBooks+uncompleteBooks) + " Books";
}

function generateBookObject(title, writer, releaseYear, isComplete){
  return {
    id : generateId(writer),
    title : title,
    author : writer,
    year : releaseYear,
    isComplete : isComplete,
  }
}

function generateId(writer){
  return writer.toLowerCase() + +new Date();
}

document.addEventListener('render-books', function(){
  const uncompleteBooksContainer = document.querySelector('.uncomplete-book-card');
  const completedBooksContainer = document.querySelector('.completed-book-card');

  uncompleteBooksContainer.innerHTML = '';
  completedBooksContainer.innerHTML = '';

  const titleUncomplete = document.createElement('h3');
  titleUncomplete.innerText = 'Uncomplete Books';

  const titleCompleted = document.createElement('h3');
  titleCompleted.innerText = 'Completed Books';

  completedBooksContainer.append(titleCompleted);
  uncompleteBooksContainer.append(titleUncomplete);

  for (const bookItem of books) {
    bookStructure = generateBookStructure(bookItem);
    if(bookItem.isComplete){
      completedBooksContainer.append(bookStructure);
    }else{
      uncompleteBooksContainer.append(bookStructure);
    }
  }

  countBooks();
})

document.addEventListener('render-search-result', function(){
  const uncompleteBooksContainer = document.querySelector('.uncomplete-book-card');
  const completedBooksContainer = document.querySelector('.completed-book-card');

  uncompleteBooksContainer.innerHTML = '';
  completedBooksContainer.innerHTML = '';

  const titleUncomplete = document.createElement('h3');
  titleUncomplete.innerText = 'Uncomplete Books';

  const titleCompleted = document.createElement('h3');
  titleCompleted.innerText = 'Completed Books';

  completedBooksContainer.append(titleCompleted);
  uncompleteBooksContainer.append(titleUncomplete);

  for (const bookItem of searchResult) {
    bookStructure = generateBookStructure(bookItem);
    if(bookItem.isComplete){
      completedBooksContainer.append(bookStructure);
    }else{
      uncompleteBooksContainer.append(bookStructure);
    }
  }
})

function generateBookStructure(bookObject){
  const imageMarker = document.createElement('img');
  if(bookObject.isComplete){
    imageMarker.setAttribute('src', 'assets/mark-fill.png');
  }else{
    imageMarker.setAttribute('src', 'assets/mark-outline.png');
  }

  const title = document.createElement('h4');
  title.innerText = bookObject.title;

  const writer = document.createElement('p');
  writer.innerText = bookObject.author;

  const releaseYear = document.createElement('p');
  releaseYear.classList.add('year');
  releaseYear.innerText = bookObject.year;

  const descriptionWrapper = document.createElement('div');
  descriptionWrapper.classList.add('description');

  descriptionWrapper.append(title);
  descriptionWrapper.append(writer);
  descriptionWrapper.append(releaseYear);

  const buttonAction =document.createElement('input');
  buttonAction.setAttribute('type', 'image');
  if(bookObject.isComplete){
    buttonAction.setAttribute('src', 'assets/back-outline.svg');
    buttonAction.addEventListener('click', function(){
      markAsUncomplete(bookObject.id);
    })
  }else{
    buttonAction.setAttribute('src', 'assets/check-outline.svg');
    buttonAction.addEventListener('click', function(){
      markAsComplete(bookObject.id);
    });
  }

  const trashButton = document.createElement('input');
  trashButton.setAttribute('type', 'image');
  trashButton.setAttribute('src', 'assets/trash-outline.svg');

  trashButton.addEventListener('click', function(){
    deleteItem(bookObject.id);
  })

  const actionWrapper = document.createElement('div');
  actionWrapper.classList.add('action');

  actionWrapper.append(buttonAction);
  actionWrapper.append(trashButton);

  const bookItemWrapper = document.createElement('div');
  bookItemWrapper.classList.add('book-item');

  bookItemWrapper.append(imageMarker);
  bookItemWrapper.append(descriptionWrapper);
  bookItemWrapper.append(actionWrapper);

  return bookItemWrapper;
}

function checkStorage(){
  return typeof(Storage) !== undefined;
}

function isStorageExist(){
  if(checkStorage()){
    if((localStorage.getItem(BOOKS_STORAGE)) === null){
      return false;
    }else{
      return true;
    }
  }else{
    return false;
  }
}

function markAsComplete(id){
  for (const bookItem of books) {
    if(bookItem.id === id){
      bookItem.isComplete = true;
      synchronizeData('arrayToStorage');
    }
  }
}

function markAsUncomplete(id){
  for (const bookItem of books) {
    if(bookItem.id === id){
      bookItem.isComplete = false;
      synchronizeData('arrayToStorage');
    }
  }
}

function deleteItem(id){
  const popupConfirmation = document.querySelector('.popup-confirmation');
  const optionYes = document.querySelector('.confirm-yes');
  const optionNo = document.querySelector('.confirm-no');

  popupConfirmation.classList.add('active');
  
  optionNo.addEventListener('click', function(){
    popupConfirmation.classList.remove('active');
    return; 
  })
  
  optionYes.addEventListener('click', function(){
    for (const index in books) {
      if(books[index].id === id){
        popupConfirmation.classList.remove('active');
        books.splice(index, 1);
        synchronizeData('arrayToStorage');
        return;
      }
    }
    
  })
}

function searchItem(keyword){
  searchResult.splice(0, searchResult.length);
  if(keyword === ''){
    document.dispatchEvent(RENDER_BOOKS_EVENT);
  }else{
    for (const bookItem of books) {
      if((bookItem.title.toLowerCase()).includes(keyword.toLowerCase()) || (bookItem.author.toLowerCase()).includes(keyword.toLowerCase())){
        searchResult.push(bookItem);
      }
    }
    document.dispatchEvent(RENDER_SEARCH_EVENT);
  }
}
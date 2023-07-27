// 宣告API URL的變數
const BASE_URL = 'https://webdev.alphacamp.io'
const INDEX_URL = BASE_URL + '/api/movies/'
const POSTER_URL = BASE_URL + '/posters/'
const MOVIES_PER_PAGE = 12  //新增這行表示每頁有12部電影

//儲存符合篩選條件的項目
let filteredMovies = []
// 宣告電影清單的空陣列
const movies = []

// 選出data-panel的元素，準備放入電影清單資料
const dataPanel = document.querySelector('#data-panel')

//選取搜尋表單的元素
const searchForm = document.querySelector('#search-form')

//選取Input的資料
const searchInput = document.querySelector('#search-input')

function renderMovieList(data) {
  let rawHTML = ''
  data.forEach((item) => {
    rawHTML += `<div class="col-sm-3">
                <div class="mb-2">
                    <div class="card">
                        <img src="${POSTER_URL + item.image}"
                            class="card-img-top" alt="Movie Poster" />
                        <div class="card-body">
                            <h5 class="card-title">${item.title}</h5>
                        </div>
                        <div class="card-footer">
                            <button class="btn btn-primary btn-show-movie" data-bs-toggle="modal"
                                data-bs-target="#movie-modal" data-id="${item.id}">
                                More
                            </button>
                            <button class="btn btn-info btn-add-favorite" data-id="${item.id}">+</button>
                        </div>
                    </div>
                </div>
            </div>`
  });
  dataPanel.innerHTML = rawHTML
}

//找出收藏的電影ID
function addToFavorite(id) {
    const list = JSON.parse(localStorage.getItem('favoriteMovies')) || []
    const movie = movies.find(movie => movie.id === id)
    if (list.some((movie) => movie.id === id)) {
        return alert('此電影已經在收藏清單中！')
    }
    list.push(movie)
    localStorage.setItem('favoriteMovies', JSON.stringify(list))
}

// 在dataPanel上放入監聽器
dataPanel.addEventListener('click', function onPanelClicked(event) {
    if (event.target.matches('.btn-show-movie')) {
        showMovieModal(Number(event.target.dataset.id))  
    } else if (event.target.matches('.btn-add-favorite')) { //加入到最愛中
        addToFavorite(Number(event.target.dataset.id))
    }
})

// 在互動視窗中放入電影的詳細資料
function showMovieModal(id) {
    const modalTitle = document.querySelector('#movie-modal-title')
    const modalImage = document.querySelector('#movie-modal-image')
    const modalDate = document.querySelector('#movie-modal-date')
    const modalDescription = document.querySelector('#movie-modal-description')
    axios.get(INDEX_URL + id).then((response) => {
        const data = response.data.results
        modalTitle.innerText = data.title
        modalDate.innerText = 'Release date: ' + data.release_date
        modalDescription.innerText = data.description
        modalImage.innerHTML = `<img src="${POSTER_URL + data.image
            }" alt="movie-poster" class="img-fluid">`
    })
}

//將電影資料放入movies陣列中
axios
  .get(INDEX_URL) // 修改這裡
  .then((response) => {
    movies.push(...response.data.results)
      renderPaginator(movies.length)
      renderMovieList(getMoviesByPage(1))
  })
  .catch((err) => console.log(err))


// 將電影清單分頁
function getMoviesByPage(page) {
    const data = filteredMovies.length ? filteredMovies: movies
    const startIndex = (page - 1) * MOVIES_PER_PAGE
    //修改這裡
    return data.slice(startIndex, startIndex + MOVIES_PER_PAGE)
}

// 製作分頁器的功能
function renderPaginator(amount) {
    //計算總頁數
    const numberOfPages = Math.ceil(amount / MOVIES_PER_PAGE)
    //製作 template
    let rawHTML = ''

    for (let page = 1; page <= numberOfPages; page++) {
        rawHTML += `<li class="page-item"><a class="page-link" href="#" data-page="${page}">${page}</a></li>`
    }
    //放回 HTML
    paginator.innerHTML = rawHTML
}

// 在分頁表單上掛上監聽器
paginator.addEventListener('click', function onPaginatorClicked(event) {
    //如果被點擊的不是 a 標籤，結束
    if (event.target.tagName !== 'A') return

    //透過 dataset 取得被點擊的頁數
    const page = Number(event.target.dataset.page)
    //更新畫面
    renderMovieList(getMoviesByPage(page))
})

//在搜尋表單上掛上監聽器
searchForm.addEventListener('submit', function onSearchFormSubmitted(event) {
    //取消預設事件
    event.preventDefault()
    //取得搜尋關鍵字
    const keyword = searchInput.value.trim().toLowerCase()
 
    //錯誤處理：輸入無效字串
    if (!keyword.length) {
        return alert('請輸入有效字串！')
    }
    //條件篩選
    filteredMovies= movies.filter((movie) =>
        movie.title.toLowerCase().includes(keyword)
    )
    //重製分頁器
    renderPaginator(filteredMovies.length)  //新增這裡
    //預設顯示第 1 頁的搜尋結果
    renderMovieList(getMoviesByPage(1))  //修改這裡
})



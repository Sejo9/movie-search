$(document).ready(() => {
  const apiKey = "8467c7";
  let url;
  let pagingData;
  let storedSorting;

  //Searh form variables
  const $searchForm = $("#search-form");
  const $searchBar = $("#title-input");
  const $year = $("#year");
  const $type = $("#type");
  const $sorting = $("#sorting");

  //Movie results variables
  const $noResults = $("#no-results");
  const $movieResults = $("#movie-results");

  //Paging variables
  const $pagingContainer = $("#paging-container");
  const $prevBtn = $("#prev-btn");
  const $nextBtn = $("#next-btn");
  const $currentPage = $("#current-page");
  const $maxPages = $("#max-pages");

  //Modal variables
  const $modal = $("#movie-modal");
  const $modalPoster = $("#movie-img");
  const $modalDetails = $("#movie-details");
  const $modalTitle = $("#movie-title");
  const $modalClose = $(".close");

  //Set year input max value
  const setMaxYear = () => $year.attr("max", new Date().getFullYear());

  //Set the URL based on the availability of year and type
  const setUrl = () => {
    let searchValue = encodeURIComponent($searchBar.val()).replaceAll(
      "%20",
      "+"
    );

    if ($year.val()) {
      if ($type.val()) {
        return `http://www.omdbapi.com/?apikey=${apiKey}&s=${searchValue}&y=${$year.val()}&type=${$type.val()}/`;
      } else {
        return `http://www.omdbapi.com/?apikey=${apiKey}&s=${searchValue}&y=${$year.val()}/`;
      }
    } else {
      if ($type.val()) {
        return `http://www.omdbapi.com/?apikey=${apiKey}&s=${searchValue}&type=${$type.val()}/`;
      } else {
        return `http://www.omdbapi.com/?apikey=${apiKey}&s=${searchValue}/`;
      }
    }
  };

  //Sort the movies received based on title or year
  const sortMovies = (movies, sortParam) => {
    if (sortParam === "title") {
      movies.sort((a, b) => {
        let aTitle = a.Title;
        let bTitle = b.Title;

        if (aTitle < bTitle) {
          return -1;
        }
        if (aTitle > bTitle) {
          return 1;
        }

        return 0;
      });
    } else {
      movies.sort((a, b) => a.Year - b.Year);
    }
  };

  const displayModal = (movie) => {
    $modal.show();

    $modalPoster.attr("src", movie.Poster);

    $modalDetails.children ? $modalDetails.empty() : null;

    Object.keys(movie).forEach((key) => {
      if (key === "Title") {
        $modalDetails.append(`<h1 id="movie-title">${movie[key]}</h1>`);
      }
      if (key !== "Title" && key !== "Poster" && key !== "Response") {
        if (movie[key] !== "N/A") {
          if (key == "Ratings") {
            console.log(movie[key]);
            $modalDetails.append(`<p><strong>${key}</strong>:</p>`);
            movie[key].forEach((rating) => {
              $modalDetails.append(
                `<p class="rating"><strong>${rating.Source}</strong>: ${rating.Value}</p>`
              );
            });
          } else {
            $modalDetails.append(
              `<p><strong>${key}</strong>: ${movie[key]}</p>`
            );
          }
        }
      }
    });
  };

  //Close modal upon clicking anywhere outside the modal
  $(window).click((event) => {
    if (event.target == $modal.get(0)) {
      $modal.hide();
    }
  });

  //Close modal upon clicking on close button
  $modalClose.click(() => $modal.hide());

  //Get data for modal
  const loadMovie = (movie) => {
    let movieUrl = `http://www.omdbapi.com/?apikey=${apiKey}&i=${movie.imdbID}&plot=full`;

    $.getJSON(movieUrl, (data) => {
      displayModal(data);
    });
  };

  //Add movies from response to grid
  const addMoviesToGrid = (movies, $movieResults) => {
    $.map(movies, (movie, index) => {
      const $movieHtml = $(`
        <div class="movie-result">
            <img src=${movie.Poster} alt="Poster Image"/>

            <h4>${movie.Title}</h4>

            <p>${movie.Year}</p>

            <button class="btn-secondary movie-btn" type="button">View Details</button>
        </div>
    `).data(movie);

      $movieHtml.find(".movie-btn").on("click", () => {
        loadMovie($movieHtml.data());
      });

      $movieResults.append($movieHtml);
    });
  };

  //Calculate information required for paging
  const calculatePagingInfo = (totalResults) => {
    let pagingInfo;
    if (totalResults % 10 != 0) {
      pagingInfo = {
        totalPages: Number.parseInt(totalResults / 10) + 1,
        currentPage: 1,
      };
    } else {
      pagingInfo = {
        totalPages: totalResults / 10,
        currentPage: 1,
      };
    }

    $currentPage.text(pagingInfo.currentPage);
    $maxPages.text(pagingInfo.totalPages);

    return pagingInfo;
  };

  //Load first search data
  const loadFirstSearch = () => {
    $.getJSON(url, (data) => {
      if (data.Response === "True") {
        pagingData = calculatePagingInfo(data.totalResults);

        storedSorting = $sorting.val();

        let movies = data.Search;

        if ($sorting.val()) {
          sortMovies(movies, $sorting.val());
        }

        addMoviesToGrid(movies, $movieResults);

        //Show and remove paging controls
        $pagingContainer.css("display", "flex");

        $prevBtn.is(":visible") ? $prevBtn.hide() : null;
        !$nextBtn.is(":visible") ? $nextBtn.show() : null;

        clearSearchFields();
      } else {
        $noResults.text(data.Error).show();
      }
    });
  };

  //Load next page
  const loadNextPage = () => {
    $.getJSON(`${url}&page=${++pagingData.currentPage}`, (data) => {
      $currentPage.text(pagingData.currentPage);

      //Show and remove paging controls
      pagingData.currentPage === pagingData.totalPages ? $nextBtn.hide() : null;

      !$prevBtn.is(":visible") ? $prevBtn.show() : null;

      let movies = data.Search;

      if (storedSorting) {
        sortMovies(movies, storedSorting);
      }

      $movieResults.empty();

      addMoviesToGrid(movies, $movieResults);

      $(window).scrollTop(0);
    });
  };

  //Load next page
  const loadPrevPage = () => {
    $.getJSON(`${url}&page=${--pagingData.currentPage}`, (data) => {
      $currentPage.text(pagingData.currentPage);

      //Show and remove paging controls
      pagingData.currentPage === 1 ? $prevBtn.hide() : null;

      !$nextBtn.is(":visible") ? $nextBtn.show() : null;

      let movies = data.Search;

      if (storedSorting) {
        sortMovies(movies, storedSorting);
      }

      $movieResults.empty();

      addMoviesToGrid(movies, $movieResults);

      $(window).scrollTop(0);
    });
  };

  //Clear search fields
  const clearSearchFields = () => {
    $searchBar.val("");
    $year.val("");
    $type.val("");
    $sorting.val("");
  };

  //Set maximum year for the year input
  setMaxYear();

  //On search form submission
  $searchForm.on("submit", (event) => {
    event.preventDefault();

    //Check if error text is visible and hide it
    $noResults.is(":visible") ? $noResults.hide() : null;

    //Check if paging controls are visible and hide them
    $pagingContainer.is(":visible") ? $pagingContainer.hide() : null;

    //Clear previous movie results
    $movieResults.children ? $movieResults.empty() : null;

    //validate fields to check if they contain data
    if ($searchBar.val()) {
      url = setUrl();

      loadFirstSearch();
    }
  });

  //Click event to load next page
  $nextBtn.click((event) => loadNextPage());

  //Click event to load prev page
  $prevBtn.click((event) => loadPrevPage());
});

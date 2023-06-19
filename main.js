$(document).ready(() => {
  const apiKey = "8467c7";
  let url;
  let pagingData;
  let storedSorting;
  let viewedMovie;

  //Searh form variables
  const $searchForm = $("#search-form");
  const $searchBar = $("#title-input");
  const $year = $("#year");
  const $type = $("#type");
  const $sorting = $("#sorting");
  const $searchBtn = $("#search-btn");

  //Movie results variables
  const $noResults = $("#no-results");
  const $movieResults = $("#movie-results");

  //Paging variables
  const $pagingContainer = $("#paging-container");
  const $prevBtn = $("#prev-btn");
  const $nextBtn = $("#next-btn");
  const $currentPage = $("#current-page");
  const $maxPages = $("#max-pages");

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
        return `http://www.omdbapi.com/?apikey=${apiKey}&s=${searchValue}&y=${$year.val()}&type=${$type.val()}`;
      } else {
        return `http://www.omdbapi.com/?apikey=${apiKey}&s=${searchValue}&y=${$year.val()}`;
      }
    } else {
      if ($type.val()) {
        return `http://www.omdbapi.com/?apikey=${apiKey}&s=${searchValue}&type=${$type.val()}`;
      } else {
        return `http://www.omdbapi.com/?apikey=${apiKey}&s=${searchValue}`;
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

  const loadMovie = (movie) => {
    console.log(movie)
    $.getJSON("url", (data, status) => {
            
        }
    );
  };

  //Add movies from response to grid
  const addMoviesToGrid = (movies, $movieResults) => {
    $.map(movies, (movie, index) => {
      const $movieHtml = $(`
        <div class="movie-result">
            <img src=${movie.Poster} alt="Poster Image"/>

            <h4>${movie.Title}</h4>

            <p>${movie.Year}</p>

            <button class="btn-secondary movie-btn" type="button">Show Information</button>
        </div>
    `).data(movie);

        $movieHtml.find(".movie-btn").on("click",() => {
            loadMovie($movieHtml.data());
        })

      $movieResults.append($movieHtml);
      
    });

    /* $movieBtn.click((event) => {
        console.log($(event.currentTarget.closest("div")).data());
    }); */

    /* $movieResults.find(".movie-btn").click((event) => {
      console.log(event.currentTarget.closest("div"));

      console.log($(event.currentTarget.closest("div")).data());
    }); */
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

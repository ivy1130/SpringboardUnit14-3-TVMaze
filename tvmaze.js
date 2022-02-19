/** Given a query string, return array of matching shows:
 *     { id, name, summary, episodesUrl }
 */

/** Search Shows
 *    - given a search term, search for tv shows that
 *      match that query.  The function is async show it
 *       will be returning a promise.
 *
 *   - Returns an array of objects. Each object should include
 *     following show information:
 *    {
        id: <show id>,
        name: <show name>,
        summary: <show summary>,
        image: <an image from the show data, or a default imege if no image exists, (image isn't needed until later)>
      }
 */
async function searchShows (query) {
	// TODO: Make an ajax request to the searchShows api.  Remove
	// hard coded data.
	const res = await axios.get('http://api.tvmaze.com/search/shows?', {params: {q: query}})
	const showResults = res.data
	const shows = []
	for (let show of showResults) {
		const {id, name, summary} = show.show
		const image = show.show.image.medium
		shows.push({id, name, summary, image})
	}
	return shows
}

/** Populate shows list:
 *     - given list of shows, add shows to DOM
 */

function populateShows (shows) {
	const $showsList = $('#shows-list')
	$showsList.empty()

	for (let show of shows) {
		let $item = $(
			`<div class="col-md-6 col-lg-3 Show" data-show-id="${show.id}">
         <div class="card" data-show-id="${show.id}">
           <div class="card-body">
             <h5 class="card-title">${show.name}</h5>
             <p class="card-text">${show.summary}</p>
           </div>
         </div>
       </div>
      `
		)

		$showsList.append($item)

		// prepend image before the card body
		if (show.image === null) {
			const $image = $(`<img class="card-img-top" src="https://tinyurl.com/tv-missing">`)
			$image.prependTo(`[data-show-id = ${show.id}] .card-body`)
		} else {
			const $image = $(`<img class="card-img-top" src="${show.image}">`)
			$image.prependTo(`[data-show-id = ${show.id}] .card-body`)
		}

		// append show episodes button to under the card info
		const $episodeButton = $(`<button class="show-episodes" >Show Episodes</button>`)
		$episodeButton.appendTo(`.card[data-show-id = ${show.id}]`)
	}
}

/** Handle search form submission:
 *    - hide episodes area
 *    - get list of matching shows and show in shows list
 */

$('#search-form').on('submit', async function handleSearch (evt) {
	evt.preventDefault()

	let query = $('#search-query').val()
	if (!query) return

	$('#episodes-area').hide()

	let shows = await searchShows(query)

	populateShows(shows)
})

/** Given a show ID, return list of episodes:
 *      { id, name, season, number }
 */

async function getEpisodes (id) {
	const res = await axios.get(`http://api.tvmaze.com/shows/${id}/episodes`)
	const episodeResults = res.data
	const episodes = []
	for (let episode of episodeResults) {
		const {id, name, season, number} = episode
		episodes.push({id, name, season, number})
	}
	return episodes
}

// Populate episodes into the episodes list with episode name, season, and number

function populateEpisodes (episodes) {
	const $episodesList = $('#episodes-list')
	$episodesList.empty()

	for (let episode of episodes) {
		let $item = $(`<li>${episode.name} (${episode.season}, ${episode.number})</li>`)
		$episodesList.append($item)
	}
}

// when show episode button is clicked within shows list, show the episodes area, and run getEpisodes and populateEpisodes

$('#shows-list').on('click', '.show-episodes', async function handleEpisodes (evt) {
	evt.preventDefault()

	$('#episodes-area').show()

	const id = $(evt.target).closest('.Show').data('show-id')

	const episodes = await getEpisodes(id)

	populateEpisodes(episodes)
})

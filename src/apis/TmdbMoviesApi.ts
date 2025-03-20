import { MovieLight, Movie, Poster as MoviePoster } from "@models/MovieModels";
import { api_get, BaseAPI } from "@apis/BaseApi";
import {
	TMDBMovieSearchResponse,
	TMDBMovieSearchResult,
	TMDBMovieResponse,
	Video,
	Poster as TMDBPoster,
	Images,
} from "./models/TmdbMovieModels";

export class TMDBMoviesAPI extends BaseAPI {

	constructor(
		api_key: string,
		locale_preference: string,
	) {
		super(api_key, locale_preference);
	}	

	async getMovies(query: string) {
		try {
			const params = {
				page: 1,
				query: query,
				language: this.locale_preference,
			};
			const headers = {};

			this.add_jwt_or_api_key(params, headers);

			const search_results = await api_get<TMDBMovieSearchResponse>(
				"https://api.themoviedb.org/3/search/multi",
				params,
				headers,
			);
			if (!search_results?.total_results) return [];
			return search_results.results
				.filter(result => result.media_type === "movie")
				.map(result => this.convert_to_movie_light(result));
		} catch (error) {
			console.warn(error);
			throw error;
		}
	}

	async get_movie_by_id(id: number, media_type: string) {
		try {
			const params = {
				language: this.locale_preference,
				append_to_response: "videos,credits,images",
			};
			const headers = {};

			this.add_jwt_or_api_key(params, headers);

			const movie = await api_get<TMDBMovieResponse>(
				`https://api.themoviedb.org/3/${this.convert_to_lower_case(media_type)}/${id}`,
				params,
				headers,
			);

			return this.createMovie(movie, media_type);
		} catch (error) {
			console.warn(error);
			throw error;
		}
	}

	private convert_to_lower_case(media_type: string): string {
		return media_type === "Movie" ? "movie" : "tv";
	}

	private convert_to_movie_light(result: TMDBMovieSearchResult): MovieLight {
		const movie_search: MovieLight = {
			id: result.id,
			title: result.title || result.name,
			name: result.title || result.name,
			release_date: result.release_date || result.first_air_date,
			original_title: result.original_title || result.original_name,
			media_type: "Movie",
			poster_path: result.poster_path ? `https://image.tmdb.org/t/p/original${result.poster_path}` : "",
		};
		return movie_search;
	}

	private createMovie(response: TMDBMovieResponse, media_type: string): Movie {

		const genres = response.genres.map(genre => genre.name);
		const actors = response.credits.cast.map(actor => `${actor.name} (${actor.character})`).slice(0, 10);
		const companies = response.production_companies.map(company => `${company.name} (${company.origin_country})`);
		const countries = response.production_countries.map(country => `${country.name} (${country.iso_3166_1})`);
		const langs = response.spoken_languages.map(language => `${language.name} (${language.iso_639_1})`);

		const original_name = response.original_title || response.original_name;

		const movie: Movie = {
			backdrop_path: response.backdrop_path ? `https://image.tmdb.org/t/p/original${response.backdrop_path}` : "",
			main_actors: actors,
			main_actors_string: actors.length > 0 ? actors.join(', ') : "",
			media_type: media_type,
			director: response.credits.crew.find(crew => crew.job === "Director")?.name,
			genres: genres,
			genres_string: genres.length > 0 ? genres.join(', ') : "",
			homepage: response.homepage,
			id: response.id,
			name: response.title || response.name,
			title: response.title || response.name,
			imdb_id: response.imdb_id,
			original_language: response.original_language,
			original_title: original_name,
			overview: response.overview,
			popularity: response.popularity,
			poster_path: response.poster_path ? `https://image.tmdb.org/t/p/original${response.poster_path}` : "",
			production_companies: companies,
			production_companies_string: companies.length > 0 ? companies.join(', ') : "",
			production_countries: countries,
			production_countries_string: countries.length > 0 ? countries.join(', ') : "",
			release_date: response.release_date || response.first_air_date,
			spoken_languages: langs,
			spoken_languages_string: langs.length > 0 ? langs.join(', ') : "",
			tagline: response.tagline? response.tagline : "-",
			vote_average: response.vote_average,
			vote_count: response.vote_count,
			youtube_url: this.get_youtube_url_from_(response.videos.results),
			collection_id: response.belongs_to_collection ? response.belongs_to_collection.id + "" : "-",
			justwatch_id: this.getJustWatchId(original_name),
			posters: this.getPosters(response.images),
		};

		return movie;
	}
	
	private getPosters(images: Images): MoviePoster[] {
		if(!images || !images.posters)
			return null;

		let posters = images.posters;
		
		const moviePosters = posters.map((tmdbPoster) => {
			let moviePoster: MoviePoster = {
				vote_average: tmdbPoster.vote_average,
				vote_count: tmdbPoster.vote_count,
				file_path: `https://image.tmdb.org/t/p/original${tmdbPoster.file_path}`
			};

			return moviePoster;
		});

		return moviePosters;
	}


	private get_youtube_url_from_(videos: Video[]): string {
		const youtube_videos = videos.filter(video => video.site === "YouTube");

		if (youtube_videos.length) {
			const trailer = youtube_videos.find(video => video.type === "Trailer");
			if (trailer) return `https://www.youtube.com/watch?v=${trailer.key}`;

			const clip = youtube_videos.find(video => video.type === "Clip");
			if (clip) return `https://www.youtube.com/watch?v=${clip.key}`;

			const featurette = youtube_videos.find(video => video.type === "Featurette");
			if (featurette) return `https://www.youtube.com/watch?v=${featurette.key}`;

			const teaser = youtube_videos.find(video => video.type === "Teaser");
			if (teaser) return `https://www.youtube.com/watch?v=${teaser.key}`;
		}
		return "";
	}

	private getJustWatchId(title: string): string {
		return title
			.toLowerCase() // Converti tutto in minuscolo
			.normalize("NFD") // Normalizza i caratteri con accenti
			.replace(/\p{Diacritic}/gu, "") // Rimuove gli accenti
			.replace(/\'/g, "") 			// rimuove '
			.replace(/[^a-z0-9]+/g, "-") // Sostituisce spazi e caratteri speciali con '-'
			.replace(/^-+|-+$/g, ""); // Rimuove eventuali '-' iniziali o finali
	}

}

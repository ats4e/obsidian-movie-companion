import LanguageDetect from "languagedetect";

import { CollectionsSearch, Collection } from "../models/collection.model";
import { api_get, BaseCollectionsAPI } from "./base_api";
import {
	TMDBCollectionsSearchResponse,
	TMDBCollectionResponse,
	TMDBCollectionSearchResult,
} from "./models/tmdb_collections_response";

let language: string;
const language_detector = new LanguageDetect();

export const DEFAULT_API_KEY = "0b56383c8a078ad8994cbaecaf9d3e3f";

export class TMDBCollectionsAPI implements BaseCollectionsAPI {
	constructor(
		private readonly api_key?: string,
		private readonly include_adult?: boolean,
		private readonly locale_preference?: string,
	) {}

	async get_collections_by_(query: string) {
		try {
			language = this.locale_preference === "auto" ? this.get_language_by_(query) : this.locale_preference;

			const params = {
				page: 1,
				query: query,
				include_adult: this.include_adult,
				language: language,
			};
			const headers = {};

			this.add_jwt_or_api_key(params, headers);

			const search_results = await api_get<TMDBCollectionsSearchResponse>(
				"https://api.themoviedb.org/3/search/collection",
				params,
				headers,
			);
			if (!search_results?.total_results) return [];
			return search_results.results.map(result => this.create_collections_search_from_(result));
		} catch (error) {
			console.warn(error);
			throw error;
		}
	}

	async get_collection_by_(id: number) {
		try {
			const params = {
				language: language,
			};
			const headers = {};

			this.add_jwt_or_api_key(params, headers);

			const collection_response = await api_get<TMDBCollectionResponse>(
				`https://api.themoviedb.org/3/collection/${id}`,
				params,
				headers,
			);
			return this.create_collection_from_(collection_response);
		} catch (error) {
			console.warn(error);
			throw error;
		}
	}

	// TODO: Use more and more movie detail endpoints (images, recommendations, reviews, similar, etc.)

	private get_language_by_(query: string): string {
		const detected_languages = language_detector.detect(query, 3);

		if (detected_languages.length) return detected_languages[0][0].slice(0, 2);
		return window.moment.locale() || "en";
	}

	private add_jwt_or_api_key(params: Record<string, string | number | boolean>, headers: Record<string, string>) {
		if (!this.api_key) {
			// Attempt without user API key.
			params["api_key"] = DEFAULT_API_KEY;
			return;
		}
		if (this.api_key.length > 32) {
			const splited_api_key = this.api_key.split(" ");
			headers["Authorization"] =
				splited_api_key.length > 1
					? `Bearer ${splited_api_key[splited_api_key.length - 1]}`
					: `Bearer ${this.api_key}`;
		} else params["api_key"] = this.api_key;
	}

	private convert_to_lower_case(media_type: string): string {
		return media_type === "Movie" ? "movie" : "tv";
	}

	private create_collections_search_from_(result: TMDBCollectionSearchResult): CollectionsSearch {
		const search_res: CollectionsSearch = {
			id: result.id,
			name: result.name,
			overview: result.overview,
			original_name: result.original_name,
			poster_path: result.poster_path ? `https://image.tmdb.org/t/p/original${result.poster_path}` : "",
			backdrop_path: result.backdrop_path ? `https://image.tmdb.org/t/p/original${result.backdrop_path}` : "",
		};
		return search_res;
	}

	private create_collection_from_(response: TMDBCollectionResponse): Collection {
		const collection: Collection = {
			id: response.id,
			name: response.name,
			overview: response.overview,
			poster_path: response.poster_path ? `https://image.tmdb.org/t/p/original${response.poster_path}` : "",
			backdrop_path: response.backdrop_path ? `https://image.tmdb.org/t/p/original${response.backdrop_path}` : "",
		};
		return collection;
	}
}

import { CollectionLight, Collection } from "../models/CollectionModels";
import { api_get, BaseAPI } from "./BaseApi";
import {
	TMDBCollectionsSearchResponse,
	TMDBCollectionResponse,
	TMDBCollectionSearchResult,
} from "./models/TmdbCollectionModels";

export class TMDBCollectionsAPI extends BaseAPI {
	constructor(
		api_key: string,
		locale_preference: string,
	) {
		super(api_key, locale_preference);
	}

	async get_collections(query: string) {
		try {

			const params = {
				page: 1,
				query: query,
				language: this.locale_preference,
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

	async get_collection_by_id(id: number) {
		try {
			const params = {
				language: this.locale_preference,
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

	private create_collections_search_from_(result: TMDBCollectionSearchResult): CollectionLight {
		const search_res: CollectionLight = {
			id: result.id,
			name: result.name,
			overview: result.overview,
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
			parts: []
		};
		return collection;
	}

	protected add_jwt_or_api_key(params: Record<string, string | number | boolean>, headers: Record<string, string>) {

		if (this.api_key.length > 32) {
			const splited_api_key = this.api_key.split(" ");
			headers["Authorization"] =
				splited_api_key.length > 1
					? `Bearer ${splited_api_key[splited_api_key.length - 1]}`
					: `Bearer ${this.api_key}`;
		} else params["api_key"] = this.api_key;
	}
}

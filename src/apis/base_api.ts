import { requestUrl } from "obsidian";
import { MovieSearch, Movie } from "@models/movie.model";
import { MovieSearchPluginSettings } from "@settings/settings";
import { CollectionsSearch, Collection } from "../models/collection.model";
import { DEFAULT_API_KEY, TMDBMoviesAPI } from "./tmdb_movies_api";
import { TMDBCollectionsAPI } from "./tmdb_collections_api";

export interface BaseMoviesAPI {
	get_movies_by_(query: string): Promise<MovieSearch[]>;
	get_movie_by_(id: number, media_type: string): Promise<Movie>;
}

export interface BaseCollectionsAPI {
	get_collections_by_(query: string): Promise<CollectionsSearch[]>;
	get_collection_by_(id: number): Promise<Collection>;
}

export function get_movie_service_provider(settings: MovieSearchPluginSettings, locale_preference = ""): BaseMoviesAPI {
	if (!settings.api_key && settings.no_api_key_attempts > 10) throw new Error("TMDB API key is required!");
	if (settings.api_key == DEFAULT_API_KEY) throw new Error("Use you own TMDB API key :)");
	return new TMDBMoviesAPI(settings.api_key, settings.include_adult, locale_preference);
}

export function get_collection_service_provider(settings: MovieSearchPluginSettings,locale_preference = ""): BaseCollectionsAPI {
	if (!settings.api_key && settings.no_api_key_attempts > 10) throw new Error("TMDB API key is required!");
	if (settings.api_key == DEFAULT_API_KEY) throw new Error("Use you own TMDB API key :)");
	return new TMDBCollectionsAPI(settings.api_key, settings.include_adult, locale_preference);
}

export async function api_get<T>(
	url: string,
	params: Record<string, string | number | boolean> = {},
	headers?: Record<string, string>,
): Promise<T> {
	const api_URL = new URL(url);
	Object.entries(params).forEach(([key, value]) => {
		api_URL.searchParams.append(key, value?.toString());
	});
	const result = await requestUrl({
		url: api_URL.href,
		method: "GET",
		headers: {
			Accept: "*/*",
			"Content-Type": "application/json; charset=utf-8",
			...headers,
		},
	});
	return result.json as T;
}

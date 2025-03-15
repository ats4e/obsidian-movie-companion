import { PluginSettings } from "@settings/PluginSettings";
import { TMDBCollectionsAPI } from "./TmdbCollectionsApi";
import { TMDBMoviesAPI } from "./TmdbMoviesApi";

export function getMoviesAPI(settings: PluginSettings): TMDBMoviesAPI {
    if (!settings.api_key) 
        throw new Error("TMDB API key is required!");

    return new TMDBMoviesAPI(settings.api_key, settings.locale_preference);
}

export function getCollectionsAPI(settings: PluginSettings): TMDBCollectionsAPI {
    if (!settings.api_key) 
        throw new Error("TMDB API key is required!");
    
    return new TMDBCollectionsAPI(settings.api_key, settings.locale_preference);
}

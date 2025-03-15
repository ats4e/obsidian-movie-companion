import { Renderable } from "./RenderableModels";

export interface Frontmatter {
	[key: string]: string | string[];
}

export interface MovieLight extends Renderable {
	id: number;
	media_type: string;
	original_title: string;
	release_date: string;
	title: string;
	poster_path: string;
}

export interface Movie extends MovieLight {
	backdrop_path: string;
	main_actors: string[];
	main_actors_string: string;
	director: string;
	genres: string[];
	genres_string: string;
	homepage: string;
	imdb_id: string;
	justwatch_id: string;
	original_language: string;
	overview: string;
	popularity: number;
	production_companies: string[];
	production_companies_string: string;
	production_countries: string[];
	production_countries_string: string;
	spoken_languages: string[];
	spoken_languages_string: string;
	tagline: string;
	vote_average: number;
	vote_count: number;
	collection_id: string | null;
	youtube_url: string;
	posters: Poster[] | null;
}

export interface Poster{
	file_path: string;
	vote_average: number;
	vote_count: number;
}

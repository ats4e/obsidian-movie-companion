import { Renderable } from "./base.models";

export interface Frontmatter {
	[key: string]: string | string[];
}

export interface CollectionsSearch {
	id: number;
	name: string;
	original_name: string;
	poster_path: string;
	backdrop_path: string;
	overview: string;
}

export interface Collection extends Renderable {
	name: string;
	poster_path: string;
	backdrop_path: string;
	overview: string;
}

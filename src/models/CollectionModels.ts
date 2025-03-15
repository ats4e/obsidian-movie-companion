import { Renderable } from "./RenderableModels";

export interface Frontmatter {
	[key: string]: string | string[];
}

export interface CollectionLight extends Renderable {
	poster_path: string;
	backdrop_path: string;
	overview: string;
}

export interface Collection extends CollectionLight {
	parts: number[];
}

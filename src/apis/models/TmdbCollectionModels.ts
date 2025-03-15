export interface TMDBCollectionsSearchResponse {
	page: number;
	results: TMDBCollectionSearchResult[];
	total_pages: number;
	total_results: number;
}

export interface TMDBCollectionSearchResult {
	id: number;
	name: string;
	original_name: string;
	poster_path: string;
	backdrop_path: string;
	overview: string;
}

export interface TMDBCollectionResponse {
	id: number;
	name: string;
	poster_path: string;
	backdrop_path: string;
	overview: string;
}

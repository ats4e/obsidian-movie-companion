import { App, SuggestModal } from "obsidian";
import { MovieSearch } from "@models/movie.model";

export class MovieSuggestModal extends SuggestModal<MovieSearch> {
	constructor(
		app: App,
		private readonly suggestion: MovieSearch[],
		private onChoose: (error: Error | null, result?: MovieSearch) => void,
	) {
		super(app);
	}

	getSuggestions(query: string): MovieSearch[] {
		return this.suggestion.filter(movie => {
			const search_query = query?.toLowerCase();
			return (
				movie.title?.toLowerCase().includes(search_query) ||
				movie.original_title?.toLowerCase().includes(search_query) ||
				movie.release_date?.toLowerCase().includes(search_query)
			);
		});
	}

	renderSuggestion(movie: MovieSearch, element: HTMLElement) {
		element.addClass("movie-search-plugin__movie-suggestion-item");

		if (movie.poster_path) {
			element.createEl("img", {
				cls: "movie-search-plugin__movie-cover-image",
				attr: {
					src: movie.poster_path,
					alt: `Poster of the ${movie.title}`,
				},
			});
		}
		const text_div = element.createEl("div", { cls: "movie-search-plugin__movie-text-info" });

		text_div.createEl("div", { text: movie.title });

		const media_type = movie.media_type.toUpperCase();
		const release_date = movie.release_date ? movie.release_date : "-";
		const original_title = movie.original_title ? movie.original_title : "-";
		text_div.createEl("small", {
			text:
				movie.title === original_title
					? `${media_type}: ${release_date}`
					: `${media_type}: ${original_title} (${release_date})`,
		});
	}

	onChooseSuggestion(movie: MovieSearch) {
		this.onChoose(null, movie);
	}
}

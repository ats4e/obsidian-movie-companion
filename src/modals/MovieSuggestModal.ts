import { App, SuggestModal } from "obsidian";
import { MovieLight } from "@models/MovieModels";
import i18n from "../services/I18nService";

export class MovieSuggestModal extends SuggestModal<MovieLight> {
	constructor(
		app: App,
		private readonly suggestion: MovieLight[],
		private onChoose: (error: Error | null, result?: MovieLight) => void,
	) {
		super(app);
	}

	getSuggestions(query: string): MovieLight[] {
		const filteredMovies = this.suggestion.filter(movie => {
			const search_query = query?.toLowerCase();
			return (
				movie.title?.toLowerCase().includes(search_query) ||
				movie.original_title?.toLowerCase().includes(search_query) ||
				movie.release_date?.toLowerCase().includes(search_query)
			);
		});

		return filteredMovies.sort((a, b) => {
			const dateA = new Date(a.release_date);
			const dateB = new Date(b.release_date);
			return dateA.getTime() - dateB.getTime();
		});
	}

	renderSuggestion(movie: MovieLight, element: HTMLElement) {
		element.addClass("movie-companion__movie-suggestion-item");

		if (movie.poster_path) {
			element.createEl("img", {
				cls: "movie-companion__movie-cover-image",
				attr: {
					src: movie.poster_path,
					alt: i18n.t("modals.posterOfThe") + " " +  movie.title,
				},
			});
		}
		const text_div = element.createEl("div", { cls: "movie-companion__movie-text-info" });

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

	onChooseSuggestion(movie: MovieLight) {
		this.onChoose(null, movie);
	}
}

import { App, SuggestModal } from "obsidian";
import { CollectionsSearch } from "@models/collection.model";

export class CollectionSuggestModal extends SuggestModal<CollectionsSearch> {
	constructor(
		app: App,
		private readonly suggestion: CollectionsSearch[],
		private onChoose: (error: Error | null, result?: CollectionsSearch) => void,
	) {
		super(app);
	}

	getSuggestions(query: string): CollectionsSearch[] {
		return this.suggestion.filter(collection => {
			const search_query = query?.toLowerCase();
			return (
				collection.name?.toLowerCase().includes(search_query) ||
				collection.original_name?.toLowerCase().includes(search_query)
			);
		});
	}

	renderSuggestion(collection: CollectionsSearch, element: HTMLElement) {
		element.addClass("movie-search-plugin__movie-suggestion-item");

		if (collection.poster_path) {
			element.createEl("img", {
				cls: "movie-search-plugin__movie-cover-image",
				attr: {
					src: collection.poster_path,
					alt: `Poster of the ${collection.name}`,
				},
			});
		}
		const text_div = element.createEl("div", { cls: "movie-search-plugin__movie-text-info" });

		text_div.createEl("div", { text: collection.name });

		const original_title = collection.original_name ? collection.original_name : "-";
		text_div.createEl("small", {
			text: `${original_title}`,
		});
	}

	onChooseSuggestion(collection: CollectionsSearch) {
		this.onChoose(null, collection);
	}
}

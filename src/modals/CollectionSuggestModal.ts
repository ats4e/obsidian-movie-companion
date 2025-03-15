import { App, SuggestModal } from "obsidian";
import { CollectionLight } from "@models/CollectionModels";
import i18n from "../services/I18nService";

export class CollectionSuggestModal extends SuggestModal<CollectionLight> {
	constructor(
		app: App,
		private readonly suggestion: CollectionLight[],
		private onChoose: (error: Error | null, result?: CollectionLight) => void,
	) {
		super(app);
	}

	getSuggestions(query: string): CollectionLight[] {
		return this.suggestion.filter(collection => {
			const search_query = query?.toLowerCase();
			return (
				collection.name?.toLowerCase().includes(search_query)
			);
		});
	}

	renderSuggestion(collection: CollectionLight, element: HTMLElement) {
		element.addClass("movie-companion__movie-suggestion-item");

		if (collection.poster_path) {
			element.createEl("img", {
				cls: "movie-companion__movie-cover-image",
				attr: {
					src: collection.poster_path,
					alt: i18n.t("modals.posterOfThe") + " " + collection.name,
				},
			});
		}
		const text_div = element.createEl("div", { cls: "movie-companion__movie-text-info" });

		text_div.createEl("div", { text: collection.name });

	}

	onChooseSuggestion(collection: CollectionLight) {
		this.onChoose(null, collection);
	}
}

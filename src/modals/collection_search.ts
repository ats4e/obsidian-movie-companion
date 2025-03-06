import { ButtonComponent, Modal, Setting, TextComponent, Notice } from "obsidian";
import { BaseCollectionsAPI, get_collection_service_provider } from "@apis/base_api";
import MovieSearchPlugin from "@src/main";
import { CollectionsSearch } from "@models/collection.model";

export let search_query = "";

export class CollectionSearchModal extends Modal {
	private isBusy = false;
	private okBtnRef?: ButtonComponent;
	private service_provider: BaseCollectionsAPI;

	constructor(
		plugin: MovieSearchPlugin,
		private query: string,
		private locale_preference: string,
		private callback: (error: Error | null, result?: CollectionsSearch[]) => void,
	) {
		super(plugin.app);
		this.service_provider = get_collection_service_provider(plugin.settings, locale_preference);
	}

	setBusy(busy: boolean) {
		this.isBusy = busy;
		this.okBtnRef?.setDisabled(busy);
		this.okBtnRef?.setButtonText(busy ? "Requesting..." : "Search");
	}

	async search_collection() {
		if (!this.query) throw new Error("No query entered.");

		if (!this.isBusy) {
			try {
				this.setBusy(true);
				const searchResults = await this.service_provider.get_collections_by_(this.query);
				this.setBusy(false);

				if (!searchResults?.length) {
					new Notice(`No results found for "${this.query}"`); // Couldn't find any collections.
					return;
				}
				search_query = this.query;
				this.callback(null, searchResults);
			} catch (err) {
				this.callback(err as Error);
			}
			this.close();
		}
	}

	submitEnterCallback(event: KeyboardEvent) {
		if (event.key === "Enter" && !event.isComposing) {
			this.search_collection();
		}
	}

	onOpen() {
		const { contentEl } = this;

		contentEl.createEl("h2", { text: "Search Collection" });

		contentEl.createDiv({ cls: "movie-search-plugin__search-modal--input" }, setting_item => {
			new TextComponent(setting_item)
				.setValue(this.query)
				.setPlaceholder("Search by keyword")
				.onChange(value => (this.query = value))
				.inputEl.addEventListener("keydown", this.submitEnterCallback.bind(this));
		});
		new Setting(contentEl).addButton(btn => {
			return (this.okBtnRef = btn
				.setButtonText("Search")
				.setCta()
				.onClick(() => {
					this.search_collection();
				}));
		});
	}

	onClose() {
		this.contentEl.empty();
	}
}

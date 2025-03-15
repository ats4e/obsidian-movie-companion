import { Setting, TextComponent, Notice, App } from "obsidian";
import { CollectionLight } from "@models/CollectionModels";
import { PluginSettings } from "@settings/PluginSettings";
import { BaseSearchModal } from "./BaseSearchModal";
import { TMDBCollectionsAPI } from "@apis/TmdbCollectionsApi";
import { getCollectionsAPI } from "@apis/ApiFactory";
import i18n from "../services/I18nService";

export let search_query = "";

export class CollectionSearchModal extends BaseSearchModal {
	private service_provider: TMDBCollectionsAPI;

	constructor(
		app: App,
		settings: PluginSettings,
		private query: string,
		private callback: (error: Error | null, result?: CollectionLight[]) => void,
	) {
		super(app, settings);
		this.service_provider = getCollectionsAPI(settings);
	}

	async search_collection() {
		if (!this.query) throw new Error(i18n.t("modals.missingInput"));

		if (!this.isBusy) {
			try {
				this.setBusy(true);
				const searchResults = await this.service_provider.get_collections(this.query);
				this.setBusy(false);

				if (!searchResults?.length) {
					new Notice(i18n.t("modals.noResultFound")); // Couldn't find any collections.
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

		contentEl.createEl("h2", { text: i18n.t("modals.searchCollection") });

		contentEl.createDiv({ cls: "movie-companion__search-modal--input" }, setting_item => {
			new TextComponent(setting_item)
				.setValue(this.query)
				.setPlaceholder(i18n.t("modals.searchByKeyword"))
				.onChange(value => (this.query = value))
				.inputEl.addEventListener("keydown", this.submitEnterCallback.bind(this));
		});
		new Setting(contentEl).addButton(btn => {
			return (this.okBtnRef = btn
				.setButtonText(i18n.t("modals.search"))
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

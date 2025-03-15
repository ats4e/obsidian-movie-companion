import { ButtonComponent, Modal, Setting, TextComponent, Notice, App } from "obsidian";
import { MovieLight } from "@models/MovieModels";
import { PluginSettings } from "@settings/PluginSettings";
import { BaseSearchModal } from "./BaseSearchModal";
import { TMDBMoviesAPI } from "@apis/TmdbMoviesApi";
import { getMoviesAPI } from "@apis/ApiFactory";
import i18n from "../services/I18nService";

export let search_query = "";

export class MovieSearchModal extends BaseSearchModal {
	private service_provider: TMDBMoviesAPI;

	constructor(
		app: App,
		settings: PluginSettings,
		private query: string,
		private callback: (error: Error | null, result?: MovieLight[]) => void,
	) {
		super(app, settings);
		this.service_provider = getMoviesAPI(settings);
	}

	async search_movie() {
		if (!this.query) throw new Error(i18n.t("modals.missingInput"));

		if (!this.isBusy) {
			try {
				this.setBusy(true);
				const searchResults = await this.service_provider.getMovies(this.query);
				this.setBusy(false);

				if (!searchResults?.length) {
					new Notice(i18n.t("modals.noResultFound")); // Couldn't find the movie.
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
			this.search_movie();
		}
	}

	onOpen() {
		const { contentEl } = this;

		contentEl.createEl("h2", { text: i18n.t("modals.searchMovie") });

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
					this.search_movie();
				}));
		});
	}

	onClose() {
		this.contentEl.empty();
	}
}

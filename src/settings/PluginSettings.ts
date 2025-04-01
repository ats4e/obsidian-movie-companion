import { App, PluginSettingTab, Setting } from "obsidian";
import { normalizePath } from 'obsidian';

import MovieCompanionPlugin from "../Main";

import { FileSuggest } from "./suggesters/FileSuggester";
import { FolderSuggest } from "./suggesters/FolderSuggester";

import i18n from '../services/I18nService';

const plugin_repo_url = process.env.HOMEPAGE;

export interface PluginSettings {
	movie_folder: string; // new movie file location
	tv_shows_folder: string; // new tv shows file location
	collection_folder: string; // new collection file location
	movie_template_file: string;
	tv_shows_template_file: string;
	collection_template_file: string;
	automatic_collection_creation: boolean;
	open_page_on_completion: boolean;
	locale_preference: string;
	api_key: string;
	show_manual_create_collection_button_ribbon: boolean;
	manual_poster_choise: boolean;
}

export const DEFAULT_SETTINGS: PluginSettings = {
	movie_folder: "",
	tv_shows_folder: "",
	movie_template_file: "",
	tv_shows_template_file: "",
	collection_template_file: "",
	collection_folder: "",
	open_page_on_completion: true,
	locale_preference: getDefaultLocale(),
	api_key: "",
	automatic_collection_creation: true,
	show_manual_create_collection_button_ribbon: false,
	manual_poster_choise: false,
};

function getDefaultLocale() : string {
	// Determina il locale predefinito dal sistema
	const system_locale = navigator.language.split('-')[0] || "en";
	return system_locale;
}

export class MovieSearchSettingTab extends PluginSettingTab {
	constructor(app: App, private plugin: MovieCompanionPlugin) {
		super(app, plugin);
	}

	get settings() {
		return this.plugin.settings;
	}

	display(): void {
		const { containerEl } = this;

		containerEl.empty();
		containerEl.classList.add("movie-companion__settings");

		// Movies Settings
		new Setting(containerEl).setName(i18n.t("settings.movies")).setHeading();

		new Setting(containerEl)
			.setName(i18n.t("settings.newMovieNoteLocation"))
			.setDesc(i18n.t("settings.newMovieNoteLocationDescription"))
			.addSearch(cb => {
				try {
					new FolderSuggest(this.app, cb.inputEl);
				} catch {
					// eslint-disable
				}
				cb.setPlaceholder(i18n.t("settings.folderLocationPlaceholder"))
					.setValue(this.plugin.settings.movie_folder)
					.onChange(new_folder => {
						this.plugin.settings.movie_folder = normalizePath(new_folder);
						this.saveSettings();
					});
			});

			const template_file_desc = document.createDocumentFragment();
			template_file_desc.createDiv({ text: i18n.t("settings.templateFileDescription") });
			template_file_desc.createEl("a", {
				text: i18n.t("settings.exampleTemplate"),
				href: `${plugin_repo_url}#Movie Note Template`,
			});
			new Setting(containerEl)
				.setName(i18n.t("settings.movieTemplateFile"))
				.setDesc(template_file_desc)
				.addSearch(cb => {
					try {
						new FileSuggest(this.app, cb.inputEl);
					} catch {
						// eslint-disable
					}
					cb.setPlaceholder(i18n.t("settings.templateFilePlaceholder"))
						.setValue(this.plugin.settings.movie_template_file)
						.onChange(new_template_file => {
							this.plugin.settings.movie_template_file = normalizePath(new_template_file);
							this.saveSettings();
						});
				});
	
		// TV Shows Settings
		/* TODO: Implement TV Shows
		new Setting(containerEl).setName("TV Shows").setHeading();
		
		new Setting(containerEl)
			.setName("New TV Shows file location")
			.setDesc("New TV Shows notes will be placed here.")
			.addSearch(cb => {
				try {
					new FolderSuggest(this.app, cb.inputEl);
				} catch {
					// eslint-disable
				}
				cb.setPlaceholder("Example: folder1/folder2")
					.setValue(this.plugin.settings.tv_shows_folder)
					.onChange(new_folder => {
						this.plugin.settings.tv_shows_folder = normalizePath(new_folder);
						this.saveSettings();
					});
			});

		const tv_show_template_file_desc = document.createDocumentFragment();
		tv_show_template_file_desc.createDiv({ text: "Files will be available as templates." });
		tv_show_template_file_desc.createEl("a", {
			text: "Example template",
			href: `${plugin_repo_url}#example-template`,
		});
		new Setting(containerEl)
			.setName("TV Show template file")
			.setDesc(tv_show_template_file_desc)
			.addSearch(cb => {
				try {
					new FileSuggest(this.app, cb.inputEl);
				} catch {
					// eslint-disable
				}
				cb.setPlaceholder("Example: templates/template-file.md")
					.setValue(this.plugin.settings.tv_shows_template_file)
					.onChange(new_template_file => {
						this.plugin.settings.tv_shows_template_file = normalizePath(new_template_file);
						this.saveSettings();
					});
			});
			*/

		// Collection Settings
		new Setting(containerEl).setName(i18n.t("settings.collections")).setHeading();
		
		new Setting(containerEl)
			.setName(i18n.t("settings.newCollectionNoteLocation"))
			.setDesc(i18n.t("settings.newCollectionNoteLocationDescription"))
			.addSearch(cb => {
				try {
					new FolderSuggest(this.app, cb.inputEl);
				} catch {
					// eslint-disable
				}
				cb.setPlaceholder(i18n.t("settings.folderLocationPlaceholder"))
					.setValue(this.plugin.settings.collection_folder)
					.onChange(new_folder => {
						this.plugin.settings.collection_folder = normalizePath(new_folder);
						this.saveSettings();
					});
			});

		const collection_template_file_desc = document.createDocumentFragment();
		collection_template_file_desc.createDiv({ text: i18n.t("settings.templateFileDescription") });
		collection_template_file_desc.createEl("a", {
			text: i18n.t("settings.exampleTemplate"),
			href: `${plugin_repo_url}#Collection Note Template`,
		});
		new Setting(containerEl)
			.setName(i18n.t("settings.collectionTemplateFile"))
			.setDesc(collection_template_file_desc)
			.addSearch(cb => {
				try {
					new FileSuggest(this.app, cb.inputEl);
				} catch {
					// eslint-disable
				}
				cb.setPlaceholder(i18n.t("settings.templateFilePlaceholder"))
					.setValue(this.plugin.settings.collection_template_file)
					.onChange(new_template_file => {
						this.plugin.settings.collection_template_file = normalizePath(new_template_file);
						this.saveSettings();
					});
			});

		// Auto Create Collection Flag
		new Setting(containerEl)
			.setName(i18n.t("settings.autoCreateCollectionFlag"))
			.setDesc(i18n.t("settings.autoCreateCollectionDescription"))
			.addToggle(toggle =>
				toggle.setValue(this.plugin.settings.automatic_collection_creation).onChange(async value => {
					this.plugin.settings.automatic_collection_creation = value;
					await this.saveSettings();
				}),
			);

		// Manual Collection Creation Button
		const manualCollectionDesc = document.createDocumentFragment();
		manualCollectionDesc.createDiv({ text: i18n.t("settings.showCreateCollectionRibbonButtonDescription") });
		const restartLink = manualCollectionDesc.createDiv();
		restartLink.createEl("a", {
			text: i18n.t("settings.requiresRestart"),
			href: "#",
		}).addEventListener("click", () => {
			// Command to restart Obsidian
			const commands = (this.app as any).commands;
			commands.executeCommandById('app:reload');
		});

		new Setting(containerEl)
			.setName(i18n.t("settings.showCreateCollectionRibbonButton"))
			.setDesc(manualCollectionDesc)
			.addToggle(toggle =>
				toggle.setValue(this.plugin.settings.show_manual_create_collection_button_ribbon).onChange(async value => {
					this.plugin.settings.show_manual_create_collection_button_ribbon = value;
					await this.saveSettings();
				}),
			);

		// General Settings
		new Setting(containerEl).setName(i18n.t("settings.generalSettings")).setHeading();

		// Preferred locale
		new Setting(containerEl)
			.setName(i18n.t("settings.preferredLocale"))
			.setDesc(i18n.t("settings.preferredLocaleDescription"))
			.addDropdown(dropdown => {
				window.moment.locales().forEach(locale => {
					dropdown.addOption(locale, locale);
				});

				dropdown.setValue(this.settings.locale_preference);

				dropdown.onChange(async value => {
					const new_value = value;
					this.settings.locale_preference = new_value;
					await this.saveSettings();
				});
			});
		new Setting(containerEl)
			.setName(i18n.t("settings.openNoteAfterCreation"))
			.setDesc(i18n.t("settings.openNoteAfterCreationDescription"))
			.addToggle(toggle =>
				toggle.setValue(this.plugin.settings.open_page_on_completion).onChange(async value => {
					this.plugin.settings.open_page_on_completion = value;
					await this.saveSettings();
				}),
			);
		new Setting(containerEl)
			.setName(i18n.t("settings.selectPoster"))
			.setDesc(i18n.t("settings.selectPosterDescription"))
			.addToggle(toggle =>
				toggle.setValue(this.plugin.settings.manual_poster_choise).onChange(async value => {
					this.plugin.settings.manual_poster_choise = value;
					await this.saveSettings();
				}),
			);


		// TMDB API Settings
		const api_key_desc = document.createDocumentFragment();
		api_key_desc.createEl("a", {
			text: i18n.t("settings.tmdbApiRetrieveApiKey"),
			href: "https://www.themoviedb.org/settings/api",
		});
		
		new Setting(containerEl)
			.setName(i18n.t("settings.tmdbApiTitle"))
			.setDesc(api_key_desc)
			.addText(text => {
				text.inputEl.type = "password";
				text.setValue(this.plugin.settings.api_key).onChange(async value => {
					this.plugin.settings.api_key = value;
					await this.saveSettings();
				});
			});
	}

	async saveSettings() {
        await this.plugin.saveData(this.settings);    
    }
}

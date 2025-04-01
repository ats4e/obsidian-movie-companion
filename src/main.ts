import { Notice, Plugin, TFile } from "obsidian";

import { MovieSearchSettingTab, PluginSettings, DEFAULT_SETTINGS } from "@settings/PluginSettings";
import { MovieService } from "./services/MovieService";
import { CollectionService } from "./services/CollectionService";
import { Movie } from "@models/MovieModels";
import i18n from './services/I18nService';

// Import locale files
import en from '../locales/en.json';
import it from '../locales/it.json';
import de from '../locales/de.json';
import fr from '../locales/fr.json';
import es from '../locales/es.json';
import pt from '../locales/pt.json';
import ru from '../locales/ru.json';
import zh from '../locales/zh.json';
import ja from '../locales/ja.json';

export default class MovieCompanionPlugin extends Plugin {
    settings: PluginSettings;
    movieService: MovieService;
    collectionService: CollectionService;
    
    private initializei18n() {
        i18n.loadLocale('en', en);
        i18n.loadLocale('it', it);
        i18n.loadLocale('de', de);
        i18n.loadLocale('fr', fr);
        i18n.loadLocale('es', es);
        i18n.loadLocale('pt', pt);
        i18n.loadLocale('ru', ru);
        i18n.loadLocale('zh', zh);
        i18n.loadLocale('ja', ja); 

        i18n.setLocale(this.settings.locale_preference);
    }

    async onload() {
        await this.loadSettings();

        this.initializei18n();
        
        this.movieService = new MovieService(this.app, this.settings, this.showNotice, this.onMovieCreated);
        this.collectionService = new CollectionService(this.app, this.settings, this.showNotice);

        if (!this.settings.api_key) {
            this.showNotice(i18n.t("errors.invalidTmdbApiKey"));
        }

        if(!this.settings.locale_preference) { 
            this.showNotice(i18n.t("errors.noLocaleFound"));
        }

        // Add ribbon icons
        // https://docs.obsidian.md/Plugins/User+interface/Icons
        const ribbon_icon_element = this.addRibbonIcon("clapperboard", i18n.t("commands.createMovieNote"), () =>
            this.movieService.createNewMovieNote(),
        );
        ribbon_icon_element.addClass("obsidian-movie-companion-ribbon-class");

        const ribbon_icon_c_element = this.addRibbonIcon("film", i18n.t("commands.createCollectionNote"), () =>
            this.collectionService.searchAndCreateCollectionNote(),
        );
        ribbon_icon_c_element.addClass("obsidian-movie-companion-ribbon-class");

        // Add commands
        this.addCommand({
            id: "open-movie-search-modal",
            name: i18n.t("commands.createMovieNote"),
            callback: () => this.movieService.createNewMovieNote(),
        });

        this.addCommand({
            id: "open-collection-search-modal",
            name: i18n.t("commands.createCollectionNote"),
            callback: () => this.collectionService.searchAndCreateCollectionNote(),
        });

        // Add settings tab
        this.addSettingTab(new MovieSearchSettingTab(this.app, this));

        console.log(
            `Movie Search: version ${this.manifest.version} (requires obsidian ${this.manifest.minAppVersion})`,
        );
    }

    async showNotice(message: unknown) {
        try {
            new Notice(message?.toString(), 5000);
        } catch {
            // eslint-disable
        }
    }

    onMovieCreated = async (movie: Movie) => {
        if(!this.settings.automatic_collection_creation || !movie.collection_id)
            return;

        const collection_id = parseInt(movie.collection_id, 10);

        if(!collection_id)
            return;

        let collection = await this.collectionService.getCollectionById(collection_id);

        let collection_file_path = await this.collectionService.getFilePath(collection, this.settings.collection_folder);

        let collection_file = this.app.vault.getFileByPath(collection_file_path);

        if(!collection || collection_file)
            return;

        this.collectionService.createNewCollectioNote(collection, false);
    }

    async loadSettings() {
        this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
    }

    

}
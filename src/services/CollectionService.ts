import { App } from "obsidian";
import { CollectionLight, Collection } from "@models/CollectionModels";
import { PluginSettings } from "@settings/PluginSettings";
import { IsOverwriteFileModal } from "@modals/is_overwrite_file";
import { CollectionSuggestModal } from "@modals/CollectionSuggestModal";
import { CollectionSearchModal } from "@modals/CollectionSearchModal";
import { BaseRenderableService } from "./BaseRenderableService";
import { getCollectionsAPI } from "@apis/ApiFactory";
import i18n from './I18nService';

export class CollectionService extends BaseRenderableService {  
  constructor(
    protected app: App,
    protected settings: PluginSettings,
    protected show_notice: (message: unknown) => Promise<void>
  ) {
    super(app, settings, show_notice);
  }

  async searchAndCreateCollectionNote(): Promise<void> {
    if (!this.settings.api_key) {
      this.show_notice(i18n.t("errors.invalidTmdbApiKey"));
      return;
    }
    try {
      const collection = await this.findCollection();
      
      this.createNewCollectioNote(collection, true);

    } catch (err) {
      console.warn(err);
      this.show_notice(err);
    }
  }

  async createNewCollectioNote(collection: Collection, check_open_on_create: boolean): Promise<void> {
    if (!this.settings.api_key) {
      this.show_notice(i18n.t("errors.invalidTmdbApiKey"));
      return;
    }

    try {
      const file_path = await this.getFilePath(collection, this.settings.collection_folder);
      var file = this.app.vault.getFileByPath(file_path);

      var create_file = true;
      if(file) {
        const is_overwrite = await this.openBoolModal(IsOverwriteFileModal, file.name);
        create_file = is_overwrite;
        if (is_overwrite)
          await this.app.vault.delete(file);
      }

      if (create_file) {
        const rendered_contents = await this.templateService.getRenderedContent(collection, this.settings.collection_template_file);  
        file = await this.app.vault.create(file_path, rendered_contents);
      }

      if (check_open_on_create && this.settings.open_page_on_completion)
        this.openNote(file);

    } catch (err) {
      console.warn(err);
      this.show_notice(err);
    }
  }

  private async getCollectionSearchData(query?: string): Promise<CollectionLight> {
    let locale_preference = this.settings.locale_preference;
    const searched_collections = await this.openCollectionSearchModal(query, locale_preference);
    if (searched_collections.length == 1) return searched_collections[0];
    return await this.openCollectionSuggestModal(searched_collections);
  }

  private async findCollection(query?: string): Promise<Collection> {
    let locale_preference = this.settings.locale_preference;
    const searched_collections = await this.openCollectionSearchModal(query, locale_preference);
    var collectionLight = searched_collections[0];
    if (searched_collections.length > 1) 
      collectionLight = await this.openCollectionSuggestModal(searched_collections);

    return this.getCollectionById(collectionLight.id);
    
  }

  async getCollectionById(collection_id: number): Promise<Collection> {
    const service_provider = getCollectionsAPI(this.settings);
    return service_provider.get_collection_by_id(collection_id);
  }

  private async openCollectionSearchModal(query = "", locale_preference: string): Promise<CollectionLight[]> {

    return new Promise((resolve, reject) => {
      return new CollectionSearchModal(this.app, this.settings, query, (error, results) => {
        return error ? reject(error) : resolve(results);
      }).open();
    });
  }

  private async openCollectionSuggestModal(collections: CollectionLight[]): Promise<CollectionLight> {
    return new Promise((resolve, reject) => {
      return new CollectionSuggestModal(this.app, collections, (error, selected_collection) => {
        return error ? reject(error) : resolve(selected_collection);
      }).open();
    });
  }

  
}
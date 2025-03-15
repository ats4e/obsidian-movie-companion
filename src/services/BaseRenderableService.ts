import { PluginSettings } from "@settings/PluginSettings";
import { App, TFile } from "obsidian";
import { Renderable } from "@models/RenderableModels";
import { CursorJumper } from "@utils/CursorJumper";
import { TemplateService } from "./TemplateService";

export abstract class BaseRenderableService {

  protected templateService: TemplateService;

  constructor(
    protected app: App,
    protected settings: PluginSettings,
    protected show_notice: (message: unknown) => Promise<void>
  ) {
    this.templateService = new TemplateService(app);
  }

  public async getFilePath(
    renderable: Renderable,
    folder_path: string
  ): Promise<string> {
    const file_name = generateFileName(renderable);
    await this.createFolder(folder_path);
    return `${folder_path}/${file_name}`;
  }

  protected async createFolder(folder_path: string): Promise<void> {
    if(!folder_path)
      return;
    
    try {
      
      if (!this.app.vault.getFolderByPath(folder_path)) {
        await this.app.vault.createFolder(folder_path);
      }
    } catch (err) {
      console.warn(err);
    }
  }

  /**
   * Opens a modal and returns a promise that resolves to a boolean value.
   *
   * @param modal - The modal class to be instantiated and opened.
   * @param args - Additional arguments to be passed to the modal constructor.
   * @returns A promise that resolves to a boolean value indicating the result of the modal.
   */
  async openBoolModal(modal, ...args: unknown[]): Promise<boolean> {
    return new Promise((resolve, reject) => {
      const m = new modal(this.app, ...args);
      m.open();
      m.waitForResult()
        .then((result) => {
          resolve(result);
        })
        .catch((error) => {
          reject(error);
        });
    });
  }

  /**
   * Opens a modal and returns a promise that resolves to the modal result.
   *
   * @param modal - The modal class to be instantiated and opened.
   * @param args - Additional arguments to be passed to the modal constructor.
   * @returns A promise that resolves to the modal result.
   */
  async openNote(target_file: TFile) {
    const active_leaf = this.app.workspace.getLeaf();
    if (!active_leaf) {
      console.warn("No active leaf");
      return;
    }
    await active_leaf.openFile(target_file, { state: { mode: "source" } });
    active_leaf.setEphemeralState({ rename: "all" });
    //await new CursorJumper(this.app).jump_to_next_cursor_location();
  }
}

export function replaceIllegalCharsFromPath(text: string) {
  return text
      .replace(/[\\*<>":?]/g, "") // Removes illegal characters
      .replace(/\s+/g, " ") // Replaces multiple spaces with a single space
      .replace(/^\.+/, ""); // Removes all leading dots from the string
}

export function generateFileName(renderable: Renderable) {
  const title = replaceIllegalCharsFromPath(renderable.name);
  return `${title}.md`;
}


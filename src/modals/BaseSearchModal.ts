import { PluginSettings } from "@settings/PluginSettings";
import i18n from "../services/I18nService";
import { App, ButtonComponent, Modal } from "obsidian";

export abstract class BaseSearchModal extends Modal {

	protected isBusy = false;
	protected okBtnRef?: ButtonComponent;

	constructor(
		app: App,
		protected settings: PluginSettings,
	) {
		super(app);
	}

    protected setBusy(busy: boolean) {
		this.isBusy = busy;
		this.okBtnRef?.setDisabled(busy);
		this.okBtnRef?.setButtonText(busy ? i18n.t("modals.requesting") : i18n.t("modals.search"));
	}
}
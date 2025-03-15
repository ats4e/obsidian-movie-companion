import { App } from "obsidian";

import { IsBoolModal } from "./is_bool";

import i18n from "../services/I18nService";

export class IsOverwriteFileModal extends IsBoolModal {
	resolve: ((value: boolean) => void) | null = null;

	constructor(app: App, file_name: string) {
		super(app, i18n.t("modals.overwriteFileQuestion"), i18n.t("modals.yes"), i18n.t("modals.no"));
	}
}

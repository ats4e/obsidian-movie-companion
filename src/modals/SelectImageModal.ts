import { App, Modal } from "obsidian";
import i18n from "../services/I18nService";

export class SelectImageModal extends Modal {
	private suggestions: string[];
	private onChoose: (error: Error | null, result?: string) => void;
	private currentIndex: number = 0;
	private imageElements: HTMLImageElement[] = [];

	constructor(
		app: App,
		suggestions: string[],
		onChoose: (error: Error | null, result?: string) => void,
	) {
		super(app);
		this.suggestions = suggestions;
		this.onChoose = onChoose;
	}

	onOpen() {
		const { contentEl } = this;

		// Aggiunge un titolo
		contentEl.createEl("h2", { text: i18n.t("modals.selectPoster") });

		// Creiamo un contenitore per le immagini
		const imageContainer = contentEl.createEl("div", {
			cls: "movie-companion__image-container",
		});

		// Renderizza le immagini e salva i riferimenti agli elementi
		this.suggestions.forEach((imagePath, index) => {
			const imgEl = imageContainer.createEl("img", {
				attr: {
					src: imagePath,
					alt: i18n.t("modals.aPoster"),
					tabindex: "0", // Rende l'immagine navigabile con tab
				},
				cls: "movie-companion__movie-suggestion-cover-image",
			});

			this.imageElements.push(imgEl);

			// Selezione tramite click
			imgEl.addEventListener("click", () => {
				this.onChoose(null, imagePath);
				this.close();
			});

			// Aggiorna la selezione quando l'immagine riceve il focus
			imgEl.addEventListener("focus", () => {
				this.currentIndex = index;
				this.updateSelection();
			});
		});

		// Aggiunge il listener per la navigazione da tastiera globale
		this.modalEl.addEventListener("keydown", this.handleKeyDown);
	}

	onClose() {
		this.modalEl.removeEventListener("keydown", this.handleKeyDown);
		const { contentEl } = this;
		contentEl.empty(); // Pulisce il contenuto per evitare duplicazioni
	}

	private handleKeyDown = (event: KeyboardEvent) => {
		// Gestisce navigazione da tastiera globale
		if (event.key === "ArrowDown" || event.key === "ArrowRight") {
			event.preventDefault();
			this.currentIndex = (this.currentIndex + 1) % this.imageElements.length;
			this.updateSelection();
			this.imageElements[this.currentIndex].focus();
		} else if (event.key === "ArrowUp" || event.key === "ArrowLeft") {
			event.preventDefault();
			this.currentIndex = (this.currentIndex - 1 + this.imageElements.length) % this.imageElements.length;
			this.updateSelection();
			this.imageElements[this.currentIndex].focus();
		} else if (event.key === "Enter") {
			const selectedImage = this.suggestions[this.currentIndex];
			this.onChoose(null, selectedImage);
			this.close();
		}
	};

	private updateSelection() {
		this.imageElements.forEach((imgEl, index) => {
			// Aggiungi o rimuovi la classe "selected" per evidenziare l'immagine selezionata
			if (index === this.currentIndex) {
				imgEl.classList.add("selected");
			} else {
				imgEl.classList.remove("selected");
			}
		});
	}
}
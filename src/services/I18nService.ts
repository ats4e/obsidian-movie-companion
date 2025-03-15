export interface LocaleMap {
    [key: string]: string | LocaleMap;
}

export class I18nService {
    private locale: string;
    private translations: { [locale: string]: LocaleMap };
    private fallbackLocale: string = "en";

    constructor() {
        // Ottieni la lingua configurata in Obsidian o usa l'inglese come fallback
        this.locale = this.fallbackLocale;
        this.translations = {};
    }

    /**
     * Carica le traduzioni per una determinata lingua
     */
    public loadLocale(locale: string, translations: LocaleMap): void {
        this.translations[locale] = translations;
    }

    /**
     * Imposta la lingua corrente
     */
    public setLocale(locale: string): void {
        if (this.translations[locale] || locale === this.fallbackLocale) {
            this.locale = locale;
        } else {
            console.warn(`Locale ${locale} not available, using ${this.fallbackLocale}`);
            this.locale = this.fallbackLocale;
        }
    }

    /**
     * Ottieni la lingua corrente
     */
    public getLocale(): string {
        return this.locale;
    }

    /**
     * Traduce una chiave
     * Supporta la notazione con punti per accedere a chiavi annidate 
     * Es: "modal.title" accede a { modal: { title: "Titolo" } }
     */
    public t(key: string, replacements?: Record<string, string>): string {
        // Cerca prima nella lingua corrente
        let translated = this.getNestedTranslation(key, this.locale);
        
        // Se non trovato, cerca nella lingua di fallback
        if (translated === key && this.locale !== this.fallbackLocale) {
            translated = this.getNestedTranslation(key, this.fallbackLocale);
        }

        // Applica le sostituzioni se fornite
        if (replacements && typeof translated === 'string') {
            Object.entries(replacements).forEach(([placeholder, value]) => {
                translated = (translated as string).replace(
                    new RegExp(`{{\\s*${placeholder}\\s*}}`, 'g'), 
                    value
                );
            });
        }

        return translated;
    }

    private getNestedTranslation(key: string, locale: string): string {
        // Se non abbiamo traduzioni per questa lingua, restituisci la chiave
        if (!this.translations[locale]) {
            return key;
        }

        const parts = key.split('.');
        let current: any = this.translations[locale];

        // Naviga l'oggetto delle traduzioni seguendo la notazione con punti
        for (const part of parts) {
            if (current[part] === undefined) {
                return key; // Chiave non trovata, restituisci la chiave originale
            }
            current = current[part];
        }

        return typeof current === 'string' ? current : key;
    }
}

// Istanza singleton
const i18n = new I18nService();
export default i18n;
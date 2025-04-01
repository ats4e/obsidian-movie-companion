import { Renderable } from "@models/RenderableModels";
import { App, normalizePath, Notice, stringifyYaml } from "obsidian";

export class TemplateService {
    
    constructor(private app: App) { 

    }

    /**
     * Generates the rendered content of a note based on the info in the renderable object.
     * Apply the template transformations if a template path is provided.
     * @param renderable the object containing the information to be rendered.
     * @param template_path the path to the template file.
     * @returns the rendered content of the note.
     */
    async getRenderedContent(renderable: Renderable, template_path: string): Promise<string> {

        let rendered_content: string = "";

        if (template_path) {
            const template_content = await this.getTemplate(template_path);

            rendered_content = this.replaceTemplateVariableWithValues(
                this.applyTemplateTransformations(template_content),
                renderable,
            );
            
        } else {
    
            let replaced_variable_frontmatter = stringifyYaml(
                this.applyDefaultFrontmatter(renderable,
                )
            );

            rendered_content = `---\n${replaced_variable_frontmatter}\n---\n`;
        }

        return rendered_content;
    }


    async getTemplate(template_path: string): Promise<string> {
        const { metadataCache, vault } = this.app;
        const normalized_template_path = normalizePath(template_path ?? "");
        if (template_path === "/") return Promise.resolve("");

        try {
            const template_file = metadataCache.getFirstLinkpathDest(normalized_template_path, "");
            return template_file ? vault.cachedRead(template_file) : "";
        } catch (err) {
            console.error(`Failed to read the note template '${normalized_template_path}'`, err);
            new Notice("Failed to read the note template");
            return "";
        }
    }

    /**
     * Applies template transformations to the given raw template contents.
     * 
     * This function searches for placeholders in the format `{{ date }}` or `{{ time }}` 
     * with optional time calculations and moment.js formatting. It replaces these placeholders 
     * with the current date or time, optionally adjusted by a specified amount of time, 
     * and formatted according to the provided moment.js format string.
     * 
     * Supported placeholders:
     * - `{{ date }}`: Replaces with the current date in "YYYY-MM-DD" format.
     * - `{{ time }}`: Replaces with the current time in "YYYY-MM-DD" format.
     * - `{{ date +1d }}`: Replaces with the date one day in the future.
     * - `{{ time -2h }}`: Replaces with the time two hours in the past.
     * - `{{ date :MM/DD/YYYY }}`: Replaces with the current date in "MM/DD/YYYY" format.
     * 
     * @param raw_template_contents - The raw template contents containing placeholders.
     * @returns The template contents with placeholders replaced by the corresponding date or time values.
     */
    applyTemplateTransformations(raw_template_contents: string): string {
        return raw_template_contents.replace(
            /{{\s*(date|time)\s*(([+-]\d+)([yqmwdhs]))?\s*(:.+?)?}}/gi,
            (_, _time_or_date, calc, time_delta, unit, moment_format) => {
                const now = window.moment();
                const current_date = window
                    .moment()
                    .clone()
                    .set({
                        hour: now.get("hour"),
                        minute: now.get("minute"),
                        second: now.get("second"),
                    });
                if (calc) current_date.add(parseInt(time_delta, 10), unit);

                if (moment_format) return current_date.format(moment_format.substring(1).trim());
                return current_date.format("YYYY-MM-DD");
            },
        );
    }

    replaceTemplateVariableWithValues(template_content: string, renderable: Renderable): string {
        if (!template_content?.trim()) return "";
    
        const entries = Object.entries(renderable);

        return entries.reduce((result, [key, val = ""]) => {
            
            // Se il valore è un array, convertilo in una stringa formattata come elenco
            if (Array.isArray(val)) {
                // Trova tutte le corrispondenze del segnaposto
                const regex = new RegExp(`(.*?)(?:"{{${key}}}"|{{${key}}})`, "g");
                let match;
                let lastIndex = 0;

                // Itera su tutte le corrispondenze
                while ((match = regex.exec(result)) !== null) {
                    // Determina l'indentazione corrente per la corrispondenza trovata
                    const indentation = match[1]; // // Cattura tutto prima di "{{${key}}}" o {{${key}}}
                    const hasQuotes = match[0].includes('"'); // Verifica se il testo contiene le virgolette

                    // Crea l'elenco con l'indentazione
                    const formattedList = val.map((item, index) => {
                        let formatted_val = removeInvalidCharFromValues(item);
                        // aggiungi le virgolette se necessario
                        formatted_val = hasQuotes ? `"${formatted_val}"` : `${formatted_val}`;
                        
                        // aggiungi l'indentazione
                        return `${indentation}${formatted_val}`;
                    }).join("\n");

                    // Sostituisci il segnaposto con l'elenco formattato
                    result = result.slice(0, match.index) + formattedList + result.slice(regex.lastIndex);
                    lastIndex = match.index + formattedList.length;
                }
            } else {
                val = val || ""; // Se il valore è undefined o null, usa una stringa vuota

                val = removeInvalidCharFromValues(val);

                result = result.replace(new RegExp(`{{${key}}}`, "ig"), val);
            }

            return result;
        }, template_content)
        .replace(/{{\w+}}/gi, "")
        .trim();
    }

    applyDefaultFrontmatter(renderable: Renderable) {
        const _frontmatter = convertToSnakeCaseMap(renderable);

        return _frontmatter as object;
    }
}

export function convertToSnakeCaseMap(renderable: Renderable) {
	return Object.entries(renderable).reduce((acc, [key, value]) => {
		acc[convertCamelToSnakeCase(key)] = value;
		return acc;
	}, {});
}

export function convertCamelToSnakeCase(str: string) {
	return str.replace(/[A-Z]/g, letter => `_${letter?.toLowerCase()}`);
}

export function removeInvalidCharFromValues(str: string) {
    if(!str)
        return;
    
    return (str + "").replace(/\"/g, "");
}

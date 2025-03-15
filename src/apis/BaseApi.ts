import { requestUrl } from "obsidian";


export abstract class BaseAPI {
	constructor(
		protected api_key: string,
		protected locale_preference: string,
	) {}

	protected add_jwt_or_api_key(params: Record<string, string | number | boolean>, headers: Record<string, string>) {

		if (this.api_key.length > 32) {
			const splited_api_key = this.api_key.split(" ");
			headers["Authorization"] =
				splited_api_key.length > 1
					? `Bearer ${splited_api_key[splited_api_key.length - 1]}`
					: `Bearer ${this.api_key}`;
		} else params["api_key"] = this.api_key;
	}
}

export async function api_get<T>(
	url: string,
	params: Record<string, string | number | boolean> = {},
	headers?: Record<string, string>,
): Promise<T> {
	const api_URL = new URL(url);
	Object.entries(params).forEach(([key, value]) => {
		api_URL.searchParams.append(key, value?.toString());
	});
	const result = await requestUrl({
		url: api_URL.href,
		method: "GET",
		headers: {
			Accept: "*/*",
			"Content-Type": "application/json; charset=utf-8",
			...headers,
		},
	});
	return result.json as T;
}

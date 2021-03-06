
/* spellchecker: disable */

import { Schema } from 'jsonschema';
import { validate } from './properties';

/* spellchecker: enable */


const failed = (url: string, request: XMLHttpRequest) =>
    `fetching '${url}' failed (${request.status}): ${request.statusText}`;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export interface FetchTransform<T> { (data: any): T | undefined; }

/**
 * Creates a promise for an asynchronous xml/http request on a given URL. If an URL is fetched successfully, the
 * promise is resolved with the fetched data.
 * @todo: switch to fetch API instead of XMLHttpRequest...
 * @param url - Uniform resource locator string referencing a file.
 * @param type - Request response type.
 * @returns - A promise that resolves on a parsed object if successful.
 */
export function fetchAsync<T>(url: string, type: XMLHttpRequestResponseType): Promise<T> {

    const response = new Promise<T>((resolve, reject) => {
        const request = new XMLHttpRequest();
        request.open('GET', url, true);
        request.responseType = type;

        request.onload = () => {
            if (request.status < 200 || request.status >= 300) {
                reject(failed(url, request));
                return;
            }
            resolve(request.response);
        };

        request.onerror = () => reject(failed(url, request));
        request.ontimeout = () => reject(failed(url, request));

        request.send();
    });
    return response;
}


/**
 * Creates a promise for an asynchronous xml/http request on a given URL. If an URL is fetched successfully, the
 * promise is resolved with a parsed JSON object. An error code and message can be caught otherwise.
 * @todo: switch to fetch API instead of XMLHttpRequest...
 * @param url - Uniform resource locator string referencing a JSON file.
 * @param transform - Callback to a function that transforms the fetched data into an instance of targeted type.
 * @param schema - Optional schema, that if specified, is used to validate the fetched json data.
 * @returns - A promise that resolves on a parsed JSON object if successful.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function fetchJsonAsync<T>(url: string, transform: FetchTransform<T>, schema?: Schema): Promise<T> {

    const response = new Promise<T>((resolve, reject) => {
        const request = new XMLHttpRequest();
        request.open('GET', url, true);

        request.onload = () => {
            if (request.status < 200 || request.status >= 300) {
                reject(failed(url, request));
                return;
            }

            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            let json: any;
            try {
                json = JSON.parse(request.responseText);
            } catch (error) {
                reject(`fetching '${url}' failed (${error.name}): ${error.message}`);
                return;
            }

            if (schema !== undefined && !validate(json, schema)) {
                return;
            }

            const object = transform(json);
            if (object === undefined) {
                reject(`fetching '${url}' failed (TransformError): transforming the object failed.`);
                return;
            }
            resolve(object);
        };

        request.onerror = () => reject(failed(url, request));
        request.ontimeout = () => reject(failed(url, request));

        request.send();
    });
    return response;
}

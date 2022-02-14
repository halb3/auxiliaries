
/* spellchecker: disable */

/* spellchecker: enable */


/**
 * Simple interface for objects that can be serialized and deserialized.
 * Intended use:
 * ```
 *     window.sessionStorage.setItem('instance', instance.serialize());
 *     instance.deserialize(window.sessionStorage.getItem('instance'));
 * ```
 */
export interface Serializable {

    serialize(): string;
    deserialize(text: string): void;

}

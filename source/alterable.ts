
/* spellchecker: disable */

/* spellchecker: enable */


/**
 * In order to favor composition over inheritance, this interface is mainly intended to be used in combination with
 * the {@see ChangeLookup}.
 * ```
 * class SomeClass implements Alterable {
 *
 *     protected readonly _altered = Object.assign(new ChangeLookup(), { any: false, someProperty: false });
 *
 *     ...
 *
 *     set somePropertySetter(value: any) {
 *         if(this._property === value) {
 *             return;
 *         }
 *         this._property = value;
 *         this._alterations.alter('property')
 *     }
 *
 *     altered(clear: boolean = false): boolean {
 *         if(!this._altered.any)
 *             return false;
 *         }
 *         if(clear) {
 *             this._altered.clear();
 *         }
 *         return true;
 *     }
 * ```
 */
export interface Alterable {

    /**
     * Allows to check if relevant properties (not all properties of a class might be tracked), have
     * been changed, since last the clearance.
     * @param clear - If true, all tracked alterations are reset (to false).
     * @returns - Whether or not any internal property was altered.
     */
    altered(clear: boolean): boolean;

}

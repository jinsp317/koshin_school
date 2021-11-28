export interface Props {
    [key: string]: any;
}
export interface RestProps {
    rest?: Partial<Props>;
}
export declare type AllOfProps = Partial<Props>;
export declare type AllWithRestProps = Partial<Props> & RestProps;
/**
 * Retrieves all props included in `from` array
 *
 * @param source (Props) - source object
 * @param from (string[]) - array of keys needed to retrieve from `source`
 *
 * @return (Partial<Props>) - object with keys contained in `from` array
 */
export declare function all(source: Props | undefined, from: string[]): AllOfProps;
/**
 * Retrieves all props included in `from` array, rest props includes in under the `rest` key
 */
export declare function allWithRest(source: Props | undefined, from: string[]): AllWithRestProps;

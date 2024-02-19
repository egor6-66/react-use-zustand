export type PrimitiveTypes = string | number | boolean | null | Date | undefined;

export type FilterByType<T, Type> = {
    [P in keyof T as T[P] extends Type | undefined ? P : never]: T[P];
};

export type Storage = 'LocalStorage' | 'sessionStorage';

export type ForStorage<T> = {
    storageName: string;
    keys?: Array<keyof T>;
    storage?: Storage;
    all?: boolean;
};

export type Wrapper<T> = {
    value: T;
    set: (arg: T) => void;
    clear: () => void;
};

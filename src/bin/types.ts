export type Storage = 'LocalStorage' | 'sessionStorage';

export type ForStorage<T> = {
    storageName: string;
    keys?: Array<keyof T>;
    storage?: Storage;
    all?: boolean;
};

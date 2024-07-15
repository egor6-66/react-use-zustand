export type Storage = 'localStorage' | 'sessionStorage';

export type ForStorage<T> = {
    storageName: string;
    keys?: Array<keyof T>;
    storage?: Storage;
    all?: boolean;
};

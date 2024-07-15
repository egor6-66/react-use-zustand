import { Storage } from '../types';

type Props = {
    storageName?: string;
    storage?: Storage;
};

function useStorage(props: Props) {
    if (typeof window === 'undefined') {
        return { set: () => '', get: () => '', remove: () => '' };
    }

    const storage = !props?.storage ? window.localStorage : props?.storage === 'localStorage' ? window.localStorage : window.sessionStorage;

    const get = (key: string) => {
        if (props.storageName) {
            const valueInStorage = storage.getItem(props.storageName);
            if (valueInStorage) {
                const parse = JSON.parse(valueInStorage);
                return parse[key];
            }
        }
    };

    const set = (key: string, value: any) => {
        if (props.storageName) {
            const valueInStorage = storage.getItem(props.storageName);
            if (valueInStorage) {
                const parse = JSON.parse(valueInStorage);
                storage.setItem(props.storageName, JSON.stringify({ ...parse, [key]: value }));
            } else {
                storage.setItem(props.storageName, JSON.stringify({ [key]: value }));
            }
        }
    };

    const remove = (key: string, defaultValue: any) => {
        if (props.storageName) {
            const valueInStorage = storage.getItem(props.storageName);
            if (valueInStorage) {
                const parse = JSON.parse(valueInStorage);
                parse[key] = defaultValue !== undefined ? defaultValue : undefined;
                storage.setItem(props.storageName, JSON.stringify(parse));
            }
        }
    };

    return { set, get, remove };
}

export default useStorage;

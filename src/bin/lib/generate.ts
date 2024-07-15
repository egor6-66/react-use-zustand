import useStorage from './use-storage';
import { ForStorage } from '../types';

const generate = <T>(keys?: any[], defaultValue?: any, forStorage?: ForStorage<T>, methods?: any, immerSet?: any, getState?: any) => {
    const obj: Record<any, any> = {};

    const storage = useStorage({ storageName: forStorage?.storageName, storage: forStorage?.storage });

    const storageFn = (key: keyof T, cb: () => void) => {
        if ((forStorage?.keys?.includes(key) || forStorage?.all) && typeof key === 'string') {
            cb();
        }
    };

    keys &&
        keys.forEach((key) => {
            const valueInStorage = storage.get(key as string);
            const def = defaultValue ? (defaultValue[key] === undefined ? undefined : defaultValue[key]) : undefined;
            obj[key] = {
                value: valueInStorage !== undefined ? valueInStorage : def,
                set: (arg: any) => {
                    if (typeof arg === 'function') {
                        immerSet((state: any) => {
                            if (typeof state[key].value === 'object') {
                                arg(state[key].value);
                                storageFn(key, () => storage.set(key, state[key].value));
                            } else {
                                const res = arg(state[key].value);
                                state[key].value = res;
                                storageFn(key, () => storage.set(key, res));
                            }
                        });
                    } else {
                        immerSet((state: any) => {
                            state[key].value = arg;
                            storageFn(key, () => storage.set(key, arg));
                        });
                    }
                },
                clear: () =>
                    immerSet((state: any) => {
                        state[key].value = def;
                        storageFn(key, () => storage.remove(key, def));
                    }),
            };

            if (methods && typeof methods[key] === 'function') {
                obj[key] = {
                    ...obj[key],
                    ...methods[key](getState),
                };
            }
        });

    if (defaultValue) {
        Object.entries(defaultValue).forEach(([key, value]: any) => {
            if (storage.get(key) === undefined) {
                storageFn(key, () => storage.set(key, value));
            }
        });
    }

    return obj as T;
};

export default generate;

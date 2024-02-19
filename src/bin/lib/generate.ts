import useStorage from './use-storage';
import { ForStorage } from '../types';

const generate = <T>(keys?: any[], defaultValue?: any, forStorage?: ForStorage<T>, methods?: any, asyncDefault?: any, set?: any, getState?: any) => {
    const obj: Record<any, any> = {};

    const storage = useStorage({ storageName: forStorage?.storageName, storage: forStorage?.storage });

    const updater = (obj: any) => {
        Object.entries(obj).forEach(([thisKey, value]: any) => {
            set((state: any) => {
                if (state) {
                    state[thisKey].value = value;
                    if ((forStorage?.keys?.includes(thisKey) || forStorage?.all) && typeof thisKey === 'string') {
                        storage.set(thisKey, value);
                    }
                }
            });
        });
    };

    keys &&
        keys.forEach((key) => {
            const valueInStorage = storage.get(key as string);
            const def = defaultValue ? (defaultValue[key] === undefined ? undefined : defaultValue[key]) : undefined;

            obj[key] = {
                value: valueInStorage || def,
                set: (value: any) =>
                    set((state: any) => {
                        state[key].value = value;
                        if ((forStorage?.keys?.includes(key) || forStorage?.all) && typeof key === 'string') {
                            storage.set(key, value);
                        }
                    }),
                clear: () =>
                    set((state: any) => {
                        state[key].value = def;
                        if ((forStorage?.keys?.includes(key) || forStorage?.all) && typeof key === 'string') {
                            storage.remove(key, def);
                        }
                    }),
            };

            if (methods && typeof methods[key] === 'function') {
                obj[key] = {
                    ...obj[key],
                    ...methods[key](() => {
                        return { state: getState(), updater };
                    }),
                };
            }
        });

    if (asyncDefault) {
        Object.entries(asyncDefault).forEach(([key, callback]: any) => {
            if (!obj[key].value) {
                callback(updater).then((res: any) => {
                    set((state: any) => {
                        state[key].value = res;
                        if ((forStorage?.keys?.includes(key) || forStorage?.all) && typeof key === 'string') {
                            storage.set(key, res);
                        }
                    });
                });
            }
        });
    }

    return obj as T;
};

export default generate;

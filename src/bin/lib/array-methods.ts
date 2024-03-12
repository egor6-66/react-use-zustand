function arrayMethods<T = any>(getState: any, set: any, key: string, storageFn: (key: keyof T, cb: () => void) => void, storage: any) {
    return {
        splice: (start: number, deleteCount: number, value?: T) => {
            set((state: any) => {
                if (value) {
                    state[key].value.splice(start, deleteCount, value);
                } else {
                    state[key].value.splice(start, deleteCount);
                }

                storageFn(key as keyof T, () => storage.set(key, state[key].value));
            });
        },
        slice: (start: number, end: number) => {
            set((state: any) => {
                state[key].value = state[key].value.slice(start, end);
                storageFn(key as keyof T, () => storage.set(key, state[key].value));
            });
        },
        concat: (...ars: Array<T>[]) => {
            set((state: any) => {
                state[key].value = state[key].value.concat(...ars);
                storageFn(key as keyof T, () => storage.set(key, state[key].value));
            });
        },
        forEach: (cb: (i: T) => void) => {
            getState()[key].value.forEach(cb);
        },
        indexOf: (item: T, from: number) => {
            return getState()[key].value.indexOf(item, from);
        },
        push: (value: T) => {
            set((state: any) => {
                state[key].value.push(value);
                storageFn(key as keyof T, () => storage.set(key, state[key].value));
            });
        },
    };
}

export default arrayMethods;

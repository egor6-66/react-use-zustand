import { create, StoreApi, UseBoundStore } from 'zustand';
import { devtools } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';

import generate from './lib/generate';
import useStorage from './lib/use-storage';
import { createSelectors } from './lib';
import { ForStorage } from './types';

type Base<T> = {
    value: T;
    set: (arg: T | ((value: T) => any)) => void;
    clear: () => void;
};

type Wrapper<T> = Base<T>;

type Wrap<T, M = any, D = any> = {
    [K in keyof Required<T>]: K extends keyof M ? Wrapper<T[K]> & M[K] : Wrapper<T[K]>;
};

type WrapWithoutCustomMethods<T> = {
    [K in keyof T]: Wrapper<T[K]>;
};

type Met<T, M> = {
    [K in keyof M]: (getState: () => WrapWithoutCustomMethods<T>) => M[K];
};

type StoreTypes<T> = {
    [K in keyof T]: T[K] extends () => any ? ReturnType<T[K]> : never;
};

type Props<T, M> = {
    keys: Array<keyof T>;
    default?: Partial<T>;
    methods?: Met<T, M>;
    forStorage?: ForStorage<T>;
};

function useZustand<T extends object, M extends Partial<Record<keyof T, Record<string, any>>> = {}>(props: Props<T, M>) {
    const storage = useStorage({ storageName: props.forStorage?.storageName, storage: props.forStorage?.storage });

    const storageFn = (key: keyof T, cb: () => void) => {
        if ((props.forStorage?.keys?.includes(key) || props.forStorage?.all) && typeof key === 'string') {
            cb();
        }
    };

    const store = create<Wrap<T, M, typeof props.default>>()(
        devtools(
            immer((set, getState) => {
                return generate<T>(props.keys, props?.default, props?.forStorage, props.methods, set, getState);
            }) as any
        )
    ) as UseBoundStore<StoreApi<Wrap<T, M, Partial<T> | undefined>>> & { setStateOutsideComponent: (initStore: Partial<T>) => void };

    // store.setStateOutsideComponent = (initStore) => {
    //     Object.entries(initStore).forEach(([key, value]) => {
    //         store.setState((prev: any) => ({ [key]: { ...prev[key], value } } as any));
    //         storageFn(key as keyof T, () => storage.set(key, value));
    //     });
    // };

    store.setStateOutsideComponent = (initStore) => {
        Object.entries(initStore).forEach(([key, value]) => {
            store.setState((prev: any) => ({ [key]: { ...prev[key], value } } as any));
            storageFn(key as keyof T, () => storage.set(key, value));
        });
    };

    return createSelectors(store);
}

export type { StoreTypes };

export default useZustand;

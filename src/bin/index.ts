import { create, StoreApi, UseBoundStore } from 'zustand';
import { devtools } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';

import { arrayMethods, createSelectors } from './lib';
import generate from './lib/generate';
import useStorage from './lib/use-storage';
import { ForStorage } from './types';

type UnArray<T> = T extends Array<infer U> ? U : T;

type Base<T> = {
    value: T;
    set: (arg: T) => void;
    clear: () => void;
};

type ArrayMethods<T> = ReturnType<typeof arrayMethods<T>>;

type Wrapper<T> = T extends Array<any> ? Base<T> & ArrayMethods<UnArray<T>> : Base<T>;

type Wrap<T, M = any, D = any> = {
    [K in keyof Required<T>]: K extends keyof M ? Wrapper<T[K]> & M[K] : Wrapper<T[K]>;
};

type WrapWithoutCustomMethods<T> = {
    [K in keyof T]: Wrapper<T[K]>;
};

type Met<T, M> = {
    [K in keyof M]: (use: () => { state: WrapWithoutCustomMethods<T>; updater: (obj: Partial<T>) => void }) => M[K];
};

type AsyncDefault<T> = {
    [K in keyof T]: (updater: (obj: Partial<T>) => void) => Promise<T[K]>;
};

type StoreTypes<T> = {
    [K in keyof T]: T[K] extends () => any ? ReturnType<T[K]> : never;
};

type Props<T, M> = {
    keys: Array<keyof T>;
    default?: Partial<T>;
    asyncDefault?: Partial<AsyncDefault<T>>;
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
                return generate<T>(props.keys, props?.default, props?.forStorage, props.methods, props.asyncDefault, set, getState);
            }) as any
        )
    ) as UseBoundStore<StoreApi<Wrap<T, M, Partial<T> | undefined>>> & { setStateOutsideComponent: (initStore: Partial<T>) => void };

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

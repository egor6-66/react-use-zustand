import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';

import { createSelectors } from './lib';
import generate from './lib/generate';
import { ForStorage, Wrapper } from './types';

type Wrap<T, M = any> = {
    [K in keyof T]: K extends keyof M ? Wrapper<T[K]> & M[K] : Wrapper<T[K]>;
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

type AllTypes<T> = {
    [K in keyof T]: T[K] extends () => any ? ReturnType<T[K]> : never;
};

type Props<T, M> = {
    keys: Array<keyof T>;
    default?: Partial<T>;
    asyncDefault?: Partial<AsyncDefault<T>>;
    methods?: Met<T, M>;
    forStorage?: ForStorage<T>;
};

function useZustand<T extends object, M extends Partial<Record<keyof T, Record<string, (arg: any) => void>>> = {}>(props: Props<T, M>) {
    const store = create<Wrap<T, M>>()(
        devtools(
            immer((set, getState) => {
                return generate<T>(props.keys, props?.default, props?.forStorage, props.methods, props.asyncDefault, set, getState);
            }) as any
        )
    );

    return createSelectors(store);
}

export type { Wrapper, AllTypes };
export default useZustand;

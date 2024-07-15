# 💾 react-use-file-uploader

![version](https://img.shields.io/github/package-json/v/egor6-66/react-use-zustand)
![stars](https://img.shields.io/github/stars/egor6-66/react-use-zustand?style=social)
![forks](https://img.shields.io/github/forks/egor6-66/react-use-zustand?style=social)
![last commit](https://img.shields.io/github/last-commit/egor6-66/react-use-zustand/main)
![code size](https://img.shields.io/github/languages/code-size/egor6-66/react-use-zustand)
![minzip size](https://img.shields.io/bundlephobia/minzip/react-use-zustand)
![download](https://img.shields.io/npm/dt/react-use-zustand)

**Description** - 🔎 Wrapper over package [zustand](https://www.npmjs.com/package/zustand). Shortens the code, provides hook that returns setter and getter, convenient to work with typescript.

[//]: # (## [🚀🚀🚀DEMO🚀🚀🚀]&#40;https://codesandbox.io/s/react-use-file-uploader-88uh7o&#41;)

## 💿 Installation

```
npm i react-use-zustand
```

## 💻 Example 
### base use
**By default, the hook will return us an object with three fields: value, setter, and cleanup.
The set method can be passed either a value or a callback.
The clear method will reset the values to the values you defined in the "default" object. If you don't define a default value, it will return an undefined value. Data from the storage will also be deleted if you saved it there.**
```jsx
// store
import useZustand, { StoreTypes } from 'react-use-zustand';

interface Store {
  counter: number;
  tree: {
    node: {
      counter: number;
    };
  };
}

const baseStore = useZustand<Store>({
  keys: ['counter', 'tree'],
  default: {
    counter: 0,
    tree: {
      node: {
        counter: 0,
      },
    },
  },
});

export type BaseStoreTypes = StoreTypes<typeof baseStore.use>;
export default baseStore;


//component
import baseStore from './stores/base';

function App() {
  const counter = baseStore.use.counter();
  const tree = baseStore.use.tree();

  const updatePrimitive = () => {
    counter.set((prev) => ++prev);
  };

  const mutatePrimitive = () => {
    counter.set(1000);
  };

  const updateObject = () => {
    tree.set((prev) => { ++prev.node.counter });
  };

  const mutateObject = () => {
    tree.set({ node: { counter: 100000 } });
  };

  return (
    <>
      <button onClick={updatePrimitive}>update primitive</button>
      <button onClick={mutatePrimitive}>mutate primitive</button>
      <div>{counter.value}</div>
      <button onClick={updateObject}>update object</button>
      <button onClick={mutateObject}>mutate object</button>
      <div>{tree.value.node.counter}</div>
    </>
  );
}
```
### with methods
**We can register methods in the store itself to avoid code duplication, for example if we change values from different places.**
```jsx
// store
import useZustand, { StoreTypes } from 'react-use-zustand';

interface User {
  id: number;
  name: string;
}

interface Store {
  users: Array<User>;
}

interface Methods {
  users: {
    add: (user: User) => void;
    getById: (id: number) => User | undefined | any;
    deleteById: (id: number) => void;
  };
}

const storeWithMethods = useZustand<Store, Methods>({
  keys: ['users'],
  default: {
    users: [],
  },
  methods: {
    users: (getState) => ({
      add: (user) => {
        const state = getState();
        state.users.set((prev) => prev.push(user));
      },
      getById: (id) => {
        const state = getState();
        return state.users.value.find((user) => user.id === id);
      },
      deleteById: (id) => {
        const state = getState();
        state.users.set((prev) => {
          const foundIndex = prev.findIndex((user) => user.id === id);
          foundIndex !== -1 && prev.splice(foundIndex, 1);
        });
      },
    }),
  },
});

export type StoreWithMethodsTypes = StoreTypes<typeof storeWithMethods.use>;
export default storeWithMethods;


//component
import storeWithMethods from './stores/withMethods';

function App() {
  const [id, setId] = useState('');

  const users = storeWithMethods.use.users();

  const foundUser = useMemo(() => {
    return users.getById(+id);
  }, [id, users.value.length]);

  const random = Math.floor(Math.random() * 10000);

  return (
    <div>
      <button onClick={() => users.add({ id: random, name: `user-${random}` })}>add</button>
      {users.value.length ? (
        <div>
          <span>search</span>___
          <input type="number" value={id} onChange={(e) => setId(e.target.value)} />
          {foundUser && <span>___{foundUser.name}</span>}
        </div>
      ) : null}
      <ul>
        {users.value.map((user) => (
          <li key={user.id} onClick={() => users.deleteById(user.id)}>
            <span>{user.name}</span>___<button>delete</button>
          </li>
        ))}
      </ul>
    </div>
  );
}
```
### with storage
**Storing data in storage. If there is data in the store, the value specified in the “default” object will be ignored.**

| Option         | Description          | value                          | Default 
|----------------|----------------------|--------------------------------| ---------|
 all            | save the entire store    | boolean                        | |
 keys           | save individual fields | string[]                       |         |
 storage | where to save      | localStorage or sessionStorage | localStorage |
 storageName | key     | string                         |  |

```jsx
// store
import useZustand, { StoreTypes } from 'react-use-zustand';

interface User {
  id: number;
  name: string;
}

interface Store {
  users: Array<User>;
}

interface Methods {
  users: {
    add: (user: User) => void;
  };
}

const storeWithStorage = useZustand<Store, Methods>({
  keys: ['users'],
  default: {
    users: [],
  },
  methods: {
    users: (use) => ({
      add: (user) => {
        const { state, updater } = use();
        updater({ users: [user, ...state.users.value] });
      },
    }),
  },
  forStorage: {
    storageName: 'users',
  },
});

export type StoreWithStorageTypes = StoreTypes<typeof storeWithStorage.use>;
export default storeWithStorage;

//component
import storeWithStorage from './stores/withStorage';

function App() {
  const users = storeWithStorage.use.users();

  const random = Math.floor(Math.random() * 10000);

  return (
    <>
      <button onClick={() => users.add({ id: random, name: `user-${random}` })}>add</button>
      <button onClick={users.clear}>clear</button>
      <ul>
        {users.value.map((user) => (
          <li key={user.id}>
            <span>{user.name}</span>
          </li>
        ))}
      </ul>
    </>
  );
}
```
### with async
**Inside the store you can do any asynchronous action.**
```jsx
// store
import useZustand, { StoreTypes } from 'react-use-zustand';

interface User {
  id: number;
  name: string;
}

interface Store {
  status: 'pending' | 'success' | 'error' | '';
  users: Array<User>;
}

interface Methods {
  users: {
    getAsyncUsers: () => void;
  };
}

const asyncStore = useZustand<Store, Methods>({
  keys: ['users', 'status'],
  default: {
    status: '',
    users: [],
  },
  methods: {
    users: (getState) => ({
      getAsyncUsers: async () => {
        const state = getState();
        if (state.status.value !== 'pending') {
          state.status.set('pending');
          try {
            const response = await fetch('https://jsonplaceholder.typicode.com/users');
            const users: Array<User> = await response.json();
            state.users.set(users);
            state.status.set('success');
          } catch (e) {
            state.status.set('error');
          }
        }
      },
    }),
  },
  forStorage: {
    keys: ['users'],
    storageName: 'users',
  },
});

export type AsyncStoreTypes = StoreTypes<typeof asyncStore.use>;
export default asyncStore;

//component
import asyncStore from './stores/async';

function App() {
  const users = asyncStore.use.users();
  const status = asyncStore.use.status();

  useEffect(() => {
    users.getAsyncUsers();
  }, []);

  return (
    <div>
      <div>{status.value}</div>

      <ul>
        {users.value.map((user) => (
          <li key={user.id}>
            <span>{user.name}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
```
### outside the component
**You can also change state outside of  jsx/tsx component.**
```jsx
// store
import useZustand, { StoreTypes } from 'react-use-zustand';

interface User {
  id: number;
  name: string;
}

interface Store {
  users: Array<User>;
}

interface Methods {
  users: {
    getUsers: (users: Array<User>) => void;
  };
}

const asyncStore = useZustand<Store, Methods>({
  keys: ['users'],
  default: {
    users: [],
  },
  methods: {
    users: (getState) => ({
      getUsers: async (users) => {
        const state = getState();
        state.users.set(users);
      },
    }),
  },
});

export type AsyncStoreTypes = StoreTypes<typeof asyncStore.use>;
export default asyncStore;

//component
import asyncStore from './stores/async';

(async function getUsers() {
  try {
    const response = await fetch('https://jsonplaceholder.typicode.com/users');
    const users: Array<User> = await response.json();
    asyncStore.setStateOutsideComponent({
      users,
    });
  } catch (e) {}
})();

function App() {
  const users = asyncStore.use.users();

  return (
    <div>
      <ul>
        {users.value.map((user) => (
          <li key={user.id}>
            <span>{user.name}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
```
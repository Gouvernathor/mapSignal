import { CreateSignalOptions, signal, Signal } from "@angular/core";

export interface MapSignal<K, V> extends Signal<ReadonlyMap<K, V>> {
    set(key: K, value: V): void;
    delete(key: K): void;
    asReadonly(): Signal<ReadonlyMap<K, V>>;
}

export interface CreateMapSignalOptions<K, V> extends Omit<CreateSignalOptions<Map<K, V>>, "equal"> {
    equal(a: V, b: V): boolean;
}

export function mapSignal<K, V>(
    initialValue: Map<K, V> = new Map(),
    { equal, ...options }: CreateMapSignalOptions<K, V> = { equal: Object.is },
): MapSignal<K, V> {
    const sig = signal(initialValue, { equal: () => false, ...options });

    function set(key: K, value: V) {
        const sigValue = sig();
        const oldValue = sigValue.get(key);
        sigValue.set(key, value);
        if (oldValue === undefined || !equal(oldValue, value)) {
            sig.set(sigValue);
        }
    }
    function del(key: K) {
        const sigValue = sig();
        if (sigValue.delete(key)) {
            sig.set(sigValue);
        }
    }
    function asReadonly() {
        return sig.asReadonly();
    }

    return Object.assign(sig.asReadonly(), { set, delete: del, asReadonly });
}

import { CreateSignalOptions, signal, Signal } from "@angular/core";

export interface MapSignal<K, V> extends Signal<ReadonlyMap<K, V>> {
    set(key: K, value: V): void;
    delete(key: K): void;
    asReadonly(): Signal<ReadonlyMap<K, V>>;
}

export function mapSignal<K, V>(
    initialValue: Map<K, V> = new Map(),
    options: CreateSignalOptions<Map<K, V>> = { equal: () => false },
): MapSignal<K, V> {
    const sig = signal(initialValue, options);

    function set(key: K, value: V) {
        const sigValue = sig();
        sigValue.set(key, value);
        sig.set(sigValue);
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

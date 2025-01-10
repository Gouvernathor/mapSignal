# mapSignal

MapSignal is a specialization of Angular's Signals to Map objects.

## Rationale

The purpose of a signal is to reliably warn its dependents (computed signals referencing it) when its value has changed. It does so by watching for calls to its `.set` and `.update` methods.

### Notifying the signal's value's mutation

This causes an issue when handling mutable objects as the signal's value, since mutating the object can be done without the signal object's awareness:

```ts
const a = signal(new Map<string, string>());
const b = computed(() => a().get("k"));
const o = signal({"p": "v"});
const q = computed(() => o().p);

...

a().set("k", "valu"); // a doesn't catch that its value is changed, b isn't updated.
o().p = "valu"; // same
```

For POJOs, a solution could be to turn all writeable properties into signals themselves, but this solution doesn't work to arrays, Sets, or Maps.  
For Maps, that can be fixed by calling `a.set(a())`, thus signifying to the signal that its value may have changed, but you need to have the consistency of doing that everywhere in your code.  
This module ensures that it's done when it needs to.

### Equality checks are not reliable

Whenever the `.set` or `.update` methods are called, the signal does not immediately considers itself as obsolete, as it first performs an equality check between the old and the new values.  
The issue, when using POJOs or Maps, is that that equality check is done using object identity (`Object.is`) by default, thus mutations of the object still go unnoticed even with the solution above.  
This issue is fixed in this package by providing a Map-equality function by default, although as with ordinary signals, you can override it when creating a new signal.

## API

This module provides a new creator function, mapSignal, and an interface for the returned value.

`function mapSignal<K, V>(initialValue?: Map<K, V>, options?): MapSignal<K, V>`

- `initialValue` defaults to a new empty map, as opposed to the base signal constructor where the parameter is required.

- `options` is the same as taken by the native `signal`, but with the `equal` key defaulting to a true map equality function.

`interface MapSignal<K, V>`

- Calling the signal returns a `ReadonlyMap<K, V>`, which (as the type implies) should never be mutated by itself.

- The `MapSignal.set` and `MapSignal.delete` methods match the `Map.set` and `Map.delete` methods, respectively, in all aspects except that they do not return a value.  
Warning : do not confuse `MapSignal.set` with `WriteableSignal.set` : the former takes two parameters when the latter takes only one. There is no equivalent to the latter, no way to change the map object as a whole.

- `MapSignal.asReadonly` is similar to `WriteableSignal.asReadonly`, returning a true `Signal<ReadonlyMap<K, V>>` with the same value.

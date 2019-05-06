# promise-map-limit

Map an array n items at a time with promises

## API

### `mapLimit(iterable, limit, iteratee)`

#### Parameters:

- `iterable` The collection to iterate over. The iterator interface will be used if it is implemented. If the collection does not implement the iterator interface then `Object.keys()` is used and values are iterated in the order of the keys.
- `limit` The concurrency limit. The maximum number of async operations at a time.
- `iteratee` The function that will be called with each value in `iterable`. It can return a `Promise` or a plain value if no async operation is needed. If the `iteratee` function throws then `mapLimit` aborts and rejects with the error.

#### Returns:

`mapLimit` returns a `Promise<Array>` that resolves with the transformed values from `iterable`.
If `iteratee` throws or returns a rejected promise then `mapLimit` will abort and return a rejected promise with the same error.

## Example

```js
const mapLimit = require('promise-map-limit');

// This will work on max two items in the array at a time
// When all items are processed it will resolve with the resulting array in the same order.
mapLimit([1, 2, 3, 4], 2, n => Promise.resolve(n * 2)).then(array => {
  // array == [2, 4, 6, 8]
});

// The iterator function can return the result synchronous
mapLimit([1, 2, 3, 4], 2, n => n * 2).then(array => {
  // array == [2, 4, 6, 8]
});

// Any value that implements the iterator interface can be used, such as Array, String, Map, Set
mapLimit('abc', 2, str => str.toUpperCase()).then(array => {
  // array == ['A', 'B', 'C']
});

// Any value that implements the iterator interface can be used, such as Array, String, Map, Set
mapLimit('abc', 2, str => str.toUpperCase()).then(array => {
  // array == ['A', 'B', 'C']
});

// Iterator object also implements the iterator interface
const arr = ['a', 'b', 'c'];
const iterator = a.entries();
mapLimit(iterator, 2, entry => entry).then(array => {
  // array == [
  //   [0, 'a'],
  //   [1, 'b'],
  //   [2, 'c']
  // ]
});

// If the iterator is omitted, each function in the array is executed
// This will run max two functions at a time
mapLimit([
  () => Promise.resolve(1),
  () => Promise.resolve(2),
  () => 3, // can be sync
  () => Promise.resolve(4),
], 2).then(array => {
  // array == [1, 2, 3, 4]
});
```

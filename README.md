# Linked List JS

A small JavaScript package for creating singly and doubly linked lists.

This package mirrors the Python `mt-linked-list` package, adapted for idiomatic JavaScript. It supports arbitrary values by default, optional value-type enforcement, sorting helpers, circular-list utilities, bounded iteration, and a factory for creating the list type you need.

## Requirements

- Node.js 20+

## Installation

Install from a local checkout:

```bash
npm install /path/to/LinkedListJS
```

## Basic Usage

Import the factory:

```js
import { LinkedList } from "@mturnbo/linked-list";

const linkedList = LinkedList.fromValues("singly", [1, 2, 3]);
linkedList.append(4);

console.log(linkedList.toList());
// [1, 2, 3, 4]
```

Or import a concrete list class:

```js
import { DoublyLinkedList, SinglyLinkedList } from "@mturnbo/linked-list";

const singly = SinglyLinkedList.fromValues(["a", "b", "c"]);
const doubly = DoublyLinkedList.fromValues([1, 2, 3]);
```

## Factory

Use `LinkedList.create()` for an empty list:

```js
import { LinkedList } from "@mturnbo/linked-list";

const singly = LinkedList.create("singly");
const doubly = LinkedList.create("doubly");
```

Accepted list type names:

- Singly: `"s"`, `"single"`, `"singly"`
- Doubly: `"d"`, `"double"`, `"doubly"`

Create a list from values:

```js
const linkedList = LinkedList.fromValues("doubly", [3, 1, 2]);
```

Factory methods pass through list configuration:

```js
const linkedList = LinkedList.fromValues("singly", [3, 1, 2], {
  valueType: "number",
  sortable: true,
});
```

## Values And Types

Lists accept any value type by default:

```js
const linkedList = new SinglyLinkedList();
linkedList.append({ id: 1 });
linkedList.append(null);
linkedList.append(false);
```

Use `valueType` to enforce a type:

```js
const linkedList = new SinglyLinkedList(undefined, { valueType: "number" });
linkedList.append(1);

linkedList.append("2");
// throws ValueTypeError
```

Primitive `valueType` values use `typeof`, such as `"number"`, `"string"`, and `"boolean"`. Constructor values use exact constructor matching, such as `Date` or a custom class.

## Equality

`contains()` uses `Object.is` by default. Provide an `equals` function for custom comparisons:

```js
const linkedList = new SinglyLinkedList(undefined, {
  equals: (left, right) => JSON.stringify(left) === JSON.stringify(right),
});

linkedList.append({ id: 1 });
linkedList.contains({ id: 1 });
// true
```

## Methods

Both `SinglyLinkedList` and `DoublyLinkedList` support:

- `append(value) -> boolean`
- `appendValues(values) -> number`
- `prepend(value) -> boolean`
- `prependValues(values) -> number`
- `insert(index, value) -> boolean`
- `replace(index, value) -> boolean`
- `remove(index) -> boolean`
- `popHead() -> Node`
- `popTail() -> Node`
- `contains(value) -> boolean`
- `getNode(index) -> Node`
- `getNodeAddress(index) -> number`
- `getValues(count) -> Array`
- `getAddresses(count) -> Array<number>`
- `toList(count) -> Array`
- `toNodes(count) -> Array<Node>`
- `reverse() -> boolean`
- `sort(method = 1, reverse = false) -> boolean`
- `createCycle(start) -> boolean`
- `getCycleStartIndex() -> number | null`
- `isCircular() -> boolean`
- `makeLinear() -> boolean`
- `clear(iterate = false) -> boolean`

Lists also support:

```js
linkedList.length;
[...linkedList];
linkedList.toString();
```

`toList()` is an alias for `getValues()`.

## Nodes

`popHead()`, `popTail()`, `getNode()`, and `toNodes()` return `Node` objects.

```js
const node = linkedList.popHead();
console.log(node.value);
```

A node has:

- `value`
- `next`
- `prev`

The `prev` field is used by doubly linked lists.

## Sorting

Use `sort()` to sort values in place.

```js
const linkedList = SinglyLinkedList.fromValues([3, 1, 2]);
linkedList.sort();

console.log(linkedList.toList());
// [1, 2, 3]
```

Sorting methods:

- `method = 1`: merge sort
- `method = 2`: insertion sort

Sort descending:

```js
linkedList.sort(1, true);
```

Sort complex values with `sortKey`:

```js
const tasks = SinglyLinkedList.fromValues(
  [
    { name: "low", priority: 3 },
    { name: "high", priority: 1 },
  ],
  { sortKey: (task) => task.priority },
);

tasks.sort();
```

Use `sortable: true` to validate sortable values as they enter the list:

```js
const numbers = new DoublyLinkedList(undefined, {
  valueType: "number",
  sortable: true,
});

numbers.appendValues([3, 1, 2]);
numbers.sort();
```

`sortable: true` requires either `valueType` or `sortKey`.

## Circular Lists

Singly linked lists can create a cycle from the tail to an earlier node:

```js
const linkedList = SinglyLinkedList.fromValues([1, 2, 3]);
linkedList.createCycle(1);

console.log(linkedList.getCycleStartIndex());
// 1
```

Doubly linked lists support circular lists where the tail points to the head and the head points back to the tail:

```js
const linkedList = DoublyLinkedList.fromValues([1, 2, 3]);
linkedList.createCycle(0);

console.log(linkedList.isCircular());
// true
```

Use `makeLinear()` to break a cycle:

```js
linkedList.makeLinear();
```

Iteration and `toString()` are bounded by list size, so they are safe for circular lists.

## Python Package Differences

- JavaScript methods use camelCase: `appendValues()` instead of `append_values()`.
- Invalid indexes throw `RangeError`.
- Invalid value types throw `ValueTypeError`.
- Cycle-protected mutations throw `CycleDetectedError`.
- Empty configured lists use `new SinglyLinkedList(undefined, options)` or `LinkedList.create(type, undefined, options)`.
- `contains()` defaults to `Object.is`; pass `equals` for deep or domain-specific equality.

## Development

Run the test suite:

```bash
npm test
```

This implementation is organized as a stack of focused branches:

- `codex/js-package-skeleton`
- `codex/js-core-base-list`
- `codex/js-singly-linked-list`
- `codex/js-doubly-linked-list`
- `codex/js-sorting`
- `codex/js-factory-public-api`
- `codex/js-docs-and-parity`

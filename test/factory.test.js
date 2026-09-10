import assert from "node:assert/strict";
import test from "node:test";

import {
  CycleDetectedError,
  DoublyLinkedList,
  EmptyValueError,
  LinkedList,
  Node,
  SinglyLinkedList,
  ValueTypeError,
} from "../src/index.js";

test("public API exports package objects", () => {
  assert.equal(new Node(1).value, 1);
  assert.equal(typeof SinglyLinkedList, "function");
  assert.equal(typeof DoublyLinkedList, "function");
  assert.ok(new EmptyValueError(null) instanceof Error);
  assert.ok(new ValueTypeError("x", "number") instanceof TypeError);
  assert.ok(new CycleDetectedError("append") instanceof Error);
});

for (const listType of ["s", "single", "singly", "SINGLY"]) {
  test(`factory creates singly list for ${listType}`, () => {
    const linkedList = LinkedList.create(listType);

    assert.ok(linkedList instanceof SinglyLinkedList);
    assert.equal(linkedList.length, 0);
  });
}

for (const listType of ["d", "double", "doubly", "DOUBLY"]) {
  test(`factory creates doubly list for ${listType}`, () => {
    const linkedList = LinkedList.create(listType);

    assert.ok(linkedList instanceof DoublyLinkedList);
    assert.equal(linkedList.length, 0);
  });
}

test("factory create passes initial value and configuration", () => {
  const linkedList = LinkedList.create("singly", 1, {
    valueType: "number",
    sortable: true,
  });

  assert.ok(linkedList instanceof SinglyLinkedList);
  assert.deepEqual(linkedList.toList(), [1]);
  assert.equal(linkedList.valueType, "number");
  assert.equal(linkedList.sortable, true);
});

test("factory create allows null initial value", () => {
  const linkedList = LinkedList.create("doubly", null);

  assert.ok(linkedList instanceof DoublyLinkedList);
  assert.deepEqual(linkedList.toList(), [null]);
});

test("factory fromValues builds selected list type", () => {
  const linkedList = LinkedList.fromValues("doubly", [3, 1, 2]);

  assert.ok(linkedList instanceof DoublyLinkedList);
  assert.deepEqual(linkedList.toList(), [3, 1, 2]);
});

test("factory fromValues passes sortKey", () => {
  const linkedList = LinkedList.fromValues(
    "singly",
    [{ priority: 2 }, { priority: 1 }],
    { sortKey: (item) => item.priority },
  );

  assert.equal(linkedList.sort(), true);
  assert.deepEqual(linkedList.toList(), [{ priority: 1 }, { priority: 2 }]);
});

test("factory raises for unknown list types", () => {
  assert.throws(() => LinkedList.create("circular"), RangeError);
  assert.throws(() => LinkedList.fromValues("circular", [1, 2, 3]), RangeError);
});

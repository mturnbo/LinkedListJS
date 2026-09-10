import assert from "node:assert/strict";
import test from "node:test";

import { DoublyLinkedList, SinglyLinkedList } from "../src/index.js";

function assertDoublyLinks(linkedList) {
  let current = linkedList.head;
  let previous = null;
  let count = 0;

  while (current) {
    assert.equal(current.prev, previous);
    previous = current;
    current = current.next;
    count += 1;
  }

  assert.equal(previous, linkedList.tail);
  assert.equal(count, linkedList.size);
}

for (const [name, ListClass] of [
  ["singly", SinglyLinkedList],
  ["doubly", DoublyLinkedList],
]) {
  test(`${name} merge sort orders values`, () => {
    const linkedList = ListClass.fromValues([4, 2, 5, 1, 3]);

    assert.equal(linkedList.sort(1), true);
    assert.deepEqual(linkedList.getValues(), [1, 2, 3, 4, 5]);
    assert.equal(linkedList.head.value, 1);
    assert.equal(linkedList.tail.value, 5);
    if (linkedList instanceof DoublyLinkedList) {
      assertDoublyLinks(linkedList);
    }
  });

  test(`${name} insertion sort orders values`, () => {
    const linkedList = ListClass.fromValues([4, 2, 5, 1, 3]);

    assert.equal(linkedList.sort(2), true);
    assert.deepEqual(linkedList.getValues(), [1, 2, 3, 4, 5]);
    assert.equal(linkedList.head.value, 1);
    assert.equal(linkedList.tail.value, 5);
    if (linkedList instanceof DoublyLinkedList) {
      assertDoublyLinks(linkedList);
    }
  });

  test(`${name} sort supports reverse order`, () => {
    const linkedList = ListClass.fromValues([4, 2, 5, 1, 3]);

    assert.equal(linkedList.sort(1, true), true);
    assert.deepEqual(linkedList.getValues(), [5, 4, 3, 2, 1]);
    assert.equal(linkedList.head.value, 5);
    assert.equal(linkedList.tail.value, 1);
    if (linkedList instanceof DoublyLinkedList) {
      assertDoublyLinks(linkedList);
    }
  });

  test(`${name} sort supports sortKey`, () => {
    const low = { name: "low", priority: 3 };
    const high = { name: "high", priority: 1 };
    const medium = { name: "medium", priority: 2 };
    const linkedList = ListClass.fromValues([low, high, medium], {
      sortKey: (item) => item.priority,
    });

    assert.equal(linkedList.sort(), true);
    assert.deepEqual(linkedList.getValues(), [high, medium, low]);
    if (linkedList instanceof DoublyLinkedList) {
      assertDoublyLinks(linkedList);
    }
  });

  test(`${name} insertion sort supports reverse with sortKey`, () => {
    const low = { name: "low", priority: 3 };
    const high = { name: "high", priority: 1 };
    const medium = { name: "medium", priority: 2 };
    const linkedList = ListClass.fromValues([low, high, medium], {
      sortKey: (item) => item.priority,
    });

    assert.equal(linkedList.sort(2, true), true);
    assert.deepEqual(linkedList.getValues(), [low, medium, high]);
    if (linkedList instanceof DoublyLinkedList) {
      assertDoublyLinks(linkedList);
    }
  });

  test(`${name} sortable lists validate incoming values`, () => {
    const numbers = new ListClass(undefined, {
      valueType: "number",
      sortable: true,
    });
    assert.equal(numbers.appendValues([3, 1, 2]), 3);
    assert.equal(numbers.sort(), true);
    assert.deepEqual(numbers.getValues(), [1, 2, 3]);

    const objects = new ListClass(undefined, {
      valueType: Object,
      sortable: true,
    });
    assert.throws(() => objects.append({ priority: 1 }), TypeError);
    assert.deepEqual(objects.getValues(), []);
  });

  test(`${name} sort validates method and values before mutation`, () => {
    const invalidMethod = ListClass.fromValues([2, 1]);
    assert.throws(() => invalidMethod.sort(3), RangeError);
    assert.deepEqual(invalidMethod.getValues(), [2, 1]);

    const mixed = ListClass.fromValues([2, "1", 3]);
    assert.throws(() => mixed.sort(1), TypeError);
    assert.deepEqual(mixed.getValues(), [2, "1", 3]);
    assert.equal(mixed.tail.value, 3);
  });
}

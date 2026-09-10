import assert from "node:assert/strict";
import test from "node:test";

import { CycleDetectedError, DoublyLinkedList, ValueTypeError } from "../src/index.js";

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

test("initializes empty and nonempty doubly lists", () => {
  const empty = new DoublyLinkedList();
  assert.equal(empty.size, 0);
  assert.equal(empty.head, null);
  assert.equal(empty.tail, null);

  const nonempty = new DoublyLinkedList(123);
  assert.equal(nonempty.size, 1);
  assert.equal(nonempty.head.value, 123);
  assert.equal(nonempty.tail.value, 123);
  assert.equal(nonempty.head.prev, null);
  assert.equal(nonempty.head.next, null);
});

test("fromValues builds a doubly list", () => {
  const linkedList = DoublyLinkedList.fromValues([1, 2, 3]);

  assert.ok(linkedList instanceof DoublyLinkedList);
  assert.deepEqual(linkedList.toList(), [1, 2, 3]);
  assert.equal(linkedList.head.value, 1);
  assert.equal(linkedList.tail.value, 3);
  assertDoublyLinks(linkedList);
});

test("append, prepend, and insert maintain bidirectional links", () => {
  const linkedList = new DoublyLinkedList();

  assert.equal(linkedList.append("b"), true);
  assert.equal(linkedList.prepend("a"), true);
  assert.equal(linkedList.insert(2, "d"), true);
  assert.equal(linkedList.insert(2, "c"), true);

  assert.deepEqual(linkedList.getValues(), ["a", "b", "c", "d"]);
  assert.equal(linkedList.getNode(2).value, "c");
  assertDoublyLinks(linkedList);
});

test("prependValues preserves order", () => {
  const linkedList = new DoublyLinkedList();

  assert.equal(linkedList.prependValues([1, 2, 3]), 3);
  assert.deepEqual(linkedList.getValues(), [1, 2, 3]);
  assertDoublyLinks(linkedList);
});

test("replace changes values and validates inputs", () => {
  const linkedList = DoublyLinkedList.fromValues([1, 2], { valueType: "number" });

  assert.equal(linkedList.replace(1, 3), true);
  assert.deepEqual(linkedList.getValues(), [1, 3]);
  assert.throws(() => linkedList.replace(-1, 4), RangeError);
  assert.throws(() => linkedList.replace(2, 4), RangeError);
  assert.throws(() => linkedList.replace(1, "4"), ValueTypeError);
  assertDoublyLinks(linkedList);
});

test("pop and remove maintain endpoints and detach popped nodes", () => {
  const linkedList = DoublyLinkedList.fromValues(["a", "b", "c", "d"]);

  const head = linkedList.popHead();
  assert.equal(head.value, "a");
  assert.equal(head.prev, null);
  assert.equal(head.next, null);
  assert.deepEqual(linkedList.getValues(), ["b", "c", "d"]);
  assertDoublyLinks(linkedList);

  assert.equal(linkedList.remove(1), true);
  assert.deepEqual(linkedList.getValues(), ["b", "d"]);
  assertDoublyLinks(linkedList);

  const tail = linkedList.popTail();
  assert.equal(tail.value, "d");
  assert.equal(tail.prev, null);
  assert.equal(tail.next, null);
  assert.deepEqual(linkedList.getValues(), ["b"]);
  assertDoublyLinks(linkedList);
});

test("contains searches from both ends and respects type checks", () => {
  const linkedList = DoublyLinkedList.fromValues(["a", "b", "c"]);
  assert.equal(linkedList.contains("b"), true);
  assert.equal(linkedList.contains("x"), false);

  const typed = DoublyLinkedList.fromValues([1], { valueType: "number" });
  assert.equal(typed.contains(1), true);
  assert.equal(typed.contains("1"), false);
});

test("reverse changes order and preserves links", () => {
  const linkedList = DoublyLinkedList.fromValues([1, 2, 3]);

  assert.equal(linkedList.reverse(), true);
  assert.deepEqual(linkedList.getValues(), [3, 2, 1]);
  assert.equal(linkedList.head.prev, null);
  assert.equal(linkedList.tail.next, null);
  assertDoublyLinks(linkedList);
});

test("doubly circular lists can be made linear", () => {
  const linkedList = DoublyLinkedList.fromValues([1, 2, 3]);

  assert.equal(linkedList.createCycle(0), true);
  assert.equal(linkedList.tail.next, linkedList.head);
  assert.equal(linkedList.head.prev, linkedList.tail);
  assert.equal(linkedList.getCycleStartIndex(), 0);
  assert.equal(linkedList.isCircular(), true);
  assert.deepEqual([...linkedList], [1, 2, 3]);
  assert.deepEqual(
    linkedList.toNodes().map((node) => node.value),
    [1, 2, 3],
  );

  assert.equal(linkedList.makeLinear(), true);
  assert.equal(linkedList.isCircular(), false);
  assert.equal(linkedList.tail.next, null);
  assert.equal(linkedList.head.prev, null);
  assertDoublyLinks(linkedList);
});

test("doubly cycle creation validates start and emptiness", () => {
  const linkedList = DoublyLinkedList.fromValues([1, 2, 3]);
  assert.throws(() => linkedList.createCycle(1), RangeError);
  assertDoublyLinks(linkedList);

  assert.throws(() => new DoublyLinkedList().createCycle(0), RangeError);
});

test("doubly mutating methods reject cyclic lists", () => {
  const linkedList = DoublyLinkedList.fromValues([1, 2, 3]);
  linkedList.createCycle(0);

  assert.throws(() => linkedList.append(4), CycleDetectedError);
  assert.throws(() => linkedList.prepend(0), CycleDetectedError);
  assert.throws(() => linkedList.insert(1, 4), CycleDetectedError);
  assert.throws(() => linkedList.popHead(), CycleDetectedError);
  assert.throws(() => linkedList.popTail(), CycleDetectedError);
  assert.throws(() => linkedList.remove(1), CycleDetectedError);
  assert.throws(() => linkedList.reverse(), CycleDetectedError);
  assert.throws(() => linkedList.sort(), CycleDetectedError);
});

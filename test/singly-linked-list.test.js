import assert from "node:assert/strict";
import test from "node:test";

import { CycleDetectedError, SinglyLinkedList, ValueTypeError } from "../src/index.js";

test("initializes empty and nonempty singly lists", () => {
  const empty = new SinglyLinkedList();
  assert.equal(empty.size, 0);
  assert.equal(empty.head, null);
  assert.equal(empty.tail, null);

  const nonempty = new SinglyLinkedList(123);
  assert.equal(nonempty.size, 1);
  assert.equal(nonempty.head.value, 123);
  assert.equal(nonempty.tail.value, 123);
  assert.equal(nonempty.head.next, null);
});

test("fromValues builds a singly list", () => {
  const linkedList = SinglyLinkedList.fromValues([1, 2, 3]);

  assert.ok(linkedList instanceof SinglyLinkedList);
  assert.deepEqual(linkedList.toList(), [1, 2, 3]);
  assert.equal(linkedList.head.value, 1);
  assert.equal(linkedList.tail.value, 3);
});

test("append, prepend, and insert update singly links", () => {
  const linkedList = new SinglyLinkedList();

  assert.equal(linkedList.append(2), true);
  assert.equal(linkedList.prepend(1), true);
  assert.equal(linkedList.insert(2, 4), true);
  assert.equal(linkedList.insert(2, 3), true);

  assert.deepEqual(linkedList.getValues(), [1, 2, 3, 4]);
  assert.equal(linkedList.head.value, 1);
  assert.equal(linkedList.tail.value, 4);
});

test("prependValues preserves order", () => {
  const linkedList = new SinglyLinkedList();

  assert.equal(linkedList.prependValues([1, 2, 3]), 3);
  assert.deepEqual(linkedList.getValues(), [1, 2, 3]);
});

test("replace changes a value and validates index", () => {
  const linkedList = SinglyLinkedList.fromValues(["a", "b"]);

  assert.equal(linkedList.replace(1, "x"), true);
  assert.deepEqual(linkedList.getValues(), ["a", "x"]);
  assert.throws(() => linkedList.replace(-1, "bad"), RangeError);
  assert.throws(() => linkedList.replace(2, "bad"), RangeError);
});

test("pop and remove detach nodes and maintain endpoints", () => {
  const linkedList = SinglyLinkedList.fromValues(["a", "b", "c", "d"]);

  const head = linkedList.popHead();
  assert.equal(head.value, "a");
  assert.equal(head.next, null);
  assert.deepEqual(linkedList.getValues(), ["b", "c", "d"]);

  assert.equal(linkedList.remove(1), true);
  assert.deepEqual(linkedList.getValues(), ["b", "d"]);

  const tail = linkedList.popTail();
  assert.equal(tail.value, "d");
  assert.equal(tail.next, null);
  assert.deepEqual(linkedList.getValues(), ["b"]);
  assert.equal(linkedList.head, linkedList.tail);
});

test("contains uses configured type and equality", () => {
  const strictList = SinglyLinkedList.fromValues([1], { valueType: "number" });
  assert.equal(strictList.contains(1), true);
  assert.equal(strictList.contains("1"), false);

  const deepList = new SinglyLinkedList(undefined, {
    equals: (left, right) => JSON.stringify(left) === JSON.stringify(right),
  });
  deepList.clear();
  deepList.append({ key: ["nested", "value"] });

  assert.equal(deepList.contains({ key: ["nested", "value"] }), true);
  assert.equal(deepList.contains({ key: ["other"] }), false);
});

test("reverse changes order in place", () => {
  const linkedList = SinglyLinkedList.fromValues([1, 2, 3]);

  assert.equal(linkedList.reverse(), true);
  assert.deepEqual(linkedList.getValues(), [3, 2, 1]);
  assert.equal(linkedList.head.value, 3);
  assert.equal(linkedList.tail.value, 1);
});

test("type validation prevents partial batch mutation", () => {
  const linkedList = new SinglyLinkedList(undefined, { valueType: "number" });
  linkedList.clear();

  assert.throws(() => linkedList.appendValues([1, "2", 3]), ValueTypeError);
  assert.deepEqual(linkedList.getValues(), []);
  assert.throws(() => linkedList.prependValues([1, "2", 3]), ValueTypeError);
  assert.deepEqual(linkedList.getValues(), []);
});

test("cycle helpers work for singly lists", () => {
  const linkedList = SinglyLinkedList.fromValues([1, 2, 3, 4, 5]);

  assert.equal(linkedList.createCycle(2), true);
  assert.equal(linkedList.getCycleStartIndex(), 2);
  assert.equal(linkedList.isCircular(), false);
  assert.equal(linkedList.makeLinear(), true);
  assert.deepEqual(linkedList.getValues(), [1, 2, 3, 4, 5]);

  linkedList.createCycle(0);
  assert.equal(linkedList.isCircular(), true);
});

test("singly mutating methods reject cyclic lists", () => {
  const linkedList = SinglyLinkedList.fromValues([1, 2, 3]);
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

test("createCycle validates start index", () => {
  const linkedList = SinglyLinkedList.fromValues([1, 2, 3]);

  assert.throws(() => linkedList.createCycle(-1), RangeError);
  assert.throws(() => linkedList.createCycle(2), RangeError);
  assert.throws(() => linkedList.createCycle(3), RangeError);
});

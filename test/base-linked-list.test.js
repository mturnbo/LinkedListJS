import assert from "node:assert/strict";
import test from "node:test";

import { BaseLinkedList, MISSING } from "../src/base-linked-list.js";
import { Node } from "../src/node.js";
import { ValueTypeError } from "../src/errors.js";

class ConcreteLinkedList extends BaseLinkedList {
  append(value) {
    this._validateValue(value);

    const newNode = new Node(value);
    if (this.head) {
      this.tail.next = newNode;
    } else {
      this.head = newNode;
    }
    this.tail = newNode;
    this.size += 1;
    return true;
  }
}

test("BaseLinkedList cannot be constructed directly", () => {
  assert.throws(() => new BaseLinkedList(), TypeError);
});

test("initializes an empty list", () => {
  const linkedList = new ConcreteLinkedList();

  assert.equal(linkedList.size, 0);
  assert.equal(linkedList.length, 0);
  assert.equal(linkedList.head, null);
  assert.equal(linkedList.tail, null);
});

test("initializes with falsy values", () => {
  for (const value of [0, false, "", null, undefined]) {
    const linkedList = new ConcreteLinkedList(value);

    assert.equal(linkedList.size, 1);
    assert.equal(linkedList.head, linkedList.tail);
    assert.equal(linkedList.head.value, value);
  }
});

test("fromValues builds a configured list", () => {
  const linkedList = ConcreteLinkedList.fromValues([1, 2, 3], {
    valueType: "number",
    sortable: true,
  });

  assert.equal(linkedList.valueType, "number");
  assert.equal(linkedList.sortable, true);
  assert.deepEqual(linkedList.toList(), [1, 2, 3]);
});

test("appendValues validates all values before mutating", () => {
  const linkedList = new ConcreteLinkedList(MISSING, { valueType: "number" });

  assert.throws(() => linkedList.appendValues([1, "2", 3]), ValueTypeError);
  assert.deepEqual(linkedList.getValues(), []);
});

test("iterates values bounded by size", () => {
  const linkedList = ConcreteLinkedList.fromValues([1, 2, 3]);
  linkedList.tail.next = linkedList.head;

  assert.deepEqual([...linkedList], [1, 2, 3]);
});

test("gets nodes, values, and stable node addresses", () => {
  const linkedList = ConcreteLinkedList.fromValues(["a", "b", "c"]);

  assert.equal(linkedList.getNode(1).value, "b");
  assert.deepEqual(linkedList.getValues(2), ["a", "b"]);
  assert.deepEqual(linkedList.toList(), ["a", "b", "c"]);
  assert.deepEqual(
    linkedList.toNodes().map((node) => node.value),
    ["a", "b", "c"],
  );
  assert.equal(linkedList.getNodeAddress(1), linkedList.getNodeAddress(1));
  assert.equal(linkedList.getAddresses().length, 3);
});

test("popHead and popTail remove and return detached nodes", () => {
  const linkedList = ConcreteLinkedList.fromValues(["a", "b", "c"]);

  const head = linkedList.popHead();
  assert.equal(head.value, "a");
  assert.equal(head.next, null);
  assert.deepEqual(linkedList.getValues(), ["b", "c"]);

  const tail = linkedList.popTail();
  assert.equal(tail.value, "c");
  assert.equal(tail.next, null);
  assert.deepEqual(linkedList.getValues(), ["b"]);
});

test("cycle helpers detect and break tail-originating cycles", () => {
  const linkedList = ConcreteLinkedList.fromValues([1, 2, 3]);

  assert.equal(linkedList.getCycleStartIndex(), null);
  assert.equal(linkedList.isCircular(), false);
  assert.equal(linkedList.createCycle(1), true);
  assert.equal(linkedList.getCycleStartIndex(), 1);
  assert.equal(linkedList.isCircular(), false);
  assert.equal(linkedList.makeLinear(), true);
  assert.deepEqual(linkedList.getValues(), [1, 2, 3]);
});

test("clear resets list state", () => {
  const linkedList = ConcreteLinkedList.fromValues([1, 2, 3]);

  assert.equal(linkedList.clear(true), true);
  assert.equal(linkedList.size, 0);
  assert.equal(linkedList.head, null);
  assert.equal(linkedList.tail, null);
});

test("Node string representation shows value", () => {
  assert.equal(new Node("x").toString(), "Node[x]");
});

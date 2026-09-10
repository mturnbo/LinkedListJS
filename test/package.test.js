import assert from "node:assert/strict";
import test from "node:test";

import {
  BaseLinkedList,
  CycleDetectedError,
  DoublyLinkedList,
  EmptyValueError,
  LinkedList,
  Node,
  SinglyLinkedList,
  ValueTypeError,
} from "../src/index.js";

test("package exports planned public API", () => {
  assert.equal(typeof Node, "function");
  assert.equal(typeof BaseLinkedList, "function");
  assert.equal(typeof SinglyLinkedList, "function");
  assert.equal(typeof DoublyLinkedList, "function");
  assert.equal(typeof LinkedList, "function");
  assert.equal(typeof EmptyValueError, "function");
  assert.equal(typeof ValueTypeError, "function");
  assert.equal(typeof CycleDetectedError, "function");
});

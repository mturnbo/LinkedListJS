import { CycleDetectedError, ValueTypeError } from "./errors.js";
import { Node } from "./node.js";

export const MISSING = Symbol("missing initial linked-list value");

const PRIMITIVE_TYPES = new Set([
  "bigint",
  "boolean",
  "function",
  "number",
  "object",
  "string",
  "symbol",
  "undefined",
]);

const nodeIds = new WeakMap();
let nextNodeId = 1;

export class BaseLinkedList {
  constructor(
    initialValue,
    {
      valueType = null,
      sortKey = null,
      sortable = false,
      equals = Object.is,
    } = {},
  ) {
    if (arguments.length === 0 || (arguments.length >= 2 && initialValue === undefined)) {
      initialValue = MISSING;
    }

    if (new.target === BaseLinkedList) {
      throw new TypeError("BaseLinkedList is abstract.");
    }

    if (valueType !== null && !this._isValidValueType(valueType)) {
      throw new TypeError("valueType must be a string primitive type or constructor.");
    }

    if (sortKey !== null && typeof sortKey !== "function") {
      throw new TypeError("sortKey must be callable.");
    }

    if (typeof equals !== "function") {
      throw new TypeError("equals must be callable.");
    }

    if (sortable && valueType === null && sortKey === null) {
      throw new TypeError("sortable lists require valueType or sortKey.");
    }

    this.valueType = valueType;
    this.sortKey = sortKey;
    this.sortable = sortable;
    this.equals = equals;
    this.head = initialValue === MISSING ? null : new Node(initialValue);
    this.tail = this.head;
    this.size = initialValue === MISSING ? 0 : 1;

    if (this.head) {
      this._validateValue(this.head.value);
    }
  }

  static fromValues(values, options = {}) {
    const linkedList = new this(MISSING, options);
    linkedList.appendValues(values);
    return linkedList;
  }

  get length() {
    return this.size;
  }

  *[Symbol.iterator]() {
    let currentNode = this.head;
    for (let index = 0; index < this.size; index += 1) {
      if (currentNode === null) {
        return;
      }
      yield currentNode.value;
      currentNode = currentNode.next;
    }
  }

  toString() {
    const values = [];
    let currentNode = this.head;
    const limit = Math.min(this.size, 20);

    for (let index = 0; index < limit; index += 1) {
      if (currentNode === null) {
        break;
      }
      values.push(currentNode.value);
      currentNode = currentNode.next;
    }

    if (this.size > 20) {
      values.push("...");
    }

    const typeLabel = this.valueType === null ? "" : `, valueType=${this._valueTypeName()}`;
    const sortLabel = this.sortable ? ", sortable=true" : "";
    return `${this.constructor.name}(size=${this.size}, values=${formatValues(values)}${typeLabel}${sortLabel})`;
  }

  _isValidValueType(valueType) {
    return (
      (typeof valueType === "string" && PRIMITIVE_TYPES.has(valueType))
      || typeof valueType === "function"
    );
  }

  _acceptsValue(value) {
    if (this.valueType === null) {
      return true;
    }

    if (typeof this.valueType === "string") {
      return typeof value === this.valueType;
    }

    if (value === null || value === undefined) {
      return false;
    }

    return value.constructor === this.valueType;
  }

  _validateValue(value) {
    if (!this._acceptsValue(value)) {
      throw new ValueTypeError(value, this.valueType);
    }
    this._validateSortableValue(value);
  }

  _sortValue(value) {
    return this.sortKey === null ? value : this.sortKey(value);
  }

  _validateSortableValue(value) {
    if (!this.sortable) {
      return;
    }

    const sortValue = this._sortValue(value);
    if (!isComparable(sortValue)) {
      throw new TypeError("Linked list value is not sortable.");
    }
  }

  _valuesAreSortable() {
    const values = this.getValues();
    for (const value of values) {
      if (!isComparable(this._sortValue(value))) {
        throw new TypeError("Linked list values are not sortable.");
      }
    }
    return true;
  }

  _ensureAcyclic(operation) {
    if (this._hasCycle()) {
      throw new CycleDetectedError(operation);
    }
  }

  _valueTypeName() {
    if (this.valueType === null) {
      return "Any";
    }

    return typeof this.valueType === "string" ? this.valueType : this.valueType.name;
  }

  append() {
    throw new TypeError("append must be implemented by a subclass.");
  }

  appendValues(values) {
    for (const value of values) {
      this._validateValue(value);
    }

    let appendedCount = 0;
    for (const value of values) {
      if (this.append(value)) {
        appendedCount += 1;
      }
    }

    return appendedCount;
  }

  getNode(index) {
    if (index < 0 || index >= this.size) {
      throw new RangeError("Linked list index out of range.");
    }

    if (index === 0) {
      return this.head;
    }

    if (index === this.size - 1) {
      return this.tail;
    }

    let currentNode = this.head;
    for (let currentIndex = 0; currentIndex < index; currentIndex += 1) {
      currentNode = currentNode.next;
    }

    return currentNode;
  }

  getNodeAddress(index) {
    return getNodeId(this.getNode(index));
  }

  getValues(count = this.size) {
    if (count <= 0) {
      return [];
    }

    const values = [];
    let currentNode = this.head;
    const limit = Math.min(count, this.size);

    for (let index = 0; index < limit; index += 1) {
      values.push(currentNode.value);
      currentNode = currentNode.next;
    }

    return values;
  }

  toList(count = this.size) {
    return this.getValues(count);
  }

  toNodes(count = this.size) {
    if (count <= 0) {
      return [];
    }

    const nodes = [];
    let currentNode = this.head;
    const limit = Math.min(count, this.size);

    for (let index = 0; index < limit; index += 1) {
      if (currentNode === null) {
        break;
      }
      nodes.push(currentNode);
      currentNode = currentNode.next;
    }

    return nodes;
  }

  getAddresses(count = this.size) {
    return this.toNodes(count).map((node) => getNodeId(node));
  }

  popHead() {
    this._ensureAcyclic("popHead");
    if (this.head === null) {
      throw new RangeError("Cannot pop from an empty linked list.");
    }

    const poppedNode = this.head;
    this.head = poppedNode.next;
    if (this.head === null) {
      this.tail = null;
    }
    poppedNode.next = null;
    this.size -= 1;

    return poppedNode;
  }

  popTail() {
    this._ensureAcyclic("popTail");
    if (this.tail === null) {
      throw new RangeError("Cannot pop from an empty linked list.");
    }

    if (this.size === 1) {
      return this.popHead();
    }

    const previousNode = this.getNode(this.size - 2);
    const poppedNode = this.tail;
    previousNode.next = null;
    this.tail = previousNode;
    poppedNode.next = null;
    this.size -= 1;

    return poppedNode;
  }

  _hasCycle() {
    let fastRunner = this.head;
    let slowRunner = this.head;

    while (fastRunner !== null && fastRunner.next !== null) {
      fastRunner = fastRunner.next.next;
      slowRunner = slowRunner.next;
      if (fastRunner === slowRunner) {
        return true;
      }
    }

    return false;
  }

  isCircular() {
    return this.head !== null && this.tail !== null && this.tail.next === this.head;
  }

  makeLinear() {
    if (!this._hasCycle()) {
      return false;
    }

    this.tail.next = null;
    return true;
  }

  getCycleStartIndex() {
    let fastRunner = this.head;
    let slowRunner = this.head;

    while (fastRunner !== null && fastRunner.next !== null) {
      fastRunner = fastRunner.next.next;
      slowRunner = slowRunner.next;
      if (fastRunner === slowRunner) {
        break;
      }
    }

    if (fastRunner === null || fastRunner.next === null) {
      return null;
    }

    slowRunner = this.head;
    let index = 0;
    while (slowRunner !== fastRunner) {
      slowRunner = slowRunner.next;
      fastRunner = fastRunner.next;
      index += 1;
    }

    return index;
  }

  clear(iterate = false) {
    if (iterate) {
      let currentNode = this.head;
      for (let index = 0; index < this.size; index += 1) {
        if (currentNode === null) {
          break;
        }
        const nextNode = currentNode.next;
        currentNode.next = null;
        currentNode.prev = null;
        currentNode = nextNode;
      }
    }

    this.head = null;
    this.tail = null;
    this.size = 0;
    return true;
  }

  createCycle(start) {
    if (this._hasCycle() || this.tail === null) {
      throw new RangeError("Cannot create a cycle in an empty linked list.");
    }

    if (start < 0 || start >= this.size - 1) {
      throw new RangeError("Cycle start index out of range.");
    }

    const startNode = this.getNode(start);
    this.tail.next = startNode;
    return true;
  }
}

function getNodeId(node) {
  if (!nodeIds.has(node)) {
    nodeIds.set(node, nextNodeId);
    nextNodeId += 1;
  }

  return nodeIds.get(node);
}

function isComparable(value) {
  if (value === null || value === undefined) {
    return false;
  }

  const valueType = typeof value;
  return valueType === "number" || valueType === "bigint" || valueType === "string";
}

function formatValues(values) {
  const formatted = values.map((value) => {
    if (typeof value === "string") {
      return `'${value}'`;
    }
    if (value === null) {
      return "null";
    }
    if (value === undefined) {
      return "undefined";
    }
    return String(value);
  });

  return `[${formatted.join(", ")}]`;
}

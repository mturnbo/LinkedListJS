import { BaseLinkedList } from "./base-linked-list.js";
import { Node } from "./node.js";

export class SinglyLinkedList extends BaseLinkedList {
  append(value) {
    this._validateValue(value);
    this._ensureAcyclic("append");

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

  prepend(value) {
    this._validateValue(value);
    this._ensureAcyclic("prepend");

    const newNode = new Node(value);
    newNode.next = this.head;
    if (this.head === null) {
      this.tail = newNode;
    }
    this.head = newNode;
    this.size += 1;
    return true;
  }

  prependValues(values) {
    for (const value of values) {
      this._validateValue(value);
    }

    let prependedCount = 0;
    for (let index = values.length - 1; index >= 0; index -= 1) {
      if (this.prepend(values[index])) {
        prependedCount += 1;
      }
    }

    return prependedCount;
  }

  insert(index, value) {
    this._validateValue(value);
    this._ensureAcyclic("insert");

    if (index <= 0) {
      return this.prepend(value);
    }

    if (index >= this.size) {
      return this.append(value);
    }

    const newNode = new Node(value);
    const currentNode = this.getNode(index - 1);
    newNode.next = currentNode.next;
    currentNode.next = newNode;
    this.size += 1;
    return true;
  }

  replace(index, value) {
    this._validateValue(value);
    if (index < 0 || index >= this.size) {
      throw new RangeError("Linked list index out of range.");
    }

    this.getNode(index).value = value;
    return true;
  }

  contains(value) {
    if (!this._acceptsValue(value)) {
      return false;
    }

    let currentNode = this.head;
    for (let index = 0; index < this.size; index += 1) {
      if (currentNode === null) {
        return false;
      }
      if (this.equals(currentNode.value, value)) {
        return true;
      }
      currentNode = currentNode.next;
    }

    return false;
  }

  remove(index) {
    this._ensureAcyclic("remove");
    if (index < 0 || index >= this.size) {
      throw new RangeError("Linked list index out of range.");
    }

    if (index === 0) {
      this.popHead();
      return true;
    }

    if (index >= this.size - 1) {
      this.popTail();
      return true;
    }

    const currentNode = this.getNode(index - 1);
    currentNode.next = currentNode.next.next;
    this.size -= 1;
    return true;
  }

  reverse() {
    this._ensureAcyclic("reverse");
    if (this.size <= 1) {
      return true;
    }

    let currentNode = this.head;
    let previousNode = null;
    while (currentNode) {
      const nextNode = currentNode.next;
      currentNode.next = previousNode;
      previousNode = currentNode;
      currentNode = nextNode;
    }

    const oldHead = this.head;
    this.head = this.tail;
    this.tail = oldHead;
    return true;
  }
}

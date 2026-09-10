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

  sort(method = 1, reverse = false) {
    if (![1, 2].includes(method)) {
      throw new RangeError("Method must be 1 (merge) or 2 (insertion).");
    }

    this._ensureAcyclic("sort");
    if (this.size <= 1) {
      return true;
    }
    this._valuesAreSortable();

    if (method === 1) {
      const [head, tail] = this.#mergeSort(this.head);
      this.head = head;
      this.tail = tail;
      if (reverse) {
        this.reverse();
      }
      return true;
    }

    let sortedHead = null;
    let currentNode = this.head;
    while (currentNode) {
      const nextNode = currentNode.next;
      if (
        sortedHead === null
        || this._sortValueLessThanOrEqual(currentNode.value, sortedHead.value)
      ) {
        currentNode.next = sortedHead;
        sortedHead = currentNode;
      } else {
        let search = sortedHead;
        while (
          search.next
          && this._sortValueLessThanOrEqual(search.next.value, currentNode.value)
        ) {
          search = search.next;
        }
        currentNode.next = search.next;
        search.next = currentNode;
      }
      currentNode = nextNode;
    }

    this.head = sortedHead;
    this.tail = sortedHead;
    while (this.tail && this.tail.next) {
      this.tail = this.tail.next;
    }
    if (reverse) {
      this.reverse();
    }
    return true;
  }

  #mergeSort(head) {
    if (head === null || head.next === null) {
      return [head, head];
    }

    const [left, right] = this.#split(head);
    const [leftHead] = this.#mergeSort(left);
    const [rightHead] = this.#mergeSort(right);
    return this.#merge(leftHead, rightHead);
  }

  #split(head) {
    if (head === null || head.next === null) {
      return [head, null];
    }

    let slow = head;
    let fast = head;
    let previous = null;
    while (fast && fast.next) {
      previous = slow;
      slow = slow.next;
      fast = fast.next.next;
    }

    if (previous) {
      previous.next = null;
    }
    return [head, slow];
  }

  #merge(left, right) {
    if (left === null) {
      return [right, this.#findTail(right)];
    }
    if (right === null) {
      return [left, this.#findTail(left)];
    }

    let head;
    if (this._sortValueLessThanOrEqual(left.value, right.value)) {
      head = left;
      left = left.next;
    } else {
      head = right;
      right = right.next;
    }

    let tail = head;
    tail.next = null;

    while (left && right) {
      if (this._sortValueLessThanOrEqual(left.value, right.value)) {
        tail.next = left;
        tail = left;
        left = left.next;
      } else {
        tail.next = right;
        tail = right;
        right = right.next;
      }
      tail.next = null;
    }

    tail.next = left || right;
    tail = this.#findTail(tail);
    return [head, tail];
  }

  #findTail(node) {
    let tail = node;
    while (tail && tail.next) {
      tail = tail.next;
    }
    return tail;
  }
}

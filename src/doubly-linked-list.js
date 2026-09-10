import { BaseLinkedList } from "./base-linked-list.js";
import { Node } from "./node.js";

export class DoublyLinkedList extends BaseLinkedList {
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

    if (index <= Math.floor(this.size / 2)) {
      let currentNode = this.head;
      for (let currentIndex = 0; currentIndex < index; currentIndex += 1) {
        currentNode = currentNode.next;
      }
      return currentNode;
    }

    let currentNode = this.tail;
    for (let currentIndex = this.size - 1; currentIndex > index; currentIndex -= 1) {
      currentNode = currentNode.prev;
    }
    return currentNode;
  }

  append(value) {
    this._validateValue(value);
    this._ensureAcyclic("append");

    const newNode = new Node(value);
    if (this.head) {
      this.tail.next = newNode;
      newNode.prev = this.tail;
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
    if (this.head) {
      this.head.prev = newNode;
    } else {
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

    const previousNode = this.getNode(index - 1);
    const nextNode = previousNode.next;
    const newNode = new Node(value, { prev: previousNode, next: nextNode });
    previousNode.next = newNode;
    nextNode.prev = newNode;
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

  popHead() {
    this._ensureAcyclic("popHead");
    if (this.head === null) {
      throw new RangeError("Cannot pop from an empty linked list.");
    }

    const poppedNode = this.head;
    this.head = poppedNode.next;
    if (this.head) {
      this.head.prev = null;
    } else {
      this.tail = null;
    }
    poppedNode.next = null;
    poppedNode.prev = null;
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

    const poppedNode = this.tail;
    this.tail = poppedNode.prev;
    this.tail.next = null;
    poppedNode.prev = null;
    poppedNode.next = null;
    this.size -= 1;
    return poppedNode;
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

    const previousNode = this.getNode(index - 1);
    const nextNode = previousNode.next.next;
    previousNode.next = nextNode;
    nextNode.prev = previousNode;
    this.size -= 1;
    return true;
  }

  contains(value) {
    if (!this._acceptsValue(value)) {
      return false;
    }

    let forward = this.head;
    let backward = this.tail;
    const limit = Math.floor((this.size + 1) / 2);

    for (let index = 0; index < limit; index += 1) {
      if (forward && this.equals(forward.value, value)) {
        return true;
      }
      if (backward && this.equals(backward.value, value)) {
        return true;
      }
      forward = forward ? forward.next : null;
      backward = backward ? backward.prev : null;
    }

    return false;
  }

  createCycle(start) {
    if (start !== 0) {
      throw new RangeError("Circular doubly linked lists must start at index 0.");
    }

    if (this.head === null || this.tail === null) {
      throw new RangeError("Cannot create a cycle in an empty linked list.");
    }

    this._ensureAcyclic("createCycle");
    this.tail.next = this.head;
    this.head.prev = this.tail;
    return true;
  }

  isCircular() {
    return (
      this.head !== null
      && this.tail !== null
      && this.tail.next === this.head
      && this.head.prev === this.tail
    );
  }

  makeLinear() {
    if (!this.isCircular()) {
      return false;
    }

    this.tail.next = null;
    this.head.prev = null;
    return true;
  }

  reverse() {
    this._ensureAcyclic("reverse");

    let currentNode = this.head;
    while (currentNode) {
      const nextNode = currentNode.next;
      currentNode.next = currentNode.prev;
      currentNode.prev = nextNode;
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
      if (this.head) {
        this.head.prev = null;
      }
      if (this.tail) {
        this.tail.next = null;
      }
      if (reverse) {
        this.reverse();
      }
      return true;
    }

    let sortedHead = null;
    let sortedTail = null;
    let currentNode = this.head;

    while (currentNode) {
      const nextNode = currentNode.next;
      currentNode.prev = null;
      currentNode.next = null;

      if (sortedHead === null) {
        sortedHead = currentNode;
        sortedTail = currentNode;
      } else if (this._sortValueLessThanOrEqual(currentNode.value, sortedHead.value)) {
        currentNode.next = sortedHead;
        sortedHead.prev = currentNode;
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
        currentNode.prev = search;
        if (search.next) {
          search.next.prev = currentNode;
        } else {
          sortedTail = currentNode;
        }
        search.next = currentNode;
      }

      currentNode = nextNode;
    }

    this.head = sortedHead;
    this.tail = sortedTail;
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
    if (slow) {
      slow.prev = null;
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

    head.prev = null;
    let tail = head;
    tail.next = null;

    while (left && right) {
      if (this._sortValueLessThanOrEqual(left.value, right.value)) {
        tail.next = left;
        left.prev = tail;
        tail = left;
        left = left.next;
      } else {
        tail.next = right;
        right.prev = tail;
        tail = right;
        right = right.next;
      }
      tail.next = null;
    }

    const remainder = left || right;
    if (remainder) {
      remainder.prev = tail;
    }
    tail.next = remainder;
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

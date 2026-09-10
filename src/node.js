export class Node {
  constructor(value, { prev = null, next = null } = {}) {
    this.value = value;
    this.prev = prev;
    this.next = next;
  }

  toString() {
    return `Node[${String(this.value)}]`;
  }
}

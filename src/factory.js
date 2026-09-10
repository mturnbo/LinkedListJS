import { MISSING } from "./base-linked-list.js";
import { DoublyLinkedList } from "./doubly-linked-list.js";
import { SinglyLinkedList } from "./singly-linked-list.js";

export class LinkedList {
  static create(listType = "singly", initialValue = MISSING, options = {}) {
    const ListClass = LinkedList.getListClass(listType);
    return initialValue === MISSING
      ? new ListClass(undefined, options)
      : new ListClass(initialValue, options);
  }

  static fromValues(listType, values, options = {}) {
    const ListClass = LinkedList.getListClass(listType);
    return ListClass.fromValues(values, options);
  }

  static getListClass(listType) {
    switch (listType.toLowerCase()) {
      case "s":
      case "single":
      case "singly":
        return SinglyLinkedList;
      case "d":
      case "double":
      case "doubly":
        return DoublyLinkedList;
      default:
        throw new RangeError(`Unknown linked list type '${listType}'.`);
    }
  }
}

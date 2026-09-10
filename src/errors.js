export class EmptyValueError extends Error {
  constructor(value, message = "Cannot perform operation with empty value.") {
    super(message);
    this.name = "EmptyValueError";
    this.value = value;
  }
}

export class ValueTypeError extends TypeError {
  constructor(value, expectedType = null) {
    const actualType = value === null ? "null" : typeof value;
    const expected = formatExpectedType(expectedType);
    super(`Invalid value type: ${actualType}. Expected ${expected}.`);
    this.name = "ValueTypeError";
    this.value = value;
    this.expectedType = expectedType;
  }
}

export class CycleDetectedError extends Error {
  constructor(operation, message = "Cannot perform operation on linked list with cycle.") {
    super(`Invalid operation: ${operation}. ${message}`);
    this.name = "CycleDetectedError";
    this.operation = operation;
  }
}

function formatExpectedType(expectedType) {
  if (typeof expectedType === "string") {
    return expectedType;
  }

  if (typeof expectedType === "function" && expectedType.name) {
    return expectedType.name;
  }

  return "configured value type";
}

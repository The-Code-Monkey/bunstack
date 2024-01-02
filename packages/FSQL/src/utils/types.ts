// Export a type alias named 'defaultDataTypes'. This type represents either a string, a number, or a boolean.
export type defaultDataTypes = string | number | boolean;

// Export a type alias named 'OperatorFunction'. This type represents a function that takes two parameters of type 'defaultDataTypes' and returns a boolean.
export type OperatorFunction = (a: defaultDataTypes, b: defaultDataTypes) => boolean;

// Export a type alias named 'Operators'. This type represents an object where each property is a string representing an operator and the value is an 'OperatorFunction'.
export type Operators = {
    // The '=' property is an 'OperatorFunction'.
    '=': OperatorFunction,
    // The '!=' property is an 'OperatorFunction'.
    '!=': OperatorFunction,
    // The '>' property is an 'OperatorFunction'.
    '>': OperatorFunction,
    // The '<' property is an 'OperatorFunction'.
    '<': OperatorFunction,
    // The '>=' property is an 'OperatorFunction'.
    '>=': OperatorFunction,
    // The '<=' property is an 'OperatorFunction'.
    '<=': OperatorFunction,
    // The 'contains' property is an 'OperatorFunction'.
    'contains': OperatorFunction,
    // The 'startsWith' property is an 'OperatorFunction'.
    'startsWith': OperatorFunction,
    // The 'endsWith' property is an 'OperatorFunction'.
    'endsWith': OperatorFunction,
    // A comment indicating that more operators can be added as needed.
    // Add more operators as needed
};
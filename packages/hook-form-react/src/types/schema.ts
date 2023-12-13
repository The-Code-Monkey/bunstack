export type SchemaValidationTypeString = {
  type: 'string';
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  pattern?: string;
};

export type SchemaValidationTypeNumber = {
  type: 'number';
  required?: boolean;
  minimum?: number;
  maximum?: number;
};

export type SchemaValidationTypeDate = {
  type: "date",
  required?: boolean;
  min?: Date;
  max?: Date;
};

export type SchemaValidationTypeArray = {
  type: 'array';
  required?: boolean;
  minItems?: number;
  maxItems?: number;
  uniqueItems?: boolean;
  schema: Record<string, SchemaValidationType>;
};

export type SchemaValidationTypeObject = {
  type: 'object';
  required?: boolean;
  properties: Record<string, SchemaValidationType>;
};

export type SchemaValidationType =
  | SchemaValidationTypeString
  | SchemaValidationTypeNumber
  | SchemaValidationTypeDate
  | SchemaValidationTypeArray
  | SchemaValidationTypeObject;


export type SchemaType = Record<string, SchemaValidationType>;
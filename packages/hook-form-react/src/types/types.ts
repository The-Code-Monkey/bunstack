export type DataTypeSingle =
  | string
  | boolean
  | number
  | [unknown]
  | Record<string, unknown>
  | undefined;

export type DataTypeArray = Array<Record<string, DataTypeSingle>>;

export type DefaultFieldType = {
  name: string;
  type: string;
};

export type TextFieldType = DefaultFieldType & {
  type: 'text';
};

export type NumberFieldType = DefaultFieldType & {
    type: 'number';
};

export type NestedFieldType = DefaultFieldType & {
  type: 'fields',
  fields: Array<FieldType>;
}

export type FieldType = TextFieldType | NumberFieldType | NestedFieldType;

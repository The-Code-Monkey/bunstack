import { ChangeEvent, useContext, useState } from "react";
import { set } from 'lodash';

import { FormContext } from '../provider/FormContext';
import { DataTypeArray, DataTypeSingle, FieldType } from '../types';

export interface useFieldsProps {
  // 'name' is the name of the field.
  name: string;
  fieldArray: Array<FieldType>;
}

export type useFieldsReturnType = {
  fields: Array<
    Array<{
      // 'value' is the current value of the field.
      value: DataTypeSingle | undefined;
      // 'reset' is a function that resets the field data to its default state.
      reset: (value?: DataTypeSingle) => void;
      // 'clean' is a function that clears the field data.
      clean: () => void;
      // 'register' is a function that returns an object with the field name, value, and onChange handler.
      name: string;
      onChange: (event: ChangeEvent<HTMLInputElement>) => void;
      type: string;
    }>
  >;
    append: () => void;
};

// Define the useFields hook.
const useFields = <DataType extends DataTypeSingle>({
  name,
  fieldArray: fieldArrayRaw,
}: useFieldsProps): useFieldsReturnType => {
  // Get the form context.
  const context = useContext(FormContext);

  const { updateField, getFieldValue } = context;

  const [fieldsRaw, setFieldsRaw] = useState<DataTypeArray>(
      (getFieldValue(name) ?? []) as DataTypeArray
  );

  const onChange =
    (index: number, fieldKey: string) => (e: ChangeEvent<HTMLInputElement>) => {
      // @ts-expect-error bun types wrong
      const value = e.target.value;
      setFieldsRaw(prevState => {
        const newState = [...prevState];
        set(newState, `${index}.${fieldKey}`, value);
        return newState;
      });
      updateField(`${name}.${index}.${fieldKey}`, value);
    };

  const onChangeSimple = (index: number, fieldKey: string) => (value: DataType) => {
    setFieldsRaw(prevState => {
        const newState = [...prevState];
        set(newState, `${index}.${fieldKey}`, value);
        return newState;
    })
    updateField(`${name}.${index}.${fieldKey}`, value);
  }

  // Define the reset function.
  const reset = (index: number, fieldKey: string) => (value?: DataType) => {
    updateField(`${name}.${index}.${fieldKey}`, value);
  };

  // Define the clean function.
  const clean = (index: number, fieldKey: string) => () => {
    updateField(`${name}.${index}.${fieldKey}`, '');
  };

  const append = () => {
      const newFieldData = [...fieldsRaw, {}];
    updateField(`${name}`, newFieldData);
    setFieldsRaw(newFieldData);
  }

  const fieldArray: useFieldsReturnType['fields'] = fieldsRaw.map((field, index: number) => {
    const fields = fieldArrayRaw.map(item => ({
      fieldKey: item.name,
      type: item.type,
    }));

    return fields.map(({ fieldKey, type }) => ({
      name: `${name}.${index}.${fieldKey}`,
      onChange: onChange(index, fieldKey),
      onChangeSimple: onChangeSimple(index, fieldKey),
      clean: clean(index, fieldKey),
      reset: reset(index, fieldKey),
      value: getFieldValue(`${name}.${index}.${fieldKey}`),
      type,
    }));
  });

  return {
    fields: fieldArray,
      append
  };
};

export default useFields;

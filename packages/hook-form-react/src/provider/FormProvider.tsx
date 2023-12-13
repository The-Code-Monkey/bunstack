import {
 useState, PropsWithChildren, useCallback
} from 'react';
import { get, set } from 'lodash';

import {FormContext} from './FormContext';
import { DataTypeSingle } from '../types';

export interface FormProviderProps<DataType> extends PropsWithChildren {
  defaultValues?: Partial<DataType>;
}

const FormProvider = <DataType extends object>({
  children,
  defaultValues = {},
}: FormProviderProps<DataType>) => {
  const [data, setData] = useState<DataType>(defaultValues as DataType);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const getData = useCallback(() => {
    return data;
  }, [data]);

  // This function updates a specific field in the form data.
  // It takes a field key and a new value as parameters.
  const updateField = useCallback(
    (fieldKey: string, value: never) => {
      // Create a copy of the current form data.
      const newData = { ...getData() };
      // Use the 'set' function to update the value of the specified field in the copied data.
      set(newData, fieldKey, value);
      // Update the form data with the modified copy.
      setData(newData);
    },
    [setData, getData]
  );

  const getFieldValue = useCallback(
    (fieldKey: string) => {
      return get(data, fieldKey) as DataTypeSingle;
    },
    [data]
  );

  const getError = useCallback(
    (fieldKey: string) => {
      return get(errors, fieldKey);
    },
    [errors]
  );

  return (
      <FormContext.Provider
          value={{ getFieldValue, getData, updateField, data, setData, errors, setErrors, getError }}
      >
        {children}
      </FormContext.Provider>
  );
};

export default FormProvider;

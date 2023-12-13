import {
  Dispatch, SetStateAction, createContext,
} from 'react';

import { DataTypeSingle } from '../types';

export type FormContextType = {
  data: object;
  updateField?: (field: string, value: unknown) => void;
  getFieldValue: (field: string) => DataTypeSingle;
  getData: () => object;
  setData?: Dispatch<SetStateAction<object>>;
  errors: Record<string, string>;
  setErrors?: Dispatch<SetStateAction<Record<string, string>>>;
  getError: (field: string) => string;
};

export const FormContext = createContext<FormContextType>({
  data: {},
  getFieldValue: () => undefined,
  getError: () => undefined,
  getData: () => ({}),
  errors: {},
});

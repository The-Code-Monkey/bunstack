import {
  FormEvent, useContext, useEffect
} from 'react';
import { get, set } from 'lodash';

import {
  SchemaValidationType,
  SchemaValidationTypeArray,
  SchemaValidationTypeNumber,
  SchemaValidationTypeObject,
  SchemaValidationTypeString,
} from '../types/schema';
import { FormContext } from '../provider/FormContext';

// Define the properties for the useForm hook.
// 'DataType' is a generic type representing the shape of the form data.
export interface useFormProps<DataType> {
  // 'defaultData' is the initial state of the form data.
  defaultValues?: Partial<DataType>;
  // 'onSubmit' is a function that is called when the form is submitted and the data is valid.
  onSubmit: (data: DataType) => void;
  // 'schema' is an object that defines the validation rules for each field in the form data.
  schema: Record<string, SchemaValidationType>;
  // 'name' is an optional name for the form.
  name?: string;
}

// Define the return type for the useForm hook.
export type useFormReturnType<DataType> = {
  // 'reset' is a function that resets the form data to its default state.
  reset: (data?: DataType) => void;
  // 'handleSubmit' is a function that handles form submission.
  handleSubmit: (event: FormEvent<HTMLFormElement>) => void;
  // 'errors' is an object that contains any validation errors.
  errors: Record<string, string> | undefined;
};

const useForm = <DataType extends object>({
  schema,
  defaultValues,
  onSubmit,
}: useFormProps<DataType>): useFormReturnType<DataType> => {
  const { getData, setData, errors, setErrors, getFieldValue } = useContext(FormContext);

  if (!schema) {
    throw new Error('You must provide a schema!');
  }

  // This function validates a value against a set of rules.
  // It takes a value and an array of rules as parameters.
  // Each rule is an object with a 'validate' function and an 'errorMessage' string.
  const validateValue = async (
    value: unknown,
    rules: Array<{
      validate: (value: unknown) => Promise<boolean | Record<keyof DataType, string>>;
      errorMessage: string;
    }>
  ): Promise<string | Record<keyof DataType, string> | null> => {
    // Iterate over each rule.
    for (const rule of rules) {
      // If the value does not pass the validation function of the rule,
      // return the error message of the rule.
      const result = await rule.validate(value);

      if (typeof result === 'boolean') {
        if (!result) {
          return rule.errorMessage;
        }
      } else if ((Object.keys(result)).length > 0) {
        return result;
      }
    }
    // If the value passes all the rules, return null.
    return null;
  };

  useEffect(() => {
    const keys = Object.keys(schema);

    const newData = { ...getData() };

    for (const key of keys) {
      if (getFieldValue(key) === undefined) {
        set(newData, key, null);
      }
    }

    setData(newData);
  }, []);

  // This function validates the data according to the schema
  const validate = async (data: DataType, innerSchema: Record<string, SchemaValidationType>) => {
    // Initialize an empty object to store any validation errors
    // @ts-expect-error - This is a hack to get around TypeScript's type checking
    const result: Record<keyof DataType, string> = {};

    // Get the keys of the data object
    const keys = Object.keys(innerSchema);

    // Iterate over each key in parallel using Promise.all
    await Promise.all(
      keys.map(async key => {
        // Get the validation rules for this key from the schema
        const validationType = innerSchema[key];

        // Get the value for this key from the data
        const value = get(data, key);

        if (!value && validationType.required) {
          result[key] = 'This field is required';
        } else {

        // Depending on the type of the validation, perform different checks
        switch (validationType.type) {
          // If the type is 'string', perform string-specific checks
          case 'string': {
            // Cast the validationType to SchemaValidationTypeString for TypeScript type safety
            const stringValidation =
              validationType as SchemaValidationTypeString;

            // Define the validation rules for strings
            const rules = [
              // The value must be a string
              {
                validate: async (value: unknown) => typeof value === 'string',
                errorMessage: 'Expected a string',
              },
              // If the field is required, the string must not be empty
              {
                validate: async (value: string) =>
                  !(stringValidation.required && value.length === 0),
                errorMessage: 'This field is required',
              },
              // If a minimum length is specified, the string must be at least that long
              {
                validate: async (value: string) =>
                  !(
                    stringValidation.minLength &&
                    value.length < stringValidation.minLength
                  ),
                errorMessage: `Minimum length is ${stringValidation.minLength}`,
              },
              // If a maximum length is specified, the string must not be longer than that
              {
                validate: async (value: string) =>
                  !(
                    stringValidation.maxLength &&
                    value.length > stringValidation.maxLength
                  ),
                errorMessage: `Maximum length is ${stringValidation.maxLength}`,
              },
              // If a pattern is specified, the string must match that pattern
              {
                validate: async (value: string) =>
                  !(
                    stringValidation.pattern &&
                    !new RegExp(stringValidation.pattern).test(value)
                  ),
                errorMessage: 'Does not match pattern',
              },
            ];

            // Get the error message from the validateValue function
            const errorMessage = await validateValue(value, rules);

            // If there's an error message, add it to the errors object
            if (errorMessage !== null) {
              result[key] = errorMessage;
            }
            break;
          }
          // If the validation type is 'number', perform number-specific checks
          case 'number': {
            // Cast the validationType to SchemaValidationTypeNumber for TypeScript type safety
            const numberValidation =
              validationType as SchemaValidationTypeNumber;

            // Define the validation rules for numbers
            const rules = [
              // The value must be a number
              {
                validate: async (value: unknown) => typeof value === 'number',
                errorMessage: 'Expected a number',
              },
              // If the field is required, the value must not be zero
              {
                validate: async (value: number) =>
                  !(numberValidation.required && !value),
                errorMessage: 'This field is required',
              },
              // If a minimum value is specified, the number must be at least that
              {
                validate: async (value: number) =>
                  !(
                    numberValidation.minimum && value < numberValidation.minimum
                  ),
                errorMessage: `Minimum value is ${numberValidation.minimum}`,
              },
              // If a maximum value is specified, the number must not be greater than that
              {
                validate: async (value: number) =>
                  !(
                    numberValidation.maximum && value > numberValidation.maximum
                  ),
                errorMessage: `Maximum value is ${numberValidation.maximum}`,
              },
            ];

            // Get the error message from the validateValue function
            const errorMessage = await validateValue(value, rules);

            // If there's an error message, add it to the errors object
            if (errorMessage !== null) {
              result[key] = errorMessage;
            }
            break;
          }
          // If the validation type is 'array', perform array-specific checks
          case 'array': {
            // Cast the validationType to SchemaValidationTypeArray for TypeScript type safety
            const arrayValidation = validationType as SchemaValidationTypeArray;

            // Define the validation rules for arrays
            const rules = [
              // The value must be an array
              {
                validate: async (value: unknown) => Array.isArray(value),
                errorMessage: 'Expected an array',
              },
              // If the field is required, the array must not be empty
              {
                validate: async (value: DataType[]) =>
                  !(arrayValidation.required && value.length === 0),
                errorMessage: 'This field is required',
              },
              // If a minimum item count is specified, the array must have at least that many items
              {
                validate: async (value: DataType[]) =>
                  !(arrayValidation.minItems && value.length < arrayValidation.minItems),
                errorMessage: `Minimum item count is ${arrayValidation.minItems}`,
              },
              // If a maximum item count is specified, the array must not have more than that many items
              {
                validate: async (value: DataType[]) =>
                  !(arrayValidation.maxItems && value.length > arrayValidation.maxItems),
                errorMessage: `Maximum item count is ${arrayValidation.maxItems}`,
              },
              // If uniqueItems is true, all items in the array must be unique
              {
                validate: async (value: DataType[]) => {
                  if (arrayValidation.uniqueItems) {
                    const valueSet = new Set(value.map(item => JSON.stringify(item)));
                    return valueSet.size === value.length;
                  }
                  return true;
                },
                errorMessage: 'All items must be unique',
              },
              // If a schema is provided, each item in the array must validate against the schema
              {
                validate: async (value: DataType[]): Promise<boolean | Record<keyof DataType, string>> => {
                  if (arrayValidation.schema) {

                    // For each item in the array, call the validate function recursively
                    const result = await Promise.all(
                      value.map(async (item) => await validate(item, arrayValidation.schema))
                    );

                    return result.length > 0
                      ? result.reduce((obj, item) => {
                          const keys = Object.keys(item);
                          const newItem = {};
                          for (const key of keys) {
                            if (item[key]) {
                              newItem[key] = item[key];
                            }
                          }
                          return Object.assign(obj, newItem);
                        }, {} as Record<keyof DataType, string>)
                      : true;
                  } else {

                  // If no schema is provided, or if all items validate against the schema, return true
                  return true;
                  }
                },
                errorMessage: 'One or more items do not match the provided schema',
              },
            ];

            // Get the error message from the validateValue function
            const errorMessage = await validateValue(value, rules);

            // If there's an error message, add it to the errors object
            if (errorMessage !== null) {
              result[key] = errorMessage;
            }
            break;
          }
          // If the validation type is 'object', perform object-specific checks
          case 'object': {
            // Cast the validationType to SchemaValidationTypeObject for TypeScript type safety
            const objectValidation =
              validationType as SchemaValidationTypeObject;

            // Define the validation rules for objects
            const rules = [
              // The value must be an object and not an array
              {
                validate: async (value: unknown) =>
                  typeof value === 'object' && !Array.isArray(value),
                errorMessage: 'Expected an object',
              },
              // If the field is required, the object must not be empty
              {
                validate: async (value: Record<string, unknown>) =>
                  !(
                    objectValidation.required && Object.keys(value).length === 0
                  ),
                errorMessage: 'This field is required',
              },
            ];

            // Get the error message from the validateValue function
            const errorMessage = await validateValue(value, rules);

            // If there's an error message, add it to the errors object
            if (errorMessage !== null) {
              result[key] = errorMessage;
            }
            break;
          }
        }
      }

        // Check for required fields that haven't been set
        if (
          validationType.required &&
          (value === undefined || value === null)
        ) {
          result[key] = 'This field is required';
        }
      })
    );

    return result;
  };

  // This function handles the form submission.
  // It takes an event object as a parameter.
  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    // Prevent the default form submission behavior.
    event.preventDefault();
    // Validate the form data and get any errors.
    const errorResult = await validate(getData() as DataType, schema);
    // If there are no errors (i.e., the errors object is empty),
    // call the 'onSubmit' function with the form data.
    if (Object.keys(errorResult).length === 0) {
      onSubmit(getData() as DataType);
    } else {
      //   If there are errors, set the error state with the errors.
      setErrors(errorResult);
    }
  };

  // This function resets the form data to its default state.
  // It takes an optional parameter 'data'. If 'data' is provided, the form data is set to 'data'.
  // If 'data' is not provided, the form data is reset to 'defaultData'.
  const reset = (data?: DataType) => {
    setData(data || defaultValues);
  };

  // useEffect(() => {
  //   if (setData && Object.keys(getData()).length === 0) {
  //     setData(defaultValues);
  //   }
  // }, [defaultValues, setData]);

  return {
    reset,
    handleSubmit,
    errors,
  };
};

export default useForm;

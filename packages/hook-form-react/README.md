# Hook Form React

This project provides a set of custom hooks to simplify the use of forms in React applications.

This project is not production ready and will contain bugs. If you find one please open an issue.

## Installation

To install the project, you can use npm:

```sh
yarn add @bunstack/hook-form-react
                or 
npm install @bunstack/hook-form-react
                or
bun add @bunstack/hook-form-react
```

This is an experimental hook form to simplify the use of forms in react.


## Usage

### FormWrapper

The FormWrapper component is a context provider for form data. It provides a way to manage form data and exposes methods to get and update form data. It uses the React Context API to allow child components to access and manipulate the form data without prop drilling.

Here's an example of how you could import and use this component:

```jsx
import FormWrapper from '@bunstack/hook-form-react';

const MyForm = () => {
  // Do not add any hooks here they will not work
  return (
    <FormWrapper defaultValues={{ firstName: '', lastName: '' }}>
      {/* Your form fields go here */}
    </FormWrapper>
  );
};

export default MyForm;
```

### useForm

useForm is a custom React hook that helps manage form state and validation. It takes an object with the initial form values, a submission function, and a schema for validation. It returns an object with methods to reset the form, handle form submission, validate the form, and access any validation errors.

Here's an example of how you might import and use this hook:

```jsx
import { useForm } from '@bunstack/hook-form-react';

type FormData = {
  name: string;
  age: number;
};

const MyFormComponent = () => {
  const { reset, handleSubmit, validate, errors } = useForm<FormData>({
    defaultValues: { name: '', age: 0 },
    onSubmit: (data) => {
      // This will only fire if there are no errors when using schema
      console.log('Form submitted with data:', data);
    },
    schema: {
      name: { validate: (value) => typeof value === 'string', errorMessage: 'Name must be a string' },
      age: { validate: (value) => typeof value === 'number', errorMessage: 'Age must be a number' },
    },
  });

  return (
    <form onSubmit={handleSubmit}>
      {/* form fields here */}
    </form>
  );
};
```


### useField

The useField hook is a custom hook that helps manage form field states in a React application. It provides functionalities to get and set the value of a form field, as well as to reset and clean the field.

Here's an example of how you can import and use this hook:

```jsx
import useField from '@bunstack/hook-form-react';

const InputComponent: FC = () => {
  const { value, onChange } = useField<string>({ name: 'name' });

  return (
      <input
        id="name"
        type="text"
        value={value || ''}
        onChange={onChange}
      />
  );
};

export default InputComponent;
```

#### Nested Example

```jsx
import useField from '@bunstack/hook-form-react';

const NameInputComponent: FC = () => {
  const { value: firstName, onChange: setFirstName } = useField<string>({ name: 'name.first' });
  const { value: lastName, onChange: setLastName } = useField<string>({ name: 'name.last' });

  return (
    <>
      <input
        id="firstName"
        type="text"
        value={firstName || ''}
        onChange={setFirstName}
      />
      <input
        id="lastName"
        type="text"
        value={lastName || ''}
        onChange={setLastName}
      />
    </>
  );
};

export default NameInputComponent;
```

In this example, we're using the useField hook twice, once for each part of the name. The name property of the options object passed to useField is a string that uses dot notation to specify the path to the field in the form data.

The first useField call is for the first name, so we pass { name: 'name.first' }. This means that the form data is expected to be an object with a name property, which is itself an object with a first property.

The second useField call is for the last name, so we pass { name: 'name.last' }. This means that the form data is expected to be an object with a name property, which is itself an object with a last property.

The value and onChange properties returned by useField are then used to manage the state of the corresponding input field.


#### Default Value Example

```jsx
import useField from '@bunstack/hook-form-react';

const NameInputComponent: FC = () => {
  const { value: firstName, onChange: setFirstName } = useField<string>({ name: 'name.first', defaultValue: 'John' });
  const { value: lastName, onChange: setLastName } = useField<string>({ name: 'name.last', defaultValue: 'Doe' });

  return (
    <>
      <input
        id="firstName"
        type="text"
        value={firstName || ''}
        onChange={setFirstName}
      />
      <input
        id="lastName"
        type="text"
        value={lastName || ''}
        onChange={setLastName}
      />
    </>
  );
};

export default NameInputComponent;
```

In this example, we're using the useField hook twice, once for each part of the name. The name property of the options object passed to useField is a string that uses dot notation to specify the path to the field in the form data.

The first useField call is for the first name, so we pass { name: 'name.first', defaultValue: 'John' }. This means that the form data is expected to be an object with a name property, which is itself an object with a first property. The default value for this field is 'John'.

The second useField call is for the last name, so we pass { name: 'name.last', defaultValue: 'Doe' }. This means that the form data is expected to be an object with a name property, which is itself an object with a last property. The default value for this field is 'Doe'.

The value and onChange properties returned by useField are then used to manage the state of the corresponding input field. If there's no user-provided value for the field, the default value will be used instead.


### useFields

The useFields hook is a custom React hook that helps manage the state of form fields. It provides functionalities such as resetting and cleaning field data, and registering fields with their respective handlers. 

Here's an example of how you can import and use this hook:

```jsx
import { useFields } from '@bunstack/hook-form-react';

function MyFormComponent() {
  const { fields } = useFields({
    name: 'myForm',
    fieldArray: [
      { name: 'firstName', type: 'text' },
      { name: 'lastName', type: 'text' },
    ],
  });

  return (
    <form>
      {fields.map((field, index) => (
        <input
          key={index}
          name={field.name}
          type={field.type}
          value={field.value}
          onChange={field.onChange}
        />
      ))}
    </form>
  );
}
```

## Types

### Schema

This TypeScript module defines several types for schema validation. Each type represents a different kind of data that can be validated. Here's a brief explanation of each type:

SchemaValidationTypeString: This type is used for validating string data. It has optional properties like required, minLength, maxLength, and pattern for additional validation rules.

SchemaValidationTypeNumber: This type is used for validating numeric data. It has optional properties like required, minimum, and maximum for additional validation rules.

SchemaValidationTypeArray: This type is used for validating array data. It has optional properties like required, minItems, maxItems, and uniqueItems for additional validation rules.

SchemaValidationTypeObject: This type is used for validating object data. It has a required property and a properties property which is a record of string keys and SchemaValidationType values for nested validation.

The SchemaValidationType is a union type of all the above types. This means a SchemaValidationType can be any one of the above types.

#### How to Use

To use these types, you would define a schema using the appropriate type for the data you want to validate. For example, if you want to validate a string, you would use SchemaValidationTypeString and specify the validation rules you want to apply:

```jsx
const nameSchema: SchemaValidationTypeString = {
  type: 'string',
  required: true,
  minLength: 5,
  maxLength: 20,
};

const { handleSubmit, errors } = useForm({
    schema: {
        "name.first_name": nameSchema,
        "name.last_name": nameSchema
    }
})
```

This part of the code uses the useForm hook to create a form with schema validation. The schema property of the form is an object where each key is the name of a form field and the value is the schema for validating that field.

In this case, the form has two fields: name.first_name and name.last_name. Both fields use the nameSchema for validation, which means both fields must be strings between 5 and 20 characters long.

The useForm hook returns an object with a handleSubmit function for submitting the form and an errors object for accessing validation errors.

The dot notation in the field names (name.first_name and name.last_name) indicates that the form data is expected to be an object with a name property, which is itself an object with first_name and last_name properties. This is a common pattern for handling complex form data structures.


### Props Table

#### useForm
| Prop          | Type              | Description                                                                  |
| ------------- | ----------------- | ---------------------------------------------------------------------------- |
| defaultValues | DataType          | The initial state of the form data.                                          |
| onSubmit      | function          | A function that is called when the form is submitted and the data is valid.  |
| schema        | object            | An object that defines the validation rules for each field in the form data. |
| name          | string (optional) | An optional name for the form.                                               |
#### useField
| Prop         | Type                            | Description                                                                           |
| ------------ | ------------------------------- | ------------------------------------------------------------------------------------- |
| name         | string                          | The name of the field.                                                                |
| defaultValue | string, number, boolean, object | An optional default value in case data is fetched in the component and needs updating |
#### useFields
| Prop       | Type   | Description                                                                                       |
| ---------- | -----  | ------------------------------------------------------------------------------------------------- |
| name       | string | The name of the field.                                                                            |
| fieldArray | array  | An array of objects, each representing a field. Each object should have a name and type property. |


Please note that DataType in useForm is a generic type representing the shape of the form data. It can be any valid JavaScript data type (string, number, object, etc.) depending on the form data.
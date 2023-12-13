import {PropsWithChildren} from "react";

import {useForm} from "../hooks";
import {SchemaType} from "../types";

export interface FormProps extends PropsWithChildren {
    schema: SchemaType;
    onSubmit: (data: any) => void;
}

const Form = ({ children, schema, onSubmit }: FormProps) => {
    const { handleSubmit } = useForm({ onSubmit, schema });

    return (
        <form onSubmit={handleSubmit}>
            {children}
        </form>
    );
}

export default Form;
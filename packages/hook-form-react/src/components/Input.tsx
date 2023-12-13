import {useField} from "../hooks";
import {DataTypeSingle} from "../types";

export interface InputProps {
    type?: 'text' | 'number' | 'date' | 'email' | 'password';
    name: string;
}

const Input = <DataType extends DataTypeSingle>({ type = 'text', name }: InputProps) => {
    const { value, onChange } = useField<DataType>({ name });

    return (
        // @ts-expect-error remove generic type error
        <input name={name} onChange={onChange} value={value} type={type} />
    )
}

export default Input;
import { v4 as uuid } from 'uuid';

type createPropsDefault = {
  [x: string]: any;
}

export interface createPropsSingle extends createPropsDefault {
  table: string;
  _id?: string;
}

export interface createPropsMulti extends createPropsDefault {
  table: string;
  data: Array<{
    _id?: string;
  }>;
}

export type createProps = createPropsSingle | createPropsMulti;

const create = ({ _id, data = undefined }: createProps) => {
  if (data) {
    return [{
      id: uuid()
    }];
  }

  const id = _id ?? uuid();

  return {
    id
  }
}

export default create;

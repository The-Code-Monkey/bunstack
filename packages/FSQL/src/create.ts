import { fullGC } from 'bun:jsc';
import { readdir } from 'node:fs/promises';
import { v4 as uuid } from 'uuid';

type createPropsDefault = {
  [x: string]: any;
}

export interface createPropsSingle extends createPropsDefault {
  _id?: string;
}

export interface createPropsMulti extends createPropsDefault {
  data: Array<{
    _id?: string;
  }>;
}

class create<Data> {
  public table: string;
  public folder: string;
  public database: string;

  constructor(_this: any) {
    this.table = _this.table;
    this.folder = _this.folder;
    this.database = _this.database;
  }

  public async create(props: createPropsSingle & Data): Promise<Data | string> {  
    const schemaPath = Bun.file(`${this.folder}/${this.database}/${this.table}/schema.json`);
  
    const schemaExists = await schemaPath.exists();

    if (!schemaExists) {
      return `${this.table} - table does not exist`;
    }
  
    const schema = await schemaPath.json();
  
    const schemaKeys = Object.keys(schema);

    const _id = props._id ?? uuid();

    if (props._id) {
      delete props._id;
    }

    (props as createPropsSingle).id = _id;

    const invalidColumns = Object.keys(props).some((column) => !schemaKeys.includes(column));

    if (invalidColumns) {
      return `Invalid column`;
    }

    const path = `${this.folder}/${this.database}/${this.table}/${_id}.json`;

    await Bun.write(path, JSON.stringify(props, null, 2));
  
    return props;
  };
  public async create(props: createPropsMulti): Promise<Data[] | string>;
}

export default create;

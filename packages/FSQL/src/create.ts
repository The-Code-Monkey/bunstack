import { v4 as uuid } from 'uuid';

type createPropsDefault = {
  [x in string]: any;
}

export interface createPropsSingle extends createPropsDefault {
  _id?: string;
  data?: never;
}

export interface createPropsMulti<Data> {
  data: Array<{
    _id?: string;
  } & Data & createPropsDefault>;
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

  private async createSingle(props: createPropsSingle & Data): Promise<Data | string> {
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

    (props as createPropsDefault).id = _id;

    const invalidColumns = Object.keys(props).filter((column) => !schemaKeys.includes(column));

    if (invalidColumns.length > 0) {
      return `Invalid column${invalidColumns.length > 1 ? 's' : ''} - ${invalidColumns.join(', ')}`;
    }

    const path = `${this.folder}/${this.database}/${this.table}/${_id}.json`;

    const fileExists = await Bun.file(path).exists();

    if (fileExists) {
      return `${_id} already exists`;
    }

    await Bun.write(path, JSON.stringify(props, null, 2));
  
    return props;
  }

  private async createMulti(props: createPropsMulti<Data>): Promise<Data[] | string> {
    const schemaPath = Bun.file(`${this.folder}/${this.database}/${this.table}/schema.json`);
  
    const schemaExists = await schemaPath.exists();

    if (!schemaExists) {
      return `${this.table} - table does not exist`;
    }
  
    const schema = await schemaPath.json();
  
    const schemaKeys = Object.keys(schema);

    async function checkColumns(): Promise<Array<string[]>> {
      return await Promise.all(props.data.map((entry: Record<string, unknown>) => {
        return new Promise<string[]>((resolve) => {
          resolve(Object.keys(entry).filter((column) => column !== '_id' && !schemaKeys.includes(column)));
        });
      }));
    }
    const dataCheck = await checkColumns();

    if (dataCheck.some((columns) => columns.length > 0)) {
      const invalidColumns = dataCheck.flat();
      return `Invalid column${invalidColumns.length > 1 ? 's' : ''} - ${invalidColumns.join(', ')}`;
    }

    const result: Data[] = [];

    for (const entry of props.data) {
      await this.createSingle(entry);

      result.push(entry);
    }

    return result;
  }

  public async create(props: createPropsSingle & Data | createPropsMulti<Data>): Promise<Data | string | Data[]> {
    if ('data' in props) {
      return this.createMulti(props as createPropsMulti<Data>);
    } else {
      return this.createSingle(props as createPropsSingle & Data);
    }
  }
}

export default create;

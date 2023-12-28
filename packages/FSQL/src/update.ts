import DB from '.';

class update<Data> {
  public table: string;
  public folder: string;
  public database: string;

  constructor(_this: DB) {
    this.table = _this.table;
    this.folder = _this.folder;
    this.database = _this.database;
  }

  public async update(id: string, data: Data) {
    const schemaPath = Bun.file(`${this.folder}/${this.database}/${this.table}/schema.json`);

    const schemaExists = await schemaPath.exists();

    if (!schemaExists) {
      return `${this.table} - table does not exist`;
    }

    const invalidColumns = Object.keys(props).filter((column) => !schemaKeys.includes(column));

    if (invalidColumns.length > 0) {
      return `Invalid column${invalidColumns.length > 1 ? 's' : ''} - ${invalidColumns.join(', ')}`;
    }

    const path = `${this.folder}/${this.database}/${this.table}/${id}.json`;

    const fileExists = await Bun.file(path).exists();

    if (!fileExists) {
      return `${_id} does not exist`;
    }

    const oldData = await Bun.file(path).json();

    const newData = {
      ...oldData,
    };

    return newData;
  }

}

export default update;

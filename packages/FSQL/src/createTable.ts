class createTable {
  public table: string;
  public folder: string;
  public database: string;
  public schema: Record<'add' | 'remove', object>;
  
  constructor(_this: any, schema: Record<'add' | 'remove', object>) {
    this.table = _this.table;
    this.folder = _this.folder;
    this.database = _this.database;
    this.schema = schema;
  }

  public async create(): Promise<number> {
    const file = Bun.file(`${this.folder}/${this.database}/${this.table}/schema.json`);

    const exists = await file.exists();

    if (exists) {
      const data = await file.json();

      // add any keys within this.schema that dont exist in data
      for (const key in this.schema.add) {
        if (!data.hasOwnProperty(key)) {
          data[key] = this.schema.add[key];
        }
      }

      // remove any keys within this.schema that exist in data
      for (const key in this.schema.remove) {
        if (data.hasOwnProperty(key)) {
          delete data[key];
        }
      }

      return await Bun.write(`./${this.folder}/${this.database}/${this.table}/schema.json`, JSON.stringify(data, null, 2));
    } else {
      return await Bun.write(`./${this.folder}/${this.database}/${this.table}/schema.json`, JSON.stringify(this.schema.add, null, 2));
    }
  }
}

export default createTable;

class createTable {
  public table: string;
  public folder: string;
  public database: string;
  public schema: object;
  
  constructor(_this: any, schema: object) {
    this.table = _this.table;
    this.folder = _this.folder;
    this.database = _this.database;
    this.schema = schema;
  }

  public async create(): Promise<number> {
    return await Bun.write(`./${this.folder}/${this.database}/${this.table}/schema.json`, JSON.stringify(this.schema, null, 2));
  }
}

export default createTable;

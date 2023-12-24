const { write, file } = Bun;

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

  public async create() {
    return await write(`./${this.folder}/${this.database}/${this.table}/schema.json`, this.schema);
  }
}

export default createTable;

class update<Data> {
  public table: string;
  public folder: string;
  public database: string;

  constructor(_this: any) {
    this.table = _this.table;
    this.folder = _this.folder;
    this.database = _this.database;
  }

}

export default update;

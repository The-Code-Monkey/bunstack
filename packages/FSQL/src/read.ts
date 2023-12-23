class read {
  public table: string;
  public folder: string;
  public database: string;
  
  constructor(_this: any) {
    this.table = _this.table;
    this.folder = _this.folder;
    this.database = _this.database;
  }

  public function orderBy(column: string, order: 'ASC' | 'DESC') {
    return this;
  }

  public function columns(...args: string[]) {
    return this;
  }

  public function limit(number: number) {
    return this;
  }

  public async function get() {
    return {};
  }
}

export default read;

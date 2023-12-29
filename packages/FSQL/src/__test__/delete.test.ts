import { describe, beforeAll, test, expect } from 'bun:test';

import DB from '../index';
import deleteFn from '../delete';
import readFn from '../read';

describe('delete', () => {
    let db: DB;
    let deleteInstance: deleteFn;
    let readInstance: readFn;

    beforeAll(async () => {
        db = await new DB().init('testDB');
        deleteInstance = db.delete('users');
        readInstance = db.read('users');
    });

    test('delete index', async () => {
      await deleteInstance.delete('2');
      const result = await readInstance.where('id', '=', '99').get();
        
      expect(result).toEqual(null);
    });

});

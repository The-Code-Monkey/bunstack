import { describe, beforeAll, test, expect } from 'bun:test';

import DB from '../index';
import deleteFn from '../delete';
import readFn from '../read';

describe('update', () => {
    let db: DB;
    let deleteInstance: deleteFn;
    let readInstance: readFn;

    beforeAll(async () => {
        db = await new DB().init('testDB');
        deleteInstance = db.delete('users');
        readInstance = db.read('users');
    });

    test('update index', async () => {
      await deleteInstance.delete('99');
      const result = await readInstance.where('id', '=', '99').get();
        
      expect(result).toEqual(null);
    });

});

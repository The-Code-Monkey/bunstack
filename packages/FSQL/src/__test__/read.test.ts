import { describe, beforeAll, test, expect, beforeEach } from 'bun:test';

import DB from '../index';
import read from '../read';

describe('read', () => {
    let db: any;
    let readInstance: read<any>;

    beforeAll(async () => {
        db = await new DB().init('testDB');
        readInstance = db.read('users');
    });

    beforeEach(() => {
        readInstance.limit(10);
    })

    test('should return an array of data', async () => {
        const result = await readInstance.get();
        expect(Array.isArray(result)).toBe(true);
    });

    test('should return the correct number of rows when limit is applied', async () => {
        readInstance.limit(1);
        const result = await readInstance.get();
        expect(result.length).toBe(1);
    });

    test('should return the data in the correct order when orderBy is applied', async () => {
        const withoutSort = await readInstance.get();
        readInstance.orderBy('id', 'ASC');
        const result = await readInstance.get();
        expect(result).not.toEqual(withoutSort);
    });

    test('should return the data that satisfies the where condition', async () => {
        readInstance.where('age', '>', 18);
        const result = await readInstance.get();
        expect(result.every((row) => row.age > 18)).toBe(true);
    });

    test('should return data by id', async () => {
        readInstance.where('id', '=', '99');
        const result = await readInstance.get();

        expect(result[0]).toEqual({
      name: "John Doe 2",
      age: 32,
      id: "99",
        });
    })
});

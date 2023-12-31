import { describe, beforeAll, test, expect } from 'bun:test';

import DB from '../index';
import create, { createPropsSingle, createPropsMulti } from '../create';

describe('create', () => {
    let db: DB;
    let createInstance: create<object>;

    beforeAll(async () => {
        db = await new DB().init('testDB');
        createInstance = db.create<object>('users');
    });

    test('should create a single entry without specifying an id', async () => {
        const props: createPropsSingle = {
          name: 'John Doe',
          age: 30,
        };
      
        const result = await createInstance.create(props);
        expect(result).toHaveProperty('id');
        expect(result.name).toBe('John Doe');
        expect(result.age).toBe(30);
      });
      
      test('should create multiple entries without specifying ids', async () => {
        const props: createPropsMulti<object> = [
          { name: 'John Doe', age: 30 },
          { name: 'Jane Doe', age: 25 },
        ];
      
        const result = await createInstance.create(props);
        expect(result).toBeInstanceOf(Array);
        result.forEach((entry, index) => {
          expect(entry).toHaveProperty('id');
          expect(entry.name).toBe(props[index].name);
          expect(entry.age).toBe(props[index].age);
        });
      });
    

    test('should create a single entry', async () => {
        const props: createPropsSingle = {
            _id: '2',
            name: 'John Doe',
            age: 30,
        };

        const result = await createInstance.create(props);

        expect(result).toEqual(props);
    });

    test('should create multiple entries', async () => {
        const props: createPropsMulti<object> = [
                {
                    _id: '99',
                    name: 'John Doe 2',
                    age: 32,
                    roleId: '12',
                },
                {
                    _id: '24',
                    name: 'Jane Smith',
                    age: 25,
                },
            ];

        const result = await createInstance.create(props);

        expect(result).toEqual(props);
    });

    test('should return error if file exists', async () => {
        // Try to create another file with the same ID
        const result = await createInstance.create({
            _id: '2',
            name: 'John Doe',
            age: 30,
        });
    
        // Check if the function returns the correct error message
        expect(result).toEqual('2 already exists');
    });

    test('should create a role', async () => {
        await db.create('roles').create({
            _id: '12',
            name: 'test'
        });
    });

    test('should add entry to users-roles', async () => {
        await db.create('users-roles').create({
            _id: '24',
            usersId: '24',
            rolesId: '12'
        });
    });
});

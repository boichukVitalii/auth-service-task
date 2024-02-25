import { DeepPartial, ObjectLiteral, Repository } from 'typeorm';

export type MockRepository<T extends ObjectLiteral = any> = Partial<
	Record<keyof Repository<T>, jest.Mock>
>;

export const createMockRepository = <T extends ObjectLiteral = any>(): MockRepository<T> => ({
	findOneBy: jest.fn(),
	find: jest.fn(),
	create: jest.fn().mockImplementation((dto: DeepPartial<T>) => dto),
	save: jest.fn(),
	remove: jest.fn(),
});

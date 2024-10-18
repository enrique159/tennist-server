import { MongoMemoryServer } from 'mongodb-memory-server';
import { connect, connection, disconnect } from 'mongoose';

let mongod: MongoMemoryServer;

export const setupTestDB = () => {
  beforeAll(async () => {
    mongod = await MongoMemoryServer.create();
    const uri = mongod.getUri();
    await connect(uri);
  });

  afterAll(async () => {
    await disconnect();
    await mongod.stop();
  });

  afterEach(async () => {
    const collections = connection.collections;
    for (const key in collections) {
      const collection = collections[key];
      await collection.deleteMany({});
    }
  });
};

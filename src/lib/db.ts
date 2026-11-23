import { MongoClient, type Db } from "mongodb";

const uri = process.env.MONGO_URI || "mongodb://localhost:27017/salon_db";

// Reuse a single client across Next.js dev hot reloads.
const globalForMongo = globalThis as unknown as {
	_mongoClient?: MongoClient;
};

export const mongoClient: MongoClient =
	globalForMongo._mongoClient ?? new MongoClient(uri);

if (process.env.NODE_ENV !== "production") {
	globalForMongo._mongoClient = mongoClient;
}

export const db: Db = mongoClient.db();

import mongoose from "mongoose";

/**
 * Cached Mongoose connection.
 *
 * Next.js hot-reloads modules in development and reuses serverless containers
 * in production, so we cache the connection on `globalThis` to avoid opening a
 * new pool on every request / reload.
 */

type MongooseCache = {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
};

declare global {
  // eslint-disable-next-line no-var
  var _mongooseCache: MongooseCache | undefined;
}

const cache: MongooseCache =
  global._mongooseCache ?? (global._mongooseCache = { conn: null, promise: null });

export async function connectDB(): Promise<typeof mongoose> {
  if (cache.conn) return cache.conn;

  if (!cache.promise) {
    const uri = process.env.MONGODB_URI || process.env.MONGO_URI;
    if (!uri) {
      throw new Error("MONGODB_URI is not set");
    }
    mongoose.set("strictQuery", true);
    cache.promise = mongoose.connect(uri, { bufferCommands: false }).then((m) => {
      // eslint-disable-next-line no-console
      console.log("[db] Connected to MongoDB");
      return m;
    });
  }

  try {
    cache.conn = await cache.promise;
  } catch (err) {
    cache.promise = null;
    throw err;
  }
  return cache.conn;
}

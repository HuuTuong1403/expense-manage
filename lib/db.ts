import "server-only";
import mongoose from "mongoose";

type MongooseCache = {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
};

declare global {
  var __mongooseCache: MongooseCache | undefined;
}

/**
 * Cache trên `globalThis` để mỗi lần HMR trong dev không mở thêm một connection
 * pool mới tới Atlas.
 */
const cache: MongooseCache =
  globalThis.__mongooseCache ?? { conn: null, promise: null };
globalThis.__mongooseCache = cache;

export async function connectDb() {
  if (cache.conn) return cache.conn;

  const uri = process.env.MONGODB_URI;
  if (!uri) {
    throw new Error(
      "Thiếu biến môi trường MONGODB_URI. Thêm vào .env trước khi chạy app.",
    );
  }

  if (!cache.promise) {
    cache.promise = mongoose.connect(uri, {
      bufferCommands: false,
    });
  }

  try {
    cache.conn = await cache.promise;
  } catch (error) {
    // Xoá promise lỗi để lần gọi sau thử kết nối lại thay vì lặp lại lỗi cũ.
    cache.promise = null;
    throw error;
  }

  return cache.conn;
}

/**
 * Chuyển document Mongoose thành object thuần để truyền từ Server Component
 * sang Client Component (ObjectId và Date không serialize được nguyên trạng).
 */
export function serialize<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

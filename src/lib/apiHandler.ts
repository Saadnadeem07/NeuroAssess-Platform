import { NextResponse, type NextRequest } from "next/server";
import { ZodError } from "zod";
import mongoose from "mongoose";
import { AppError } from "./AppError";
import { ERROR_CODES } from "./errorCodes";
import { isProd } from "./env";
import { connectDB } from "./db";

// Next.js 15 validates that a Route Handler's second argument is assignable
// from `{ params: Promise<any> }`. Using `Promise<any>` keeps a single shared
// signature valid for both static and dynamic routes.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type RouteContext = { params: Promise<any> };
type Handler = (req: NextRequest, ctx: RouteContext) => Promise<NextResponse> | NextResponse;

const requestId = (req: NextRequest): string => {
  const incoming = req.headers.get("x-request-id");
  if (incoming && /^[\w-]{8,128}$/.test(incoming)) return incoming;
  return crypto.randomUUID();
};

/** Success envelope helper. */
export function ok<T>(data: T, message?: string, status = 200): NextResponse {
  return NextResponse.json(
    { success: true, ...(message ? { message } : {}), data },
    { status }
  );
}

/** Bare success (no data) — used by logout / resend etc. */
export function done(message?: string, status = 200): NextResponse {
  return NextResponse.json(
    { success: true, ...(message ? { message } : {}), data: null },
    { status }
  );
}

/**
 * Wraps a Route Handler with DB connection, request-id, and centralised
 * error translation — the Next.js equivalent of asyncHandler + errorHandler.
 */
export function withRoute(handler: Handler): Handler {
  return async (req, ctx) => {
    const rid = requestId(req);
    try {
      await connectDB();
      const res = await handler(req, ctx);
      res.headers.set("x-request-id", rid);
      return res;
    } catch (err) {
      return serializeError(err, rid, req);
    }
  };
}

function serializeError(err: unknown, rid: string, req: NextRequest): NextResponse {
  let statusCode = 500;
  let code: string = ERROR_CODES.INTERNAL_SERVER_ERROR;
  let message = "Internal server error";
  let details: unknown;

  if (err instanceof AppError) {
    statusCode = err.statusCode;
    code = err.code;
    message = err.message;
    details = err.details;
  } else if (err instanceof ZodError) {
    statusCode = 422;
    code = ERROR_CODES.VALIDATION_FAILED;
    message = "Validation failed";
    details = err.issues.map((i) => ({ field: i.path.join(".") || "body", message: i.message }));
  } else if (err instanceof mongoose.Error.ValidationError) {
    statusCode = 422;
    code = ERROR_CODES.VALIDATION_FAILED;
    message = "Validation failed";
    details = Object.values(err.errors).map((e) => ({ field: e.path, message: e.message }));
  } else if (isDuplicateKey(err)) {
    statusCode = 409;
    code = ERROR_CODES.RESOURCE_CONFLICT;
    message = "Duplicate value for a unique field";
    details = (err as { keyValue?: unknown }).keyValue;
  } else if (err instanceof Error) {
    message = err.message;
  }

  const logPayload = {
    requestId: rid,
    method: req.method,
    url: req.nextUrl?.pathname,
    statusCode,
    code,
    message: err instanceof Error ? err.message : String(err),
  };
  if (statusCode >= 500) {
    // eslint-disable-next-line no-console
    console.error("[error]", logPayload, err instanceof Error ? `\n${err.stack}` : "");
    if (isProd()) {
      message = "Internal server error";
      details = undefined;
    }
  } else {
    // eslint-disable-next-line no-console
    console.warn("[warn]", logPayload);
  }

  return NextResponse.json(
    {
      success: false,
      error: message,
      code,
      statusCode,
      requestId: rid,
      ...(details ? { details } : {}),
    },
    { status: statusCode, headers: { "x-request-id": rid } }
  );
}

function isDuplicateKey(err: unknown): boolean {
  return Boolean(err && typeof err === "object" && (err as { code?: number }).code === 11000);
}

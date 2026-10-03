// Small custom error type so controllers can throw with an explicit HTTP status,
// e.g. `throw new ApiError(404, "Product not found.")`.
class ApiError extends Error {
  constructor(statusCode, message) {
    super(message);
    this.statusCode = statusCode;
  }
}

// Catches any request that didn't match a route.
function notFound(req, res, next) {
  next(new ApiError(404, `Route ${req.method} ${req.originalUrl} not found.`));
}

// Translates a Mongoose/MongoDB error into an { statusCode, message } pair.
// Returns null if `err` isn't one of the Mongo-related error shapes, so the
// caller can fall back to its normal handling.
function fromMongoError(err) {
  // Schema validation failed (required/min/custom validators, etc.).
  if (err.name === "ValidationError") {
    const message = Object.values(err.errors)
      .map((e) => e.message)
      .join(" ");
    return { statusCode: 400, message: message || "Validation failed." };
  }

  // A field expected to be an ObjectId (e.g. an :id param) wasn't one.
  if (err.name === "CastError") {
    return { statusCode: 400, message: `Invalid ${err.path}: "${err.value}".` };
  }

  // Duplicate key on a unique index (e.g. sku, category name, supplier name/email).
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue || {})[0] || "field";
    const value = err.keyValue?.[field];
    return { statusCode: 409, message: `"${value}" already exists for ${field}.` };
  }

  return null;
}

// Centralized error handler — must be registered last, after all routes.
function errorHandler(err, req, res, next) { // eslint-disable-line no-unused-vars
  const mongoError = fromMongoError(err);

  if (mongoError) {
    return res.status(mongoError.statusCode).json({ success: false, error: mongoError.message });
  }

  const statusCode = err.statusCode || 500;
  const message = err.statusCode ? err.message : "Internal server error.";

  if (!err.statusCode) {
    console.error(err);
  }

  res.status(statusCode).json({ success: false, error: message });
}

module.exports = { ApiError, notFound, errorHandler };

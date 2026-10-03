// Express 4 doesn't forward a rejected Promise to next() automatically.
// Wrapping every async controller in this means a thrown/rejected error
// (ApiError, a Mongoose ValidationError, anything) reaches errorHandler
// instead of crashing the process or hanging the request.
function asyncHandler(fn) {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

module.exports = asyncHandler;

const errorHandler = (error, _request, response, _next) => {
  const httpStatus = error.status || error.httpStatus || 500;
  const msg =
    httpStatus === 500
      ? "Internal Server Error"
      : error.messages || error.message || "에러 발생";

  response.fail(msg, { httpStatus });
};

export default errorHandler;

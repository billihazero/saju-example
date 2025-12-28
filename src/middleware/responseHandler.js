export const responseHandler = (_req, res, next) => {
  // ✅ 성공 응답
  res.ok = (
    data = null,
    { messages = "", total = null, httpStatus = 200 } = {}
  ) => {
    return res.status(httpStatus).json({
      status: httpStatus,
      messages,
      data,
      total,
    });
  };

  // ✅ 실패 응답
  res.fail = (
    messages = "",
    { data = null, total = null, httpStatus = 400 } = {}
  ) => {
    return res.status(httpStatus).json({
      status: httpStatus,
      messages,
      data,
      total,
    });
  };

  next();
};

export const getTestData = async (_req, res, next) => {
  try {
    const data = [];
    res.ok([], {
      messages: "테스트 데이터 조회 성공",
    });
  } catch (error) {
    next(error);
  }
};

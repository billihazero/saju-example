import { convertBirthTimeToSaju } from "../commons/birth-to-saju";

export const getTestData = async (_req, res, next) => {
  try {
    const result = await convertBirthTimeToSaju(
      "SOLAR",
      "1987-02-13",
      "23:40",
      "FEMALE"
    );
    res.ok(result, {
      messages: "테스트 데이터 조회 성공",
    });
  } catch (error) {
    next(error);
  }
};

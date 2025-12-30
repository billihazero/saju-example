import * as manseService from "@services/manse.service.js";

export const caculate = async (req, res, next) => {
  try {
    const result = await manseService.caculate(req.body);
    res.ok(result, {
      messages: "만세력 계산 성공",
    });
  } catch (error) {
    next(error);
  }
};

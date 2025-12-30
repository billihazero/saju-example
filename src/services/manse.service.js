import { convertToManse } from "@commons/format.js";

export const caculate = async (data) => {
  const { gender, birthdayType, birthday, time, createdAt } = data;

  const manse = await convertToManse();
};

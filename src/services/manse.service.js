import { convertToManse } from "@commons/format.js";

export const caculate = async (data) => {
  const { birthdayType, birthday, time, gender } = data;

  const manse = await convertToManse();
};

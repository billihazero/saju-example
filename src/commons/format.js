import { listBigFortune } from "@commons/fortune.js";

export const convertToManse = async () => {
  //대운
  const fortunes = await listBigFortune();
  //gender, yearSky, monthSky, monthGround, bigFortuneNumber 필요
  //birth-to-saju에서 사주로 변환후 가져와야함
};

import prisma from "@config/prismaClient";

//생년월일을 삼주 => 사주로 변환
export const convertBirthTimeToSaju = async () => {};

/**
 * 생년월일을 삼주로 변환
 */

//return samju;
export const convertBirthToSamju = async (birthdayType, birthday, time) => {
  // 23:30 ~ 23:59 자시에 태어난 경우 다음날로 처리
  // 1987.02.13 00:30분  (계사일주 - 임자시)
  // 1987.02.13 23:40분  (갑오일주 - 갑자시)
  const birthtime = time === null ? "12:00" : time;
  if (time >= "23:30" && time <= "23:59") {
    birthday = moment(birthday).add(1, "days").format("YYYY-MM-DD");
  }
  //음력 / 양력 생일 선택
  const condition =
    birthdayType === "SOLAR"
      ? {
          solarDate: birthday, //양력
        }
      : {
          lunarDate: birthday, //음력
        };

  //manse 테이블에서 생일자 컬럼 고르기
  const samju = await prisma.manses.findFirst({
    where: condition,
  });
};

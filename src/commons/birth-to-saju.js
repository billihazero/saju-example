import prisma from "@config/prismaClient";
import dayjs from "dayjs";
import duration from "dayjs/plugin/duration";
import utc from "dayjs/plugin/utc";
import customParseFormat from "dayjs/plugin/customParseFormat";
dayjs.extend(utc);
dayjs.extend(customParseFormat);
dayjs.extend(duration);

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
    birthday = dayjs(birthday).add(1, "day").format("YYYY-MM-DD");
  }

  const birthDate = dayjs.utc(birthday, "YYYY-MM-DD", true).toDate();
  //음력 / 양력 생일 선택
  const condition =
    birthdayType === "SOLAR"
      ? {
          solarDate: birthDate, //양력
        }
      : {
          lunarDate: birthDate, //음력
        };

  //manse 테이블에서 생일자 컬럼 고르기
  const samju = await prisma.manses.findFirst({
    where: condition,
  });

  //절입일인 경우
  if (samju.season) {
    const seasonTime = dayjs(samju.seasonStartTime, "YYYY-MM-DD HH:mm:ss");
    const solarDatetime = dayjs(birthday + " " + birthtime);
    const diff = dayjs.duration(solarDatetime.diff(seasonTime)).asHours();

    if (diff < 0) {
      const manse = await prisma.manses.findFirst({
        where: {
          solarDate: dayjs(birthday, "YYYY-MM-DD")
            .subtract(1, "day")
            .startOf("day")
            .toDate(),
        },
      });
      samju.yearSky = manse.yearSky;
      samju.yearGround = manse.yearGround;
      samju.monthSky = manse.monthSky;
      samju.monthGround = manse.monthGround;
      samju.daySky = manse.daySky;
      samju.dayGround = manse.dayGround;
    }
  }
  return samju;
};

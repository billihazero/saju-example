import prisma from "@config/prismaClient";
import dayjs from "dayjs";
import duration from "dayjs/plugin/duration";
import utc from "dayjs/plugin/utc";
import customParseFormat from "dayjs/plugin/customParseFormat";
import { getMinusPlus, getTimeJuData, getTimeJuData2 } from "./saju-data";
dayjs.extend(utc);
dayjs.extend(customParseFormat);
dayjs.extend(duration);

//생년월일을 삼주 => 사주로 변환
export const convertBirthTimeToSaju = async (
  birthdayType,
  birthday,
  time,
  gender
) => {
  const samju = await convertBirthToSamju(birthdayType, birthday, time, gender);
  //생년월일시 생성
  const dateStr = dayjs(samju.solarDate).format("YYYY-MM-DD");
  const solarDatetime = time ? `${dateStr} ${time}:00` : `${dateStr} 12:00:00`;
  console.log("solarDatetime", solarDatetime);
  //순행,역행 판단 gender = "MALE" "FEMALE"
  const direction = await isRightDirection(gender, samju.yearSky);
  console.log("direct", direction);

  //절입시간 가져오기
  const seasonTime = await getSeasonStartTime(direction, solarDatetime);
  console.log("seasonTime", seasonTime);

  //대운수 및 대운 시작년 가져오기
  const bigFortune = await getBigFortuneNumber(
    direction,
    seasonTime,
    solarDatetime
  );
  console.log("bigfortune", bigFortune);

  //사주 가져오기
  const timeJu = await getTimePillar(samju.daySky, time);
  console.log("timeJu", timeJu);

  return {
    bigFortuneNumber: bigFortune.bigFortuneNumber,
    bigFortuneStartYear: bigFortune.bigFortuneStart,
    seasonStartTime: samju.seasonStartTime,
    yearSky: samju.yearSky,
    yearGround: samju.yearGround,
    monthSky: samju.monthSky,
    monthGround: samju.monthGround,
    daySky: samju.daySky,
    dayGround: samju.dayGround,
    timeSky: timeJu.timeSky,
    timeGround: timeJu.timeGround,
  };
};

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

export const isRightDirection = async (gender, yearSky) => {
  console.log("진입");
  const minusPlus = await getMinusPlus()[yearSky];

  //남양여음 순행, 남음여양 역행
  if (
    (gender === "MALE" && minusPlus === "양") ||
    (gender === "FEMALE" && minusPlus === "음")
  ) {
    return true;
  } else if (
    (gender === "FEMALE" && minusPlus === "양") ||
    (gender === "MALE" && minusPlus === "음")
  ) {
    return false;
  }
};

//절입시간 가져오기
export const getSeasonStartTime = async (direction, solarDatetime) => {
  const baseDatetime = dayjs(solarDatetime).toDate();

  const manse = await prisma.manses.findFirst({
    where: {
      seasonStartTime: direction
        ? { gte: baseDatetime } // 이후 절입일
        : { lte: baseDatetime }, // 이전 절입일
    },
    orderBy: {
      solarDate: direction ? "asc" : "desc",
    },
  });

  if (!manse || !manse.seasonStartTime) {
    return null;
  }

  return dayjs(manse.seasonStartTime).format("YYYY-MM-DD");
};

//대운수 및 대운 시작 구하기
export const getBigFortuneNumber = async (
  direction,
  seasonStartTime,
  solarDatetime
) => {
  const sst = dayjs(seasonStartTime);
  const sdt = dayjs(solarDatetime);

  const diffTime = direction
    ? sst.diff(sdt, "day", true) // 순행
    : sdt.diff(sst, "day", true); // 역행

  const divider = Math.floor(diffTime / 3);
  const demainder = Math.floor(diffTime) % 3;

  let bigFortuneNumber = divider;
  if (diffTime < 4) {
    bigFortuneNumber = 1;
  }

  if (demainder === 2) {
    bigFortuneNumber += 1;
  }

  // dayjs는 immutable → add 결과를 받아야 함
  const bigFortuneStart = sdt.add(bigFortuneNumber, "year").format("YYYY");

  return {
    bigFortuneNumber, // 대운수
    bigFortuneStart, // 대운 시작년
  };
};

//사주 계산하기
export const getTimePillar = async (daySky, time) => {
  //시간이 없는 경우 null
  let timeSky = null;
  let timeGround = null;

  if (time) {
    let index = null;
    const timeJuData = getTimeJuData();
    const timeJuData2 = getTimeJuData2();

    for (const key in timeJuData) {
      const strKey = String(key);

      if (time >= timeJuData[strKey]["0"] && time <= timeJuData[strKey]["1"]) {
        index = strKey;
        break;
      } else if (
        (time >= "23:30" && time <= "23:59") ||
        (time >= "00:00" && time <= "01:29")
      ) {
        // 0 => ['23:30:00', '01:30:00'],  //자시
        index = strKey;
        break;
      }
    }
    //일간
    timeSky = timeJuData2[daySky][index][0];
    timeGround = timeJuData2[daySky][index][1];
  }
  return {
    timeSky,
    timeGround,
  };
};

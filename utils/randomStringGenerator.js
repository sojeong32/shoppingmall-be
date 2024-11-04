const randomStringGenerator = () => {
  const randomString = Array.from({ length: 10 }, () =>
    Math.floor(Math.random() * 36).toString(36)
  ).join(""); // 배열을 문자열로 변환

  console.log("Generated Random String:", randomString); // 디버깅 로그 추가
  return randomString;
};

module.exports = { randomStringGenerator };

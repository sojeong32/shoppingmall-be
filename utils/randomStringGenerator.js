const randomStringGenerator = () => {
  const characters = "abcdefghijklmnopqrstuvwxyz0123456789";
  const randomString = Array.from(
    { length: 10 },
    () => characters[Math.floor(Math.random() * characters.length)]
  ).join(""); // 배열을 문자열로 변환

  return randomString;
}; // orderNum 만들 때 씀

module.exports = { randomStringGenerator };

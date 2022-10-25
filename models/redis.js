const redis = require("redis");

const redisConfig = {
  host: "127.0.0.1",
  port: 6379,
  db: 0,
  //  password: ""
  legacyMode: true,
};

const redisClient = redis.createClient(redisConfig);

redisClient.on("connect", () => {
  console.info("Redis Connected!");
});
redisClient.on("error", (err) => {
  console.error("Redis Connection Lost!", err);
});
redisClient.connect();
const redisCli = redisClient.v4;

module.exports = redisCli;

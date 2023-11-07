const Koa = require("koa");
const Router = require("koa-router");
const logger = require("koa-logger");
const bodyParser = require("koa-bodyparser");
const fs = require("fs");
const path = require("path");
const { init: initDB, Counter } = require("./db");
const axios = require('axios')

const router = new Router();

const homePage = fs.readFileSync(path.join(__dirname, "index.html"), "utf-8");

// 首页
router.get("/", async (ctx) => {
  ctx.body = homePage;
});

// 更新计数
router.post("/api/count", async (ctx) => {
  const { request } = ctx;
  console.log(ctx)
  ctx.body = {
    code: 0,
    data: "消息为：" + ctx,
  };
});

// 测试接收
const client = axios.default
router.post("/api/msgt", async (ctx) => {
  // console.log(ctx)
  // console.log(ctx.headers)
  const headers = ctx.headers
  console.log("________________________________________________")
  let a = await client.get("https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid=wx3fbbaa0b94922ed1&secret=45bd3b7671f2ce27d383f2b41cd7eae9")
  let access_token = a.data.access_token
  console.log(headers['x-wx-openid'])
  console.log(access_token)
  // console.log(a)
  // let access_token = a
  // console.log(access_token)
  const weixinAPI = "http://api.weixin.qq.com/cgi-bin/message/custom/send?access_token="+access_token
  const payload = {
    touser: headers['x-wx-openid'],
    msgtype: 'text',
    text: {
      content: `云托管接收消息推送成功，内容如下：\n${JSON.stringify(ctx.data, null, 2)}`
    }
  }
  // dispatch to wx server
  console.log(weixinAPI)
  console.log(payload)
  const result = await client.post(weixinAPI, payload)
  // console.log(result)
  console.log("________________________________________________")
  ctx.body = {
    code: 0,
    data: "收到消息",
  };
});

// 获取计数
router.get("/api/count", async (ctx) => {
  const result = await Counter.count();

  ctx.body = {
    code: 0,
    data: result,
  };
});

// 小程序调用，获取微信 Open ID
router.get("/api/wx_openid", async (ctx) => {
  if (ctx.request.headers["x-wx-source"]) {
    ctx.body = ctx.request.headers["x-wx-openid"];
  }
});

const app = new Koa();
app
  .use(logger())
  .use(bodyParser())
  .use(router.routes())
  .use(router.allowedMethods());

const port = process.env.PORT || 80;
async function bootstrap() {
  await initDB();
  app.listen(port, () => {
    console.log("启动成功", port);
  });
}
bootstrap();

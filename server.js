const Koa = require("koa");
const Router = require("koa-router");
const fs = require("fs");
const KoaStatic = require("koa-static");
const server = new Koa();
const path = require("path");
// 静态资源
server.use(KoaStatic(path.join(__dirname)));
server.use(async ctx => {
  const url = ctx.request.url;

  if (url === "/") {
    console.log(url);
    ctx.response.type = "html";
    const html = await fs.readFileSync("./threejsdocument/1.start.html");
    ctx.response.body = html;
  }
});
server.listen(3000, () => {
  console.log("server on : http://localhost:3000");
});

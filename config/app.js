module.exports = {
    serverApp: `${__dirname}/../src/apps/app`,
    serverPort: process.env.SERVER_PORT || 8888,
    router: `${__dirname}/../src/routers/web`,
    viewPath:`${__dirname}/../src/apps/views`,
    staticFolder: `${__dirname}/../src/public`,
    viewEngine: `ejs`, 
    tmp: `${__dirname}/../src/tmp`,
}
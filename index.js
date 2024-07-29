const app = require("express")()
const consign = require('consign')

require('dotenv').config();

const { PORT } = process.env;

consign()
    .then('./config/middlewares.js')
    .then('./config/logger.js')
    .then('./api')
    .then('./config/routes.js')
    .then('./utils')
    .into(app)

app.listen(PORT, () => {
    console.log(`Node server listening at http://localhost:${PORT}/`)
})
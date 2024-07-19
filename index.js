const app = require("express")()
const consign = require('consign')

require('dotenv').config();

const { PORT } = process.env;

consign()
    .then('./config/middlewares.js')
    .then('./api')
    .then('./config/routes.js')
    .into(app)

app.listen(PORT, () => {
    console.log(`Node server listening at http://localhost:${PORT}/`)
})
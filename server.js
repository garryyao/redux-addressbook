var webpack = require('webpack')
var webpackDevMiddleware = require('webpack-dev-middleware')
var webpackHotMiddleware = require('webpack-hot-middleware')
var config = require('./webpack.config')
var bodyParser = require('body-parser')

var app = new (require('express'))()
var port = 8080

var compiler = webpack(config)
app.use(webpackDevMiddleware(compiler, { noInfo: true, publicPath: config.output.publicPath }))
app.use(webpackHotMiddleware(compiler))
app.use(bodyParser.json())

let address_list = require('./address-mock');
const route_addr = '/lead/address';
app.get(route_addr, function(req, res) {
  res.json(address_list);
});

app.put(route_addr, function(req, res) {
  address_list = req.body;
  res.sendStatus(200);
});

app.get("/", function(req, res) {
  res.sendFile(__dirname + '/index.html')
});

app.listen(port, function(error) {
  if (error) {
    console.error(error)
  } else {
    console.info("==> 🌎  Listening on port %s. Open up http://localhost:%s/ in your browser.", port, port)
  }
})

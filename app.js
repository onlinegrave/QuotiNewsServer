const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const dotenv = require("dotenv");
const helmet = require("helmet");
const { createProxyMiddleware } = require('http-proxy-middleware');
dotenv.config();

const app = express();

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(helmet())
function logProvider(provider) {
  // replace the default console log provider.
  return require('winston');
}

function onProxyReq(proxyReq, req, res) {
  proxyReq.setHeader('X-Api-Key', process.env.NEWS_API_KEY);
}

function onError(err, req, res, target) {
  res.writeHead(500, {
    'Content-Type': 'text/plain',
  });
  res.end('Something went wrong. And we are reporting a custom error message.');
}

const proxyOptions = { target: process.env.NEW_API_AUTHORITY, changeOrigin: true, onProxyReq: onProxyReq, logProvider: logProvider, onError: onError }

app.use('/', createProxyMiddleware({ target: process.env.NEW_API_AUTHORITY, changeOrigin: true, onProxyReq: onProxyReq, logProvider: logProvider, onError: onError }));
// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;

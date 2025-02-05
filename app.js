const express = require('express');
const path = require('path');
const EventEmitter = require('events');

const port = process.env.PORT || 3000;
const app = express();
const chatEmitter = new EventEmitter();

app.use(express.static(__dirname + '/public'));

/**
 * Serves up the chat.html file
 * @param {express.Request} req
 * @param {express.Response} res
 */
function chatApp(req, res) {
  res.sendFile(path.join(__dirname, '/chat.html'));
}

/**
 * Responds with plain text
 * @param {express.Request} req
 * @param {express.Response} res
 */
function respondText(req, res) {
  res.setHeader('Content-Type', 'text/plain');
  res.end('hi');
}

/**
 * Responds with JSON
 * @param {express.Request} req
 * @param {express.Response} res
 */
function respondJson(req, res) {
  res.json({
    text: 'hi',
    numbers: [1, 2, 3],
  });
}

/**
 * Responds with the input string in various formats
 * @param {express.Request} req
 * @param {express.Response} res
 */
function respondEcho(req, res) {
  const { input = '' } = req.query;

  res.json({
    normal: input,
    shouty: input.toUpperCase(),
    charCount: input.length,
    backwards: input.split('').reverse().join(''),
  });
}

/**
 * Handles chat messages
 * @param {express.Request} req
 * @param {express.Response} res
 */
function respondChat(req, res) {
  const { message } = req.query;
  chatEmitter.emit('message', message);
  res.end();
}

/**
 * Responds with server-sent events (SSE) for chat messages
 * @param {express.Request} req
 * @param {express.Response} res
 */
function respondSSE(req, res) {
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Connection': 'keep-alive',
  });

  const onMessage = message => res.write('data: ${message}\n\n');
  chatEmitter.on('message', onMessage);

  res.on('close', () => {
    chatEmitter.off('message', onMessage);
  });
}

app.get('/', chatApp);
app.get('/json', respondJson);
app.get('/echo', respondEcho);
app.get('/chat', respondChat);
app.get('/sse', respondSSE);
app.use((req, res) => res.status(404).send('Not Found'));

app.listen(port, () => {
  console.log(`Listening on port  ${port}`);
});
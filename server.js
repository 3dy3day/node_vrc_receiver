// server.js
const express = require('express');
const http = require('http');
const WebSocket = require('ws');

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

// 全体で共有する回答データ
let combinedAnswers = {};

// 別のHTTP GETリクエストを待ち受ける
app.get('/body/:questions/:answer', (req, res) => {
  const questions = req.params.questions;
  const answer = req.params.answer;
  const parsedAnswer = parseAnswer(questions, answer);

  if (!parsedAnswer) {
    res.status(400).send({ error: 'Invalid questions parameter' });
    return;
  }

  const ipAddress = req.connection.remoteAddress;

  // 回答を統合
  combinedAnswers = { ...combinedAnswers, ...parsedAnswer };

  // WebSocketで接続しているすべてのクライアントに送信
  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify(combinedAnswers));
    }
  });

  // HTTPレスポンス
  res.json(combinedAnswers);
  console.log(combinedAnswers);
  console.log(ipAddress);
});

// 解答解析関数
function parseAnswer(questions, answer) {
  let parsedAnswer = {};
  if (questions === 'q1-3') {
    parsedAnswer.q1 = Math.floor(answer / 100);
    parsedAnswer.q2 = Math.floor((answer % 100) / 10);
    parsedAnswer.q3 = answer % 10;
  } else if (questions === 'q4-6') {
    parsedAnswer.q4 = Math.floor(answer / 100);
    parsedAnswer.q5 = Math.floor((answer % 100) / 10);
    parsedAnswer.q6 = answer % 10;
  } else {
    return null;
  }
  return parsedAnswer;
}

server.listen(3000, () => {
  console.log('Server started on http://localhost:3000');
});

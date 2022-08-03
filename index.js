const express = require('express');
const bodyParser = require('body-parser');
// const req = require('express/lib/request');
// const res = require('express/lib/response');
const fs = require('fs').promises;
const generateToken = require('./services');
const {
  validateEmail,
  validatePassword,
  validateToken,
  validateName,
  validateAge,
  validateTalk,
  validateWatchedAt,
  validateRate,
} = require('./middlewares');

const app = express();
app.use(bodyParser.json());

const HTTP_OK_STATUS = 200;
const PORT = '3000';

// não remova esse endpoint, e para o avaliador funcionar
app.get('/', (_request, response) => {
  response.status(HTTP_OK_STATUS).send();
});

app.listen(PORT, () => {
  console.log('Online');
});

// 1
app.get('/talker', async (_req, res) => {
  const data = await fs.readFile('talker.json', 'utf-8');
  res.status(HTTP_OK_STATUS).json(JSON.parse(data));
});

// 2
app.get('/talker/:id', async (req, res) => {
  const { id } = req.params;

  const data = await fs.readFile('talker.json', 'utf-8');
  const talker = JSON.parse(data).find((el) => el.id === Number(id));

  if (!talker) return res.status(404).json({ message: 'Pessoa palestrante não encontrada' });
  
  res.status(HTTP_OK_STATUS).json(talker);
});

// 3 and 4
app.post('/login', validateEmail, validatePassword, (_req, res) => {
  const token = generateToken();
  res.status(200).json({ token });
});

// 5
app.post('/talker',
validateToken,
validateName,
validateAge,
validateTalk,
validateWatchedAt,
validateRate,
async (req, res) => {
  const data = JSON.parse(await fs.readFile('talker.json', 'utf-8'));
  const id = data.length + 1;
  const { name, age, talk } = req.body;
  const { watchedAt, rate } = talk;
  
  const newTalker = { id, name, age, talk: { watchedAt, rate } };
  data.push(newTalker);
  await fs.writeFile('talker.json', JSON.stringify(data));
  
  res.status(201).json(newTalker);
});

// 7
app.delete('/talker/:id', validateToken, async (req, res) => {
  const { id } = req.params;
  const data = JSON.parse(await fs.readFile('talker.json', 'utf-8'));
  const talkerIndex = data.findIndex((el) => el.id === Number(id));

  if (!talkerIndex) return res.status(404).json({ message: 'Palestrante não encontrado' });

  data.splice(talkerIndex, 1);

  const newData = data.filter((el) => el.id !== Number(id));
  await fs.writeFile('talker.json', JSON.stringify(newData));

  res.status(204).end();
});
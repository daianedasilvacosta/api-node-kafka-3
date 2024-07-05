const express = require('express');
const { User } = require('./models');

const router = express.Router();

router.get('/users', async (req, res) => {
  const users = await User.findAll();
  res.json(users);
});

router.post('/users', async (req, res) => {
  const user = await User.create(req.body);

  await req.producer.send({
    topic: 'topic1',
    messages: [{ value: JSON.stringify(user) }],
  });

  res.json(user);
});

module.exports = router;

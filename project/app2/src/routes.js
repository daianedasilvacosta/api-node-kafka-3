const express = require('express');
const { User } = require('./models');

const router = express.Router();

router.get('/users', async (req, res) => {
  const users = await User.find();
  res.json(users);
});

router.post('/users', async (req, res) => {
  const user = new User(req.body);
  await user.save();

  await req.producer.send({
    topic: 'topic2',
    messages: [{ value: JSON.stringify(user) }],
  });

  res.json(user);
});

module.exports = router;

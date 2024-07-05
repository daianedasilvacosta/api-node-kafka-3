// const express = require('express');
// const { Kafka } = require('kafkajs');
// const routes = require('./routes');
// const mongoose = require('mongoose');

// const app = express();
// app.use(express.json());

// const kafka = new Kafka({
//   clientId: 'app2',
//   brokers: ['kafka:9092'],
// });

// const producer = kafka.producer();
// const consumer = kafka.consumer({ groupId: 'app2-group' });

// mongoose.connect(process.env.MONGO_URL, { useNewUrlParser: true, useUnifiedTopology: true });

// app.use((req, res, next) => {
//   req.producer = producer;
//   return next();
// });

// app.use(routes);

// async function run() {
//   await producer.connect();
//   await consumer.connect();

//   await consumer.subscribe({ topic: 'topic1' });

//   await consumer.run({
//     eachMessage: async ({ topic, partition, message }) => {
//       console.log(`Received message ${message.value.toString()}`);
//     },
//   });

//   app.listen(8081, () => {
//     console.log('Server is running on port 8081');
//   });
// }

// run().catch(console.error);

// app2/server.js
// const express = require('express');
// const { Kafka } = require('kafkajs');
// const mongoose = require('mongoose');
// const app = express();

// app.use(express.json());

// mongoose.connect(process.env.MONGO_URL, { useNewUrlParser: true, useUnifiedTopology: true });

// const userSchema = new mongoose.Schema({
//   name: String,
//   email: String,
//   password: String,
// });

// const User = mongoose.model('User', userSchema);

// const kafka = new Kafka({
//   clientId: 'app2',
//   brokers: [process.env.KAFKA_BOOTSTRAP_SERVERS],
// });

// const producer = kafka.producer();
// producer.connect();

// app.post('/users', async (req, res) => {
//   const { name, email, password } = req.body;
//   const user = new User({ name, email, password });
//   await user.save();

//   await producer.send({
//     topic: process.env.KAFKA_TOPIC,
//     messages: [{ value: JSON.stringify(user) }],
//   });

//   res.status(201).json(user);
// });

// app.listen(process.env.PORT, () => {
//   console.log(`App2 running on port ${process.env.PORT}`);
// });

// app2/server.js
const express = require('express');
const { Kafka } = require('kafkajs');
const mongoose = require('mongoose');
const app = express();

app.use(express.json());

mongoose.connect(process.env.MONGO_URL, { useNewUrlParser: true, useUnifiedTopology: true });

const userSchema = new mongoose.Schema({
  name: String,
  email: String,
  password: String,
});

const User = mongoose.model('User', userSchema);

const kafka = new Kafka({
  clientId: 'app2',
  brokers: [process.env.KAFKA_BOOTSTRAP_SERVERS],
});

const producer = kafka.producer();
producer.connect();

app.post('/users', async (req, res) => {
  const { name, email, password } = req.body;
  const user = new User({ name, email, password });
  await user.save();

  await producer.send({
    topic: process.env.KAFKA_TOPIC,
    messages: [{ value: JSON.stringify(user) }],
  });

  res.status(201).json(user);
});

app.listen(process.env.PORT, () => {
  console.log(`App2 running on port ${process.env.PORT}`);
});

app.post('/', async (req, res) => {
  try {
    producer.send([{topic: process.env.KAFKA_TOPIC, messages: JSON.stringify(req.body)}], async (err, data) => {
      if (err) {
        console.log(err);
        return res.status(500).send('Erro ao enviar mensagem para o Kafka');
      }
      await User.create(req.body);
      res.send(req.body);
    });
  } catch (error) {
    console.error('Erro ao criar usuário:', error);
    res.status(500).send('Erro ao criar usuário');
  }
});

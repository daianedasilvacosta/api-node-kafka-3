// const express = require('express');
// const { Kafka } = require('kafkajs');
// const routes = require('./routes');

// const app = express();
// app.use(express.json());

// const kafka = new Kafka({
//   clientId: 'app1',
//   brokers: ['kafka:9092'],
// });

// const producer = kafka.producer();
// const consumer = kafka.consumer({ groupId: 'app1-group' });

// app.use((req, res, next) => {
//   req.producer = producer;
//   return next();
// });

// app.use(routes);

// async function run() {
//   await producer.connect();
//   await consumer.connect();

//   await consumer.subscribe({ topic: 'topic2' });

//   await consumer.run({
//     eachMessage: async ({ topic, partition, message }) => {
//       console.log(`Received message ${message.value.toString()}`);
//     },
//   });

//   app.listen(8080, () => {
//     console.log('Server is running on port 8080');
//   });
// }

// run().catch(console.error);

// app1/server.js
// const express = require('express');
// const { Kafka } = require('kafkajs');
// const { Sequelize } = require('sequelize');
// const app = express();

// app.use(express.json());

// const db = new Sequelize(process.env.POSTGRES_URL);

// const User = db.define('user', {
//   name: Sequelize.STRING,
//   email: Sequelize.STRING,
//   password: Sequelize.STRING,
// });

// db.sync();

// const kafka = new Kafka({
//   clientId: 'app1',
//   brokers: [process.env.KAFKA_BOOTSTRAP_SERVERS],
// });

// const producer = kafka.producer();
// producer.connect();

// app.post('/users', async (req, res) => {
//   const { name, email, password } = req.body;
//   const user = await User.create({ name, email, password });
  
//   await producer.send({
//     topic: process.env.KAFKA_TOPIC,
//     messages: [{ value: JSON.stringify(user) }],
//   });

//   res.status(201).json(user);
// });

// app.listen(process.env.PORT, () => {
//   console.log(`App1 running on port ${process.env.PORT}`);
// });

// app1/server.js
const express = require('express');
const { Kafka } = require('kafkajs');
const { Sequelize } = require('sequelize');
const app = express();

app.use(express.json());

const db = new Sequelize(process.env.POSTGRES_URL);

const User = db.define('user', {
  name: Sequelize.STRING,
  email: Sequelize.STRING,
  password: Sequelize.STRING,
});

db.sync();

const kafka = new Kafka({
  clientId: 'app1',
  brokers: [process.env.KAFKA_BOOTSTRAP_SERVERS],
});

const producer = kafka.producer();
producer.connect();

app.post('/users', async (req, res) => {
  const { name, email, password } = req.body;
  const user = await User.create({ name, email, password });
  
  await producer.send({
    topic: process.env.KAFKA_TOPIC,
    messages: [{ value: JSON.stringify(user) }],
  });

  res.status(201).json(user);
});

app.listen(process.env.PORT, () => {
  console.log(`App1 running on port ${process.env.PORT}`);
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

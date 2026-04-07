const express = require('express');
const os = require('os');
const { MongoClient } = require('mongodb');

const app = express();
const PORT = 3000;

const url = 'mongodb://db:27017';
const client = new MongoClient(url);

let db;

async function connectDB() {
  await client.connect();
  db = client.db('tasksdb');

  const count = await db.collection('tasks').countDocuments();

  if (count === 0) {
    await db.collection('tasks').insertMany([
      { id: 1, name: 'Milk', status: 'done' },
      { id: 2, name: 'Eggs', status: 'done' },
      { id: 3, name: 'Bread', status: 'pending' },
      { id: 4, name: 'Butter', status: 'pending' },
      { id: 5, name: 'Orange juice', status: 'pending' }
    ]);
  }
}

// Route 1
app.get('/', (req, res) => {
  res.json({
    app: 'CISC 886 Lab 8',
    mode: process.env.MODE || 'local',
    node: process.version,
    host: os.hostname(),
  });
});

// Route 2
app.get('/tasks', async (req, res) => {
  const tasks = await db.collection('tasks').find().toArray();

  const grouped = tasks.reduce((acc, task) => {
    acc[task.status] = acc[task.status] || [];
    acc[task.status].push(task);
    return acc;
  }, {});

  res.json(grouped);
});

connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
});
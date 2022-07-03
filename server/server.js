const express = require('express')
const app = express();
const MongoClient = require("mongodb").MongoClient;
const WebSocket = require('ws');

///URI expuesto con pass, vulnerabilidad aca. 
const uri = "mongodb+srv://MauLom:Hyklv5gh@cluster0.wurfvtc.mongodb.net/?retryWrites=true&w=majority"
const client = new MongoClient(uri);

async function getUserData(userId) {
  try {
    await client.connect();
    const database = client.db('test-data');
    const usersCollection = database.collection('users');
    const query = { name: 'someUserName' };
    const userData = await usersCollection.findOne(query);
    return userData
  } finally {
    await client.close();
  }
}
async function updateUserData(newProps) {
  try {
    await client.connect();
    const database = client.db('test-data');
    const usersCollection = database.collection('users');
    const query = { name: 'someUserName' };
    const updateData = { $set: newProps }
    const options = {}
    await usersCollection.updateOne(query, updateData, options)
  } finally {
    await client.close();
  }
}
async function getPrizesChart() {
  try {
    await client.connect();
    const database = client.db('test-data');
    const usersCollection = database.collection('settings');
    const query = { name: 'prize-charts' };
    const prizesData = await usersCollection.findOne(query);
    return prizesData
  } finally {
    await client.close();
  }
}

const wss = new WebSocket.Server({ port: 8000 });

wss.on('connection', async function connection(ws) {
  var dataResponse = {}
  ws.on('message', async function incoming(data) {
    const request = JSON.parse(data.toString('utf8'))
    switch (request.operation) {
      case "getUserData":
        const dataUser = await getUserData(request.userId)
        dataResponse["dataUser"] = dataUser
        dataResponse["operation"] = "getUserData"
        break;
      case "getPrizeForConection":
        updateUserData({ lastRuntoWheel: request.lastRunToWheel, balance: request.newBalance })
        dataResponse["operation"] = "getPrizeForConection"
        break;
      case "loadPrizes":
        const prizesData = await getPrizesChart()
        dataResponse["operation"] = "loadPrizes"
        dataResponse["dataPrizes"] = prizesData
        break;
      case "rollPrizes":
        await updateUserData({balance: request.bal})
        const dataUserAfterRoll = await getUserData(request.userId)
        dataResponse["dataUser"] = dataUserAfterRoll
        dataResponse["operation"] = "rollPrizes"
        break;
      default:
        dataResponse["operation"] = "Error";
        dataResponse["message"] = "The operations was not recognized";
        break;
    }

    wss.clients.forEach(function each(client) {
      client.send(JSON.stringify(dataResponse));
    });
  });
});

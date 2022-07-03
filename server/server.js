const express = require('express')
const app = express();
const MongoClient = require("mongodb").MongoClient;
const WebSocket = require('ws');
///URI expuesto con pass, vulnerabilidad aca. 
const uri ="mongodb+srv://MauLom:Hyklv5gh@cluster0.wurfvtc.mongodb.net/?retryWrites=true&w=majority"
const client = new MongoClient(uri);
async function run() {
  try {
    await client.connect();
    const database = client.db('test-data');
    const usersCollection = database.collection('users');
    const query = { name: 'someUserName' };
    const userData = await usersCollection.findOne(query);
    console.log(userData.lastRuntoWheel);
  } finally {
    await client.close();
  }
}
// run().catch(console.dir);

///Recibir cuando fue la ultima vez que el usuario detono la tombola
/// Si ya paso mas de un minuto, re habilitarla (websocket)
/// Se le otrogara un credito adicional por cada minuto en que gire la tombola
/// podra girar otra ruleta a cambio de creditos, seran dos tipos de ruletas, una de costo de un credito, y otra de coste 2 cada ruleta tendra porcentajes de recompensa editables en la base de datos.

/// El usuario debe conservar sus creditos

const wss = new WebSocket.Server({ port: 8000 });
wss.on('connection', function connection(ws) {
  ws.on('message', function incoming(data) {
    console.log("incoming data:", data.toString('utf8'))
    wss.clients.forEach(function each(client) {
      if (client !== ws && client.readyState === WebSocket.OPEN) {
        client.send(data.toString('utf8'));
        // console.log('data', data);
      }
    });
  });
});

// app.get('/', (req, res) => {
//   res.send('Hello World!')
// })
// app.listen(8000, () => {
//   console.log('Example app listening on port 8000!')
// });
const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const webpush = require('web-push');

const vapidKeys = {
  publicKey: "BOnPSF2Y5ZLwlbfRk9C4gTjqAD3VdN3PKK9miJd_39shrK3ibptSYEzENVx2XMnz5wpZOGAof28AxX4BTkScLsI",
  privateKey: "4Jg1B8EpkPWkBoN4BatSzE8ptR7bgbM_iyolhuSaMTY"
}

const app = express();
app.use(cors());
app.use(bodyParser.json());

const port = 4000;

app.get("/", (req, res) => res.send("Hello World!"));

const dummyDb = { subscriptions: [] }; //dummy in memory store

const saveToDatabase = async subscription => {
  // Since this is a demo app, I am going to save this in a dummy in memory store. Do not do this in your apps.
  // Here you should be writing your db logic to save it.
  dummyDb.subscriptions.push(subscription);
  console.log("saving subscription", subscription)
};

// The new /save-subscription endpoint
app.post("/save-subscription", async (req, res) => {
  const subscription = req.body;
  await saveToDatabase(subscription); //Method to save the subscription to Database
  res.json({ message: "success" });
});

//setting our previously generated VAPID keys
webpush.setVapidDetails(
  'mailto:wenjun@openfin.co',
  vapidKeys.publicKey,
  vapidKeys.privateKey
)

//function to send the notification to the subscribed device
const sendNotification = (subscription, dataToSend='') => {
  webpush.sendNotification(subscription, dataToSend)
}

//route to test send notification
app.get('/send-notification', (req, res) => {
  console.log('sending notification')
  dummyDb.subscriptions.forEach(sub => {
    const message = 'Hello World'
    sendNotification(sub, message)
    console.log("sent to ", sub)
  });
  res.json({ message: 'message sent' })
})

app.listen(port, () => console.log(`Example app listening on port ${port}!`));

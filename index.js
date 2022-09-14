const express = require('express');
const cors = require('cors');
require('dotenv').config();
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const app = express();
const stripe = require('stripe')(process.env.PAYMENT_SECRET);
const port = process.env.PORT || 5000;

//
app.use(cors())
app.use(express.json())

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.ssaxmkp.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

async function run() {
    try {
        await client.connect();
        console.log('done');
        const productCollection = client.db('houseList').collection('sell')
        const orderCollection = client.db('houseList').collection('order')
        const reviewCollection = client.db('houseList').collection('review')
        const sellerCollection = client.db('houseList').collection('seller')
        const buyerCollection = client.db('houseList').collection('buyer')

        //
        app.post('/sell', async (req, res) => {
            const product = req.body;
            const result = await productCollection.insertOne(product);
            res.send(result);
        })
        app.get('/sell', async (req, res) => {
            const query = {};
            const cursor = productCollection.find(query);
            const result = await cursor.toArray();
            res.send(result);
        })
        app.get('/sell/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const product = await productCollection.findOne(query);
            res.send(product);
        });
        //delete service
        app.delete('/sell/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const order = await productCollection.deleteOne(query);
            res.send(order);
        })
        //get service by query in email
        app.get('/manage',async(req,res)=>{
            const email=req.query.email;
            const query={email:email};
            const result=await productCollection.find(query).toArray();
            res.send(result);
        })
        //query by email
        app.get('/order', async (req, res) => {
            const email=req.query.email;
            // const email = 'imamhossen204@gmail.com';
            const query = { email: email };
            const result = await orderCollection.find(query).toArray();
            res.send(result);
        })
        //post order
        app.post('/order', async (req, res) => {
            const order = req.body;
            const result = await orderCollection.insertOne(order);
            res.send(result);
        })
        //get all order
        // app.get('/order', async (req, res) => {
        //     const query = {};
        //     const cursor = await orderCollection.find(query).toArray();
        //     res.send(cursor);
        // })
        app.get('/order/:id',async(req,res)=>{
            const id=req.params.id;
            const query={_id:ObjectId(id)};
            const order=await orderCollection.findOne(query);
            res.send(order);
        })
        //delete order
        app.delete('/order/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) }
            const order = await orderCollection.deleteOne(query);
            res.send(order);
        })
        //review post
        app.post('/review', async (req, res) => {
            const review = req.body;
            const result = await reviewCollection.insertOne(review);
            res.send(result);
        })
        app.get('/review', async (req, res) => {
            const query = {};
            const cursor = await reviewCollection.find(query).toArray();
            res.send(cursor);
        })
        //seller admit post
        app.post('/seller', async (req, res) => {
            const seller = req.body;
            const result = await sellerCollection.insertOne(seller);
            res.send(result);
        })
        app.get('/seller', async (req, res) => {
            const query = {};
            const seller = await sellerCollection.find(query).toArray();
            res.send(seller);
        })
        //single seller
        app.get('/seller/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const seller = await sellerCollection.findOne(query);
            res.send(seller);
        })
        //buyer admission
        app.post('/buyer', async (req, res) => {
            const buyer = req.body;
            const result = await buyerCollection.insertOne(buyer);
            res.send(result);
        })
        app.get('/buyer', async (req, res) => {
            const query = {};
            const buyer = await buyerCollection.find(query).toArray();
            res.send(buyer);
        })
        //payment
        app.post('/create-payment-intent', async (req, res) => {
            const service = req.body;
            const price = service.price;
            const amount = price * 100;
            const paymentIntent = await stripe.paymentIntents.create({
                amount: amount,
                currency: "usd",
                payment_method_card: ['card'],
            })
            res.send({ clientSecret: paymentIntent.client_secret })

        })

    }
    finally {

    }

}
run().catch(console.dir);

app.get('/', (req, res) => {
    res.send('Hello world')
})
app.listen(port, () => {
    console.log('listening form ', port);
})
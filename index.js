const express = require('express');
const cors = require('cors');
require("dotenv").config()
const port = process.env.PORT || 5000;
const jwt = require('jsonwebtoken')
const { MongoClient, ObjectId } = require('mongodb');
const app = express()


app.use(cors())
app.use(express.json())


// uri of mongodb
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.ag5u5eg.mongodb.net/?retryWrites=true&w=majority`;

const client = new MongoClient(uri)

// main apis function

const run = async () => {

    const Bikes = client.db('USB').collection('bikes')
    const users = client.db('USB').collection('users')

    try {

        // basic root api
        app.get('/', (req, res) => {
            res.send('Server is up and Running')
        })


        // getting bikes by category
        app.get('/bikes', async (req, res) => {
            const query = req.query;

            // filtering the data
            const filter = query
            // getting the values
            const bikes = await Bikes.find(filter).toArray()
            res.send({ bikes })
        })

        // getting bike by id
        app.get('/bikes/:id', async (req, res) => {
            const id = req.params.id;

            // filtering the data
            const query = { _id: ObjectId(id) }
            // getting the values
            const bike = await Bikes.findOne(query)
            res.send({ bike })
        })


        // creating user collection in database
        app.post('/adduser', async (req, res) => {

            try {
                const user = req.body;
                console.log(user)
                const result = await users.insertOne(user)
                res.send({
                    message: "Success",
                    result
                })
            } catch (error) {
                res.status(401).send({
                    message: error.message
                })
            }


        })


        // getting a user by emai
        app.get('/user', async (req, res) => {
            try {
                const email = req.query.email;
                const filter = { email: email }
                const result = await users.findOne(filter)
                res.send({
                    message: "Success",
                    result
                })
            } catch (error) {
                res.status(401).send({
                    message: error.message
                })
            }
        })








    } catch (error) {

    }

}

run()






app.listen(port, () => {
    console.log(`Server is running on port ${port}`)
})
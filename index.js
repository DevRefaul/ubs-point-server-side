const express = require('express');
const cors = require('cors');
require("dotenv").config()
const port = process.env.PORT || 5000;
const jwt = require('jsonwebtoken')
const { MongoClient, ObjectId } = require('mongodb');
const app = express()
const stripe = require("stripe")(process.env.STRIPE_KEY);

app.use(cors())
app.use(express.json())


// uri of mongodb
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.ag5u5eg.mongodb.net/?retryWrites=true&w=majority`;

const client = new MongoClient(uri)

// main apis function

const run = async () => {

    const Bikes = client.db('USB').collection('bikes')
    const Users = client.db('USB').collection('users')
    const ReportedPosts = client.db('USB').collection('reportedposts')
    const VerificationApplication = client.db("USB").collection('verification-applications')
    const BookedBikes = client.db("USB").collection("bookedBikes")


    try {

        // basic root api
        app.get('/', (req, res) => {
            res.send('Server is up and Running')
        })


        // payment api for user
        app.post("/create-payment-intent", async (req, res) => {
            try {
                const price = req.body.price;
                const amount = parseFloat(price * 100)

                // Create a PaymentIntent with the order amount and currency
                const paymentIntent = await stripe.paymentIntents.create({
                    amount: amount,
                    currency: "usd",
                    automatic_payment_methods: {
                        enabled: true,
                    },
                });

                res.send({
                    clientSecret: paymentIntent.client_secret,
                });
            } catch (error) {
                res.send({
                    message: error.message
                })
            }
        });



        // creating user collection in database
        app.post('/adduser', async (req, res) => {

            try {
                const user = req.body;
                const result = await Users.insertOne(user)
                res.send({
                    message: "Success",
                    result
                })
            } catch (error) {
                res.send({
                    message: error.message
                })
            }


        })

        // get all the buyers
        app.get('/buyers', async (req, res) => {
            try {
                const filter = { role: "buyer" }
                const buyers = await Users.find(filter).toArray()
                res.send({
                    message: "Success",
                    buyers
                }
                )
            } catch (error) {
                res.send({
                    message: error.message
                })
            }
        })

        // get all the sellers
        app.get('/sellers', async (req, res) => {
            try {
                const filter = { role: "seller" }
                const sellers = await Users.find(filter).toArray()
                res.send({
                    message: "Success",
                    sellers
                }
                )
            } catch (error) {
                res.send({
                    message: error.message
                })
            }
        })


        // getting a user by emai
        app.get('/user', async (req, res) => {
            try {
                const email = req.query.email;
                const filter = { email: email }

                const result = await Users.findOne(filter)
                res.send({
                    message: "Success",
                    result
                })
            } catch (error) {
                res.send({
                    message: error.message
                })
            }
        })

        // update user name
        app.patch('/updatename', async (req, res) => {
            try {
                const userInfo = req.body;

                const email = userInfo.email
                const userName = userInfo.name
                // updating the name field
                const updatedDoc = { $set: { name: userName } }

                const filter = { email: email }
                const updateName = await Users.updateOne(filter, updatedDoc)
                res.send({
                    message: "Success",
                    updateName
                })
            } catch (error) {
                res.send({
                    message: error.message
                })
            }
        })



        // delete a user
        app.delete('/deleteuser/:id', async (req, res) => {
            try {
                const id = req.params.id;
                const filter = { _id: ObjectId(id) };
                const deleteUser = await Users.deleteOne(filter)
                res.send({
                    message: "Success",
                    deleteUser
                })
            } catch (error) {
                res.send({
                    message: error.message
                })
            }
        })



        // getting bikes by category
        app.get('/bikes', async (req, res) => {
            try {
                const query = req.query;

                // filtering the data
                const filter = query
                // getting the values
                const bikes = await Bikes.find(filter).toArray()
                res.send({ message: "Success", bikes })
            } catch (error) {
                res.send({
                    message: error.message
                })
            }
        })

        // getting bike by id
        app.get('/bikes/:id', async (req, res) => {
            try {
                const id = req.params.id;

                // filtering the data
                const query = { _id: ObjectId(id) }
                // getting the values
                const bike = await Bikes.findOne(query)
                res.send({ message: "Success", bike })
            } catch (error) {
                res.send({
                    message: error.message
                })
            }
        })

        // modifying bikes info
        app.patch('/bikes/:id', async (req, res) => {
            try {
                const id = req.params.id;
                const updatedInfo = req.body;
                console.log(updatedInfo);
                const filter = { _id: ObjectId(id) }
                console.log(filter)
                const updatedDoc = { $set: updatedInfo }
                console.log(updatedDoc);
                const updatedResponse = await Bikes.updateOne(filter, updatedDoc)
                res.send({
                    message: "success",
                    updatedResponse
                })
            } catch (error) {
                res.send({
                    message: error.message
                })
            }
        })


        // get all the reported post
        app.get('/reported', async (req, res) => {
            try {
                const query = {};
                const reportedItems = await ReportedPosts.find(query).toArray()
                res.send({ message: "Success", reportedItems })
            } catch (error) {
                res.send({
                    message: error.message
                })
            }
        })


        // report post
        app.post('/report', async (req, res) => {
            try {
                const reportedInfo = req.body
                const reportedPostInfo = { reportedInfo: reportedInfo }

                const reported = await ReportedPosts.insertOne(reportedPostInfo)
                res.send({ message: "Success", reported })
            } catch (error) {
                res.send({
                    message: error.message
                })
            }
        })

        // delete reported post
        app.delete('/deletepost', async (req, res) => {
            try {
                const id = req.query.reportedpost;
                const reportedId = req.query.reportedqueue;
                const filter = { _id: ObjectId(id) }

                // filter reported post
                const reportedPostQueue = { _id: ObjectId(reportedId) }


                const deleteReportedQueue = await ReportedPosts.deleteOne(reportedPostQueue)

                const deletePost = await Bikes.deleteOne(filter)
                res.send({ message: "Success", deletePost })
            } catch (error) {
                res.send({
                    message: error.message
                })
            }

        })


        // verification allplication by seller
        app.post('/applyverify', async (req, res) => {
            try {
                const sellerInfo = req.body;
                const result = await VerificationApplication.insertOne(sellerInfo)
                res.send({
                    message: "success",
                    result
                })
            } catch (error) {
                res.send({
                    message: error.message
                })
            }

        })

        // get all application for verifying sellers
        app.get('/verifyapplication', async (req, res) => {
            try {
                const query = {}
                const applications = await VerificationApplication.find(query).toArray()
                res.send({
                    message: "success",
                    applications
                })
            } catch (error) {
                res.send({
                    message: error.message
                })
            }
        })

        // verifying seller and updating their verified status
        app.patch('/verifyseller', async (req, res) => {
            try {
                const sellerEmail = req.body.email;

                const filter = { email: sellerEmail }
                const findSeller = await Users.findOne(filter)

                const updatedDoc = { $set: { sellerVerified: "true", verifyMessage: "Account Verified" } }
                const verifiedSuccess = await Users.updateOne(findSeller, updatedDoc)
                res.send({
                    message: "success",
                    verifiedSuccess
                })
            } catch (error) {
                res.send({
                    message: error.message
                })
            }
        })

        // cancel verifying seller and updating their verified status by admin
        app.patch('/cancelverify', async (req, res) => {
            try {
                const sellerEmail = req.body.email;

                const filter = { email: sellerEmail }
                const findSeller = await Users.findOne(filter)


                const updatedDoc = { $set: { sellerVerified: "false", verifyMessage: "Verification Denied" } }
                const verifiedSuccess = await Users.updateOne(findSeller, updatedDoc)
                res.send({
                    message: "success",
                    verifiedSuccess
                })
            } catch (error) {
                res.send({
                    message: error.message
                })
            }
        })


        // delete application after verify 
        app.delete('/deleteapplication/:id', async (req, res) => {
            try {
                const applicantId = req.params.id;

                const filter = { _id: ObjectId(applicantId) }
                const deleteApplication = await VerificationApplication.deleteOne(filter)
                res.send({
                    message: "success",
                    deleteApplication
                })
            } catch (error) {
                res.send({
                    message: error.message
                })
            }
        })


        // make sell post
        app.post('/makepost', async (req, res) => {
            try {
                const bikeInfo = req.body;
                const postResponse = await Bikes.insertOne(bikeInfo)
                res.send({
                    message: "success",
                    postResponse
                })
            } catch (error) {
                res.send({
                    message: error.message
                })
            }
        })


        // getting posted bikes by seller email
        app.get('/singlesellerposts', async (req, res) => {
            try {
                const sellerEmail = req.query.email;
                const filter = { sellerMail: sellerEmail }

                const sellerPosts = await Bikes.find(filter).toArray()
                res.send({
                    message: "success",
                    sellerPosts
                })
            } catch (error) {
                res.send({
                    message: error.message
                })
            }
        })


        // apis for seller actions in teir posted products

        // promote post api for seller
        app.patch('/promotepost', async (req, res) => {
            try {
                const id = req.body.id;

                const filter = { _id: ObjectId(id) }
                const updatedDoc = { $set: { "advertise": "true" } }

                const promotedResponse = await Bikes.updateOne(filter, updatedDoc)
                res.send({
                    message: "success",
                    promotedResponse
                })
            } catch (error) {
                res.send({
                    message: error.message
                })
            }

        })


        // deleting single post api for seller
        app.delete('/deletesellerpost/:id', async (req, res) => {
            try {
                const id = req.params.id;
                const filter = { _id: ObjectId(id) }

                const deleteResponse = await Bikes.deleteOne(filter)
                res.send({
                    message: "success",
                    deleteResponse
                })
            } catch (error) {
                res.send({
                    message: error.message
                })
            }
        })

        // update product availability
        app.patch('/updateProductAvalablity', async (req, res) => {
            try {
                const id = req.body.id;
                const availablity = req.body.available
                const filter = { _id: ObjectId(id) };

                const updatedDoc = { $set: { "available": availablity } }
                const updatedProductResponse = await Bikes.updateOne(filter, updatedDoc)
                res.send({
                    message: "success",
                    updatedProductResponse
                })
            } catch (error) {
                res.send({
                    message: error.message
                })
            }
        })

        // update product booking
        app.patch('/updateProductBooking', async (req, res) => {
            try {
                const id = req.body.id;
                const availablity = req.body.available

                const filter = { _id: ObjectId(id) };

                const updatedDoc = { $set: { "isBooked": availablity } }
                const updatedProductResponse = await Bikes.updateOne(filter, updatedDoc)
                res.send({
                    message: "success",
                    updatedProductResponse
                })
            } catch (error) {
                res.send({
                    message: error.message
                })
            }
        })

        // update product payment
        app.patch('/updateProductPayment', async (req, res) => {

            try {

                const id = req.body.productId;

                const filter = { _id: ObjectId(id) };

                const updatedDoc = { $set: { "isPaid": "paid" } }
                const updatedPaymentResponse = await BookedBikes.updateOne(filter, updatedDoc)

                res.send({
                    message: "success",
                    updatedPaymentResponse
                })
            } catch (error) {
                res.send({
                    message: error.message
                })
            }
        })


        // api for booking bike for buyer
        app.post("/booked", async (req, res) => {
            try {

                const bookedInfo = req.body;
                const bookingInfo = await BookedBikes.insertOne(bookedInfo)
                res.send({
                    message: "success",
                    bookingInfo
                })
            } catch (error) {
                res.send({
                    message: error.message
                })
            }

        })

        // get booked bikes by user
        app.get('/userbookings', async (req, res) => {
            try {
                const email = req.query.email;
                const filter = { bookerEmail: email }

                const bookedBikes = await BookedBikes.find(filter).toArray()
                res.send({
                    message: "success",
                    bookedBikes
                })
            } catch (error) {
                res.send({
                    message: error.message
                })
            }
        })

        // get booked bikes by seller
        app.get('/sellerBookedPosts', async (req, res) => {
            try {
                const email = req.query.email;
                const filter = { sellerEmail: email }
                console.log(email, filter)
                const bookedBikes = await BookedBikes.find(filter).toArray()
                res.send({
                    message: "success",
                    bookedBikes
                })
            } catch (error) {
                res.send({
                    message: error.message
                })
            }
        })

        // delete booking
        app.delete("/deletebooking/:id", async (req, res) => {
            try {
                const id = req.params.id;
                console.log(id);
                const filter = { _id: ObjectId(id) }
                console.log(filter)
                const deletedResponse = await BookedBikes.deleteOne(filter)
                res.send({
                    message: "success",
                    deletedResponse
                })
            } catch (error) {
                res.send({
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
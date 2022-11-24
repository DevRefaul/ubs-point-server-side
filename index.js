const express = require('express');
const cors = require('cors');
const port = process.env.PORT || 5000;
const app = express()



app.use(cors())
app.use(express.json())


app.get('/', (req, res) => {
    res.send('Server is up and Running')
})


app.get('/bikes', (req, res) => {
    const bikes = require('./bikesDetail.json')
    res.send({ bikes })
})








app.listen(port, () => {
    console.log(`Server is running on port ${port}`)
})
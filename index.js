const express = require('express')
const  app = express()

const db = require("./config");

app.get('/categories', (req, res) => {
    db.query('SELECT * FROM category', (error, result) => {
        if(error) throw error
        return res.send({ result })
    })
})

app.listen(3000)
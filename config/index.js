const dbConfig = require('../config/database.js')
const mysql = require("mysql2")


const connection = mysql.createConnection({
    host: dbConfig.host,
    user: dbConfig.user,
    password: dbConfig.password,
    database: dbConfig.database
})

connection.connect(error => {
    if(error) throw error;
    console.log("Successfully connected to the database.")
})

module.exports = connection
const express = require('express')
const app = express()

const db = require("./config");

app.use(express.json())

app.get('/categories', (req, res) => {
  db.query('SELECT * FROM category', (error, result) => {
    if (error) throw error
    return res.send({ result })
  })
})

app.get('/film/name', (req, res) => {
  db.query('SELECT film.title FROM film', (error, result) => {
    if (error) throw error
    return res.send({ result })
  })
})

app.get('/actors10', (req, res) => {
  db.query('SELECT actor.first_name, actor.last_name FROM actor ORDER BY actor.last_name LIMIT 10', (error, result) => {
    if (error) throw error
    return res.send({ result })
  })
})

app.get('/film/category/:name', (req, res) => {
  const name = req.params.name
  db.query('SELECT film.title FROM film JOIN film_category ON film.film_id = film_category.film_id INNER JOIN category ON film_category.category_id = category.category_id WHERE category.name = ? ', name, (error, result) => {
    if (error) throw error
    return res.send({ data: result })
  })
})

app.get('/film/actor/:id', (req, res) => {
  const id = req.params.id
  db.query('SELECT film.title FROM film INNER JOIN film_actor ON film.film_id = film_actor.film_id INNER JOIN actor ON film_actor.actor_id = actor.actor_id WHERE actor.actor_id = ? ', id, (error, result) => {
    if (error) throw error
    return res.send({ data: result })
  })
})

app.get('/film/actor/lastname/:lastname', (req, res) => {
  const lastname = req.params.lastname
  db.query('SELECT film.title FROM film INNER JOIN film_actor ON film.film_id = film_actor.film_id INNER JOIN actor ON film_actor.actor_id = actor.actor_id WHERE actor.last_name = ? ', lastname, (error, result) => {
    if (error) throw error
    return res.send({ data: result })
  })
})

app.get('/film/actor/begin/name/:begin_name', (req, res) => {
  const begin_name = req.params.begin_name
  db.query('SELECT film.title FROM film INNER JOIN film_actor ON film.film_id = film_actor.film_id INNER JOIN actor ON film_actor.actor_id = actor.actor_id WHERE actor.last_name LIKE ? ', [begin_name + '%'], (error, result) => {
    if (error) throw error
    return res.send({ data: result })
  })
})

app.get('/film/group/category', (req, res) => {
  db.query(`SELECT category.name, COUNT(film.film_id) AS COUNT_FILM 
            FROM category 
            LEFT JOIN film_category ON category.category_id = film_category.category_id 
            LEFT JOIN film ON film_category.film_id = film.film_id 
            GROUP BY category.name;`,
    (error, result) => {
      if (error) throw error
      return res.send({ data: result })
    })
})

//Изменение данных
app.put('/actors/:id', (req, res) => {
  const id = req.params.id
  db.query(`UPDATE actor SET ? 
            WHERE actor_id = ?`,
            [req.body, id], (error) => {
              if (error) throw error;
              res.status(200).send(`Actor with ${id} update successfully.`)
            })
})

//Добавление данных
app.post('/actors', (req, res) => {
  db.query(`INSERT INTO actor 
            Set ?`, req.body, (error, result) => {
    if (error) throw error;
    res.status(201).send(`Actor added with ID: ${result.insertId}`)
  })
})


//Удаление данных
app.delete('/actors/:id', (req, res) => {
  const id = req.params.id
  db.query(`DELETE FROM actor WHERE actor_id = ?`, id, (error) => {
    if(error) throw error;
    res.status(200).send(`Actor with ${id} deleted.`)
  })
})



app.listen(3000)
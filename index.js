const express = require('express')
const app = express()
const util = require('util');


const db = require("./config");

// // const func_actor = require('./func/actor.js');
// const func_actor = require('/func/actor.js');
// const func_lang = require('/func/language.js');



const queryAsync = util.promisify(db.query).bind(db);


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
    if (error) throw error;
    res.status(200).send(`Actor with ${id} deleted.`)
  })
})


// app.post('/films', async (req, res) => {
//   try {
//     const { title,
//             category_id,
//             language_id,
//             actor_name } = req.body;

//     // Проверяем, существует ли актер с указанным именем
//     let actorId;
//     const actorCheck = await queryAsync('SELECT actor_id FROM actors WHERE actor_name = ?', actor_name);
//     if (actorCheck.length === 0) {
//       // Если актер не существует, добавляем его и получаем его идентификатор
//       const actorInsert = await queryAsync('INSERT INTO actors (actor_name) VALUES (?)', actor_name);
//       actorId = actorInsert.insertId;
//     } else {
//       actorId = actorCheck[0].actor_id;
//     }

//     // Проверяем, существует ли язык с указанным идентификатором
//     const languageCheck = await queryAsync('SELECT * FROM languages WHERE id = ?', language_id);
//     if (languageCheck.length === 0) {
//       return res.status(400).json({ error: 'Language with the provided ID does not exist' });
//     }

//     // Теперь, когда актер и язык существуют, добавляем фильм
//     const insertQuery = 'INSERT INTO movies (title, director, release_year, category_id, language_id, actor_id) VALUES (?, ?, ?, ?, ?, ?)';
//     await queryAsync(insertQuery, [title, director, release_year, category_id, language_id, actorId]);

//     res.status(201).json({ message: 'Movie added successfully' });
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ error: 'Internal Server Error' });
//   }
// });

app.post('/films', async (req, res) => {
  try {
    const { title,
      actor_name,
      actor_lastname,
      language,
      rental_duration,
      rental_rate,
      replacement_cost,
      rating, } = req.body; // Получаем данные фильма из запроса




    async function addActorIfNotExists(actor_name, actor_lastname) {
      const actorExists = await queryAsync('SELECT * FROM actor WHERE first_name = ? AND last_name = ?', [actor_name, actor_lastname]);
      if (actorExists.length === 0) {
        const insertQuery = 'INSERT INTO actor (first_name, last_name) VALUES (?, ?)';
        const result = await queryAsync(insertQuery, [actor_name, actor_lastname]);
        return result.insertId;
      } else {
        return actorExists[0].id;
      }
    }

    async function addLanguageIfNotExists(languageName) {
      const languageExists = await queryAsync('SELECT * FROM language WHERE name = ?', languageName);
      if (languageExists.length === 0) {
        const insertQuery = 'INSERT INTO language (name) VALUES (?)';
        const result = await queryAsync(insertQuery, [languageName]);
        return result.insertId;
      } else {
        return languageExists[0].id;
      }
    }

    // Добавляем актера и получаем его идентификатор
    const actorId = await addActorIfNotExists(actor_name, actor_lastname);

    // Добавляем язык и получаем его идентификатор
    const languageId = await addLanguageIfNotExists(language);

    // Вставляем новый фильм с актером и языком
    const insertQuery = 'INSERT INTO film (title, rental_duration ,rental_rate, replacement_cost, rating, actor_id, language_id) VALUES (?, ?, ?, ?, ?, ?, ?)';
    const result = await queryAsync(insertQuery, [title, rental_duration, rental_rate, replacement_cost, rating, actorId, languageId]);

    res.status(201).json({ id: result.insertId, message: 'Movie added successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});


app.listen(3000)
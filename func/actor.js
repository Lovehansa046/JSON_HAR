const queryAsync = util.promisify(db.query).bind(db);


async function addActorIfNotExists(firstName, lastName) {
    const actorExists = await queryAsync('SELECT * FROM actor WHERE first_name = ? AND last_name = ?', [firstName, lastName]);
    if (actorExists.length === 0) {
      const insertQuery = 'INSERT INTO actor (first_name, last_name) VALUES (?, ?)';
      const result = await queryAsync(insertQuery, [firstName, lastName]);
      return result.insertId;
    } else {
      return actorExists[0].id;
    }
  }



export default addActorIfNotExists
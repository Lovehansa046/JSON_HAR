const queryAsync = util.promisify(db.query).bind(db);

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

export default addLanguageIfNotExists
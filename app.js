const express = require('express')
const {open} = require('sqlite')
const sqlite3 = require('sqlite3')
const path = require('path')

const app = express()
app.use(express.json())

const dbPath = path.join(__dirname, 'moviesData.db')

let db = null

const initializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    })
    app.listen(3000, () => {
      console.log('Server Running at 3000')
    })
  } catch (e) {
    console.log(`DB Error: ${e.message} `)
    process.exit(1)
  }
}
initializeDBAndServer()

const movies = moviesList => {
  return {
    movieId: moviesList.movie_id,
    directorId: moviesList.director_id,
    movieName: moviesList.movie_name,
    leadActor: moviesList.lead_actor,
  }
}

//Get Movies API
app.get('/movies/', async (request, response) => {
  const getMoviesQuery = `
    SELECT movie_name
    FROM 
    movie
    ORDER BY 
    movie_id`

  const moviesArray = await db.all(getMoviesQuery)
  response.send(moviesArray.map(eachMovie => movies(eachMovie)))
})

//Add Movie API
app.post('/movies/', async (request, response) => {
  const movieDetails = request.body
  console.log(movieDetails)
  const {directorId, movieName, leadActor} = movieDetails

  const addMovieQuery = `
  INSERT INTO 
  movie (director_id, movie_name, lead_actor) 
  VALUES (${directorId}, '${movieName}', '${leadActor}');
  `

  const dbResponse = await db.run(addMovieQuery)
  const movieId = dbResponse.lastID
  response.send('Movie Successfully Added')
})

//Get Movies based on movieId
app.get('/movies/:movieId/', async (request, response) => {
  const {movieId} = request.params
  const getMoviesBYMovieIdQuery = `
  SELECT * 
  FROM 
  movie 
  WHERE 
  movie_id = ${movieId}`

  const movie = await db.get(getMoviesBYMovieIdQuery)
  response.send(movies(movie))
})

//Update movie API
app.put('/movies/:movieId/', async (request, response) => {
  const {movieId} = request.params
  const {directorId, movieName, leadActor} = request.body

  const updateMovieQuery = `
   UPDATE 
   movie SET 
   director_id = ${directorId}, movie_name = '${movieName}', lead_actor = '${leadActor}' 
   WHERE movie_id = ${movieId}`

  await db.run(updateMovieQuery)
  response.send('Movie Details Updated')
})

//Delete Movie API
app.delete('/movies/:movieId/', async (request, response) => {
  const {movieId} = request.params
  const deleteMovieQuery = `
  DELETE 
  FROM 
  movie 
  WHERE 
  movie_id = ${movieId}`

  await db.run(deleteMovieQuery)
  response.send('Movie Removed')
})

const director = directorList => {
  return {
    directorId: directorList.director_id,
    directorName: directorList.director_name,
  }
}

//Get Directors API
app.get('/directors/', async (request, response) => {
  const getDirectorsQuery = `
    SELECT *
    FROM 
    director
    ORDER BY 
    director_id`

  const directorsArray = await db.all(getDirectorsQuery)
  response.send(directorsArray.map(eachDirector => director(eachDirector)))
})

//Get Movie By Direcor API
app.get('/directors/:directorId/movies', async (request, response) => {
  const {directorId} = request.params
  const getMoviesByDirectorQuery = `
  SELECT movie_name AS movieName
  FROM
  movie
  WHERE 
  director_id = ${directorId}`

  const directorArray = await db.all(getMoviesByDirectorQuery)
  response.send(directorArray)
})

module.exports  = app
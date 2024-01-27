import express from 'express';
import bodyParser from 'body-parser';
import { getUsers, getUsersById } from './api-data/apiQueries.js';

const app = express();

//Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.listen(3000, () => console.log('http://localhost:3000/users'))

//Rutas
app.get('/users',(req, res)=> {
    getUsers().then(users => {
        res.status(200).json({code: 200, data: users})
    }).catch(error => {        
        res.status(500).json({code: 500, error: "Error al cargar usuarios."})
    })    
})

app.get('/users/:id',(req, res)=> {
    let id = req.params.id
    getUsersById(id).then(users => {
        res.status(200).json({code: 200, data: users})
    }).catch(error => {        
        res.status(500).json({ code: 500, error: "Error al cargar usuarios.", detalles: error.message });

    })    
})



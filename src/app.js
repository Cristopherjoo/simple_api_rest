import express from 'express'
import jwt from 'jsonwebtoken'
import { getUsers, getUsersById, addUsers, 
    updateUsers, deleteUsersById, usersLogin,
    getProducts, getProductsById, addProducts
} from './api-data/apiQueries.js'
import multer from 'multer'
import { nanoid } from 'nanoid'
import * as path from 'path'
import { fileURLToPath } from 'url'
const __dirname = path.dirname(fileURLToPath(import.meta.url))
import cors from 'cors'
import { v4 as uuid } from 'uuid'

const app = express()
const secret = process.env.JWT_SECRET;

if (!secret) {
  console.error("ADVERTENCIA: La variable de entorno JWT_SECRET no está definida.");
  console.error("Configure una clave secreta segura antes de ejecutar la aplicación.");
  process.exit(1); // Salir del proceso o manejar la situación según la necesidad.
}

//Middleware
app.use(express.json());
app.use(express.urlencoded({extended:false}));
app.use(cors());

const multerMiddleware = multer({
    limits: { fileSize: 2 * 1024 * 1024 }, // 2mb
    abortOnLimit: true,
    responseOnLimit: "El archivo supera el tamaño permitido (2 mb)"
});

app.use(multerMiddleware.single('image'));


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
        res.status(500).json({ code: 500, error: "Error al cargar usuarios.", detalles: error.message })
    })    
})

//Rutas de usuario post
app.post("/users", (req, res) => {
    let { name, email, password, image } = req.body;
    addUsers(name, email, password, image)
        .then(users => {
            res.status(201).json({ code: 201, data: users });
        })
        .catch(error => {
            console.error(error);
            res.status(500).json({ code: 500, error: "Error al agregar un usuario.", detalles: error.message });
        });
});

app.post("/users/login", (req, res) => {
    try {
        let { email, password } = req.body;
        usersLogin(email, password).then(users => {
            if (users.length === 0) {
                return res.status(400).json({ code: 400, error: "Error en el login" });
            }
            let token = jwt.sign(users[0], secret);
            res.status(200).json({ code: 200, token });
        }).catch(error => {
            console.log(error);
            res.status(500).json({ code: 500, error: "No se pudo realizar el token." });
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({ code: 500, error: "Error interno del servidor." });
    }
});


//Rutas put 
app.put("/users", (req, res) => {
   let {name, email, password, image, id} = req.body;
   updateUsers(name, email, password, image, id).then(users => {
      res.status(201).json({code: 201, data: users})
  }).catch(error => {
      console.log(error)
      res.status(500).json({code: 500, error: "Error al actualizar el usuario. " + name})
  })
})

const validar = (req, res, next) =>{
    let token = req.query.token
    if(token){
        jwt.verify(token, secret, (err, decoded) => {
            if(err) return res.status(403).json({code: 401, error: "Usted no tiene los permisos necesarios para eliminar / token invalido."})
           req.usuario = decoded
            next()
          });
    }else{
        return res.status(401).json({code: 401, error: "Debe proporcionar un token, debe autenticarse"})
    }
}

//Rutas delete usuario
app.delete("/users/:id", validar, (req, res) => {
    let id = req.params.id

    deleteUsersById(id).then(users => {
        if(users.length == 0) return res.status(400).json({code: 400, error: "Ha intentado eliminar un usuario con un id desconocido"})
        res.status(200).json({code: 200, data: users})
    }).catch(error => {
        console.log(error)
        res.status(500).json({code: 500, error: "Error al eliminar el usuario con id: " + id})
    })
})

//Rutas de productos
app.get("/products", async (req, res) => {
    try {
        let products = await getProducts()
        res.status(200).json({code: 200, data:products})
    } catch (error) {
        res.status(500).json({code: 500, error: "No se pudo concretar la consulta."})
    }    
})

app.get("/products/:id", async (req, res) => {
    try {
        let id = req.params.id;
        let products = await getProductsById(id)
        res.status(200).json({code: 200, data:products})
    } catch (error) {
        res.status(500).json({code: 500, error: "No se pudo concretar la consulta."})
    }    
})

app.post("/products", async (req, res) => {
    try {
        const { name, description, price, stock } = req.body;
        const foto = req.files.image;
        const codigo = uuid().slice(0, 6);
        const extension = foto.mimetype.split("/")[1];

        if (!(extension === "jpg" || extension === "jpeg" || extension === "webp" || extension === "gif")) {
            return res.status(400).json({ code: 500, error: "Está intentando subir un archivo con formato no permitido." });
        }

        const nameImage = `${codigo}-imagen.${extension}`;
        const basePath = path.join(__dirname, "public", nameImage);

        await foto.mv(basePath);
        await addProducts(name, description, price, stock, nameImage);

        res.status(201).json({ code: 201, message: "Producto creado correctamente." });
    } catch (error) {
        console.error(error);
        res.status(500).json({ code: 500, error: "No se pudo guardar el producto.", detalles: error.message });
    }
});

app.get("/images/:image", (req, res) => {
    try {
        const nameImage = req.params.image;

        if (nameImage === "null") {
            return res.status(404).sendFile(path.join(__dirname, "public", "not_found.png"));
        }

        res.sendFile(path.join(__dirname, "public", nameImage));
    } catch (error) {
        console.error(error);
        res.status(404).sendFile(path.join(__dirname, "public", "not_found.png"));
    }
});


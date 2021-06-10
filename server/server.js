const express = require('express');
const path = require('path');
var cors = require('cors');
const Sequelize = require('sequelize');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const TOKEN_KEY = '<TOKEN_PLACEHOLDER>';


const app = express(),
  bodyParser = require("body-parser");
port = 3080;


app.use(cors())


app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, '../my-app/dist')));

var sequelize = new Sequelize('', '', '', {
  host: '',
  port: 3306,
  logging: console.log,
  maxConcurrentQueries: 100,
  dialect: 'mysql',
  dialectOptions: {
    ssl: 'Amazon RDS'
  },
  pool: { maxConnections: 5, maxIdleTime: 30 },
  language: 'en'
})


const Model = Sequelize.Model;
class User extends Model { }
User.init(
  {
    id: {
      type: Sequelize.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    username: {
      type: Sequelize.STRING,
      unique: true
    },
    password: {
      type: Sequelize.STRING
    },
    age: {
      type: Sequelize.STRING,
      allowNull: true
    },
    car: {
      type: Sequelize.STRING,
      allowNull: true
    }
  },
  {
    sequelize: sequelize,
    modelName: "users"
    // options
  }
);

function auth(req, res, next) {
  const token = req.header('authtoken');
  if (!token) return res.status(401).send('Dostęp wzbroniony');


  try {
    const verified = jwt.verify(token, TOKEN_KEY);
    req.user = verified;
    next();
  } catch (error) {
    res.status(200).send('Błąd uwierzytelniania tokenu');
  }

}

// middleware for /users
app.use('/users', auth);

app.get('/users', async (req, res) => {
  try {
    const users = await User.findAll({});
    res.send(users);
  } catch (error) {
    console.log(error);
    res.status(500).send({
      error: "Błąd podczas wyswietlania wszystkich użytkownikow",
    });
  };
});


app.post('/users', async (req, res) => {
  try {

    const findUser = await User.findOne({ where: { username: req.body.username } });


    if(!req.body){
      throw 'Nie wysłano {body}';
    }
    if (!req.body.username || !req.body.password) {
      throw 'Nie wysłano nazwy użykownika lub hasła';
    }


    if (findUser) {
      throw 'Podany użytkownik jest zajęty';
    }

    const salt = await bcrypt.genSalt(10);
    const hashPassword = await bcrypt.hash(req.body.password, salt);


    const user = User.build({
      username: req.body.username,
      password: hashPassword
    })
    await user.save();
    res.status(200).send('Dodano użytkownika');


  } catch (error) {
    res.status(500).send(error);
  };
});

app.post('/users/delete', async (req, res) => {

  try {
    const users = await User.findAll({});
    if (users.length <= 1) {
      throw 'Nie można usunąć ostatniego dostępnego użytkownika'
    }



    const findUser = await User.findOne({ where: { username: req.body.username } });
    console.log(findUser);

    if (!findUser) {
      throw 'Podany użytkownik nie istnieje';
    }
    await findUser.destroy();

    res.send('Użytkownik został usunięty')
  } catch (error) {
    console.log(error);
    res.status(400).send(error);
  }

})


app.post('/login', async (req, res) => {
  try {
    const findUser = await User.findOne({ where: { username: req.body.username } });

    if(findUser == null || findUser == undefined) {
      throw 'Nie mozna odnaleźć tego użytkownika';
    }

    if (!findUser) {
      throw 'Nie mozna odnaleźć tego użytkownika';
    }

    const validPass = await bcrypt.compare(req.body.password, findUser.password);
    if (!validPass) {
      throw 'Nieprawidłowe dane logowania, spróbuj ponownie';
    }

    if(findUser){
      const token = jwt.sign({ id: findUser.id }, TOKEN_KEY);
      res.header('authtoken', token).send(token);
    }



  } catch (error) {
    res.status(500).send(error);
  };
});


app.post('/users/update', async (req,res) => {
  try {
    const findUser = await User.findOne({ where: { username: req.body.username } });
    console.log(findUser);

    if (req.body.age === undefined || req.body.age === null || req.body.age === ""){
      throw 'Parametr age nie istnieje';
    }

    if (req.body.car === undefined || req.body.car === null || req.body.car === ""){
      throw 'Parametr car nie istnieje';
    }

    if (!findUser) {
      throw 'Podany użytkownik nie istnieje';
    }

    await User.update({ age: req.body.age, car: req.body.car }, {
      where: {
        username: req.body.username
      }
    });

    res.send('Zapisano');
  } catch (e) {
    console.log(e);
    res.status(500).send(e);
  }
})



app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../my-app/build/index.html'));
});


sequelize.sync().then(() => {
  app.listen(port);
  console.log(`Serwer działa na porcie ${port}`);
});

sequelize
  .authenticate()
  .then(() => {
    console.log("Połączenie ustanowiono poprawnie.");
  })
  .catch((err) => {
    console.error("Nie można połączyć się z bazą danych.:", err);
  });

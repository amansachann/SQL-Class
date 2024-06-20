const { faker } = require("@faker-js/faker");
const mysql = require("mysql2"); // Get the client
const path = require("path");
const methodOverride = require("method-override");

// Creating an express app
const express = require("express");
const { log } = require("console");
const app = express();
const port = 8080;

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.static(path.join(__dirname, "public")));
app.use(methodOverride("_method"));

// using express.urlencoded middleware
app.use(express.urlencoded({ extended: true }));

// Create the connection to database
const connection = mysql.createConnection({
  host: "localhost",
  user: "root",
  database: "sigma_db",
  password: "aman1234",
});

// Display Homepage - count of users
app.get("/", (req, res) => {
  let query = "SELECT COUNT(*) AS c FROM user";
  try {
    connection.query(query, (err, result) => {
      if (err) throw err;
      let count = result[0]["c"];
      res.render("home.ejs", { count });
    });
  } catch (err) {
    console.log(err);
    res.send("Some error in Database");
  }
});

// Display all users
app.get("/user", (req, res) => {
  let query = "SELECT id, username, email FROM user ORDER BY username";
  try {
    connection.query(query, (err, result) => {
      if (err) throw err;
      res.render("user", { result });
    });
  } catch (err) {
    console.log(err);
    res.send("Some error in database");
  }
  // res.render("user");
});

// Edit user
app.get("/user/:id/edit", (req, res) => {
  let { id } = req.params;
  // let query = `SELECT * FROM user WHERE id='${id}'`;
  let query = `SELECT * FROM user WHERE id=?`;
  try {
    connection.query(query, [id], (err, result) => {
      if (err) throw err;
      let userDetails = result[0];
      res.render("editUser", { userDetails });
    });
  } catch (err) {
    console.log(err);
    res.send("Some error in database");
  }
});

// Handle User Update
app.patch("/user/:id", (req, res) => {
  let { id } = req.params;
  let body = Object.values(req.body);
  let query = `UPDATE user SET id = ?,username = ?,email = ?,password = ? WHERE id=?`;
  let data = [...body, id];

  let query2 = `SELECT * FROM user WHERE id=?`;
  try {
    connection.query(query2, [id], (err, result) => {
      if (err) throw err;
      let dbPassword = result[0].password;
      if (dbPassword != req.body.userpassword) {
        res.send("Wrong Password");
      } else {
        try {
          connection.query(query, data, (err, result) => {
            if (err) throw err;
            console.log("Value Upadted in DB");
            console.log(result);
            res.redirect("/user");
          });
        } catch (err) {
          console.log(err);
          res.send("Some error with database");
        }
      }
    });
  } catch (err) {
    console.log(err);
    res.send("Some error in database");
  }
});

// Handle Delete user
app.get("/user/:id", (req, res) => {
  let { id } = req.params;
  // let query = `SELECT * FROM user WHERE id='${id}'`;
  let query = `SELECT * FROM user WHERE id=?`;
  try {
    connection.query(query, [id], (err, result) => {
      if (err) throw err;
      let userDetails = result[0];
      res.render("deleteUser", { userDetails });
    });
  } catch (err) {
    console.log(err);
    res.send("Some error in database");
  }
});

app.delete("/user/:id", (req, res) => {
  let { id } = req.params;
  let userPassword = req.body.userpassword;
  let query1 = `SELECT * FROM user WHERE id=?`;
  try {
    connection.query(query1, [id], (err, result) => {
      let dbPassword = result[0].password;
      if (userPassword != dbPassword) {
        res.send("Wrong Password");
      } else {
        if (err) throw err;
        query2 = `DELETE FROM user WHERE id='${id}'`;
        try {
          connection.query(query2, (err2, result2) => {
            if (err2) throw err2;
            console.log(result2);
            res.redirect("/user");
          });
        } catch (err2) {
          console.log(err2);
          res.send("Some error in database");
        }
      }
    });
  } catch (err) {
    console.log(err);
    res.send("Some error in database");
  }
});

app.listen(port, () => {
  console.log(`App listening on port ${port}`);
});

// let query = "INSERT INTO user (id, username, email, password) VALUES ?";
// let users = [
//     ["123b", "akash453", "akashgupta@gmail.com", "dobaramatpoochna"],
//     ["123c", "aditi1302", "aditikashyap@gmail.com", "nhidungi"],
// ];

// let getRandomUser = () => {
//   return [
//     faker.string.uuid(),
//     faker.internet.userName(),
//     faker.internet.email(),
//     faker.internet.password(),
//   ];
// };

// let data = [];
// for (let i = 0; i < 100; i++) {
//   console.log(getRandomUser());
//   data.push(getRandomUser());
// }

// try {
//   // Execute the query
//   connection.query(query, [data], (err, result) => {
//     if (err) throw err;
//     console.log(result);
//   });
// } catch (err) {
//   console.log(err);
// }

// connection.end(); // close the db connection

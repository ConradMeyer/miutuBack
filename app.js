// -------------------------------------------------------------------------------
// Node modules
// -------------------------------------------------------------------------------
require("dotenv").config();
const express = require("express");
const app = express();
const cors = require("cors");

const {
  signUp,
  signIn,
  signOut,
  editUser,
  newCar,
  editCar,
  newInvoice,
  validateEmail,
  validatePass,
  validateName,
  validateSurname,
  validateCard,
  newCard,
  deleteCar,
  deleteCard,
  readUser,
  signUpGoogle,
} = require("./src/controllers/controller");

app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(cors());

// -------------------------------------------------------------------------------
// API
// -------------------------------------------------------------------------------

app.post("/signup", async (req, res) => {
  if (validateEmail(req.body.email) && validatePass(req.body.pass)) {
    if (validateName(req.body.name) && validateSurname(req.body.surname)) {
      const result = await signUp(req.body);
      res.send(result);
    } else {
      res.status(406).json({
        status: 406,
        data: "El Nombre/Apellido del usuario no es válido",
        ok: false,
      });
    }
  } else {
    res.status(406).json({
      status: 406,
      data: "Email/contraseña no válida",
      ok: false,
    });
  }
});

app.post("/signin", async (req, res) => {
  const result = await signIn(req.body);
  res.send(result);
});

app.put("/signout", async (req, res) => {
  const result = await signOut(req.headers.authorization);
  res.send(result);
});

app.put("/create/card", async (req, res) => {
  if (validateCard(req.body.numero)) {
    const result = await newCard(req.body, req.headers.authorization);
    res.send(result);
  } else {
    res.status(406).json({
      status: 406,
      data: "El número de la tarjeta no es válido",
      ok: false,
    });
  }
});

app.put("/edit/user", async (req, res) => {
  const result = await editUser(req.body, req.headers.authorization);
  res.send(result);
});

app.put("/create/car", async (req, res) => {
  const result = await newCar(req.body, req.headers.authorization);
  res.send(result);
});

app.put("/edit/car", async (req, res) => {
  const result = await editCar(req.body, req.headers.authorization);
  res.send(result);
});

app.put("/invoice", async (req, res) => {
  const result = await newInvoice(req.body, req.headers.authorization);
  res.send(result);
});

app.delete("/delete/car", async (req, res) => {
  const result = await deleteCar(req.body, req.headers.authorization);
  res.send(result);
});

app.delete("/delete/card", async (req, res) => {
  const result = await deleteCard(req.body, req.headers.authorization);
  res.send(result);
});

app.get("/usuario/get", async (req, res) => {
  const result = await readUser(req.headers.authorization);
  res.send(result);
});

// --------------- PARA CHEQUEAR ---------------
app.post("/signin/google", async (req, res) => {
  const result = await signIn(req.body.email, "");
  res.send(result);
});

app.post("/signup/google", async (req, res) => {
  const result = await signUpGoogle(req.body);
  res.send(result);
});

// -------------------------------------------------------------------------------
// Start server
// -------------------------------------------------------------------------------

app.listen(process.env.PORT, () =>
  console.log(`Server listening on ${process.env.PORT}`)
);

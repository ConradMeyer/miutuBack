// -------------------------------------------------------------------------------
// Node modules
// -------------------------------------------------------------------------------
require("dotenv").config();
const crypto = require("crypto");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");
const randomstring = require("randomstring");
const { nanoid } = require("nanoid");
const {
  registerNewUser,
  checkUser,
  newCardDB,
  newCarDB,
  editCarDB,
  editUserDB,
  newInvoiceDB,
  deleteCarDB,
  readUserDB,
  deleteCardDB,
  deleteSecret,
  registerNewUserGoogle,
} = require("../database/db");

// -------------------------------------------------------------------------------
// Aux Functions
// -------------------------------------------------------------------------------
function validateEmail(email) {
  let patternEmail = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
  return patternEmail.test(email);
}

function validatePass(pass) {
  let patternPass =
    /(?=^.{8,}$)((?=.*\d)|(?=.*\W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/;
  return patternPass.test(pass);
}

function validateName(name) {
  let patternName = /^[a-zA-Z]+(([',. -][a-zA-Z ])?[a-zA-Z]*)*$/;
  return patternName.test(name);
}

function validateSurname(surname) {
  let patternSurname = /^[a-zA-Z]+(([',. -][a-zA-Z ])?[a-zA-Z]*)*$/;
  return patternSurname.test(surname);
}

function validateCard(card) {
  let patternCard =
    /^(?:4[0-9]{12}(?:[0-9]{3})?|5[1-5][0-9]{14}|6(?:011|5[0-9][0-9])[0-9]{12}|3[47][0-9]{13}|3(?:0[0-5]|[68][0-9])[0-9]{11}|(?:2131|1800|35d{3})d{11})$/;
  return patternCard.test(card);
}

// -------------------------------------------------------------------------------
// Logic
// -------------------------------------------------------------------------------

const signUp = async (user) => {
  const secret = randomstring.generate();
  let hash = crypto.createHmac("sha512", user.pass);
  hash.update(user.pass);
  const value = hash.digest("hex");
  const id = nanoid(10);
  const USER = {
    id,
    img: "",
    name: user.name,
    surname: user.surname,
    email: user.email,
    movil: user.movil,
    pass: value,
    secret,
    coches: [],
    facturas: [],
    tarjetas: [],
  };
  const result = await registerNewUser(USER);
  return result;
};

const signIn = async (user) => {
  let hash = crypto.createHmac("sha512", user.pass);
  hash.update(user.pass);
  const value = hash.digest("hex");
  const USER = {
    email: user.email,
    pass: value,
  };
  const result = await checkUser(USER);
  return result;
};

const signOut = async (token) => {
  const result = await deleteSecret(token);
  return result;
};

const newCard = async (card, token) => {
  const decode = jwt.decode(token);
  const CARD = {
    id: decode.id,
    titular: card.titular,
    numero: card.numero,
    fecha: card.fecha,
    codigo: card.codigo,
  };
  const result = await newCardDB(CARD);
  return result;
};

const editUser = async (user, token) => {
  const decode = jwt.decode(token);
  const newUser = {
    id: decode.id,
    name: user.name,
    surname: user.surname,
    email: user.email,
    movil: user.movil,
  };

  const result = await editUserDB(newUser);
  return result;
};

const newCar = async (coche, token) => {
  const decode = jwt.decode(token);
  const CAR = {
    id: decode.id,
    descripcion: coche.descripcion,
    cargador: coche.cargador,
    color: coche.color,
    matricula: coche.matricula,
  };
  const result = await newCarDB(CAR);
  return result;
};

const editCar = async (coche, token) => {
  const decode = jwt.decode(token);
  const newCar = {
    id: decode.id,
    descripcion: coche.descripcion,
    cargador: coche.cargador,
    color: coche.color,
    matricula: coche.matricula,
  };

  const result = await editCarDB(newCar);
  return result;
};

const newInvoice = async (invoice, token) => {
  const decode = jwt.decode(token);
  const newInvoice = {
    id: decode.id,
    idFactura: nanoid(5),
    nombre: invoice.nombre,
    concepto: invoice.concepto,
    importe: invoice.importe,
    direccion: invoice.direccion,
    fecha: new Date(),
  };
  mailer(invoice);
  const result = await newInvoiceDB(newInvoice);
  return result;
};

const deleteCar = async (coche, token) => {
  const decode = jwt.decode(token);
  const car = {
    id: decode.id,
    matricula: coche.matricula,
  };

  const result = await deleteCarDB(car);
  return result;
};

const deleteCard = async (tarjeta, token) => {
  const decode = jwt.decode(token);
  const card = {
    id: decode.id,
    numero: tarjeta.numero,
  };

  const result = await deleteCardDB(card);
  return result;
};

const readUser = async (token) => {
  try {
    const decode = jwt.decode(token);

    const result = await readUserDB(decode.id);

    return result;
  } catch {
    const result = {
      status: 401,
      data: "Id incorrecto",
      ok: false,
    };
    return result;
  }
};

// --------------- PARA CHEQUEAR ---------------
const mailer = (invoice) => {
  const transporter = nodemailer.createTransport({
    service: "Gmail",
    auth: {
      user: "tbgreenteam@gmail.com",
      pass: process.env.PASS,
    },
  });

  const mailOptions = {
    from: "Miutu",
    to: invoice.email,
    subject: "Tu recarga ya está en camino",
    html: `
    <table border="0" cellpadding="0" cellspacing="0" width="600px" margin="20px auto" background-color="#2d3436" bgcolor="#2d3436">
    <tr height="200px">  
        <td bgcolor="" width="600px">
            <h1 style="color: #fff; text-align:center">Gracias, ${invoice.nombre} </h1>
            <h3  style="color: #fff; text-align:center">
            ¡Tu
                <span style="color: #22C47D">CHARGER</span> 
                ya está en camino!
            </h3>
            <h4  style="color: #fff; text-align:center">
            La factura de tu ${invoice.concepto} ya está disponible en <span style="color: #22C47D">Mis Recargas</span>.
            </h4>
            <h3  style="color: #fff; text-align:center">
             Importe: ${invoice.importe}
            </h3>
        </td>
    </tr>
    <tr bgcolor="#fff">
        <td style="text-align:center">
            <p style="color: #000">¡Miutu, un mundo de recargas a su disposición!</p>
        </td>
    </tr>
    </table>

`,
  };

  return new Promise((res, rej) => {
    transporter.sendMail(mailOptions, function (error, info) {
      if (error) {
        console.log(error);
        res(false);
      } else {
        res(true);
      }
    });
  });
};

const signUpGoogle = async (user) => {
  let hash = crypto.createHmac("sha512", user.pass);
  hash.update(user.pass);
  const value = hash.digest("hex");
  const secret = randomstring.generate();
  const id = nanoid(10);
  const USER = {
    id,
    img: "",
    name: user.name,
    surname: "",
    email: user.email,
    movil: user.movil,
    pass: value,
    secret,
    coches: [],
    facturas: [],
    tarjetas: [],
  };
  const result = await registerNewUserGoogle(USER);
  return result;
};

// -------------------------------------------------------------------------------
// Export modules
// -------------------------------------------------------------------------------

module.exports = {
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
};

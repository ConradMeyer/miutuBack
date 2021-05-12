// -------------------------------------------------------------------------------
// Node modules
// -------------------------------------------------------------------------------
const md5 = require("md5");
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
  let patternPass = /(?=^.{8,}$)((?=.*\d)|(?=.*\W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/;
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
  let patternCard = /^(?:4[0-9]{12}(?:[0-9]{3})?|5[1-5][0-9]{14}|6(?:011|5[0-9][0-9])[0-9]{12}|3[47][0-9]{13}|3(?:0[0-5]|[68][0-9])[0-9]{11}|(?:2131|1800|35d{3})d{11})$/;
  return patternCard.test(card);
}

// -------------------------------------------------------------------------------
// Logic
// -------------------------------------------------------------------------------

const signUp = async (user) => {
  const secret = randomstring.generate();
  const id = nanoid(10);
  const USER = {
    id,
    img: "",
    name: user.name,
    surname: user.surname,
    email: user.email,
    movil: user.movil,
    pass: md5(user.pass),
    secret,
    coches: [],
    facturas: [],
    tarjetas: [],
  };
  const result = await registerNewUser(USER);
  return result;
};

const signIn = async (user) => {
  const USER = {
    email: user.email,
    pass: md5(user.pass),
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
const newPass = async (email) => {
  const sql = `SELECT * FROM usuarios WHERE email = "${email}"`;
  const response = await doQuery(sql);
  let result;

  if (response.length !== 0) {
    const token = jwt.sign({ email: email }, response[0].pass);
    const link = `https://fyf-greenteam.netlify.app/pass/recuperar/?token=${token}`;
    try {
      await mailer(email, link).then((res) => {
        if (res) {
          result = {
            status: 200,
            data: `Correo electrónico mandado a ${email}`,
            ok: true,
          };
        } else {
          result = {
            status: 404,
            data: "Algo ha salido mal...",
            ok: false,
          };
        }
      });
    } catch (error) {
      result = {
        status: 500,
        data: `Error al mandar correo a ${email}: error`,
        ok: false,
      };
    }
  } else {
    result = {
      status: 406,
      data: "Este correo no existe",
      ok: false,
    };
  }

  return result;
};

const changePass = async (newPass, token) => {
  if (validatePass(newPass)) {
    try {
      const decode = jwt.decode(token);
      const sql = `SELECT * FROM usuarios WHERE email = "${decode.email}"`;
      const response = await doQuery(sql);

      if (response.length !== 0) {
        const pass = response[0].pass;
        try {
          const res = jwt.verify(token, pass);
          if (res.email) {
            const newSecret = randomstring.generate();
            const sql2 = `UPDATE usuarios SET secret = "${newSecret}", pass = "${md5(
              newPass
            )}" WHERE email = "${decode.email}"`;
            const response = await doQuery(sql2);
            return response.changedRows > 0
              ? {
                  status: 200,
                  data: "Password cambiada",
                  ok: true,
                }
              : {
                  status: 406,
                  data: "Algo va mal...",
                  ok: false,
                };
          } else {
            const result = {
              status: 500,
              data: "La contraseña ya ha sido cambiada",
              ok: false,
            };
            return result;
          }
        } catch (error) {
          const result = {
            OK: 0,
            error: 401,
            message: `Token no válido: ${error.message}`,
          };
          return result;
        }
      }
    } catch (error) {
      const result = {
        status: 400,
        data: `No hay token.`,
        ok: false,
      };
      return result;
    }
  }
};

const mailer = (email, link) => {
  const transporter = nodemailer.createTransport({
    service: "Gmail",
    auth: {
      user: "tbgreenteam@gmail.com",
      pass: "josjoschapcon",
    },
  });

  const mailOptions = {
    from: "FyF Tu Portal de Empleo IT",
    to: email,
    subject: "RECUPERACION DE CONTRASEÑA",
    text: `Pincha aquí para recuperar tu contraseña ${link}`,
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
  const secret = randomstring.generate();
  const id = nanoid(10);
  const USER = {
    id,
    img: "",
    name: user.name,
    surname: user.surname,
    email: user.email,
    movil: user.movil,
    pass: md5(user.pass),
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
  newPass,
  changePass,
  signUpGoogle,
};

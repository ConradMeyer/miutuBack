// -------------------------------------------------------------------------------
// CONEXIÓN DB
// -------------------------------------------------------------------------------
const jwt = require("jsonwebtoken");
const { MongoClient } = require("mongodb");
const randomstring = require("randomstring");
const URL = process.env.MONGODB;
const optionsMongo = { useNewUrlParser: true, useUnifiedTopology: true };

// -------------------------------------------------------------------------------
// LOGICA
// -------------------------------------------------------------------------------

const registerNewUser = (USER) => {
  return new Promise((res, rej) => {
    MongoClient.connect(URL, optionsMongo, (err, db) => {
      try {
        db.db("niutu")
          .collection("usuarios")
          .insertOne(USER, (err, response) => {
            if (err) {
              console.log(err);
            } else {
              let token = jwt.sign(
                { email: response.ops[0].email, id: response.ops[0].id },
                response.ops[0].secret,
                {
                  expiresIn: 60 * 60,
                }
              );
              const result = {
                status: 200,
                data: "Nuevo usuario creado",
                token,
                ok: true,
              };
              res(result);
              db.close();
            }
          });
      } catch {
        rej({
          status: 500,
          data: "Error con la base de datos",
          ok: false,
        });
      }
    });
  });
};

const checkUser = (user) => {
  return new Promise((res, rej) => {
    MongoClient.connect(URL, optionsMongo, (err, db) => {
      try {
        db.db("niutu")
          .collection("usuarios")
          .findOne(user, (err, result) => {
            if (err) throw err;
            if (result === null) {
              res({
                status: 401,
                data: "Email o contraseña incorrect@s",
                ok: false,
              });
            } else {
              let token = jwt.sign(
                { email: result.email, id: result.id },
                result.secret,
                {
                  expiresIn: 60 * 60,
                }
              );
              res({
                status: 200,
                token: token,
                data: "Usuario logado correctamente",
                ok: true,
              });
              db.close();
            }
          });
      } catch {
        rej({
          status: 500,
          data: "Error con la base de datos",
          ok: false,
        });
      }
    });
  });
};

const deleteSecret = (token) => {
  const secret = randomstring.generate();
  const decode = jwt.decode(token);
  return new Promise((res, rej) => {
    MongoClient.connect(URL, optionsMongo, (err, db) => {
      try {
        db.db("niutu")
          .collection("usuarios")
          .updateOne(
            { id: decode.id },
            {
              $set: { secret: secret },
            },
            (err, result) => {
              if (err) throw err;
              if (result === null) {
                res({
                  status: 401,
                  data: "No se ha encontrado a ningun usuario con ese id, token incorrecto",
                  ok: false,
                });
              } else if (result.result.n === 1) {
                res({
                  status: 200,
                  data: "Logout correctamente",
                  ok: true,
                });
                db.close();
              } else {
                res({
                  status: 406,
                  data: "Algo salió mal...",
                  result,
                  ok: false,
                });
                db.close();
              }
            }
          );
      } catch {
        rej({
          status: 500,
          data: "Error con la base de datos",
          ok: false,
        });
      }
    });
  });
};

const newCardDB = (card) => {
  return new Promise((res, rej) => {
    MongoClient.connect(URL, optionsMongo, (err, db) => {
      try {
        db.db("niutu")
          .collection("usuarios")
          .updateOne(
            { id: card.id },
            { $push: { tarjetas: card } },
            (err, result) => {
              if (err) throw err;
              if (result === null) {
                res({
                  status: 401,
                  data: "Ha habido un error",
                  ok: false,
                });
              } else {
                res({
                  status: 200,
                  data: "Tarjeta añadida correctamente",
                  ok: true,
                });
                db.close();
              }
            }
          );
      } catch {
        rej({
          status: 500,
          data: "Error con la base de datos",
          ok: false,
        });
      }
    });
  });
};

const editUserDB = (user) => {
  return new Promise((res, rej) => {
    MongoClient.connect(URL, optionsMongo, (err, db) => {
      try {
        db.db("niutu")
          .collection("usuarios")
          .updateOne(
            { id: user.id },
            {
              $set: {
                name: user.name,
                surname: user.surname,
                email: user.email,
                movil: user.movil,
              },
            },
            (err, result) => {
              if (err) throw err;
              if (result === null) {
                res({
                  status: 401,
                  data: "Ha habido un error",
                  ok: false,
                });
              } else {
                res({
                  status: 200,
                  data: "Usuario editado correctamente",
                  ok: true,
                });
                db.close();
              }
            }
          );
      } catch {
        rej({
          status: 500,
          data: "Error con la base de datos",
          ok: false,
        });
      }
    });
  });
};

const newCarDB = (coche) => {
  return new Promise((res, rej) => {
    MongoClient.connect(URL, optionsMongo, (err, db) => {
      try {
        db.db("niutu")
          .collection("usuarios")
          .updateOne(
            { id: coche.id },
            { $push: { coches: coche } },
            (err, result) => {
              if (err) throw err;
              if (result === null) {
                res({
                  status: 401,
                  data: "Ha habido un error",
                  ok: false,
                });
              } else {
                res({
                  status: 200,
                  data: "Coche añadido correctamente",
                  ok: true,
                });
                db.close();
              }
            }
          );
      } catch {
        rej({
          status: 500,
          data: "Error con la base de datos",
          ok: false,
        });
      }
    });
  });
};

const editCarDB = (coche) => {
  return new Promise((res, rej) => {
    MongoClient.connect(URL, optionsMongo, (err, db) => {
      try {
        db.db("niutu")
          .collection("usuarios")
          .updateOne(
            { id: coche.id, "coches.matricula": coche.matricula },
            {
              $set: { "coches.$": coche },
            },
            (err, result) => {
              if (err) throw err;
              if (result === null) {
                res({
                  status: 401,
                  data: "Ha habido un error",
                  ok: false,
                });
              } else if (result.result.nModified === 1) {
                res({
                  status: 200,
                  data: "Coche editado correctamente",
                  ok: true,
                });
                db.close();
              } else {
                res({
                  status: 406,
                  data: "No se ha encontrado el coche",
                  result,
                  ok: false,
                });
                db.close();
              }
            }
          );
      } catch {
        rej({
          status: 500,
          data: "Error con la base de datos",
          ok: false,
        });
      }
    });
  });
};

const newInvoiceDB = (invoice) => {
  return new Promise((res, rej) => {
    MongoClient.connect(URL, optionsMongo, (err, db) => {
      try {
        db.db("niutu")
          .collection("usuarios")
          .updateOne(
            { id: invoice.id },
            { $push: { facturas: invoice } },
            (err, result) => {
              if (err) throw err;
              if (result === null) {
                res({
                  status: 401,
                  data: "Ha habido un error",
                  ok: false,
                });
              } else {
                res({
                  status: 200,
                  data: "Factura añadida correctamente",
                  ok: true,
                });
                db.close();
              }
            }
          );
      } catch {
        rej({
          status: 500,
          data: "Error con la base de datos",
          ok: false,
        });
      }
    });
  });
};

const deleteCarDB = (coche) => {
  return new Promise((res, rej) => {
    MongoClient.connect(URL, optionsMongo, (err, db) => {
      try {
        db.db("niutu")
          .collection("usuarios")
          .updateOne(
            { id: coche.id },
            { $pull: { coches: coche } },
            (err, result) => {
              if (err) throw err;
              if (result === null) {
                res({
                  status: 401,
                  data: "Ha habido un error",
                  result,
                  ok: false,
                });
              } else if (result.result.nModified === 0) {
                res({
                  status: 406,
                  data: "No se ha encontrado ningun coche",
                  result,
                  ok: true,
                });
                db.close();
              } else {
                res({
                  status: 200,
                  data: "Coche borrado correctamente",
                  result,
                  ok: true,
                });
                db.close();
              }
            }
          );
      } catch {
        rej({
          status: 500,
          data: "Error con la base de datos" + err,
          ok: false,
        });
      }
    });
  });
};

const readUserDB = (id) => {
  return new Promise((res, rej) => {
    MongoClient.connect(URL, optionsMongo, (err, db) => {
      try {
        db.db("niutu")
          .collection("usuarios")
          .findOne({ id: id }, (err, result) => {
            if (err) throw err;
            if (result === null) {
              res({
                status: 401,
                data: "No se encontro usuario",
                ok: false,
              });
            } else {
              const response = {
                status: 200,
                data: "Usuario encontrado",
                result: result,
                ok: true,
              };
              res(response);
              db.close();
            }
          });
      } catch {
        rej({
          status: 500,
          data: "Error con la base de datos",
          ok: false,
        });
      }
    });
  });
};

const deleteCardDB = (tarjeta) => {
  return new Promise((res, rej) => {
    MongoClient.connect(URL, optionsMongo, (err, db) => {
      try {
        db.db("niutu")
          .collection("usuarios")
          .updateOne(
            { id: tarjeta.id },
            { $pull: { tarjetas: tarjeta } },
            (err, result) => {
              if (err) throw err;
              if (result === null) {
                res({
                  status: 401,
                  data: "Ha habido un error",
                  result,
                  ok: false,
                });
              } else if (result.result.nModified === 0) {
                res({
                  status: 406,
                  data: "No se ha encontrado ninguna tarjeta",
                  result,
                  ok: true,
                });
                db.close();
              } else {
                res({
                  status: 200,
                  data: "Tarjeta borrada correctamente",
                  result,
                  ok: true,
                });
                db.close();
              }
            }
          );
      } catch {
        rej({
          status: 500,
          data: "Error con la base de datos" + err,
          ok: false,
        });
      }
    });
  });
};

// --------------- PARA CHEQUEAR ---------------
const registerNewUserGoogle = (USER) => {
  return new Promise((res, rej) => {
    MongoClient.connect(URL, optionsMongo, (err, db) => {
      try {
        db.db("niutu")
          .collection("usuarios")
          .insertOne(USER, (err, response) => {
            if (err) {
              console.log(err);
            } else {
              let token = jwt.sign(
                { email: response.ops[0].email, id: response.ops[0].id },
                response.ops[0].secret,
                {
                  expiresIn: 60 * 60,
                }
              );
              const result = {
                status: 200,
                data: "Nuevo usuario creado",
                token,
                ok: true,
              };
              res(result);
              db.close();
            }
          });
      } catch {
        rej({
          status: 500,
          data: "Error con la base de datos",
          ok: false,
        });
      }
    });
  });
};

// -------------------------------------------------------------------------------
// Export modules
// -------------------------------------------------------------------------------

module.exports = {
  registerNewUser,
  checkUser,
  newCardDB,
  editUserDB,
  newCarDB,
  editCarDB,
  newInvoiceDB,
  deleteCarDB,
  deleteCardDB,
  deleteSecret,
  readUserDB,
  registerNewUserGoogle,
};

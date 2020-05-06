"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
//importamos las queries necesarias
const queries_1 = require("../queries");
const promise_mysql_1 = __importDefault(require("promise-mysql"));
//Aqui es donde traemos todo nuestra informacion de la DB
const database_1 = __importStar(require("../database"));
class ComputersController {
    //Ya que tenemos que declarar los tipos de variables que estamos obteniendo, utilizamos la libreria de express para declararlos
    list(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            //Aqui las cosas se pusieron dificiles....
            //Primeramente creamos nuestra conexion con nuestra query indicada
            var query;
            if (!(Object.entries(req.query).length === 0 && req.query.constructor === Object)) {
                if (req.query.search !== null) {
                    var whereClause = ' WHERE';
                    whereClause += ' brand LIKE \'%' + req.query.search + '%\' OR';
                    whereClause += ' serial_number LIKE \'%' + req.query.search + '%\'';
                    query = database_1.connection.query(queries_1.computersQuery + whereClause);
                }
                if (req.query.computerList) {
                    query = database_1.connection.query(queries_1.computersWithFK);
                    console.log(query);
                }
            }
            else {
                query = database_1.connection.query(queries_1.computersQuery);
            }
            //Y creamos nuestro arreglo de usuarios
            var computers = [];
            //Ya que el metodo pool no tiene esta funcion , generamos una tipo connection
            query
                .on('error', function (err) {
                //En caso de haber un error...
                if (err)
                    throw err;
                res.json('Error ocurred when retriving data ' + err);
            })
                .on('result', function (row) {
                //La funcion principal de este metodo esta aqui
                //por cada "row" o fila, pausamos la query
                database_1.connection.pause();
                //Y se los asignamos al usuario
                var computer = {};
                console.log(row);
                console.log("----**");
                if (!(Object.entries(req.query).length === 0 && req.query.constructor === Object)) {
                    if (req.query.computerList) {
                        computer = {
                            idComputer: row['id'],
                            company: row['company'],
                            brand: row['brand'],
                            serial_number: row['serial_number'],
                            QR: row['QR'],
                            created_at: row['created_at']
                        };
                    }
                    else {
                        computer = {
                            idComputer: row['id'],
                            brand: row['brand'],
                            serial_number: row['serial_number'],
                            QR: row['QR'],
                            created_at: row['created_at']
                        };
                    }
                }
                else {
                    computer = {
                        idComputer: row['id'],
                        brand: row['brand'],
                        serial_number: row['serial_number'],
                        QR: row['QR'],
                        created_at: row['created_at']
                    };
                }
                //Empujamos nuestra fila al arreglo de usuarios
                computers.push(computer);
                //Y continuamos con la query
                database_1.connection.resume();
            })
                .on('end', function () {
                //Creamos nuestra variable result, la cual sera la que se convertira en nuestra respuesta JSON
                var result;
                console.log("computers --");
                console.log(computers);
                //Si obtenemos mas de 1 resultado, regresamos verdadero 
                if (computers.length > 0) {
                    result = { result: true, data: computers };
                }
                else {
                    //caso contrario, regresamos falso 
                    result = { result: false, data: [] };
                }
                //Regresamos los resultados de la busqueda
                return res.json(result);
            });
        });
    }
    getOne(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            //Obtenemos el id 
            const { id } = req.params;
            //Creamos nuestra query
            var query = database_1.connection.query(queries_1.computerQuery + ' WHERE id = ?', [id]);
            //Y creamos nuestra variable donde almacenaremos al objeto seleccionado
            var computer;
            //Ya que el metodo pool no tiene esta funcion , generamos una tipo connection
            query
                .on('error', function (err) {
                //En caso de haber un error...
                if (err)
                    throw err;
                res.json('Error ocurred when retriving data ' + err);
            })
                .on('result', function (row) {
                //La funcion principal de este metodo esta aqui
                //por cada "row" o fila, pausamos la query
                database_1.connection.pause();
                //Asignamos los valores del objeto
                computer = {
                    idComputer: row['id'],
                    brand: row['brand'],
                    serial_number: row['serial_number'],
                    QR: row['QR'],
                    created_at: row['created_at']
                };
                //Y continuamos con la query
                database_1.connection.resume();
            })
                .on('end', function () {
                //Generamos nuestra variable que se convertira en nuestro JSON
                var result;
                //Si nuesto objeto no se define o esta vacio...
                if (computer == undefined || computer == null) {
                    //Devolvemos que nuestra busqueda no arrojo resultados
                    result = { result: false, data: {} };
                }
                else {
                    //caso contrario, regresamos verdadero y nuestro objeto 
                    result = { result: true, data: computer };
                }
                //Regresamos los resultados de la busqueda
                return res.json(result);
            });
        });
    }
    //Creamos nuestro metodo Async, para que no tengamos que esperar y poder aprovechar los recursos
    create(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            var that = this;
            //Obtenemos la password
            const { brand, serial_number, QR, company_id } = req.body;
            var computer = {
                brand: brand,
                serial_number: serial_number,
                QR: QR,
                company_id: company_id
            };
            //convertimos nuestro objeto en una query
            var querycomputer = database_1.connection.escape(computer);
            var result;
            //Y hacemos nuestra query tipo pool
            database_1.default.query('INSERT INTO computers SET ' + querycomputer, function (error, results, fields) {
                //En caso de tener un error, mandamos el error
                if (error) {
                    res.json('No computer was added ' + error);
                    throw error;
                }
                //Ya que en un insert no nos interesa el dato, solamente preguntamos por las filas afectadas
                //En caso de ser mas de una, devolvemos que nuestra consulta fue verdadera
                if (results.affectedRows > 0) {
                    result = { result: true };
                }
                else {
                    //caso contrario, regresamos falso 
                    result = { result: false };
                }
                return res.json(result);
            })
                //En caso de haber otro tipo de error
                .catch(function (err) {
                res.json({
                    result: false,
                    data: {
                        code: err.code,
                        error: err.errno,
                        state: err.sqlState
                    }
                });
            });
        });
    }
    delete(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            //Obtenemos la id a partir de los parametros
            const { id } = req.params;
            //Generamos nuestra query
            var query = promise_mysql_1.default.format('DELETE FROM t_clients WHERE id= ?', [id]);
            var result = yield database_1.default.query(query, function (error, results, fields) {
                //En caso de haber un error
                if (error) {
                    res.json('No client was changed' + error);
                    throw error;
                }
                var result;
                //Ya que en un delete no nos interesa el dato, solamente preguntamos por las filas afectadas
                //En caso de ser mas de una, devolvemos que nuestra consulta fue verdadera
                if (results.affectedRows > 0) {
                    result = { result: true };
                }
                else {
                    //caso contrario, regresamos falso 
                    result = { result: false };
                }
                //Regresamos los resultados de la busqueda
                return res.json(result);
            })
                //En caso de que ocurra otro tipo de error
                .catch(function (err) {
                res.json({
                    result: false,
                    data: {
                        code: err.code,
                        error: err.errno,
                        state: err.sqlState
                    }
                });
            });
        });
    }
    update(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            //obtenemos todos los tipos de valores esperados
            const { id } = req.params;
            const { name, email, lastname } = req.body;
            //Creamos nuestro objeto con sus valores
            var user = {
                name: name,
                email: email,
                lastname: lastname
            };
            //Y le damos forma a nuestra query con el objeto
            var query = promise_mysql_1.default.format('UPDATE t_clients SET ? WHERE id= ?', [user, id]);
            database_1.default.query(query, function (error, results, fields) {
                //En caso de haber un error
                if (error) {
                    res.json('No user was changed' + error);
                    throw error;
                }
                var result;
                //Ya que en un update no nos interesa el dato, solamente preguntamos por las filas afectadas
                //En caso de ser mas de una, devolvemos que nuestra consulta fue verdadera
                if (results.affectedRows > 0) {
                    result = { result: true };
                }
                else {
                    //caso contrario, regresamos falso 
                    result = { result: false };
                }
                //Regresamos los resultados de la busqueda
                return res.json(result);
            })
                //En caso de obtener otro tipo de error
                .catch(function (err) {
                res.json({
                    result: false,
                    data: {
                        code: err.code,
                        error: err.errno,
                        state: err.sqlState
                    }
                });
            });
        });
    }
}
//Se exporta toda la clase para poder utilizar todos estos metodos
exports.computersController = new ComputersController();


require('dotenv').config();
const inquirer = require('inquirer');
const mysql = require('mysql2');
const {allDepartment,allRoles,allEmployee,addDepartments,addRole,addIntern}=require('./utils/functions');


const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: process.env.DB_PASSWORD,
    database: 'employee_DB',
});


function menu() {
    inquirer
        .prompt({
            name: 'action',
            type: 'list',
            message: '¿Que quieres hacer?',
            choices: [
                'Ver todos los departamentos',
                'Ver todos los roles',
                'Ver todos los empleados',
                'Agregar un departamento',
                'Agregar un rol',
                "Agregar un empleado",
                'Actualizar un rol de empleado',
                'Actualizar gerentes de empleados',
                'Ver empleados por gerente',
                'Ver empleados por departamento',
                'Eliminar departamentos, roles y empleados',
                "Ver el presupuesto total de un departamento",
                'Salir',
            ],
        })
        .then((answer) => {
            switch (answer.action) {
                case 'Ver todos los departamentos':
                allDepartment();
                break;
            case 'Ver todos los roles':
                allRoles();
                break;
            case 'Ver todos los empleados':
                allEmployee();
                break;
            case 'Agregar un departamento':
                addDepartments();
                break;
            case "Agregar un rol":
                addRole();
                break;
            case 'Agregar un empleado':
                writeToFile();
                break;
            case 'Actualizar un rol de empleado':
                writeToFile();
                break;
            case 'Actualizar gerentes de empleados':
                writeToFile();
                break;
            case 'Ver empleados por gerente':
                writeToFile();
                break;
            case 'Ver empleados por departamento':
                writeToFile();
                break;
            case "Eliminar departamentos, roles y empleados":
                writeToFile();
                break;
            case 'Ver el presupuesto total de un departamento':
                writeToFile();
                break;
            case 'Salir':
                db.end();
                break;
            }
        });
}

// Start application
db.connect((err) => {
    if (err) throw err;
    menu();
});

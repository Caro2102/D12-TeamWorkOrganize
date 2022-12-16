
require('dotenv').config();
const inquirer = require('inquirer');
const mysql = require('mysql2');
const cTable = require('console.table');

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
                'Eliminar departamentos, roles y empleados',
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

let nameval=/^[a-zA-Z]+(([',. -][a-zA-Z ])?[a-zA-Z]*)*$/g;
const confirmname=(name)=>{
    return !name.match(nameval)||name==''?'Ingrese el nombre del departamento': true
}
//Funciones para ver informacion
allDepartment=()=>{
    db.query(`SELECT * FROM department`,(err,res)=>{
        if(err)throw err;
        console.table(res);
        menu();
        }
)};
allRoles=()=>{
    db.query(`SELECT * FROM role`,(err,res)=>{
        if(err)throw err;
        console.table(res);
        menu();
        }
)};
allEmployee=()=>{
    db.query(`SELECT employee.id, employee.first_name, employee.last_name, role.title, role.salary, department.name AS department, CONCAT(e.first_name,' ',e.last_name) AS manager
        FROM employee LEFT JOIN employee AS e ON e.id = employee.manager_id 
        JOIN role ON employee.role_id = role.id 
        JOIN department ON role.department_id = department.id 
        ORDER BY employee.id;`,(err,res)=>{
        if(err)throw err;
        console.table(res);
        menu();
        }
)};


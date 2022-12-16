
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
            case 'Agregar un departamento':
                addDepartments();
                break;
            case "Agregar un rol":
                addRole();
                break;
            case 'Agregar un empleado':
                addEmployee();
                break;
            case 'Actualizar un rol de empleado':
                updateRole();
                break;
            case 'Actualizar gerentes de empleados':
                updateManager();
                break;
            case "Eliminar departamentos, roles y empleados":
                deleteE();
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
    return !name.match(nameval)||name==''?'Ingrese bien el nombre': true
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
//Funciones para agregar informacion
addDepartments=()=>{
    inquirer
        .prompt({
            type: 'input',
            message: '¿Cual es el nombre del departamento?',
            name: 'nameD',
            validate: confirmname,
        }).then(answer => {
            db.query(`INSERT INTO department SET ?`,{
                name:answer.nameD
            },(err)=>{
                if(err)throw err;
                console.log(`Se agrego ${answer.nameD} a la base de datos`)
                menu();
            });
        })
}
addRole=()=>{
    inquirer
        .prompt([
            {
                type: 'input',
                message: '¿Cual es el nombre del rol',
                name: 'nameR',
                validate: confirmname,
            },
            {
                type: 'input',
                message: '¿Cual es el salario del rol?',
                name: 'salaryR',
            },
            {
                type: 'input',
                message: '¿A que id de departamento pertenece el rol?',
                name: 'departmentR',
            },
        ]).then(answer => {
            db.query(`INSERT INTO role SET ?`,{
                title:answer.nameR,
                salary:answer.salaryR,
                department_id:answer.departmentR
            },(err)=>{
                if(err)throw err;
                console.log(`Se agrego ${answer.nameR} a la base de datos`)
                menu();
            });
        })
}
addEmployee=()=> {
    const newEmployee = {};
    db.query('SELECT * FROM role', (err, res) => {
        if (err) throw err;
        inquirer
            .prompt([
                {
                    name: 'first_name',
                    type: 'input',
                    message: `¿Cual es el nombre del empleado?`,
                    validate: confirmname,
                },
                {
                    name: 'last_name',
                    type: 'input',
                    message: `¿Cual es el apellido del empleado?`,
                    validate: confirmname,
                },
                {
                    name: 'employee_role',
                    type: 'list',
                    // Obtener title de db role
                    choices() {
                        const roleArray = [];
                        for (let i = 0; i < res.length; i++) {
                            roleArray.push(res[i].title);
                        }
                        return roleArray;
                    },
                    message: `¿Cual es el rol del empleado?`,
                },
            ])
            .then((answer) => {
                // Agregar nombre y apellido al objeto
                newEmployee.first_name = answer.first_name;
                newEmployee.last_name = answer.last_name;

                //Tomar id del tittle seleccionado para que role.id sea ese id 
                db.query('SELECT * FROM role WHERE title = ?', answer.employee_role, (err, res) => {
                    if (err) throw err;

                    newEmployee.role_id = res[0].id;
                });

                // Buscar empleados de db employee
                db.query('SELECT * FROM employee', (err, res) => {
                    if (err) throw err;
                    inquirer
                        .prompt([
                            {
                                name: 'manager_name',
                                type: 'list',
                                choices() {
                                    const choiceArray = [];
                                    for (let i = 0; i < res.length; i++) {
                                        choiceArray.push(
                                            `${res[i].first_name} ${res[i].last_name}`
                                        );
                                    }
                                    return choiceArray;
                                },
                                message: "¿Quien es el manager del empleado?",
                            },
                        ])
                        .then((answer) => {
                            db.query(
                                //Tomar id del nombre seleccionado para que el manager_id sea ese id 
                                'SELECT id FROM employee WHERE first_name = ?',
                                answer.manager_name.split(' ')[0],
                                (err, res) => {
                                    if (err) throw err;
                                    newEmployee.manager_id = res[0].id;
                                    db.query('INSERT INTO employee SET ?', newEmployee, (err) => {
                                        if (err) throw err;
                                        console.log('Se agrego empleado');
                                        menu();
                                    });
                                }
                            );
                        });
                });
            });
    });
}

updateRole=()=> {
    const update = {};
    db.query(
        //Seleccionar tabla employee para obtener nombres y role title
        `SELECT employee.id, employee.first_name, employee.last_name, role.title, role.salary, department.name AS department, 
        emp.first_name AS manager FROM employee 
        LEFT JOIN employee AS emp ON emp.id = employee.manager_id 
        JOIN role ON employee.role_id = role.id 
        JOIN department ON role.department_id = department.id 
        ORDER BY employee.id`,
        (err,res) => {
            if (err) throw err;
            inquirer
                .prompt([
                    {
                        name: 'updEmployee',
                        type: 'list',
                        choices() {
                            const choiceArray = [];
                            for (let i = 0; i < res.length; i++) {
                                choiceArray.push(`${res[i].first_name} ${res[i].last_name}`);
                            }
                            return choiceArray;
                        },
                        message: `¿Que rol de empleado quieres actualizar?`,
                    },
                ])
                .then((answer) => {
                    //agregar solo nombre a objeto
                    update.first_name = answer.updEmployee.split(' ')[0];
                    db.query('SELECT * FROM role', (err, res) => {
                        if (err) throw err;
                        inquirer
                            .prompt([
                                {
                                    name: 'roleAsign',
                                    type: 'list',
                                    choices() {
                                        const choiceArray = [];
                                        for (let i = 0; i < res.length; i++) {
                                            choiceArray.push(res[i].title);
                                        }
                                        return choiceArray;
                                    },
                                    message: `¿Que rol quieres asignarle al empleado `,
                                },
                            ])
                            .then((answer) => {
                                //Tomar id del nombre seleccionado para que role_id sea de ese id 
                                db.query('SELECT * FROM role WHERE title = ?', answer.roleAsign, (err, res) => {
                                    if (err) throw err;
                                    update.role_id = res[0].id;
                                    db.query(
                                        //Actualizar role_id de db employee donde el nombre sea la respuesta 
                                        'UPDATE employee SET role_id = ? WHERE first_name = ?',
                                        [update.role_id, update.first_name],
                                        (err) => {
                                            if (err) throw err;
                                            console.log('El empleado se actualizo.');
                                            menu();
                                        }
                                    );
                                });
                            });
                    });
                });
        }
    );
}
updateManager=()=> {
    const newManager = {};
    db.query(
        `SELECT * FROM employee`,
        (err,res) => {
            if (err) throw err;
            inquirer
            .prompt([
                {
                    name: 'changeManager',
                    type: 'list',
                    choices() {
                        const choiceArray = [];
                        for (let i = 0; i < res.length; i++) {
                            choiceArray.push(`${res[i].first_name} ${res[i].last_name}`);
                        }
                        return choiceArray;
                    },
                    message: `¿Cual empleado tiene nuevo manager?`,
                },
                {
                    name: 'newMan',
                    type: 'list',
                    choices() {
                        const choiceArray = [];
                        for (let i = 0; i < res.length; i++) {
                            choiceArray.push(`${res[i].first_name} ${res[i].last_name}`);
                        }
                        return choiceArray;
                    },
                    message: `¿Quien es su nuevo manager?`,
                },
            ])
            .then((answer) => {
                newManager.first_name = answer.changeManager.split(' ')[0];
                    //Tomar id del nombre seleccionado para que el manager_id sea de ese id 
                db.query('SELECT * FROM employee WHERE first_name = ?', answer.newMan.split(' ')[0], (err, res) => {
                    if (err) throw err;
                    newManager.manager_id = res[0].id;
                    db.query(
                        //Actualizar manager_id de db employee donde el nombre sea la respuesta 
                        'UPDATE employee SET manager_id = ? WHERE first_name = ?',
                        [newManager.manager_id, newManager.first_name],
                        (err) => {
                            if (err) throw err;
                            console.log('El manager se actualizo.');
                            menu();
                        }
                    );
                });
            });
        });
}
deleteE=()=>{
    inquirer
    .prompt({
        type: 'list',
        message: '¿Que quieres eliminar?',
        name: 'deleteE',
        choices:['Departamento', 'Role', 'Empleado','Salir', ],
    }).then((answer) => {
        switch (answer.deleteE) {
        case 'Departamento':
            deletDepartment();
        break;
        case 'Role':
            deletRole();
            break;
        case 'Empleado':
            deletEmpleyee();
            break;
        case 'Salir':
            db.end();
            break;
        }
    });
    
}
deletDepartment=()=>{
    const deletD={};
    //Seleccionar nombres de db department
    db.query('SELECT name from department',(err,res)=>{
        if (err) throw err;
        inquirer
        .prompt([
            {
                name: 'departmentN',
                type: 'list',
                choices() {
                    const choiceArray = [];
                    for (let i = 0; i < res.length; i++) {
                        choiceArray.push(`${res[i].name}`);
                    }
                    return choiceArray;
                },
                message: `¿Que departamento quieres eliminar?`,
            },
        ]).then(answer => {
                deletD.name= answer.departmentN;;
                db.query(
                    //Borrar de db department donde este el nombre seleccionado de la respuesta
                    'DELETE FROM department WHERE name = ?',deletD.name,
                    (err) => {
                        if (err) throw err;
                        console.log('El departamento se elimino.');
                        menu();
                    }
                );
            
        })
    });
}
deletRole=()=>{
    //Seleccionar title de db role
    db.query('SELECT title from role',(err,res)=>{
        if (err) throw err;
        inquirer
        .prompt([
            {
                name: 'roleS',
                type: 'list',
                choices() {
                    const choiceArray = [];
                    for (let i = 0; i < res.length; i++) {
                        choiceArray.push(`${res[i].title}`);
                    }
                    return choiceArray;
                },
                message: `¿Que rol quieres eliminar?`,
            },
        ]).then(answer => {
                db.query(
                    //Borrar de db role donde este el title seleccionado de la respuesta
                    'DELETE FROM role WHERE title = ?',answer.roleS,
                    (err) => {
                        if (err) throw err;
                        console.log('El rol se elimino.');
                        menu();
                    }
                );
            
        })
    });
}
deletEmpleyee=()=>{
    //Seleccionar nombres de db employee
    const deletD={};
    db.query('SELECT * from employee',(err,res)=>{
        if (err) throw err;
        inquirer
        .prompt([
            {
                name: 'employeeN',
                type: 'list',
                choices() {
                    const choiceArray = [];
                    for (let i = 0; i < res.length; i++) {
                        choiceArray.push(`${res[i].first_name} ${res[i].last_name}`);
                    }
                    return choiceArray;
                },
                message: `¿Que empleado quieres eliminar?`,
            },
        ]).then(answer => {  
                    db.query(
                        //Borrar de db employee donde este el nombre seleccionado de la respuesta
                        'DELETE FROM employee WHERE first_name = ?',answer.employeeN.split(' ')[0],(err) => {
                        if (err) throw err;
                        console.log('El empleado se elimino.');
                        menu();
                    }
                );
            
        })
    });
}


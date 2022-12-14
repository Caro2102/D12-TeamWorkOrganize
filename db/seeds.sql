-- Departments
INSERT INTO department (name)
VALUES 
    ("CEO"),
    ("Marketing"),
    ("Operaciones"); 
    
   

-- Employee Roles
INSERT INTO role (title, salary, department_id)
VALUES
    ("Director", 120000.00, 1),
    ("VP Marketing", 90000.00, 2),
    ("VP Operaciones", 90000.00, 3),
    ("Director,Relaciones publicas", 65000.00, 2),
    ("Director, Marketing", 65000.00, 2),
    ("Manager, Operaciones", 65000.00, 2),
    ("Jefe, Marketing", 45000.00, 3),
    ("Estratega de marca", 45000.00, 2),
    ("Supervisor de Instalaciones", 45000.00, 3);
    

-- Employee info

INSERT INTO employee (first_name, last_name, role_id, manager_id)
VALUES
-- Employee managers
    ("Elaine", "Vanderbilt", 1, NULL),
    ("Jerry", "Daniels", 2, 1),
    ("Edward", "Prescott", 3, 1),
    ("Tony", "Fresco", 4, 2),
-- Employees with managers
    ("Eliza", "Cain", 5, 2),
    ("Joseph", "spinelli", 6, 3),
    ("Paul", "Rand", 7, 4),
    ("Vanessa", "Lorriet", 8, 5),
    ("Julius", "Paige", 9, 6);
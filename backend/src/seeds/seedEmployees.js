import { Employee } from "../models/employee.js";
import { EMPLOYEE_ROLES } from "../constants/enums.js";

export const seedEmployees = async () => {
  const count = await Employee.count();
  if (count > 0) return console.log("Employees already exist");

  const employees = [
    {
      first_name: "Andrei",
      last_name: "Buzagiu",
      email: "andrei.buzagiu@gmail.com",
      phone_number: "0756056577",
      password: "admin1234",
      role: EMPLOYEE_ROLES.ADMIN,
    },
    {
      first_name: "Andrei2",
      last_name: "Buzagiu",
      email: "andrei2.buzagiu@gmail.com",
      phone_number: "0742369855",
      password: "staff1234",
      role: EMPLOYEE_ROLES.ANGAJAT,
    }
  ];

  await Employee.bulkCreate(employees, { individualHooks: true });
  console.log("Employees seeded");
};

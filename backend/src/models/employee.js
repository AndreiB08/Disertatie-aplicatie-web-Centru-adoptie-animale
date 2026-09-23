import { DataTypes } from "sequelize";
import bcrypt from "bcryptjs"
import { sequelize } from "../config/database.js";
import { EMPLOYEE_ROLES } from "../constants/enums.js";

export const Employee = sequelize.define(
    "employees",
    {
        // Identification
        id: {
            type: DataTypes.UUID,
            primaryKey: true,
            defaultValue: DataTypes.UUIDV4
        },
        first_name: {
            type: DataTypes.STRING,
            allowNull: false
        },
        last_name: {
            type: DataTypes.STRING,
            allowNull: false
        },

        // Contact information
        email: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true,
            validate: {
                isEmail: true
            },
            set(value) {
                this.setDataValue("email", value.toLowerCase());
            }
        },
        phone_number: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true,
            validate: {
                is: /^[0-9+\-\(\)\s]*$/,
                len: [10, 15],
            }
        },

        // Authentification
        password: {
            type: DataTypes.STRING,
            allowNull: false,
            validate: {
                len: [8, 64]
            }
        },

        // Role
        role: {
            type: DataTypes.ENUM(...Object.values(EMPLOYEE_ROLES)),
            allowNull: false
        }
    },
    {
        tableName: "employees",
        timestamps: true,
        defaultScope: {
            attributes: { exclude: ["password"] },
        },
        scopes: {
            withPassword: {
                attributes: { include: ["password"] },
            }
        }
    }
);

Employee.beforeCreate(async (employee) => {
    const salt = await bcrypt.genSalt(10);
    employee.password = await bcrypt.hash(employee.password, salt);
});

Employee.beforeUpdate(async (employee) => {
    if (employee.changed("password")) {
        const salt = await bcrypt.genSalt(10);
        employee.password = await bcrypt.hash(employee.password, salt);
    }
});

Employee.prototype.comparePassword = async function (password) {
    return await bcrypt.compare(password, this.password);
};
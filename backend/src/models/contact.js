import { DataTypes } from "sequelize";
import { sequelize } from "../config/database.js";

export const Contact = sequelize.define(
    "contacts",
    {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true,
        },
        name: {
            type: DataTypes.STRING,
            allowNull: false
        },
        email: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: false,
            validate: {
                isEmail: true
            },
            set(value) {
                this.setDataValue("email", value.toLowerCase());
            }
        },
        message: {
            type: DataTypes.TEXT,
            allowNull: false,
        }
    }, {
    tableName: "contacts",
    timestamps: true,
    indexes: [
        {
            unique: true,
            fields: ["email"]
        },
    ],
})
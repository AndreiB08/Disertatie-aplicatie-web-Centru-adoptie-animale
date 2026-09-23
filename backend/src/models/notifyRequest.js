import { DataTypes } from "sequelize";
import { sequelize } from "../config/database.js";

export const NotifyRequest = sequelize.define(
    "notify_requests",
    {
        // Identification
        id: {
            type: DataTypes.UUID,
            primaryKey: true,
            defaultValue: DataTypes.UUIDV4,
        },

        // Applicant information
        email: {
            type: DataTypes.STRING,
            allowNull: false,
            validate: {
                isEmail: true
            },
            set(value) {
                this.setDataValue("email", value.toLowerCase());
            }
        },

        // Reference to the animal
        animalId: {
            type: DataTypes.UUID,
            allowNull: false,
            references: {
                model: "animals",
                key: "id",
            },
        },
    }, {
    tableName: "notification_requests",
    timestamps: true,
    indexes: [
        {
            unique: true,
            fields: ["email", "animalId"]
        },
    ],
});
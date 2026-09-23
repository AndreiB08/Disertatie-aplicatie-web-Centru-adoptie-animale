import { DataTypes } from "sequelize";
import { sequelize } from "../config/database.js";

export const AdoptionRequest = sequelize.define(
    "adoption_requests",
    {
        // Identification
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true
        },

        // Adopter information
        adopter_first_name: {
            type: DataTypes.STRING,
            allowNull: false
        },
        adopter_last_name: {
            type: DataTypes.STRING,
            allowNull: false
        },
        adopter_email: {
            type: DataTypes.STRING,
            allowNull: false,
            validate: {
                isEmail: true
            },
            set(value) {
                this.setDataValue("adopter_email", value.toLowerCase());
            }
        },
        adopter_phone_number: {
            type: DataTypes.STRING,
            allowNull: false,
            validate: {
                is: /^[0-9+\-\(\)\s]*$/,
                len: [10, 15],
            }
        },
        message: {
            type: DataTypes.TEXT,
            allowNull: true,
        },

        // Adoption scheduling
        pickup_datetime: {
            type: DataTypes.DATE,
            allowNull: false,
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

        // Approval status
        approved: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: false,
        },
    }, {
    tableName: "adoption_requests",
    timestamps: true,
});

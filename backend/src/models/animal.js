import { DataTypes } from "sequelize";
import { sequelize } from "../config/database.js";
import { SPECIES, GENDERS, SIZES, HEALTH_STATUSES, ADOPTION_STATUSES } from "../constants/enums.js";

export const Animal = sequelize.define(
    "animals",
    {
        // Identification
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true,
        },
        name: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        species: {
            type: DataTypes.STRING,
            allowNull: false,
            validate: {
                isIn: [Object.values(SPECIES)],
            },
        },
        breed: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        microchip_number: {
            type: DataTypes.STRING,
            unique: true,
            allowNull: true,
        },

        // Physical characteristics
        age: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 0,
            validate: {
                min: 0,
            },
        },
        gender: {
            type: DataTypes.ENUM(...Object.values(GENDERS)),
            allowNull: false,
        },
        size: {
            type: DataTypes.ENUM(...Object.values(SIZES)),
            allowNull: false,
        },
        color: {
            type: DataTypes.STRING,
            allowNull: false,
        },

        // Medical condition
        health_status: {
            type: DataTypes.ENUM(...Object.values(HEALTH_STATUSES)),
            allowNull: false,
            defaultValue: HEALTH_STATUSES.SĂNĂTOS
        },
        vaccinated: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: false,
        },
        sterilized: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: false,
        },

        // Adoption and status
        adoption_status: {
            type: DataTypes.ENUM(...Object.values(ADOPTION_STATUSES)),
            allowNull: false,
            defaultValue: ADOPTION_STATUSES.DISPONIBIL,
        },
        arrival_date: {
            type: DataTypes.DATEONLY,
            allowNull: false,
            defaultValue: DataTypes.NOW,
        },
        notes: {
            type: DataTypes.TEXT,
            allowNull: true,
        },
        image: {
            type: DataTypes.STRING,
            allowNull: false,
            validate: {
                isUrl: true,
            }
        }
    },
    {
        tableName: "animals",
        timestamps: true,
        indexes: [
            { fields: ["species"] },
            { fields: ["adoption_status"] },
            { fields: ["arrival_date"] },
            { fields: ["microchip_number"], unique: true },
        ]
    }
);
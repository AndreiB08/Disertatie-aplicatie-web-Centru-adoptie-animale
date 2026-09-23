import { Sequelize } from "sequelize";

export const sequelize = new Sequelize({
    dialect: "sqlite",
    storage: 'storage.db'
});

export const synchronizeDatabase = async () => {
    try {
        await sequelize.authenticate();
        console.log("Database connection established successfully.");

        await sequelize.sync({ force: false });
        console.log("Database synchronized.");
    } catch (error) {
        console.error("Database synchronization failed:", error);
    }
};

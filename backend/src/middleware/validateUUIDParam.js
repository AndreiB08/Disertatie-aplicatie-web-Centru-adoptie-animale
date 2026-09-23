import { validate as isUUID } from "uuid";

export const validateUUIDParam = (paramName = "id") => {
  return (req, res, next, value) => {
    if (!isUUID(value)) {
      return res.status(400).json({ message: `Invalid ${paramName} format` });
    }
    next();
  };
};

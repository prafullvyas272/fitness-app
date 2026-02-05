import swaggerJSDoc from "swagger-jsdoc";

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Node Prisma Mongo API",
      version: "1.0.0",
    },
    tags: [
      {
        name: "Authentication",
        description: "Auth, OTP, and social login APIs",
      },
    ],
  },
  apis: ["./src/routes/*.js"],
};

export default swaggerJSDoc(options);

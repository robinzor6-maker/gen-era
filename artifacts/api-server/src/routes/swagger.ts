import { Router } from "express";
import swaggerUi from "swagger-ui-express";

const router = Router();

const swaggerDocument = {
  openapi: "3.0.3",
  info: {
    title: "GEN ERA API",
    description: "GEN ERA e-commerce backend API",
    version: "1.0.0",
  },
  servers: [{ url: "/api/v1", description: "API v1" }],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: "http",
        scheme: "bearer",
        bearerFormat: "JWT",
      },
    },
    schemas: {
      Error: {
        type: "object",
        properties: {
          success: { type: "boolean", example: false },
          message: { type: "string" },
        },
      },
      Success: {
        type: "object",
        properties: {
          success: { type: "boolean", example: true },
          message: { type: "string" },
          data: { type: "object" },
        },
      },
    },
  },
  paths: {
    "/healthz": {
      get: {
        tags: ["Health"],
        summary: "Health check",
        responses: {
          "200": {
            description: "Service status",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    status: { type: "string", example: "ok" },
                    database: { type: "string", example: "connected" },
                    version: { type: "string", example: "1.0.0" },
                    timestamp: { type: "string", format: "date-time" },
                  },
                },
              },
            },
          },
        },
      },
    },
    "/auth/register": {
      post: {
        tags: ["Auth"],
        summary: "Register a new user",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["name", "email", "password"],
                properties: {
                  name: { type: "string", minLength: 2 },
                  email: { type: "string", format: "email" },
                  password: { type: "string", minLength: 6 },
                },
              },
            },
          },
        },
        responses: {
          "201": { description: "User registered" },
          "409": { description: "Email already registered" },
        },
      },
    },
    "/auth/login": {
      post: {
        tags: ["Auth"],
        summary: "Login",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["email", "password"],
                properties: {
                  email: { type: "string", format: "email" },
                  password: { type: "string" },
                },
              },
            },
          },
        },
        responses: {
          "200": { description: "Login successful, returns tokens" },
          "401": { description: "Invalid credentials" },
        },
      },
    },
    "/auth/refresh": {
      post: {
        tags: ["Auth"],
        summary: "Refresh access token",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["refreshToken"],
                properties: { refreshToken: { type: "string" } },
              },
            },
          },
        },
        responses: {
          "200": { description: "New access token" },
          "401": { description: "Invalid or expired refresh token" },
        },
      },
    },
    "/auth/logout": {
      post: {
        tags: ["Auth"],
        summary: "Logout (revoke refresh token)",
        requestBody: {
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: { refreshToken: { type: "string" } },
              },
            },
          },
        },
        responses: { "200": { description: "Logged out" } },
      },
    },
    "/auth/profile": {
      get: {
        tags: ["Auth"],
        summary: "Get current user profile",
        security: [{ bearerAuth: [] }],
        responses: {
          "200": { description: "User profile" },
          "401": { description: "Unauthorized" },
        },
      },
    },
    "/products": {
      get: {
        tags: ["Products"],
        summary: "List products",
        parameters: [
          { name: "page", in: "query", schema: { type: "integer", default: 1 } },
          { name: "limit", in: "query", schema: { type: "integer", default: 9 } },
          { name: "category", in: "query", schema: { type: "string" } },
          { name: "collection", in: "query", schema: { type: "string" } },
          { name: "q", in: "query", schema: { type: "string" } },
          { name: "minPrice", in: "query", schema: { type: "integer" } },
          { name: "maxPrice", in: "query", schema: { type: "integer" } },
          { name: "inStock", in: "query", schema: { type: "boolean" } },
        ],
        responses: { "200": { description: "Paginated product list" } },
      },
    },
    "/products/featured": {
      get: {
        tags: ["Products"],
        summary: "Get featured products",
        responses: { "200": { description: "Featured products" } },
      },
    },
    "/products/{slug}": {
      get: {
        tags: ["Products"],
        summary: "Get product by slug",
        parameters: [{ name: "slug", in: "path", required: true, schema: { type: "string" } }],
        responses: {
          "200": { description: "Product detail" },
          "404": { description: "Product not found" },
        },
      },
    },
    "/orders": {
      post: {
        tags: ["Orders"],
        summary: "Create order (guest or authenticated)",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["customer", "items"],
                properties: {
                  customer: {
                    type: "object",
                    required: ["name", "email", "address", "city"],
                    properties: {
                      name: { type: "string" },
                      email: { type: "string", format: "email" },
                      phone: { type: "string" },
                      address: { type: "string" },
                      city: { type: "string" },
                    },
                  },
                  items: {
                    type: "array",
                    minItems: 1,
                    items: {
                      type: "object",
                      required: ["productId", "quantity"],
                      properties: {
                        productId: { type: "string" },
                        quantity: { type: "integer", minimum: 1 },
                        selectedSize: { type: "string" },
                        selectedColor: { type: "string" },
                      },
                    },
                  },
                  notes: { type: "string" },
                  idempotencyKey: { type: "string" },
                },
              },
            },
          },
        },
        responses: {
          "201": { description: "Order created" },
          "400": { description: "Invalid input or product not found" },
          "409": { description: "Insufficient stock" },
        },
      },
      get: {
        tags: ["Orders"],
        summary: "List orders (requires auth)",
        security: [{ bearerAuth: [] }],
        responses: {
          "200": { description: "Order list" },
          "401": { description: "Unauthorized" },
        },
      },
    },
    "/orders/{id}": {
      get: {
        tags: ["Orders"],
        summary: "Get order by ID or order number",
        security: [{ bearerAuth: [] }],
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
        responses: {
          "200": { description: "Order detail" },
          "401": { description: "Unauthorized" },
          "403": { description: "Access denied" },
          "404": { description: "Order not found" },
        },
      },
    },
    "/admin/stats": {
      get: {
        tags: ["Admin"],
        summary: "Dashboard stats",
        security: [{ bearerAuth: [] }],
        responses: { "200": { description: "Product/order/user counts and revenue" } },
      },
    },
    "/admin/products": {
      get: {
        tags: ["Admin"],
        summary: "List all products (admin)",
        security: [{ bearerAuth: [] }],
        responses: { "200": { description: "All products" } },
      },
      post: {
        tags: ["Admin"],
        summary: "Create product",
        security: [{ bearerAuth: [] }],
        responses: { "201": { description: "Created product" } },
      },
    },
    "/admin/orders": {
      get: {
        tags: ["Admin"],
        summary: "List all orders (admin)",
        security: [{ bearerAuth: [] }],
        responses: { "200": { description: "All orders" } },
      },
    },
    "/admin/users": {
      get: {
        tags: ["Admin"],
        summary: "List all users (admin)",
        security: [{ bearerAuth: [] }],
        responses: { "200": { description: "All users" } },
      },
    },
  },
};

router.use("/", swaggerUi.serve);
router.get("/", swaggerUi.setup(swaggerDocument));

export default router;

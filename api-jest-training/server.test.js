const request = require("supertest");
const mongoose = require("mongoose");
const app = require("./server");

let server;

beforeAll(async () => {
  const mongoURI = "mongodb+srv://jokast38:Jok%4062106835@jokastclusteripssi.0ur0y.mongodb.net/pmu-prepa?retryWrites=true&w=majority";
  await mongoose.connect(mongoURI);

  if (!server) {
    server = app.listen(3003, () => {
      console.log("Test server running on port 3003");
    });
  }
});

afterAll(async () => {
  await mongoose.connection.close();
  if (server) {
    server.close();
  }
});

describe("POST /users", () => {
  it("should create a new user with valid input", async () => {
    const response = await request(app)
      .post("/users")
      .send({ firstName: "Charlie", lastName: "Brown", email: "charlie.brown@example.com" })
      .expect(201);

    expect(response.body).toHaveProperty("id"); // Vérifie que l'ID est remappé en `id`
    expect(response.body.firstName).toBe("Charlie");
    expect(response.body.lastName).toBe("Brown");
    expect(response.body.email).toBe("charlie.brown@example.com");
  });

  it("should return 400 if input is invalid", async () => {
    const response = await request(app)
      .post("/users")
      .send({ firstName: 123, lastName: "Brown", email: "invalid-email" })
      .expect(400);

    expect(response.body.errors).toBeDefined();
    expect(response.body.errors.length).toBeGreaterThan(0);
  });
});

describe("PUT /users/:id", () => {
  let userId;

  beforeEach(async () => {
    const response = await request(app)
      .post("/users")
      .send({ firstName: "Charlie", lastName: "Brown", email: "charlie.brown@example.com" });
    userId = response.body.id; // Utilise `id` au lieu de `_id`
  });

  afterEach(async () => {
    await request(app).delete(`/users/${userId}`);
  });

  it("should update an existing user with valid input", async () => {
    const response = await request(app)
      .put(`/users/${userId}`)
      .send({ firstName: "Charles", lastName: "Brown", email: "charles.brown@example.com" })
      .expect(200);

    expect(response.body.firstName).toBe("Charles");
    expect(response.body.lastName).toBe("Brown");
    expect(response.body.email).toBe("charles.brown@example.com");
  });

  it("should return 400 if firstName is not a string", async () => {
    const response = await request(app)
      .put(`/users/${userId}`)
      .send({ firstName: 123, lastName: "Brown", email: "charlie.brown@example.com" })
      .expect(400);

    expect(response.body.errors).toBeDefined();
    expect(response.body.errors[0].msg).toBe("First name must be a string");
  });

  it("should return 400 if lastName is not a string", async () => {
    const response = await request(app)
      .put(`/users/${userId}`)
      .send({ firstName: "Charlie", lastName: 123, email: "charlie.brown@example.com" })
      .expect(400);

    expect(response.body.errors).toBeDefined();
    expect(response.body.errors[0].msg).toBe("Last name must be a string");
  });

  it("should return 400 if email is not valid", async () => {
    const response = await request(app)
      .put(`/users/${userId}`)
      .send({ firstName: "Charlie", lastName: "Brown", email: "invalid-email" })
      .expect(400);

    expect(response.body.errors).toBeDefined();
    expect(response.body.errors[0].msg).toBe("Email must be valid");
  });

  it("should return 404 if user does not exist", async () => {
    const invalidId = new mongoose.Types.ObjectId();
    const response = await request(app)
      .put(`/users/${invalidId}`)
      .send({ firstName: "Charlie", lastName: "Brown", email: "charlie.brown@example.com" })
      .expect(404);

    expect(response.body.error).toBe("User not found");
  });

  it("should return 400 if ID is invalid", async () => {
    const response = await request(app)
      .put("/users/invalid-id")
      .send({ firstName: "Charlie", lastName: "Brown", email: "charlie.brown@example.com" })
      .expect(400);

    expect(response.body.error).toBe("Invalid user ID");
  });
});

describe("DELETE /users/:id", () => {
  let userId;

  beforeEach(async () => {
    const response = await request(app)
      .post("/users")
      .send({ firstName: "Charlie", lastName: "Brown", email: "charlie.brown@example.com" });
    userId = response.body.id; // Utilise `id` au lieu de `_id`
  });

  it("should delete an existing user", async () => {
    await request(app).delete(`/users/${userId}`).expect(204);

    const response = await request(app).get(`/users/${userId}`).expect(404);
    expect(response.body.error).toBe("User not found");
  });

  it("should return 404 if user does not exist", async () => {
    const invalidId = new mongoose.Types.ObjectId();
    const response = await request(app).delete(`/users/${invalidId}`).expect(404);

    expect(response.body.error).toBe("User not found");
  });

  it("should return 400 if ID is invalid", async () => {
    const response = await request(app).delete("/users/invalid-id").expect(400);

    expect(response.body.error).toBe("Invalid user ID");
  });
});
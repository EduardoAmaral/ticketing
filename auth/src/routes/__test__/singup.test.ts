import request from "supertest";
import app from "../../app";

describe("SignUp Router", () => {
  it("returns a 201 on successful singup", () => {
    return request(app)
      .post("/api/users/signup")
      .send({
        email: "test@test.com",
        password: "password",
      })
      .expect(201);
  });
});

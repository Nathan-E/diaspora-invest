const request = require("supertest");
const httpStatus = require("http-status");
const bcrypt = require("bcrypt");
const chai = require("chai"); // eslint-disable-line import/newline-after-import
const expect = chai.expect;
const User = require("../models/user.model");
const Post = require("../models/post.model");
const app = require("../index");

chai.config.includeStack = true;

/**
 * root level hooks
 */
afterAll(async () => {
  await User.deleteMany({});
});

describe("## User APIs", () => {
  let userAccessToken;
  let user;
  let user2;
  let newUser;
  const password = "123yuq74ex56";

  beforeEach(async () => {
    const passwordHashed = await bcrypt.hash(password, 1);

    newUser = {
      name: "John Doe",
      username: "newbie",
      mobileNumber: "38298920",
      email: "k3k123@test.com",
      password: "11kk1234"
    };

    user = {
      name: "Prince Brad",
      username: "KK123",
      mobileNumber: "21020191",
      email: "kk123@test.com",
      password: passwordHashed,
    };

    user2 = {
      name: "Drew Click",
      username: "KK12343", 
      mobileNumber: "21020192",
      email: "hello@world.com",
      password: passwordHashed,
    };
    await User.deleteMany({});
    await User.insertMany([user, user2]);
    user.password = password;

    const userObj = await User.findOne({ email: user.email });

    userAccessToken = userObj.token();
  });

  describe("# POST /api/v1/users", () => {
    it("should create a new user and generate a token for the user on sign up", () => {
      return request(app)
        .post("/api/v1/users")
        .send(newUser)
        .then(res => {
          expect(res.body.payload.username).to.equal(newUser.username);
          expect(res.body.payload.mobileNumber).to.equal(newUser.mobileNumber);
          expect(res.body.payload.email).to.equal(newUser.email)
          expect(res.body.token).to.exist;
        })
    });

    it('should report error with message - "username already exist", when username already exists', () => {
      return request(app)
        .post("/api/v1/users")
        .send(user2)
        .then(res => {
          expect(res.body.message).to.equal("username already exist");
          expect(res.body.statusCode).to.equal(400);
        })
    });

    it('should report error with message - "email already exist", when email already exists', done => {
      user2.username = "KK1234";
      user2.email = "kk123@test.com";
      return request(app)
        .post("/api/v1/users")
        .send(user2)
        .then(res => {
          expect(res.body.message).to.equal("email already exist");
          expect(res.body.statusCode).to.equal(400);
          done();
        })
        .catch(done);
    });

    it('should report error with message - "Invalid mobile number", when mobile number has alphabet(s)', done => {
      user2.username = 'KK12345';
      user2.mobileNumber = '12345t67845';
      return request(app)
        .post('/api/v1/users')
        .send(user2)
        .then(res => {
          expect(res.body.errors['mobileNumber']).to.equal('mobile number must contain numbers only');
          expect(res.body.statusCode).to.equal(400);
          done();
        })
        .catch(done);
    });

    it('should return error with message - "Invalid mobile number", when mall the input fields are invalid', done => {
      user2.username = 'K34';
      user2.email = "helloworld.com";
      return request(app)
        .post('/api/v1/users')
        .send(user2)
        .then(res => {
          expect(res.body.errors['username']).to.equal('username length must be at least 4 characters long');
          expect(res.body.errors['email']).to.equal("email must be a valid email");
          expect(res.body.statusCode).to.equal(400);
          done();
        })
        .catch(done);
    });
  });

  describe("# POST /api/v1/users/profile-setup/:userId", () => {
    it("should update user details", async done => {
      const updateUser = {
        dueDateStart: "2019-10-10",
        dueDateEnd: "2020-07-10",
        userInterest: [
          "5d133c958563b08edb38b9d1",
          "5d133c958563b08edb38b9d2"
        ],
        hasBirthHospital: true,
        hasHealthMaintenanceOrg: true
      };
      delete user.password;
      const id = (await User.findOne(user))._id;
      return request(app)
        .put(`/api/v1/users/profile-setup/${id}`)
        .set("Authorization", `Bearer ${userAccessToken}`)
        .send(updateUser)
        .expect(httpStatus.OK)
        .then(res => {
          expect(res.body.payload.userInterest).to.eql(["5d133c958563b08edb38b9d1", "5d133c958563b08edb38b9d2"]);
          expect(res.body.payload.dueDateStart).to.equal("2019-10-10T00:00:00.000Z");
          expect(res.body.payload.dueDateEnd).to.equal("2020-07-10T00:00:00.000Z");
          expect(res.body.payload.hasBirthHospital).to.equal(true);
          expect(res.body.payload.hasHealthMaintenanceOrg).to.equal(true);
          expect(res.body.payload.hasInterestInAntenatalServices).to.equal(false);
          done();
        })
        .catch(done);
    });   
  });

  describe("# GET /api/v1/users/:userId", () => {
    it("should get user details", async done => {
      delete user.password;
      const id = (await User.findOne(user))._id;
      return request(app)
        .get(`/api/v1/users/${id}`)
        .set("Authorization", `Bearer ${userAccessToken}`)
        .then(res => {
          expect(res.body.payload.username).to.equal(user.username);
          expect(res.body.payload.mobileNumber).to.equal(user.mobileNumber);
          expect(res.body.payload.email).to.equal(user.email);
          done();
        })
        .catch(done);
    });

    it("should report error with message - Not found, when user does not exists", done => {
      return request(app)
        .get("/api/v1/users/56c787ccc67fc16ccc1a5e92")
        .send({})
        .then(res => {
          expect(res.body.message).to.equal("No such user exists!");
          done();
        })
        .catch(done);
    });
  });



  describe("# GET /api/v1/users/:userId/posts", () => {
    it("should return only the user's posts", async done => {
      delete user.password;
      const id = (await User.findOne(user))._id;
      let post = { topic: 'Hello World', description: 'I want to go home', category: '5d144f60bcfd65b270f8c755', user: id, likes: [] };
      await Post.insertMany([post, {...post}, {...post, user: '5d144f60bcfd65b270f8c755'}]);
      return request(app)
        .get(`/api/v1/users/${id}/posts`)
        .set("Authorization", `Bearer ${userAccessToken}`)
        .then(res => {
          expect(res.body.payload.length).to.equal(2);
          expect(res.body.payload[0]["noOfComments"]).to.equal(0);
          done();
        })
        .catch(done);
    });
    it("should return only the user's undeleted posts", async done => {
      delete user.password;
      const id = (await User.findOne(user))._id;
      let post = { topic: 'Hello World', description: 'I want to go home', category: '5d144f60bcfd65b270f8c755', user: id };
      await Post.insertMany([post, {...post, deleted: true}]);
      return request(app)
        .get(`/api/v1/users/${id}/posts`)
        .set("Authorization", `Bearer ${userAccessToken}`)
        .then(res => {
          expect(res.body.payload.length).to.equal(1);
          done();
        })
        .catch(done);
    });
  });

  describe("# PUT /api/v1/users/:userId", () => {
    it("should update user details", async done => {
      const updateUser = { address: "jupiter" };
      delete user.password;
      const id = (await User.findOne(user))._id;

      return request(app)
        .put(`/api/v1/users/${id}`)
        .set("Authorization", `Bearer ${userAccessToken}`)
        .send(updateUser)
        .expect(httpStatus.OK)
        .then(res => {
          expect(res.body.payload.address).to.equal("jupiter");
          expect(res.body.payload.mobileNumber).to.equal(user.mobileNumber);
          done();
        })
        .catch(done);
    });
  });

  describe("# DELETE /api/v1/users/", () => {
    it("should delete user", async done => {
      delete user.password;
      const id = (await User.findOne(user))._id;
      return request(app)
        .delete(`/api/v1/users/${id}`)
        .set("Authorization", `Bearer ${userAccessToken}`)
        .then(res => {
          expect(res.body.payload.username).to.equal(`${id}KK123`);
          expect(res.body.payload.email).to.equal(`${id}${user.email}`);
          expect(res.body.payload.mobileNumber).to.equal(user.mobileNumber);
          expect(res.body.payload.deleted).to.equal(true);
          done();
        })
        .catch(done);
    });
  });
});

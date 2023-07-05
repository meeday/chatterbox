const jwt = require("jsonwebtoken");

const secret = "thisIsMySecretShhh";
const expiration = "3h";

module.exports = {
  authMiddleware: ({ req }) => {
    let token = req.body.token || req.query.token || req.headers.authorization;
    // ["Bearer", "<tokenvalue>"]
    if (req.headers.authorization) {
      token = token.split(" ").pop().trim();
    }

    if (!token) {
      return req;
    }
    try {
      const { data } = jwt.verify(token, secret, { maxAge: expiration });
      req.user = data;
    } catch (error) {
      console.log("Invalid token");
    }
    return req;
  },
  signToken: ({ username, _id }) => {
    return jwt.sign({ data: { username, _id } }, secret, {
      expiresIn: expiration,
    });
  },
};

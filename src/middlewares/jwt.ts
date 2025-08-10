import jwt from "jsonwebtoken";

interface IpayloadProps {
  id: string;
  email: string;
  role: string;
  iat: number;
  exp: number;
}

export const verifyToken = async (req) => {
  const bearerHeader = req.headers.authorization;
  if (bearerHeader) {
    const token = bearerHeader.split(" ")[1];
    const payload: string | jwt.JwtPayload = jwt.verify(
      token,
      process.env.JWT_SECRET
    );
    return payload as IpayloadProps;
  } else {
    throw new Error("Toekn not Valid");
  }
};

export const generateToken = async (id, email, role) => {
  try {
    return jwt.sign({ id, email, role }, process.env.JWT_SECRET, {
      expiresIn: "365d",
    });
  } catch (err) {
    console.log(err);
    throw err;
  }
};

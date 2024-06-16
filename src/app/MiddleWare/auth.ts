import jwt, { JwtPayload } from 'jsonwebtoken';
import catchAsync from '../Utills/catchAsync';
import { NextFunction, Request, Response } from 'express';
import config from '../config';
import { User } from '../modules/User/user.model';
import { TUserRole } from '../modules/User/user.interface';

export const auth = (...requiredRoles: TUserRole[]) => {
  return catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const accessToken = req.headers.authorization;
    if (!accessToken) {
      throw new Error('You have no access to this route');
    }
    //("Bearer token")
    const token = accessToken.split(' ')[1]; //Splits the accessToken string at each space character, resulting in an array with two elements: ["Bearer", "<token>"].

    const verfiedToken = jwt.verify(
      token as string,
      config.jwt_access_secret as string,
    );

    const { role, email } = verfiedToken as JwtPayload;

    const user = await User.findOne({ email });

    if (!user) {
      throw new Error('User not found');
    }

    if (!requiredRoles.includes(role)) {
      throw new Error('unauthorized');
    }

    req.user = verfiedToken as JwtPayload;
    next();
  });
};

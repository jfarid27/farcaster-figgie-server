import { createClient } from "@farcaster/quick-auth";
import express from "npm:express";

const client = createClient();

const domain = Deno.env.get('DOMAIN') ?? 'farggie.xyz';

export const verifySWIFJWT = (token: string) => client.verifyJwt({
  token: token as string,
  domain: domain
});

/**
 * Authenticate a SWIFT JWT token
 */
export const authenticateSWIFJWT = async (req: express.Request, res: express.Response, next: express.NextFunction) => {
  const token = req.headers.authorization;

  if (!token) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    const payload = await verifySWIFJWT(token as string);
    if (!payload) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    next();
  } catch (error) {
    console.error(error);
    return res.status(401).json({ error: 'Unauthorized' });
  }

};

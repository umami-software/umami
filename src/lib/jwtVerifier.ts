import { JwtRsaVerifier } from "aws-jwt-verify";


export const verifier = JwtRsaVerifier.create({
  issuer: process.env.COGNITO_ISSUER,
  audience: process.env.COGNITO_CLIENT_ID, 
  jwksUri:  process.env.COGNITO_JWKS_URI
});



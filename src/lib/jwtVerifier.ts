import { JwtRsaVerifier } from "aws-jwt-verify";


export const verifier = JwtRsaVerifier.create({
  issuer: process.env.COGNITO_ISSUER, // set this to the expected "iss" claim on your JWTs
  audience:null, // set this to the expected "aud" claim on your JWTs
  jwksUri:  process.env.COGNITO_JWKS_URI, // set this to the JWKS uri from your OpenID configuration
});



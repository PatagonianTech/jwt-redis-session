import type jwt from "jsonwebtoken";

/**
 * JWTSessionConfig. Configuration for JWTSession.
 * 
 * @param {Object} client - Redis client
 * @param {string} secretOrPrivateKey - Secret key for JWT. Used for signing and verifying JWT. In case of using a asymmetric key, you should use (for instance) the private_key.pem for this property and you must use the public_key.pem for secretOrPublicKey.
 * @param {string} secretOrPublicKey - Public key for JWT. Used for verifying JWT. In case of using a asymmetric key, you should use (for instance) the public_key.pem for this property and you must use the private_key.pem for secretOrPrivateKey.
 * @param {jwt.SignOptions} signOptions - Options for JWT sign method.
 * @param {string} keyspace - Prefix for Redis keys.
 * @param {number} maxAge - Max age for JWT token.
 * @param {string} requestKey - Key for JWT token in request object.
 * @param {string} requestArg - Argument for JWT token in request object.
 * @param {Function} sessionSerialize - Function for serialize session.
 * @param {Function} sessionDeserialize - Function for deserialize session.
 */
export interface JWTSessionConfig {
  client: Object;
  secretOrPrivateKey: string;
  secretOrPublicKey: string;
  signOptions?: jwt.SignOptions;
  keyspace?: string;
  maxAge?: number;
  requestKey?: string;
  requestArg?: string;
  sessionSerialize?: Function;
  sessionDeserialize?: Function;
}

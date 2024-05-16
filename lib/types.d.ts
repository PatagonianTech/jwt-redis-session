import type jwt from "jsonwebtoken";

export interface JWTSessionConfig {
  client: Object;
  secret: string;
  signOptions?: jwt.SignOptions;
  keyspace?: string;
  maxAge?: number;
  requestKey?: string;
  requestArg?: string;
  sessionSerialize?: Function;
  sessionDeserialize?: Function;
}

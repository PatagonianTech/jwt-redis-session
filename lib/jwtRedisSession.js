const reduce = require('lodash/reduce');
const extend = require('lodash/extend');
const noop = require('lodash/noop');
const jwt = require("jsonwebtoken");
const utils = require("./utils");


const sessionSerialize = function (session) {
	return reduce(session, function (memo, val, key) {
		if (typeof val !== "function" && key !== "id")
			memo[key] = val;
		return memo;
	}, {});
};

const sessionDeserialize = function (_o) {
	return Promise.resolve(session);
};

/**
 * Create a middleware for JWT Redis Session.
 * 
 * @typedef {import('./types.d.ts').JWTSessionConfig} JWTSessionConfig
 * 
 * @param {JWTSessionConfig} options 
 * @returns 
 */
module.exports = function (options) {

	if (!options.client || !options.secret)
		throw new Error("Redis client and secret required for JWT Redis Session!");

	options = {
		client: options.client,
		secret: options.secret,
		signOptions: options.signOptions,
		keyspace: options.keyspace || "sess:",
		maxAge: options.maxAge || 86400,
		requestKey: options.requestKey || "session",
		requestArg: options.requestArg || "accessToken",
		sessionSerialize: options.sessionSerialize || sessionSerialize,
		sessionDeserialize: options.sessionDeserialize || sessionDeserialize
	};

	const SessionUtils = utils(options);

	return function jwtRedisSession(req, _res, next) {

		req[options.requestKey] = new SessionUtils();

		let token;

		if(req.rawHeaders) {
			req.rawHeaders.forEach(function (elem, i, headers) {
				if (elem === 'Authorization' || elem === 'authorization') {
					token = headers[i + 1];
				}
			});
		}

		if (!token && req._query) {
			token = req._query[options.requestArg];
		}

		if (!token) {
			if (req.url) {
				const  urlParams = new URL(req.url, 'https://localhost/');

				if (urlParams.searchParams?.get('token')) {
					token = urlParams.searchParams.get('token');
				}	
			}
		}

		if (token) {
			jwt.verify(token, options.secret, function (error, decoded) {
				if (error || !decoded.jti)
					return next();
					
				options.client.get(options.keyspace + decoded.jti, function (err, session) {
					if (err || !session)
						return next();

					try {
						options.sessionDeserialize(JSON.parse(session)).then(function (session) {
							extend(req[options.requestKey], session);
							req[options.requestKey].claims = decoded;
							req[options.requestKey].id = decoded.jti;
							req[options.requestKey].jwt = token;
							// Update the TTL
							req[options.requestKey].touch(noop);
							next();
						}, function () { next(); });
					} catch (e) {
						return next();
					}
				});
			});
		} else {
			next();
		}
	};

};

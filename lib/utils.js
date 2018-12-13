

var _ = require("lodash"),
jwt = require("jsonwebtoken"),
uuid = require("node-uuid");


var extendSession = function(session, data){
_.reduce(data, function(memo, val, key){
	if(typeof val !== "function" && key !== "id")
		memo[key] = val;
	return memo;
}, session);
};

// these are bound to the session
module.exports = function(options){

var SessionUtils = function(){};

_.extend(SessionUtils.prototype, {

	// create a new session and return the jwt
	create: function(claims, callback){
		if(typeof claims === "function" && !callback){
			callback = claims;
			claims = {};
		}
		var self = this,
			sid = uuid.v4();
		var token = jwt.sign(_.extend({ jti: sid }, claims || {}), options.secret, { algorithm: options.algorithm });
		options.client.setex(options.keyspace + sid, options.maxAge, JSON.stringify(options.sessionSerialize(self)), function(error){
			self.id = sid;
			callback(error, token);
		});
	},

	// update the TTL on a session
	touch: function(callback){
		if(!this.id){
			return process.nextTick(function(){
				callback(new Error("Invalid session ID"));
			});
		}
		options.client.expire(options.keyspace + this.id, options.maxAge, callback);
	},

	// update a session's data, update the ttl
	update: function(callback){
		if(!this.id){
			return process.nextTick(function(){
				callback(new Error("Invalid session ID"));
			});
		}
		options.client.setex(options.keyspace + this.id, options.maxAge, JSON.stringify(options.sessionSerialize(this)), callback);
	},

	// reload a session data from redis
	reload: function(callback){
		var self = this;
		if(!this.id){
			return process.nextTick(function(){
				callback(new Error("Invalid session ID"));
			});
		}

		options.client.get(options.keyspace + self.id, function(error, resp){
			if(error)
				return callback(error);
			try{
				options.sessionDeserialize(JSON.parse(resp)).then(function(session) {
					extendSession(self, session);
					callback();
				});
			}catch(e){
				return callback(e);
			}
		});
	},

	// destroy a session
	destroy: function(callback){
		if(!this.id){
			return process.nextTick(function(){
				callback(new Error("Invalid session ID"));
			});
		}
		options.client.del(options.keyspace + this.id, callback);
	},

	toJSON: function(){
		return options.sessionSerialize(this);
	}

});

return SessionUtils;
};
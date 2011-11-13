var crypto = require('crypto');

function define (mongoose, fn) {
    var Schema = mongoose.Schema,
        ObjectId = Schema.ObjectId;

    // User Model
    var User = new Schema({
        name: { type: String, index: { unique: true }},
        email: String,
        website: String,
        hashed_password: String,
        salt: String
    });

    /* virtual */
    User.virtual('id').get(function() {
        return this._id.toHexString();
    });

    User.virtual('password').set(function (pw) {

        this._password = pw;
        this.salt = this.createSalt();
        this.hashed_password = this.encryptPassword(pw);

    }).get(function () {
        return this._password;
    }); 

    User.pre('save', function (next) {
        next();
    });

    /* methods */
    User.method('createSalt', function() {
        return Math.round((new Date().valueOf() * Math.random())) + '';
    });

    User.method('encryptPassword', function (str) {
        return crypto.createHmac('sha1', this.salt).update(str).digest('hex');
    });

    User.method('authenticate', function (plain) {
        return this.encryptPassword(plain) === this.hashed_password;
    });

    // LoginToken model
    LoginToken = new Schema({
        email: { type: String, index: true },
        series: { type: String, index: true },
        token: { type: String, index: true }
    });

    LoginToken.virtual('id').get(function() {
        return this._id.toHexString();
    });

    LoginToken.virtual('cookieValue').get(function() {
        return JSON.stringify({
            email: this.email,
            token: this.token,
            series: this.series
        });
    });

    LoginToken.method('randomToken', function() {
        return Math.round((new Date().valueOf() * Math.random())) + '';
    });

    LoginToken.pre('save', function (next) {
        this.token = this.randomToken();
        this.series = this.randomToken();
        next();
    });

    // export models
    mongoose.model('User', User);
    mongoose.model('LoginToken', LoginToken);

    fn();
}

exports.define = define;

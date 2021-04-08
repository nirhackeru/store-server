const mongoose = require('mongoose')
const crypto = require('crypto')
const {v4:uuidv4} = require('uuid')
const { ObjectId } = mongoose.Schema;

const userSchema = new mongoose.Schema({
    name:{
        type:String,
        trim:true,
        required:true,
        maxlength:50
    },
    email:{
        type:String,
        trim:true,
        required:true,
        unique:true,
        maxlength:100
    },
    hashed_password:{
        type:String,
        required:true
    },
    solt:String,
    about:{
        type:String,
        trim:true,
        maxlength:250
    },
    history:{
        type:Array,
        default:[]
    },
    role:{
        type:Number,
        default:0
    },
    cart: {
        type: Array,
        default: [],
      },
    address: String,
    wishlist: [{ type: ObjectId, ref: "Product" }],
},{timestamps:true})

//virtual field
userSchema.virtual('password').set(function(password){
    this._password = password
    this.solt = uuidv4()
    this.hashed_password = this.encryptPassword(password)
}).get(function(){
    return this._password
})

userSchema.methods = {

    authenticate: function(plainText){
        return this.encryptPassword(plainText) === this.hashed_password
    },

    encryptPassword: function(password){
        if (!password) return '';
        try{
            return crypto.createHmac('sha1',this.solt).update(password).digest('hex')
        } catch(err){
            return ''
        }
    }
}

module.exports = mongoose.model("User", userSchema)


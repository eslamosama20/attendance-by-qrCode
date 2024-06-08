const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

// 1-create schema
const lecturerSchema = new mongoose.Schema(
  {
    name : {
        type :String,
        required : [true, 'name is required'],
        // unique:[true,'the name must be unique'],
        minLength : [3, 'name must be at least 3 characters'],                                                                                                          
        maxLength : [100, 'name is too long']
    },
    email: {
      type: String,
      required: [true, "email required"],
      unique: true,
      lowercase: true,
    },
    phone: String,
    profileImage: String,
    password: {
      type: String,
      required: [true, "password required"],
      minlength: [8, "too short pasword"],
    },
    passwordChangedAt: Date,
    role: {
      type: String,
      enum: ["user", "admin" , "manager"],
      default: "admin",
    },
    passwordRessetCode:String,
    passwordRessetExpires:Date,
    passwordResetVerified:Boolean,
    active: {
      type: Boolean,
      default: true,
    },
    // A and B =>shopping.com/a-and-b
programme:{
        type :String,
        required:[true,'programme is required']
    },
    courses :[{
      type:mongoose.Schema.ObjectId,
      ref:'course'
  }],
   
}, 
  { timestamps: true }
);


lecturerSchema.pre(/^find/,function (next){
    this.populate({
        path :'courses',
        select:'name-_id'
    })
    next()
});

//return image as URL
const setImageUrl = (doc)=>{
  if(doc.image){
    const imageUrl = `${process.env.BASE_URL}/Lecturers/${doc.image}`
    doc.image = imageUrl;
  }
}
//getAll - getOne - Update
lecturerSchema.post('init', (doc)=>{
  setImageUrl(doc)
})
//create
lecturerSchema.post('save', (doc)=>{
  setImageUrl(doc)
})
lecturerSchema.pre("save", async function (next) {
  if (!this.isModified('password'))
  return  next()
   this.password = await bcrypt.hash(this.password, 12);
  next();
});

// 2-create model
const lecturerModel = mongoose.model("lecturer", lecturerSchema);
module.exports = lecturerModel;

const mongoose = require("mongoose");

const employeeSchema = new mongoose.Schema({
  code: { type: String, required: true },           
  fullName: { type: String, required: true },      
  fullNameEN: String,                                
  department: String,                                
  nickname: String,                                  
  company: String,                                   
  email: { type: String, lowercase: true, trim: true },  
  username: String,                                  
  macaddr: String,                                
  phone: String,                                     
  status: String                                     
}, {
  timestamps: true  
});

const Aruba = mongoose.model("Employees", employeeSchema);

module.exports = Aruba;

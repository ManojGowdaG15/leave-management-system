
import Employee from "../models/employeeModel.js";

export const createEmployee = async(req,res)=>{
  const emp = await Employee.create(req.body);
  res.json(emp);
}
export const getEmployees = async(req,res)=>{
  res.json(await Employee.find().sort({createdAt:-1}));
}
export const getEmployee = async(req,res)=>{
  res.json(await Employee.findById(req.params.id));
}
export const updateEmployee = async(req,res)=>{
  res.json(await Employee.findByIdAndUpdate(req.params.id, req.body,{new:true}));
}
export const deleteEmployee = async(req,res)=>{
  await Employee.findByIdAndDelete(req.params.id);
  res.json({message:"Deleted"});
}

import mongoose from 'mongoose';
import Department from './models/Department.js';
import dotenv from 'dotenv';

dotenv.config();

const departments = [
  {
    name: "Engineering",
    code: "ENG",
    description: "Software development and engineering team"
  },
  {
    name: "Sales",
    code: "SAL",
    description: "Sales and business development"
  },
  {
    name: "Marketing",
    code: "MKT",
    description: "Marketing and communications"
  },
  {
    name: "Human Resources",
    code: "HR",
    description: "Human resources and talent management"
  },
  {
    name: "Finance",
    code: "FIN",
    description: "Finance and accounting department"
  },
  {
    name: "Operations",
    code: "OPS",
    description: "Operations and administration"
  },
  {
    name: "Product Management",
    code: "PM",
    description: "Product management and strategy"
  },
  {
    name: "Quality Assurance",
    code: "QA",
    description: "Quality assurance and testing"
  },
  {
    name: "Customer Support",
    code: "CS",
    description: "Customer support and service"
  },
  {
    name: "Research & Development",
    code: "R&D",
    description: "Research and development"
  },
  {
    name: "Information Technology",
    code: "IT",
    description: "IT infrastructure and support"
  },
  {
    name: "Legal",
    code: "LEG",
    description: "Legal and compliance"
  }
];

const seedDepartments = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Clear existing departments
    await Department.deleteMany({});
    console.log('Cleared existing departments');

    // Insert new departments
    await Department.insertMany(departments);
    console.log('Successfully seeded departments');

    process.exit(0);
  } catch (error) {
    console.error('Error seeding departments:', error);
    process.exit(1);
  }
};

seedDepartments();
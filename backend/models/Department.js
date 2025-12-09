const mongoose = require('mongoose');

const departmentSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    manager: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    description: {
        type: String,
        trim: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

// Update the updatedAt field on save
departmentSchema.pre('save', function(next) {
    this.updatedAt = Date.now();
    next();
});

const Department = mongoose.model('Department', departmentSchema);

// Create default departments if none exist
Department.countDocuments({})
    .then(count => {
        if (count === 0) {
            const defaultDepartments = [
                { name: 'Human Resources', description: 'HR Department' },
                { name: 'Engineering', description: 'Software Engineering' },
                { name: 'Sales', description: 'Sales and Marketing' },
                { name: 'Finance', description: 'Finance and Accounting' },
                { name: 'Operations', description: 'Operations Management' }
            ];
            
            return Department.insertMany(defaultDepartments);
        }
    })
    .then(() => console.log('✅ Departments initialized'))
    .catch(err => console.error('❌ Error initializing departments:', err));

module.exports = Department;
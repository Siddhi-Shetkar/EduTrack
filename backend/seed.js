const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Student = require('./models/Student');
const Attendance = require('./models/Attendance');

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/student_attendance';

const seedData = async () => {
    try {
        await mongoose.connect(MONGODB_URI);
        console.log('MongoDB connected');

        // Clear existing data
        await Student.deleteMany({});
        await Attendance.deleteMany({});
        console.log('Cleared existing data');

        const students = [
            { name: "Rahul Sharma", rollNumber: "1601247373161", className: "B.Tech IT - 2nd Year" },
            { name: "Priya Patel", rollNumber: "1601247373162", className: "B.Tech IT - 2nd Year" },
            { name: "Amit Kumar", rollNumber: "1601247373163", className: "B.Tech IT - 2nd Year" },
            { name: "Sneha Gupta", rollNumber: "1601247373164", className: "B.Tech IT - 2nd Year" },
            { name: "Vikram Singh", rollNumber: "1601247373165", className: "B.Tech IT - 2nd Year" },
            { name: "Aditi Desai", rollNumber: "1601247333001", className: "B.Tech CSE - 2nd Year" },
            { name: "Rohan Verma", rollNumber: "1601247333002", className: "B.Tech CSE - 2nd Year" }
        ];

        await Student.insertMany(students);
        console.log('Inserted B.Tech students');

        process.exit();
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

seedData();

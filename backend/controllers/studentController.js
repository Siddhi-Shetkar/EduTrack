const Student = require('../models/Student');

// Get all students
exports.getStudents = async (req, res) => {
  try {
    const { className } = req.query;
    const filter = className ? { className } : {};
    const students = await Student.find(filter).sort({ rollNumber: 1 });
    res.status(200).json(students);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching students', error: error.message });
  }
};

// Get single student
exports.getStudent = async (req, res) => {
  try {
    const student = await Student.findById(req.params.id);
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }
    res.status(200).json(student);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching student', error: error.message });
  }
};

// Create new student
exports.createStudent = async (req, res) => {
  try {
    const { name, rollNumber, className } = req.body;
    
    // Check if roll number already exists
    const existingStudent = await Student.findOne({ rollNumber });
    if (existingStudent) {
      return res.status(400).json({ message: 'Student with this roll number already exists' });
    }

    const newStudent = new Student({
      name,
      rollNumber,
      className
    });

    const savedStudent = await newStudent.save();
    res.status(201).json(savedStudent);
  } catch (error) {
    res.status(500).json({ message: 'Error creating student', error: error.message });
  }
};

// Update student
exports.updateStudent = async (req, res) => {
  try {
    const { name, rollNumber, className } = req.body;
    const updatedStudent = await Student.findByIdAndUpdate(
      req.params.id,
      { name, rollNumber, className },
      { new: true, runValidators: true }
    );
    
    if (!updatedStudent) {
      return res.status(404).json({ message: 'Student not found' });
    }
    
    res.status(200).json(updatedStudent);
  } catch (error) {
    res.status(500).json({ message: 'Error updating student', error: error.message });
  }
};

// Delete student
exports.deleteStudent = async (req, res) => {
  try {
    const deletedStudent = await Student.findByIdAndDelete(req.params.id);
    if (!deletedStudent) {
      return res.status(404).json({ message: 'Student not found' });
    }
    res.status(200).json({ message: 'Student deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting student', error: error.message });
  }
};

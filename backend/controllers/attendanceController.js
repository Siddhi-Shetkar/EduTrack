const Attendance = require('../models/Attendance');

// Mark or Update Attendance
exports.markAttendance = async (req, res) => {
  try {
    const { date, className, records } = req.body;

    // Check if attendance already exists for this date and class
    let attendance = await Attendance.findOne({ date: new Date(date), className });

    if (attendance) {
      // Update existing
      attendance.records = records;
      await attendance.save();
      return res.status(200).json({ message: 'Attendance updated successfully', attendance });
    } else {
      // Create new
      attendance = new Attendance({
        date: new Date(date),
        className,
        records
      });
      await attendance.save();
      return res.status(201).json({ message: 'Attendance marked successfully', attendance });
    }
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ message: 'Attendance already exists for this class on this date. Please update instead.' });
    }
    res.status(500).json({ message: 'Error marking attendance', error: error.message });
  }
};

// Get Attendance by Date and Class
exports.getAttendance = async (req, res) => {
  try {
    const { date, className } = req.query;
    
    if (!date || !className) {
      return res.status(400).json({ message: 'Date and className are required query parameters' });
    }

    const attendance = await Attendance.findOne({ 
      date: new Date(date), 
      className 
    }).populate('records.student', 'name rollNumber');

    if (!attendance) {
      return res.status(404).json({ message: 'No attendance records found for this date and class' });
    }

    res.status(200).json(attendance);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching attendance', error: error.message });
  }
};

// Get Attendance Report (e.g. for a specific class over a date range)
exports.getReport = async (req, res) => {
  try {
    const { startDate, endDate, className } = req.query;

    let query = {};
    if (className) query.className = className;
    if (startDate && endDate) {
      query.date = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }

    const attendanceRecords = await Attendance.find(query).populate('records.student', 'name rollNumber');
    
    // Process data to calculate percentages
    const reportData = processReportData(attendanceRecords);
    
    res.status(200).json(reportData);
  } catch (error) {
    res.status(500).json({ message: 'Error generating report', error: error.message });
  }
};

// Helper function to process report data
function processReportData(attendanceRecords) {
  const studentStats = {};

  attendanceRecords.forEach(record => {
    record.records.forEach(studentRecord => {
      const studentId = studentRecord.student._id.toString();
      
      if (!studentStats[studentId]) {
        studentStats[studentId] = {
          student: studentRecord.student,
          presentCount: 0,
          absentCount: 0,
          lateCount: 0,
          totalClasses: 0
        };
      }

      studentStats[studentId].totalClasses++;
      
      if (studentRecord.status === 'Present') {
        studentStats[studentId].presentCount++;
      } else if (studentRecord.status === 'Absent') {
        studentStats[studentId].absentCount++;
      } else if (studentRecord.status === 'Late') {
        studentStats[studentId].lateCount++;
      }
    });
  });

  // Calculate percentages and format output
  const report = Object.values(studentStats).map(stat => {
    // Treat 'Late' as present for percentage calculation, or define custom logic. Let's count Late as present, but maybe half? 
    // Let's stick to simple: Present + Late / Total
    const presentTotal = stat.presentCount + stat.lateCount;
    const percentage = stat.totalClasses > 0 ? (presentTotal / stat.totalClasses) * 100 : 0;
    
    return {
      ...stat,
      percentage: percentage.toFixed(2)
    };
  });

  return report;
}

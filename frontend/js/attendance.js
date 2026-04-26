document.addEventListener('DOMContentLoaded', () => {
    const fetchStudentsBtn = document.getElementById('fetch-students-btn');
    const yearSelect = document.getElementById('year-select');
    const departmentSelect = document.getElementById('department-select');
    const dateSelect = document.getElementById('date-select');
    const attendanceListContainer = document.getElementById('attendance-list-container');
    const studentsTbody = document.getElementById('students-tbody');
    const markAllPresentBtn = document.getElementById('mark-all-present');
    const submitAttendanceBtn = document.getElementById('submit-attendance-btn');

    let currentStudents = [];

    // Set today as default date
    dateSelect.valueAsDate = new Date();

    fetchStudentsBtn.addEventListener('click', async () => {
        const year = yearSelect.value;
        const department = departmentSelect.value;
        const date = dateSelect.value;

        if (!year || !department || !date) {
            showToast('Please select year, department and date', 'error');
            return;
        }

        const className = `${department} - ${year}`;

        try {
            // 1. Fetch Students
            const studentRes = await fetch(`${API_BASE_URL}/students?className=${encodeURIComponent(className)}`);
            if (!studentRes.ok) throw new Error('Failed to fetch students');
            currentStudents = await studentRes.json();

            if (currentStudents.length === 0) {
                showToast('No students found for this class', 'error');
                attendanceListContainer.style.display = 'none';
                return;
            }

            // 2. Fetch existing attendance for this date (if any)
            let existingRecords = {};
            try {
                const attRes = await fetch(`${API_BASE_URL}/attendance?date=${date}&className=${encodeURIComponent(className)}`);
                if (attRes.ok) {
                    const attData = await attRes.json();
                    attData.records.forEach(r => {
                        existingRecords[r.student._id || r.student] = r.status;
                    });
                    showToast('Loaded existing attendance records', 'success');
                }
            } catch (e) {
                // It's ok if no existing attendance
            }

            renderStudentList(currentStudents, existingRecords);
            attendanceListContainer.style.display = 'block';

        } catch (error) {
            showToast(error.message, 'error');
        }
    });

    function renderStudentList(students, existingRecords = {}) {
        studentsTbody.innerHTML = '';
        
        students.forEach(student => {
            const tr = document.createElement('tr');
            
            // Determine default status
            const status = existingRecords[student._id] || 'Present';
            
            tr.innerHTML = `
                <td>${student.rollNumber}</td>
                <td>${student.name}</td>
                <td>
                    <div class="status-toggle" data-student-id="${student._id}">
                        <button class="status-btn ${status === 'Present' ? 'active present' : ''}" data-status="Present">Present</button>
                        <button class="status-btn ${status === 'Absent' ? 'active absent' : ''}" data-status="Absent">Absent</button>
                        <button class="status-btn ${status === 'Late' ? 'active late' : ''}" data-status="Late">Late</button>
                    </div>
                </td>
            `;
            studentsTbody.appendChild(tr);
        });

        // Add event listeners to toggle buttons
        document.querySelectorAll('.status-btn').forEach(btn => {
            btn.addEventListener('click', function() {
                const parent = this.parentElement;
                parent.querySelectorAll('.status-btn').forEach(b => {
                    b.classList.remove('active', 'present', 'absent', 'late');
                });
                
                const status = this.getAttribute('data-status');
                this.classList.add('active', status.toLowerCase());
            });
        });
    }

    markAllPresentBtn.addEventListener('click', () => {
        document.querySelectorAll('.status-toggle').forEach(toggle => {
            toggle.querySelectorAll('.status-btn').forEach(b => {
                b.classList.remove('active', 'present', 'absent', 'late');
                if (b.getAttribute('data-status') === 'Present') {
                    b.classList.add('active', 'present');
                }
            });
        });
    });

    submitAttendanceBtn.addEventListener('click', async () => {
        const year = yearSelect.value;
        const department = departmentSelect.value;
        const className = `${department} - ${year}`;
        const date = dateSelect.value;
        
        const records = [];
        document.querySelectorAll('.status-toggle').forEach(toggle => {
            const studentId = toggle.getAttribute('data-student-id');
            const activeBtn = toggle.querySelector('.status-btn.active');
            const status = activeBtn ? activeBtn.getAttribute('data-status') : 'Present';
            
            records.push({ student: studentId, status });
        });

        try {
            const res = await fetch(`${API_BASE_URL}/attendance/mark`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    date,
                    className,
                    records
                })
            });

            const data = await res.json();
            
            if (res.ok) {
                showToast(data.message, 'success');
            } else {
                throw new Error(data.message || 'Failed to submit attendance');
            }
        } catch (error) {
            showToast(error.message, 'error');
        }
    });
});

document.addEventListener('DOMContentLoaded', () => {
    // Elements
    const form = document.getElementById('add-student-form');
    const nameInput = document.getElementById('student-name');
    const rollInput = document.getElementById('student-roll');
    const yearSelect = document.getElementById('student-year');
    const deptSelect = document.getElementById('student-department');
    const tbody = document.getElementById('students-directory-tbody');
    const filterYearSelect = document.getElementById('filter-year');
    const filterDeptSelect = document.getElementById('filter-department');

    // State
    let allStudents = [];

    // Fetch students on load
    fetchStudents();

    // Event Listeners
    form.addEventListener('submit', handleAddStudent);
    const handleFilterChange = () => renderStudents(allStudents);
    filterYearSelect.addEventListener('change', handleFilterChange);
    filterDeptSelect.addEventListener('change', handleFilterChange);

    // Functions
    async function fetchStudents() {
        try {
            const response = await fetch(`${API_BASE_URL}/students`);
            if (!response.ok) {
                throw new Error('Failed to fetch students');
            }
            const data = await response.json();
            allStudents = data;
            renderStudents(allStudents);
        } catch (error) {
            console.error(error);
            showToast('Error loading students', 'danger');
            tbody.innerHTML = '<tr><td colspan="4" style="text-align: center; color: red;">Failed to load data</td></tr>';
        }
    }

    function renderStudents(students) {
        // Filter if year/dept are selected
        const filterYear = filterYearSelect.value;
        const filterDept = filterDeptSelect.value;
        let filteredStudents = students;
        
        if (filterYear || filterDept) {
            filteredStudents = students.filter(s => {
                if (!s.className) return false;
                
                let matchesYear = true;
                let matchesDept = true;
                
                if (filterYear) {
                    matchesYear = s.className.includes(filterYear);
                }
                
                if (filterDept) {
                    // Check if department string exists as a distinct word/part
                    matchesDept = s.className.includes(filterDept);
                }
                
                return matchesYear && matchesDept;
            });
        }

        tbody.innerHTML = '';

        if (filteredStudents.length === 0) {
            tbody.innerHTML = '<tr><td colspan="4" style="text-align: center;">No students found</td></tr>';
            return;
        }

        filteredStudents.forEach(student => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td><strong>${student.rollNumber}</strong></td>
                <td>${student.name}</td>
                <td><span class="badge" style="background-color: var(--primary-light); color: var(--primary-color); padding: 0.2rem 0.5rem; border-radius: 0.25rem;">${student.className}</span></td>
                <td>
                    <button class="btn btn-outline btn-sm delete-btn" data-id="${student._id}" style="color: var(--danger-color); border-color: var(--danger-color);">
                        <i class="fa-solid fa-trash"></i>
                    </button>
                </td>
            `;
            tbody.appendChild(tr);
        });

        // Add event listeners to delete buttons
        document.querySelectorAll('.delete-btn').forEach(btn => {
            btn.addEventListener('click', async (e) => {
                const btnElement = e.target.closest('button');
                const id = btnElement.getAttribute('data-id');
                if (confirm('Are you sure you want to delete this student?')) {
                    await deleteStudent(id);
                }
            });
        });
    }

    async function handleAddStudent(e) {
        e.preventDefault();

        if (!yearSelect.value || !deptSelect.value) {
            showToast('Please select both Year and Department', 'error');
            return;
        }

        const className = `${deptSelect.value} - ${yearSelect.value}`;

        const studentData = {
            name: nameInput.value.trim(),
            rollNumber: rollInput.value.trim(),
            className: className
        };

        try {
            const response = await fetch(`${API_BASE_URL}/students`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(studentData)
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.message || 'Failed to add student');
            }

            // Success
            showToast('Student added successfully!');
            form.reset();
            
            // Refresh the table
            await fetchStudents();

        } catch (error) {
            console.error(error);
            showToast(error.message, 'danger');
        }
    }

    async function deleteStudent(id) {
        try {
            const response = await fetch(`${API_BASE_URL}/students/${id}`, {
                method: 'DELETE'
            });

            if (!response.ok) {
                throw new Error('Failed to delete student');
            }

            showToast('Student deleted successfully');
            await fetchStudents();
            
        } catch (error) {
            console.error(error);
            showToast('Error deleting student', 'danger');
        }
    }
});

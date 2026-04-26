document.addEventListener('DOMContentLoaded', () => {
    const generateBtn = document.getElementById('generate-report-btn');
    const yearSelect = document.getElementById('report-year-select');
    const departmentSelect = document.getElementById('report-department-select');
    const startDateInput = document.getElementById('start-date');
    const endDateInput = document.getElementById('end-date');
    const resultsContainer = document.getElementById('report-results-container');
    const reportTbody = document.getElementById('report-tbody');
    const exportBtn = document.getElementById('export-csv-btn');

    let currentReportData = [];

    // Set default dates (last 7 days)
    const today = new Date();
    const lastWeek = new Date(today);
    lastWeek.setDate(lastWeek.getDate() - 7);
    
    endDateInput.valueAsDate = today;
    startDateInput.valueAsDate = lastWeek;

    generateBtn.addEventListener('click', async () => {
        const year = yearSelect.value;
        const department = departmentSelect.value;
        const startDate = startDateInput.value;
        const endDate = endDateInput.value;

        if (!year || !department) {
            showToast('Please select Year and Department', 'error');
            return;
        }

        const className = `${department} - ${year}`;

        try {
            const res = await fetch(`${API_BASE_URL}/attendance/report?className=${encodeURIComponent(className)}&startDate=${startDate}&endDate=${endDate}`);
            
            if (!res.ok) throw new Error('Failed to fetch report');
            
            currentReportData = await res.json();
            
            if (currentReportData.length === 0) {
                showToast('No attendance records found for this period', 'warning');
                resultsContainer.style.display = 'none';
                return;
            }

            renderReport(currentReportData);
            resultsContainer.style.display = 'block';
            showToast('Report generated successfully', 'success');
            
        } catch (error) {
            showToast(error.message, 'error');
        }
    });

    function renderReport(data) {
        reportTbody.innerHTML = '';
        
        // Sort by roll number
        data.sort((a, b) => a.student.rollNumber.localeCompare(b.student.rollNumber));

        data.forEach(stat => {
            const tr = document.createElement('tr');
            
            // Determine color based on percentage
            let percentClass = 'success';
            if (stat.percentage < 75) percentClass = 'danger';
            else if (stat.percentage < 85) percentClass = 'warning';

            tr.innerHTML = `
                <td>${stat.student.rollNumber}</td>
                <td>${stat.student.name}</td>
                <td>${stat.totalClasses}</td>
                <td><span class="status-badge present">${stat.presentCount}</span></td>
                <td><span class="status-badge absent">${stat.absentCount}</span></td>
                <td><span class="status-badge late">${stat.lateCount}</span></td>
                <td><strong class="text-${percentClass}">${stat.percentage}%</strong></td>
            `;
            reportTbody.appendChild(tr);
        });
    }

    exportBtn.addEventListener('click', () => {
        if (currentReportData.length === 0) return;

        // Create CSV content
        let csvContent = "data:text/csv;charset=utf-8,";
        csvContent += "Roll Number,Student Name,Total Classes,Present,Absent,Late,Percentage\n";

        currentReportData.forEach(stat => {
            const row = [
                stat.student.rollNumber,
                `"${stat.student.name}"`, // Quote name in case of commas
                stat.totalClasses,
                stat.presentCount,
                stat.absentCount,
                stat.lateCount,
                `${stat.percentage}%`
            ].join(",");
            csvContent += row + "\n";
        });

        // Trigger download
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        
        const year = yearSelect.value;
        const department = departmentSelect.value;
        const className = `${department}_${year}`.replace(/\s+/g, '_');
        link.setAttribute("download", `attendance_report_${className}.csv`);
        document.body.appendChild(link);
        
        link.click();
        document.body.removeChild(link);
    });
});

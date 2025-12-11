const express = require('express');
const router = express.Router();
const db = require('../config/db');
const authenticate = require('../middleware/auth');

// GET team leave calendar data
router.get('/team-calendar', authenticate, async (req, res) => {
    try {
        // Assuming manager's ID is in req.user.id and they manage a team
        const managerId = req.user.id;

        // Get all team members managed by this manager
        const [teamMembers] = await db.query(
            `SELECT id, name FROM users WHERE manager_id = ?`,
            [managerId]
        );

        if (teamMembers.length === 0) {
            return res.json([]);
        }

        const teamMemberIds = teamMembers.map(member => member.id);
        const placeholders = teamMemberIds.map(() => '?').join(',');

        // Get all leaves for team members
        const [leaves] = await db.query(
            `SELECT 
                la.id,
                la.user_id,
                u.name as user_name,
                la.start_date,
                la.end_date,
                la.leave_type,
                la.reason,
                la.status,
                la.manager_comments
            FROM leave_applications la
            JOIN users u ON la.user_id = u.id
            WHERE la.user_id IN (${placeholders})
            AND la.status IN ('Pending', 'Approved')
            ORDER BY la.start_date`,
            teamMemberIds
        );

        // Format for calendar
        const calendarData = leaves.map(leave => {
            // Color coding based on status
            let color = '#FF6B6B'; // Default red for pending
            if (leave.status === 'Approved') {
                if (leave.leave_type === 'Casual') color = '#4ECDC4';
                else if (leave.leave_type === 'Sick') color = '#45B7D1';
                else if (leave.leave_type === 'Earned') color = '#96CEB4';
            }

            return {
                id: leave.id,
                title: `${leave.user_name} - ${leave.leave_type}`,
                start: new Date(leave.start_date),
                end: new Date(new Date(leave.end_date).setDate(new Date(leave.end_date).getDate() + 1)), // Add 1 day to include end date
                allDay: true,
                backgroundColor: color,
                borderColor: color,
                extendedProps: {
                    userId: leave.user_id,
                    userName: leave.user_name,
                    leaveType: leave.leave_type,
                    reason: leave.reason,
                    status: leave.status,
                    comments: leave.manager_comments
                }
            };
        });

        res.json(calendarData);

    } catch (error) {
        console.error('Error fetching team calendar:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

module.exports = router;
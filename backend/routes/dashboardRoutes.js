const express = require('express');
const router = express.Router();
const db = require('../config/db');
const authenticate = require('../middleware/auth');

// GET dashboard data
router.get('/', authenticate, async (req, res) => {
    try {
        const userId = req.user.id;
        const userRole = req.user.role;

        if (userRole === 'employee') {
            // Employee dashboard data
            const [leaveStats] = await db.query(
                `SELECT 
                    COUNT(*) as totalLeaves,
                    SUM(CASE WHEN status = 'Pending' THEN 1 ELSE 0 END) as pendingLeaves,
                    SUM(CASE WHEN status = 'Approved' THEN 1 ELSE 0 END) as approvedLeaves,
                    SUM(CASE WHEN status = 'Rejected' THEN 1 ELSE 0 END) as rejectedLeaves
                FROM leave_applications 
                WHERE user_id = ?`,
                [userId]
            );

            const [recentLeaves] = await db.query(
                `SELECT * FROM leave_applications 
                WHERE user_id = ? 
                ORDER BY applied_date DESC 
                LIMIT 5`,
                [userId]
            );

            const [balance] = await db.query(
                `SELECT casual_leaves, sick_leaves, earned_leaves 
                FROM leave_balance 
                WHERE user_id = ?`,
                [userId]
            );

            res.json({
                stats: {
                    totalLeaves: leaveStats[0]?.totalLeaves || 0,
                    pendingLeaves: leaveStats[0]?.pendingLeaves || 0,
                    approvedLeaves: leaveStats[0]?.approvedLeaves || 0,
                    rejectedLeaves: leaveStats[0]?.rejectedLeaves || 0
                },
                recentLeaves: recentLeaves || [],
                leaveBalance: balance[0] || { casual_leaves: 12, sick_leaves: 10, earned_leaves: 15 }
            });

        } else if (userRole === 'manager') {
            // Manager dashboard data
            const [teamMembers] = await db.query(
                `SELECT id FROM users WHERE manager_id = ?`,
                [userId]
            );

            const teamMemberIds = teamMembers.map(member => member.id);
            const placeholders = teamMemberIds.map(() => '?').join(',');

            let leaveStats = { totalLeaves: 0, pendingLeaves: 0, approvedLeaves: 0, rejectedLeaves: 0 };
            let recentLeaves = [];
            let pendingRequests = [];

            if (teamMemberIds.length > 0) {
                const [stats] = await db.query(
                    `SELECT 
                        COUNT(*) as totalLeaves,
                        SUM(CASE WHEN status = 'Pending' THEN 1 ELSE 0 END) as pendingLeaves,
                        SUM(CASE WHEN status = 'Approved' THEN 1 ELSE 0 END) as approvedLeaves,
                        SUM(CASE WHEN status = 'Rejected' THEN 1 ELSE 0 END) as rejectedLeaves
                    FROM leave_applications 
                    WHERE user_id IN (${placeholders})`,
                    teamMemberIds
                );

                const [recent] = await db.query(
                    `SELECT la.*, u.name as employee_name 
                    FROM leave_applications la
                    JOIN users u ON la.user_id = u.id
                    WHERE la.user_id IN (${placeholders})
                    ORDER BY la.applied_date DESC 
                    LIMIT 5`,
                    teamMemberIds
                );

                const [pending] = await db.query(
                    `SELECT la.*, u.name as employee_name, u.email as employee_email
                    FROM leave_applications la
                    JOIN users u ON la.user_id = u.id
                    WHERE la.user_id IN (${placeholders})
                    AND la.status = 'Pending'
                    ORDER BY la.applied_date ASC 
                    LIMIT 5`,
                    teamMemberIds
                );

                leaveStats = stats[0] || leaveStats;
                recentLeaves = recent || [];
                pendingRequests = pending || [];
            }

            res.json({
                stats: {
                    totalLeaves: leaveStats.totalLeaves || 0,
                    pendingLeaves: leaveStats.pendingLeaves || 0,
                    approvedLeaves: leaveStats.approvedLeaves || 0,
                    rejectedLeaves: leaveStats.rejectedLeaves || 0
                },
                recentLeaves: recentLeaves,
                pendingRequests: pendingRequests
            });
        } else {
            res.status(400).json({ error: 'Invalid user role' });
        }

    } catch (error) {
        console.error('Dashboard error:', error);
        res.status(500).json({ error: 'Failed to load dashboard data' });
    }
});

module.exports = router;
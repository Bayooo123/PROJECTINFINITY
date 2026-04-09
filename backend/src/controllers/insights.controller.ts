import { Request, Response } from 'express';
import { query } from '../config/db';

export const getDashboardStats = async (req: Request, res: Response) => {
    const { userId } = req.params;
    try {
        // Basic stats for MVP
        const attempts = await query(
            'SELECT COUNT(*) as total, SUM(CASE WHEN is_correct THEN 1 ELSE 0 END) as correct FROM attempts WHERE user_id = $1',
            [userId]
        );

        // Recent activity
        const recent = await query(
            'SELECT q.stem, a.is_correct, a.created_at FROM attempts a JOIN questions q ON a.question_id = q.id WHERE a.user_id = $1 ORDER BY a.created_at DESC LIMIT 5',
            [userId]
        );

        const total = parseInt(attempts.rows[0].total) || 0;
        const correct = parseInt(attempts.rows[0].correct) || 0;
        const mastery = total > 0 ? (correct / total) * 100 : 0;

        res.json({
            mastery: mastery.toFixed(1),
            totalAttempts: total,
            recentActivity: recent.rows
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to fetch insights' });
    }
};

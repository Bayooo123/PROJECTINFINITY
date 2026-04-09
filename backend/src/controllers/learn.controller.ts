import { Request, Response } from 'express';
import { query } from '../config/db';

export const getQuestions = async (req: Request, res: Response) => {
    // Retrieval-first: Fetch questions without explanations initially
    // In a real app, logic would lock explanation until attempted
    try {
        const result = await query('SELECT id, stem, type, principle_id, case_id FROM questions LIMIT 20');
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch questions' });
    }
};

export const submitAttempt = async (req: Request, res: Response) => {
    const { user_id, question_id, selected_option_id, is_correct } = req.body;
    try {
        await query(
            'INSERT INTO attempts (user_id, question_id, selected_option_id, is_correct) VALUES ($1, $2, $3, $4)',
            [user_id, question_id, selected_option_id, is_correct]
        );

        // After attempt, return the explanation/insight
        const insight = await query(
            'SELECT explanation FROM questions WHERE id = $1',
            [question_id]
        );

        res.json({
            success: true,
            feedback: is_correct ? 'Correct' : 'Incorrect',
            explanation: insight.rows[0]?.explanation
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to record attempt' });
    }
};

export const getPrinciples = async (req: Request, res: Response) => {
    try {
        const result = await query('SELECT * FROM principles WHERE id = $1', [req.params.id]);
        res.json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch principle' });
    }
};

import { Pool } from 'pg';
import dotenv from 'dotenv';
import path from 'path';

// Load env from the backend directory
dotenv.config({ path: path.join(__dirname, '.env') });

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

const seedData = async () => {
    try {
        console.log('Connecting to DB...');

        // 1. Create Topic: Tort Law
        const topicRes = await pool.query(
            `INSERT INTO topics (name) VALUES ($1) RETURNING id`,
            ['Tort Law']
        );
        const topicId = topicRes.rows[0].id;
        console.log(`Created Topic: Tort Law (${topicId})`);

        // 2. Create Principle: Duty of Care
        const principleRes = await pool.query(
            `INSERT INTO principles (topic_id, content, authority_ref) VALUES ($1, $2, $3) RETURNING id`,
            [topicId, 'A person owes a duty of care to their "neighbours" - persons who are so closely and directly affected by my act that I ought reasonably to have them in contemplation.', 'Donoghue v Stevenson [1932]']
        );
        const principleId = principleRes.rows[0].id;
        console.log(`Created Principle: Duty of Care (${principleId})`);

        // 3. Create Case: Donoghue v Stevenson
        const caseRes = await pool.query(
            `INSERT INTO cases (name, summary, year, principle_id) VALUES ($1, $2, $3, $4) RETURNING id`,
            ['Donoghue v Stevenson', 'Ms Donoghue drank ginger beer containing a decomposed snail. She fell ill. She had no contract with the manufacturer.', 1932, principleId]
        );
        const caseId = caseRes.rows[0].id;
        console.log(`Created Case: Donoghue v Stevenson (${caseId})`);

        // 4. Create Question: MCQ
        const options = JSON.stringify([
            { id: 'opt1', text: 'Only if there is a contract', is_correct: false },
            { id: 'opt2', text: 'To anyone who might be injured', is_correct: false },
            { id: 'opt3', text: 'To persons closely and directly affected by the act', is_correct: true },
            { id: 'opt4', text: 'Only to immediate family members', is_correct: false }
        ]);

        await pool.query(
            `INSERT INTO questions (principle_id, case_id, stem, explanation, type, options) VALUES ($1, $2, $3, $4, $5, $6)`,
            [
                principleId,
                caseId,
                'According to Lord Atkin in Donoghue v Stevenson, to whom is a duty of care owed?',
                'Lord Atkin established the "Neighbour Principle": You must take reasonable care to avoid acts or omissions which you can reasonably foresee would be likely to injure your neighbour.',
                'MCQ',
                options
            ]
        );
        console.log('Created Question: Duty of Care MCQ');

        console.log('Seeding Complete!');
    } catch (err) {
        console.error('Seeding failed:', err);
    } finally {
        pool.end();
    }
};

seedData();

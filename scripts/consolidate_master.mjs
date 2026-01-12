import fs from 'fs';
import path from 'path';

const dataDir = './data';
const masterFile = path.join(dataDir, 'bank_master.json');

// Files to merge
const filesToMerge = [
    'equity_topic_1.json',
    'land_batch_1.json',
    'land_batch_2.json',
    'land_batch_3.json',
    'land_batch_4.json',
    'land_batch_5.json',
    'land_batch_6.json',
    'land_batch_7.json',
    'contract_batch_1.json',
    'contract_batch_2.json',
    'const_batch_1.json',
    'const_batch_2.json',
    'my_questions.json' // This had the initial 100 equity questions
];

let allQuestions = [];
const seenQuestions = new Set();

filesToMerge.forEach(file => {
    const filePath = path.join(dataDir, file);
    if (fs.existsSync(filePath)) {
        try {
            const content = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
            content.forEach(q => {
                const qText = q.question_data.text.trim();
                if (!seenQuestions.has(qText)) {
                    seenQuestions.add(qText);
                    allQuestions.push(q);
                }
            });
            console.log(`Loaded ${content.length} questions from ${file}`);
        } catch (e) {
            console.error(`Error parsing ${file}: ${e.message}`);
        }
    } else {
        console.warn(`File not found: ${file}`);
    }
});

fs.writeFileSync(masterFile, JSON.stringify(allQuestions, null, 2));
console.log(`Total unique questions in bank_master.json: ${allQuestions.length}`);

import { Pinecone } from '@pinecone-database/pinecone';
import { generateEmbedding } from './geminiService';

// Initialize Pinecone client
const PINECONE_API_KEY = import.meta.env.VITE_PINECONE_API_KEY;
const PINECONE_INDEX_NAME = import.meta.env.VITE_PINECONE_INDEX_NAME || 'reforma';

if (!PINECONE_API_KEY) {
    console.warn('Pinecone API key not found. RAG features will be limited.');
}

const pinecone = new Pinecone({
    apiKey: PINECONE_API_KEY || ''
});

let index: any = null;

// Lazy initialization of index
const getIndex = async () => {
    if (!index && PINECONE_API_KEY) {
        index = pinecone.index(PINECONE_INDEX_NAME);
    }
    return index;
};

// --- Type Definitions ---

export interface CourseMaterial {
    id: string;
    course: string;
    topic: string;
    content: string;
    chunkIndex?: number;
    source?: string;
}

export interface PastQuestion {
    id: string;
    course: string;
    year: string;
    questionText: string;
    section?: string;
}

// --- Upsert Functions ---

/**
 * Upsert course material chunks to Pinecone
 */
export const upsertCourseMaterials = async (materials: CourseMaterial[]): Promise<void> => {
    const idx = await getIndex();
    if (!idx) throw new Error('Pinecone index not initialized');

    // Generate embeddings and prepare vectors
    const vectors = await Promise.all(
        materials.map(async (material) => {
            const embedding = await generateEmbedding(material.content);
            if (!embedding) throw new Error(`Failed to generate embedding for ${material.id}`);

            return {
                id: material.id,
                values: embedding,
                metadata: {
                    type: 'course_material',
                    course: material.course,
                    topic: material.topic,
                    content: material.content.substring(0, 1000), // Store first 1000 chars in metadata
                    chunk_index: material.chunkIndex || 0,
                    source: material.source || 'unknown'
                }
            };
        })
    );

    // Batch upsert (Pinecone handles batching internally)
    await idx.namespace('course_materials').upsert(vectors);
    console.log(`✓ Upserted ${vectors.length} course material chunks to Pinecone`);
};

/**
 * Upsert past questions to Pinecone
 */
export const upsertPastQuestions = async (questions: PastQuestion[]): Promise<void> => {
    const idx = await getIndex();
    if (!idx) throw new Error('Pinecone index not initialized');

    const vectors = await Promise.all(
        questions.map(async (question) => {
            const embedding = await generateEmbedding(question.questionText);
            if (!embedding) throw new Error(`Failed to generate embedding for ${question.id}`);

            return {
                id: question.id,
                values: embedding,
                metadata: {
                    type: 'past_question',
                    course: question.course,
                    year: question.year,
                    question_text: question.questionText,
                    section: question.section || 'General'
                }
            };
        })
    );

    await idx.upsert(vectors);
    console.log(`✓ Upserted ${vectors.length} past questions to Pinecone`);
};

// --- Search Functions ---

/**
 * Search for relevant course materials using vector similarity
 */
export const searchCourseMaterials = async (
    queryEmbedding: number[],
    course?: string,
    topK: number = 3
): Promise<any[]> => {
    const idx = await getIndex();
    if (!idx) return [];

    try {
        const filter: any = { type: { $eq: 'course_material' } };
        if (course) {
            filter.course = { $eq: course };
        }

        const results = await idx.namespace('course_materials').query({
            vector: queryEmbedding,
            topK,
            filter,
            includeMetadata: true
        });

        return results.matches.map((match: any) => ({
            id: match.id,
            content: match.metadata.content,
            course: match.metadata.course,
            topic: match.metadata.topic,
            similarity: match.score,
            source: match.metadata.source
        }));
    } catch (error) {
        console.error('Error searching course materials in Pinecone:', error);
        return [];
    }
};

/**
 * Search for relevant past questions using vector similarity
 */
export const searchPastQuestions = async (
    queryEmbedding: number[],
    course?: string,
    topK: number = 3
): Promise<any[]> => {
    const idx = await getIndex();
    if (!idx) return [];

    try {
        const filter: any = { type: { $eq: 'past_question' } };
        if (course) {
            filter.course = { $eq: course };
        }

        const results = await idx.query({
            vector: queryEmbedding,
            topK,
            filter,
            includeMetadata: true
        });

        return results.matches.map((match: any) => ({
            id: match.id,
            question_text: match.metadata.question_text,
            course: match.metadata.course,
            year: match.metadata.year,
            similarity: match.score
        }));
    } catch (error) {
        console.error('Error searching past questions in Pinecone:', error);
        return [];
    }
};

/**
 * Get index statistics
 */
export const getIndexStats = async (): Promise<any> => {
    const idx = await getIndex();
    if (!idx) return null;

    try {
        const stats = await idx.describeIndexStats();
        return stats;
    } catch (error) {
        console.error('Error fetching Pinecone stats:', error);
        return null;
    }
};


import { createClient } from '@supabase/supabase-js';

try {
    console.log('Attempting to create client with empty strings...');
    const client = createClient('', '');
    console.log('Client created successfully (unexpected if it should fail)');
} catch (error) {
    console.error('CRASHED:', error.message);
}

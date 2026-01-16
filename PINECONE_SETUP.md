# Pinecone Setup Guide

## Step 1: Create Pinecone Account

1. Go to [https://www.pinecone.io/](https://www.pinecone.io/)
2. Click **"Start Free"**
3. Sign up with your email or GitHub account
4. Verify your email

## Step 2: Create a Serverless Index

1. In the Pinecone console, click **"Create Index"**
2. Configure the index:
   ```
   Index Name: learned-rag
   Dimensions: 768
   Metric: cosine
   Cloud: AWS
   Region: us-east-1
   ```
3. Click **"Create Index"**

> [!NOTE]
> We use **768 dimensions** because Google's `text-embedding-004` model outputs 768-dimensional vectors.

## Step 3: Get Your API Key

1. In the Pinecone console, navigate to **"API Keys"**
2. Click **"Create API Key"**
3. Name it: `learned-production`
4. Copy the API key (you'll only see it once!)

## Step 4: Add to Environment Variables

Add these to your `.env.local` file:

```bash
# Pinecone Configuration
VITE_PINECONE_API_KEY=your_api_key_here
VITE_PINECONE_INDEX_NAME=learned-rag
```

## Step 5: Verify Setup

Run this test script to verify your connection:

```bash
node scripts/test_pinecone.mjs
```

You should see:
```
✓ Connected to Pinecone
✓ Index 'learned-rag' found
✓ Index stats: 0 vectors
```

---

## Index Structure

Your Pinecone index will store two types of vectors:

### Course Materials
```javascript
{
  id: "mat_uuid",
  values: [0.123, -0.456, ...], // 768 dimensions
  metadata: {
    type: "course_material",
    course: "Constitutional Law",
    topic: "Separation of Powers",
    content: "The doctrine of separation...",
    chunk_index: 0,
    source: "textbook_chapter_3.pdf"
  }
}
```

### Past Questions
```javascript
{
  id: "pq_uuid",
  values: [0.789, -0.234, ...], // 768 dimensions
  metadata: {
    type: "past_question",
    course: "Constitutional Law",
    year: "2023",
    question_text: "Discuss the principle of...",
    section: "Section A"
  }
}
```

---

## Free Tier Limits

- **100,000 vectors** (enough for ~200 textbooks)
- **Unlimited queries**
- **1 index**

For production scale (10M vectors), upgrade to **Standard plan** at $70/month.

---

## Next Steps

Once setup is complete:
1. Install Pinecone SDK: `npm install @pinecone-database/pinecone`
2. Create `services/pineconeService.ts`
3. Update `services/geminiService.ts` to use Pinecone

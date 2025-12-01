
import React, { useState } from 'react';
import { BlogPost } from '../types';
import { Clock, ArrowUpRight, ArrowLeft, User, Calendar } from 'lucide-react';

const BLOG_POSTS: BlogPost[] = [
  {
    id: '5',
    title: "Assumptions",
    excerpt: "A habit built on an assumption is a falsehood that has been translated into a lifestyle. Why data-driven decision making matters in your legal studies.",
    category: "Mindset",
    readTime: "4 min read",
    imageUrl: "https://picsum.photos/800/600?random=5",
    author: "Learned Team",
    date: "October 24, 2023",
    content: `
I didn’t assume I would have time to write this piece later, so I wrote it today.

Have you ever had an idea, a thought pattern, or a habit that you have probably held on to for weeks, months, and years? I am sure you have because that’s perfectly normal. It's normal to conclude too soon with little or no evidence in support of your chosen position. It happens every day.

Just today, I assumed that by randomly placing my hand in my locker, I would pull out a clean pair of socks. A little bit of background is needed here. I remember washing my socks, but I also remember wearing them, and if I am not mistaken, I also remember wearing a mixed pair yesterday, one dirty one clean. The implication of this was that I had to wear another mixed pair today. The consequences of my action were minimal. The socks weren’t necessarily really dirty.

But thinking about it again, **assumptions are costly**, and they are even costlier when we build habits around them. A habit built on an assumption is a falsehood that has been translated into a lifestyle.

As students, we all have our assumptions. We all have those ideas in our heads that we may not really be sure how they got there, but months down the line, they are now a part of our lives.

An academic assumption can be as simple as:
* "I can assimilate while listening to music."
* "I can afford not to listen during classes because I will still have time to copy my notes after the class."
* "I can afford to miss today's lectures because I will have time to catch up later."

What about in relation to past questions? Yes, I just heard someone say that they could pass their exams without looking at past questions in preparation. Okay, let’s get a bit closer to home; I just heard another person say that how intentional his friends are with their studies has no effect on him.

Whilst I admit that assumptions are a part of everyday life, before making one in relation to your studies, try counting the cost. What would be the implications of my assumption being wrong? A lower grade, a missed test, a complaint to the faculty office that may never be resolved, or much worse, your self-esteem crashing because of a poor grade and your perception of self being damaged long-term.

This is obviously not an attempt at scaring anyone; it's just a call to much more **data-driven decision-making**.

Before you conclude that you can afford to miss your class, try and think about the relevance of the information you might miss out on, the potential attendance issue that awaits those who miss lectures consistently enough, or even the test you might not get to write.

In essence, all I am saying is don’t come to conclusions too easily. Think about your actions and act appropriately.

### Let's test some of our assumptions against actual research

**"Group study sessions don't help me."**
Zhou et al. (2023) noted that students with lower academic preparation and lower baseline motivation demonstrated improved academic performance as a result of study group interventions.

Jain and Kapoor (2015) additionally pointed out that more heterogeneous peer groups have positive effects on individual grades, with high-ability peers accounting for most of the positive effect.

Slow down a bit. I am not asking you to start harassing Google Scholar to ascertain the best way to study and live your life as a student. I am simply advocating for more thoughtfulness. Ask yourself:
* Do I have a track record of being successful doing things this way?
* Peradventure I am not successful, what’s the exact magnitude of the implications?
* Can I live with the implications of my actions if things go wrong?
* Would anything bad happen if I just tried to do things differently?
* Can I talk to a mentor or a friend and get their view on my assumption?

### Action points
Take a few minutes from your busy schedule and itemize all the assumptions you presently have about yourself, strengths, limitations, and any detail that constitutes a part of your academics.

Write down at least 10 now, and ask yourself: **Am I sure of the accuracy or otherwise of this position?** If you are not sure, then try to find out the most likely truth that can be verified by data.
    `
  },
  {
    id: '1',
    title: "The Art of Legal Reasoning",
    excerpt: "Moving beyond memorization to understanding the 'Why' in judicial decisions. A guide to applying IRAC method effectively.",
    category: "Study Skills",
    readTime: "5 min read",
    imageUrl: "https://picsum.photos/800/600?random=1",
    content: "Content coming soon. This article will explore the IRAC (Issue, Rule, Analysis, Conclusion) method in depth."
  },
  {
    id: '2',
    title: "Overcoming Academic Indifference",
    excerpt: "How to cultivate genuine interest in courses you find boring. Strategies for finding practical relevance in abstract legal theories.",
    category: "Mindset",
    readTime: "4 min read",
    imageUrl: "https://picsum.photos/800/600?random=2",
    content: "Content coming soon. This article will discuss strategies to engage with dryer legal topics."
  },
  {
    id: '3',
    title: "Leveraging Community for Success",
    excerpt: "Why study groups matter and how to structure them for maximum efficiency without them becoming social distractions.",
    category: "Productivity",
    readTime: "6 min read",
    imageUrl: "https://picsum.photos/800/600?random=3",
    content: "Content coming soon. This article will outline the best practices for study groups."
  },
  {
    id: '4',
    title: "Active Recall vs. Passive Reading",
    excerpt: "Stop re-reading your notes. Discover the science behind active recall and how to implement it in your law preparation.",
    category: "Technique",
    readTime: "7 min read",
    imageUrl: "https://picsum.photos/800/600?random=4",
    content: "Content coming soon. This article will explain spaced repetition and active recall techniques."
  }
];

export const Blog: React.FC = () => {
  const [selectedPost, setSelectedPost] = useState<BlogPost | null>(null);

  // Detailed Post View
  if (selectedPost) {
    return (
      <div className="max-w-4xl mx-auto bg-white min-h-screen animate-in slide-in-from-right duration-300">
        <div className="sticky top-0 bg-white/80 backdrop-blur-md border-b border-slate-100 p-4 flex items-center gap-4 z-10">
          <button 
            onClick={() => setSelectedPost(null)}
            className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-600"
          >
            <ArrowLeft size={24} />
          </button>
          <span className="font-serif font-bold text-lg truncate">{selectedPost.title}</span>
        </div>

        <div className="p-6 md:p-12 space-y-8">
          <div className="space-y-4">
            <span className="text-amber-600 font-semibold text-sm tracking-wider uppercase">{selectedPost.category}</span>
            <h1 className="text-3xl md:text-5xl font-serif font-bold text-slate-900 leading-tight">{selectedPost.title}</h1>
            
            <div className="flex items-center gap-6 text-slate-500 text-sm border-y border-slate-100 py-4">
              <div className="flex items-center gap-2">
                 <User size={16} />
                 <span>{selectedPost.author || 'Learned Team'}</span>
              </div>
              <div className="flex items-center gap-2">
                 <Calendar size={16} />
                 <span>{selectedPost.date || 'Recently'}</span>
              </div>
              <div className="flex items-center gap-2">
                 <Clock size={16} />
                 <span>{selectedPost.readTime}</span>
              </div>
            </div>
          </div>

          <div className="relative h-64 md:h-96 rounded-2xl overflow-hidden shadow-md">
             <img 
                src={selectedPost.imageUrl} 
                alt={selectedPost.title}
                className="w-full h-full object-cover"
             />
          </div>

          <div className="prose prose-slate prose-lg max-w-none text-slate-800 leading-relaxed whitespace-pre-wrap">
            {selectedPost.content}
          </div>

          <div className="pt-12 border-t border-slate-200">
             <button 
                onClick={() => setSelectedPost(null)}
                className="text-slate-500 hover:text-amber-600 font-medium flex items-center gap-2 transition-colors"
             >
                <ArrowLeft size={20} /> Back to Journal
             </button>
          </div>
        </div>
      </div>
    );
  }

  // List View
  return (
    <div className="max-w-5xl mx-auto p-6 space-y-8 pb-24">
      <header className="space-y-2">
        <h2 className="text-3xl font-serif font-bold text-slate-900">Learned Journal</h2>
        <p className="text-slate-600 max-w-2xl">
          Insights on effective learning practices, overcoming mental barriers, and restructuring thinking patterns for academic success.
        </p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {BLOG_POSTS.map((post) => (
          <article 
            key={post.id} 
            className="group flex flex-col bg-white rounded-2xl overflow-hidden border border-slate-200 shadow-sm hover:shadow-md transition-all duration-300 cursor-pointer"
            onClick={() => setSelectedPost(post)}
          >
            <div className="h-48 overflow-hidden relative">
              <img 
                src={post.imageUrl} 
                alt={post.title} 
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-semibold text-slate-900 uppercase tracking-wider">
                {post.category}
              </div>
            </div>
            <div className="p-6 flex-1 flex flex-col">
              <div className="flex items-center gap-2 text-slate-400 text-xs mb-3">
                <Clock size={12} />
                <span>{post.readTime}</span>
              </div>
              <h3 className="text-xl font-serif font-bold text-slate-900 mb-3 group-hover:text-amber-600 transition-colors">
                {post.title}
              </h3>
              <p className="text-slate-600 text-sm leading-relaxed mb-6 flex-1 line-clamp-3">
                {post.excerpt}
              </p>
              <button className="text-slate-900 font-medium text-sm flex items-center gap-1 hover:gap-2 transition-all">
                Read Article <ArrowUpRight size={14} />
              </button>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
};
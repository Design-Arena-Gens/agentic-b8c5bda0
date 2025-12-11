import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || 'demo-key',
})

interface MetadataPrompts {
  tech: string
  vlog: string
  shorts: string
  gaming: string
  tutorial: string
  entertainment: string
  education: string
  music: string
}

const categoryPrompts: MetadataPrompts = {
  tech: 'technology, software, programming, coding, hardware, innovation, review',
  vlog: 'daily life, lifestyle, personal, behind the scenes, day in the life',
  shorts: 'quick tips, viral, trending, short form, bite-sized',
  gaming: 'gameplay, walkthrough, gaming tips, let\'s play, game review',
  tutorial: 'how to, step by step, guide, learn, educational, tips and tricks',
  entertainment: 'funny, entertaining, comedy, reaction, interesting',
  education: 'educational, learning, knowledge, informative, academic',
  music: 'music, song, cover, performance, audio, beats',
}

const languageNames: { [key: string]: string } = {
  en: 'English',
  es: 'Spanish',
  fr: 'French',
  de: 'German',
  pt: 'Portuguese',
  it: 'Italian',
  ja: 'Japanese',
  ko: 'Korean',
  zh: 'Chinese',
  hi: 'Hindi',
  ar: 'Arabic',
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const category = formData.get('category') as string || 'tech'
    const language = formData.get('language') as string || 'en'
    const videoFile = formData.get('video') as File | null
    const videoUrl = formData.get('videoUrl') as string | null

    // Get video context
    let videoContext = 'video content'
    if (videoFile) {
      videoContext = `video file: ${videoFile.name}`
    } else if (videoUrl) {
      videoContext = `video URL: ${videoUrl}`
    }

    const categoryKeywords = categoryPrompts[category as keyof MetadataPrompts] || categoryPrompts.tech
    const languageName = languageNames[language] || 'English'

    const systemPrompt = `You are an expert YouTube SEO specialist. Generate optimized metadata for a ${category} video in ${languageName}.

Requirements:
1. Title: 60-70 characters, attention-grabbing, includes main keywords
2. Description: 150-200 words, keyword-rich, includes call-to-action, timestamps if applicable
3. Tags: 15-20 relevant tags, mix of broad and specific keywords
4. Hashtags: 3-5 trending hashtags relevant to the content
5. Thumbnail prompt: Detailed description for creating an eye-catching thumbnail

Focus on: ${categoryKeywords}

Return ONLY a valid JSON object with this exact structure:
{
  "title": "string",
  "description": "string",
  "tags": ["string"],
  "hashtags": ["#string"],
  "thumbnailPrompt": "string"
}`

    const userPrompt = `Generate SEO-optimized YouTube metadata for this ${category} video: ${videoContext}

Make it compelling, searchable, and optimized for the YouTube algorithm. Use ${languageName} language for all content.`

    // Use OpenAI to generate metadata
    let metadata

    if (process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY !== 'demo-key') {
      const completion = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        temperature: 0.8,
        response_format: { type: 'json_object' },
      })

      metadata = JSON.parse(completion.choices[0].message.content || '{}')
    } else {
      // Fallback demo metadata when OpenAI is not configured
      metadata = generateDemoMetadata(category, videoContext, languageName)
    }

    return NextResponse.json({ metadata })
  } catch (error) {
    console.error('Error generating metadata:', error)
    return NextResponse.json(
      { error: 'Failed to generate metadata' },
      { status: 500 }
    )
  }
}

function generateDemoMetadata(category: string, videoContext: string, language: string): any {
  const categoryTitles: { [key: string]: string } = {
    tech: '🚀 Amazing Tech Innovation You Need to See in 2024',
    vlog: '📸 A Day in My Life - Behind the Scenes Vlog',
    shorts: '⚡ Quick Tip That Will Change Everything #Shorts',
    gaming: '🎮 Epic Gaming Moments - You Won\'t Believe This!',
    tutorial: '📚 Complete Tutorial - Learn This in 10 Minutes',
    entertainment: '😂 This Will Make Your Day - Must Watch!',
    education: '🎓 Educational Guide - Everything You Need to Know',
    music: '🎵 Amazing Music Performance - Full Video',
  }

  const categoryDescriptions: { [key: string]: string } = {
    tech: `In this video, I'm diving deep into the latest technology trends and innovations that are shaping our future. Whether you're a tech enthusiast or just curious about what's next, this comprehensive guide will give you everything you need to know.

🔔 Subscribe for more tech content!
💬 Leave a comment with your thoughts
👍 Like if you found this helpful

Timestamps:
0:00 - Introduction
1:30 - Main Content
8:45 - Key Takeaways
10:00 - Conclusion

Follow me for more tech updates and reviews!

#Technology #Innovation #TechReview #2024Tech #TechNews`,

    vlog: `Join me for a day in my life! In this vlog, I'm taking you behind the scenes and showing you what a typical day looks like for me. From morning routines to evening wind-down, you'll see it all!

🔔 Subscribe to follow along on my journey
💬 Comment what you want to see next
👍 Like if you enjoyed this vlog

Timestamps:
0:00 - Morning Routine
2:30 - Work/Activities
6:00 - Evening
9:00 - Wrap Up

Let's stay connected!

#Vlog #DayInMyLife #LifestyleVlog #BehindTheScenes #DailyVlog`,

    shorts: `Quick tip that will save you time and make everything easier!

👍 Like and Follow for more tips
💬 Comment "YES" if this helped

#Shorts #QuickTip #LifeHack #Viral #Trending`,

    gaming: `Epic gaming session with unbelievable moments! Watch until the end for the most insane play you've ever seen.

🔔 Subscribe for daily gaming content
💬 Drop your thoughts in the comments
👍 Smash that like button

Timestamps:
0:00 - Intro
1:00 - Gameplay Start
5:30 - Epic Moment
8:00 - Final Thoughts

#Gaming #Gameplay #GamingVideo #LetsPlay #GamerLife`,

    tutorial: `Complete step-by-step tutorial that will teach you everything you need to know! Perfect for beginners and those looking to level up their skills.

🔔 Subscribe for more tutorials
💬 Questions? Ask in the comments!
👍 Like if this was helpful

Timestamps:
0:00 - Introduction
1:00 - Step 1
3:00 - Step 2
6:00 - Step 3
9:00 - Final Tips

#Tutorial #HowTo #Learn #Guide #Educational`,

    entertainment: `Get ready to be entertained! This video is packed with moments that will make you laugh, think, and feel all the emotions.

🔔 Subscribe for more amazing content
💬 Comment your favorite part
👍 Like and share with friends

Follow for daily entertainment!

#Entertainment #Funny #MustWatch #Viral #Amazing`,

    education: `Comprehensive educational content that breaks down complex topics into easy-to-understand explanations. Perfect for students and lifelong learners!

🔔 Subscribe for more educational videos
💬 Questions? Leave them below
👍 Like to support educational content

Timestamps:
0:00 - Overview
2:00 - Main Topic
7:00 - Key Concepts
10:00 - Summary

#Education #Learning #Knowledge #Educational #Study`,

    music: `Amazing musical performance that you don't want to miss! Turn up the volume and enjoy!

🔔 Subscribe for more music content
💬 Request songs in the comments
👍 Like if you enjoyed this

Stream on all platforms!

#Music #Song #Performance #Audio #MusicVideo`,
  }

  const categoryTags: { [key: string]: string[] } = {
    tech: ['technology', 'tech review', 'innovation', 'gadgets', 'software', 'hardware', 'tech news', '2024 tech', 'tech tips', 'programming', 'coding', 'computers', 'smartphones', 'AI', 'machine learning'],
    vlog: ['vlog', 'daily vlog', 'lifestyle', 'day in my life', 'behind the scenes', 'personal vlog', 'vlogger', 'daily life', 'routine', 'real life', 'authentic', 'lifestyle vlog', 'my life', 'follow me', 'vlog channel'],
    shorts: ['shorts', 'short video', 'quick tip', 'viral', 'trending', 'tiktok', 'bite sized', 'fast', 'quick', 'life hack', 'tip', 'trick', 'viral shorts', 'youtube shorts', 'short form'],
    gaming: ['gaming', 'gameplay', 'lets play', 'walkthrough', 'game review', 'video games', 'gamer', 'gaming channel', 'play through', 'game tips', 'gaming guide', 'game', 'esports', 'gaming video', 'live gaming'],
    tutorial: ['tutorial', 'how to', 'guide', 'step by step', 'learn', 'teaching', 'education', 'tips', 'tricks', 'help', 'beginner', 'easy', 'simple', 'complete guide', 'full tutorial'],
    entertainment: ['entertainment', 'funny', 'comedy', 'reaction', 'interesting', 'viral', 'trending', 'must watch', 'amazing', 'incredible', 'wow', 'epic', 'fun', 'entertaining', 'hilarious'],
    education: ['education', 'educational', 'learning', 'knowledge', 'teaching', 'school', 'study', 'academic', 'informative', 'lesson', 'explain', 'science', 'history', 'facts', 'educational video'],
    music: ['music', 'song', 'audio', 'performance', 'cover', 'original', 'music video', 'artist', 'musician', 'beats', 'instrumental', 'vocals', 'melody', 'tune', 'musical'],
  }

  const categoryHashtags: { [key: string]: string[] } = {
    tech: ['#Technology', '#TechReview', '#Innovation', '#TechNews', '#Gadgets'],
    vlog: ['#Vlog', '#DailyVlog', '#Lifestyle', '#DayInMyLife', '#Vlogger'],
    shorts: ['#Shorts', '#Viral', '#Trending', '#QuickTip', '#YouTubeShorts'],
    gaming: ['#Gaming', '#Gamer', '#Gameplay', '#LetsPlay', '#VideoGames'],
    tutorial: ['#Tutorial', '#HowTo', '#Learn', '#Guide', '#Educational'],
    entertainment: ['#Entertainment', '#Funny', '#Viral', '#MustWatch', '#Amazing'],
    education: ['#Education', '#Learning', '#Knowledge', '#Educational', '#Study'],
    music: ['#Music', '#Song', '#MusicVideo', '#Artist', '#NewMusic'],
  }

  const categoryThumbnails: { [key: string]: string } = {
    tech: 'Modern tech-themed thumbnail with bold text overlay, vibrant blue and purple gradients, sleek device silhouettes, futuristic elements, high contrast, professional lighting, centered composition with eye-catching title text',
    vlog: 'Personal vlog thumbnail showing authentic moment, bright and colorful, casual aesthetic, person in center with natural expression, lifestyle photography style, warm tones, text overlay with video title',
    shorts: 'High-energy thumbnail with bold text, bright colors, dynamic composition, attention-grabbing emoji or symbol, vertical format optimized, contrasting colors, simple but eye-catching design',
    gaming: 'Gaming thumbnail with game screenshot, intense action moment, dramatic lighting, bold text overlay, gaming UI elements, exciting composition, vibrant colors, player reaction or character focus',
    tutorial: 'Clean tutorial thumbnail with step indicators, clear topic visualization, professional layout, instructional graphics, numbered steps, before/after comparison, educational aesthetic, readable fonts',
    entertainment: 'Entertainment thumbnail with expressive facial reaction, bright background, bold text, exciting composition, high energy, contrasting colors, emoji elements, fun and engaging aesthetic',
    education: 'Educational thumbnail with clean design, topic illustration, professional look, clear text hierarchy, academic color scheme, diagrams or charts if relevant, trustworthy presentation',
    music: 'Music thumbnail with artistic design, album art aesthetic, performer or instrument focus, stylized text, music-themed graphics, mood-appropriate colors, professional music video look',
  }

  return {
    title: categoryTitles[category] || categoryTitles.tech,
    description: categoryDescriptions[category] || categoryDescriptions.tech,
    tags: categoryTags[category] || categoryTags.tech,
    hashtags: categoryHashtags[category] || categoryHashtags.tech,
    thumbnailPrompt: categoryThumbnails[category] || categoryThumbnails.tech,
  }
}

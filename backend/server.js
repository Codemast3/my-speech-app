if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config()
}

const express = require('express')
const cors = require('cors')
const multer = require('multer')
const fs = require('fs')
const mongoose = require('mongoose')
const axios = require('axios')
const { createClient: createSupabaseClient } = require('@supabase/supabase-js')
const { createClient: createDeepgramClient } = require('@deepgram/sdk')

const app = express()
const upload = multer({ dest: 'uploads/' })

const dburl = process.env.DB_URL || 'mongodb://localhost:27017/speechdb'

// MongoDB Connection
async function connectToMongoDB() {
  try {
    await mongoose.connect(dburl, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    })
    console.log('✅ Connected to MongoDB')
  } catch (error) {
    console.error('❌ MongoDB Connection Error:', error)
  }
}
connectToMongoDB()

// MongoDB Schema & Model
const taskSchema = new mongoose.Schema({
  audio_url: String,
  transcription: String,
  user_id: String,
  createdAt: { type: Date, default: Date.now },
  sentiment: Array,
  chapters: Array,
  entities: Array,
  topics: Object,
  safety_labels: Object,
})
const Task = mongoose.model('Task', taskSchema)

// Configure CORS to allow requests from the frontend origin
app.use(
  cors({
    origin: 'https://speechiit.netlify.app', // Allow only this origin
    methods: ['GET', 'POST', 'OPTIONS'], // Allow these HTTP methods
    allowedHeaders: ['Content-Type', 'Authorization'], // Allow these headers
    credentials: true, // Allow credentials (if needed)
  })
)

// Add a middleware to log CORS headers for debugging
app.use((req, res, next) => {
  console.log('CORS Headers Set:', {
    'Access-Control-Allow-Origin': res.get('Access-Control-Allow-Origin'),
    'Access-Control-Allow-Methods': res.get('Access-Control-Allow-Methods'),
    'Access-Control-Allow-Headers': res.get('Access-Control-Allow-Headers'),
  })
  next()
})

app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use('/uploads', express.static('uploads'))

// Upload Audio File
app.post('/upload', upload.single('audio'), (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No file uploaded' })
  console.log('File uploaded:', req.file)
  res
    .status(200)
    .json({ message: 'File uploaded successfully', file: req.file })
})

// Transcription + Audio Intelligence Route
app.post('/transcription', upload.single('audio'), async (req, res) => {
  if (!req.file)
    return res.status(400).json({ error: 'No audio file uploaded' })
  const userId = req.body.userId
  const filePath = req.file.path

  try {
    console.log('Starting transcription process for file:', filePath)
    const fileStream = fs.createReadStream(filePath)
    const uploadResponse = await axios.post(
      'https://api.assemblyai.com/v2/upload',
      fileStream,
      {
        headers: {
          authorization: process.env.ASSEMBLYAI_API_KEY,
          'Transfer-Encoding': 'chunked',
        },
      }
    )
    const assemblyUploadUrl = uploadResponse.data.upload_url
    console.log('AssemblyAI Upload URL:', assemblyUploadUrl)

    const transcriptResponse = await axios.post(
      'https://api.assemblyai.com/v2/transcript',
      {
        audio_url: assemblyUploadUrl,
        auto_chapters: true,
        sentiment_analysis: true,
        entity_detection: true,
        content_safety: true,
        iab_categories: true,
      },
      {
        headers: {
          authorization: process.env.ASSEMBLYAI_API_KEY,
        },
      }
    )
    const transcriptId = transcriptResponse.data.id
    console.log('Transcript ID:', transcriptId)

    // Polling
    let transcriptionResult
    let retries = 20
    console.log('Polling for transcription result...')
    while (retries--) {
      const pollingResponse = await axios.get(
        `https://api.assemblyai.com/v2/transcript/${transcriptId}`,
        { headers: { authorization: process.env.ASSEMBLYAI_API_KEY } }
      )
      transcriptionResult = pollingResponse.data
      console.log('Transcription Status:', transcriptionResult.status)
      if (transcriptionResult.status === 'completed') break
      if (transcriptionResult.status === 'error') {
        console.error('AssemblyAI Error:', transcriptionResult.error)
        throw new Error('Transcription failed.')
      }
      await new Promise((resolve) => setTimeout(resolve, 5000))
    }

    console.log('Transcription Completed:', {
      textLength: transcriptionResult.text
        ? transcriptionResult.text.length
        : 0,
    })

    // Clean up the file
    console.log('Cleaning up file:', filePath)
    fs.unlinkSync(filePath)

    // Save all Audio Intelligence results
    console.log('Saving transcription to MongoDB...')
    const newTask = new Task({
      audio_url: `/uploads/${req.file.filename}`,
      transcription: transcriptionResult.text,
      user_id: userId,
      sentiment: transcriptionResult.sentiment_analysis_results || [],
      chapters: transcriptionResult.auto_chapters || [],
      entities: transcriptionResult.entities || [],
      topics: transcriptionResult.iab_categories_result || {},
      safety_labels: transcriptionResult.content_safety_labels || {},
    })
    await newTask.save()
    console.log('Transcription saved to MongoDB:', newTask._id)

    res.status(200).json({
      message: 'Transcription and Intelligence saved successfully',
      transcription: transcriptionResult.text,
      intelligence: {
        sentiment: transcriptionResult.sentiment_analysis_results,
        chapters: transcriptionResult.auto_chapters,
        entities: transcriptionResult.entities,
        topics: transcriptionResult.iab_categories_result,
        safety_labels: transcriptionResult.content_safety_labels,
      },
    })
    console.log('Response sent to frontend successfully')
  } catch (error) {
    console.error('❌ Transcription Error:', error.message || error)
    // Clean up the file in case of error
    if (fs.existsSync(filePath)) {
      console.log('Cleaning up file on error:', filePath)
      fs.unlinkSync(filePath)
    }
    res.status(500).json({ error: 'Transcription process failed.' })
  }
})

// Get User Transcriptions
app.get('/user-transcriptions', async (req, res) => {
  const userId = req.query.userId
  if (!userId) return res.status(400).json({ error: 'User ID is required' })
  try {
    console.log('Fetching transcriptions for user:', userId)
    const userTranscriptions = await Task.find({ user_id: userId }).sort({
      createdAt: -1,
    })
    console.log('Transcriptions fetched:', userTranscriptions.length)
    res.status(200).json(userTranscriptions)
  } catch (error) {
    console.error('❌ Fetching Transcriptions Error:', error.message)
    res.status(500).json({ error: 'Failed to fetch transcriptions' })
  }
})

const PORT = process.env.PORT || 5000
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`))

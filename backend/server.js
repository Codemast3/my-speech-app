if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config()
}

const express = require('express')
const cors = require('cors')
const multer = require('multer')
const fs = require('fs')
const dotenv = require('dotenv')
const { createClient: createDeepgramClient } = require('@deepgram/sdk')
const { createClient: createSupabaseClient } = require('@supabase/supabase-js')
const mongoose = require('mongoose')
const { OpenAI } = require('openai')
const axios = require('axios')
dotenv.config()
require('dotenv').config()
const MongoDBStore = require('connect-mongo')
// const mongoose = require('mongoose')

const app = express()
const upload = multer({ dest: 'uploads/' })
const openai = new OpenAI(process.env.OPENAI_API_KEY)

// Supabase setup
const supabase = createSupabaseClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY
)

// Deepgram API setup
const deepgram = createDeepgramClient(process.env.DEEPGRAM_API_KEY)
// const dburl = 'mongodb://localhost:27017/speechdb'
const dburl = process.env.DB_URL || 'mongodb://localhost:27017/speechdb'
// MongoDB setup
// mongoose.connect(process.env.DB_URL, 'mongodb://localhost:27017/speechdb', {

// })

async function connectToMongoDB() {
  try {
    await mongoose.connect(dburl, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    })
    console.log('Connected to MongoDB')
  } catch (error) {
    console.error('Error connecting to MongoDB:', error)
  }
}

connectToMongoDB()

const taskSchema = new mongoose.Schema({
  audio_url: String,
  transcription: String,

  user_id: String,
})

const Task = mongoose.model('Task', taskSchema)

app.use(cors())
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use('/uploads', express.static('uploads'))

const secret = process.env.SECRET || 'thisshouldbeabettersecret!'

// Configure session store
const store = MongoDBStore.create({
  mongoUrl: dburl,
  crypto: {
    secret,
  },
  touchAfter: 24 * 60 * 60, // Lazy session update (once per day)
})

store.on('error', function (e) {
  console.log('SESSION STORE ERROR', e)
})

// **Upload Audio File**
app.post('/upload', upload.single('audio'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' })
  }
  res
    .status(200)
    .json({ message: 'File uploaded successfully', file: req.file })
})

app.post('/transcription', upload.single('audio'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No audio file uploaded' })
  }

  const userId = req.body.user_id // Assume frontend sends user_id
  const filePath = req.file.path

  let assemblyUploadUrl
  try {
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
    assemblyUploadUrl = uploadResponse.data.upload_url
  } catch (error) {
    return res
      .status(500)
      .json({ error: 'Error uploading file to AssemblyAI.' })
  }

  let transcriptId
  try {
    const transcriptResponse = await axios.post(
      'https://api.assemblyai.com/v2/transcript',
      { audio_url: assemblyUploadUrl },
      { headers: { authorization: process.env.ASSEMBLYAI_API_KEY } }
    )
    transcriptId = transcriptResponse.data.id
  } catch (error) {
    return res
      .status(500)
      .json({ error: 'Error starting transcription process.' })
  }

  // Polling for transcription completion
  const getTranscription = async (transcriptId) => {
    try {
      const pollingResponse = await axios.get(
        `https://api.assemblyai.com/v2/transcript/${transcriptId}`,
        { headers: { authorization: process.env.ASSEMBLYAI_API_KEY } }
      )
      return pollingResponse.data
    } catch (error) {
      throw new Error('Error checking transcription status.')
    }
  }

  let transcriptionResult
  try {
    while (true) {
      transcriptionResult = await getTranscription(transcriptId)
      if (transcriptionResult.status === 'completed') break
      if (transcriptionResult.status === 'error') {
        return res.status(500).json({ error: 'Transcription failed.' })
      }
      await new Promise((resolve) => setTimeout(resolve, 5000)) // Wait 5s
    }
  } catch (error) {
    return res
      .status(500)
      .json({ error: 'Error during transcription polling.' })
  } finally {
    fs.unlinkSync(filePath) // Delete uploaded file after processing
  }

  // **Save transcription & file URL in MongoDB**
  const newTask = new Task({
    audio_url: `/uploads/${req.file.filename}`, // Relative path
    transcription: transcriptionResult.text,
    user_id: userId,
  })

  await newTask.save()

  res.status(200).json({
    message: 'Transcription saved successfully',
    transcription: transcriptionResult.text,
  })
})

app.get('/user-transcriptions', async (req, res) => {
  const userId = req.query.userId // Get user_id from request

  if (!userId) {
    return res.status(400).json({ error: 'User ID is required' })
  }

  try {
    const userTranscriptions = await Task.find({ user_id: userId }).sort({
      createdAt: -1,
    })
    res.status(200).json(userTranscriptions)
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch transcriptions' })
  }
})

const PORT = process.env.PORT || 5000
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`)
})

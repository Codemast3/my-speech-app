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
// await deepgram.listen.prerecorded.transcribeFile
// **Transcribe Audio File using Deepgram**
// app.post('/transcribe', upload.single('audio'), async (req, res) => {
//   console.log('Received file:', req.file)
//   console.log('Received userId:', req.body.userId)

//   if (!req.file) {
//     return res.status(400).json({ error: 'No file uploaded' })
//   }
//   if (!req.body.userId) {
//     return res.status(400).json({ error: 'User ID is required' })
//   }

//   try {
//     const audioBuffer = fs.readFileSync(req.file.path)

//     // Correct method for transcribing an audio file using the v3 SDK
//     const { response, error } =
//       await deepgram.listen.prerecorded.transcribeFile(
//         {
//           buffer: audioBuffer,
//           mimetype: req.file.mimetype,
//         },
//         {
//           punctuate: true, // Optional: If you want punctuation added to the transcription
//           language: 'en-US', // Optional: Specify the language
//         }
//       )

//     if (error) {
//       console.error('Deepgram error:', error)
//       return res.status(500).json({ error: 'Failed to transcribe audio' })
//     }

//     // Log the full response to understand its structure
//     console.log('Deepgram response:', response)

//     if (
//       response.results &&
//       response.results.channels &&
//       response.results.channels[0] &&
//       response.results.channels[0].alternatives &&
//       response.results.channels[0].alternatives[0]
//     ) {
//       const transcription =
//         response.results.channels[0].alternatives[0].transcript

//       // Save transcription to Supabase
//       const { data, error: supabaseError } = await supabase
//         .from('transcriptions')
//         .insert([
//           { audio_url: req.file.path, transcription, user_id: req.body.userId },
//         ])

//       if (supabaseError) {
//         console.error('Supabase error:', supabaseError)
//         return res.status(500).json({ error: 'Failed to save transcription' })
//       }

//       res.status(200).json({
//         message: 'Transcription saved successfully',
//         transcription,
//       })
//     } else {
//       console.error('Transcription result not found in response')
//       return res
//         .status(500)
//         .json({ error: 'Transcription not found in response' })
//     }
//   } catch (error) {
//     console.error('Error during transcription:', error)
//     res.status(500).json({ error: 'Failed to transcribe audio' })
//   }
// })
// app.post('/transcription', upload.single('audio'), async (req, res) => {
//   const audioPath = req.file.path
//   console.log('Received audio file at:', audioPath) // Log the audio file path

//   try {
//     const transcription = await openai.audio.transcriptions.create({
//       file: fs.createReadStream(audioPath),
//       model: 'whisper-1',
//     })

//     console.log('Transcription:', transcription.text)
//     res.json({ transcription: transcription.text })
//   } catch (error) {
//     console.error('Transcription error:', error.message)
//     res
//       .status(500)
//       .json({ error: 'Failed to transcribe audio.', details: error.message })
//   } finally {
//     fs.unlinkSync(audioPath) // Clean up the uploaded file
//   }
// })

app.post('/transcription', upload.single('audio'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No audio file uploaded' })
  }

  // Step 1: Upload the file to AssemblyAI
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
    console.error('Error uploading to AssemblyAI:', error.message)
    return res
      .status(500)
      .json({ error: 'Error uploading file to AssemblyAI.' })
  }

  // Step 2: Request a transcription from AssemblyAI
  let transcriptId
  try {
    const transcriptResponse = await axios.post(
      'https://api.assemblyai.com/v2/transcript',
      { audio_url: assemblyUploadUrl },
      {
        headers: { authorization: process.env.ASSEMBLYAI_API_KEY },
      }
    )
    transcriptId = transcriptResponse.data.id
  } catch (error) {
    console.error('Error requesting transcription:', error.message)
    return res
      .status(500)
      .json({ error: 'Error starting transcription process.' })
  }

  // Step 3: Poll for the transcription result
  // (In a production app, you might use webhooks or a more sophisticated polling mechanism)
  const getTranscription = async (transcriptId) => {
    try {
      const pollingResponse = await axios.get(
        `https://api.assemblyai.com/v2/transcript/${transcriptId}`,
        {
          headers: { authorization: process.env.ASSEMBLYAI_API_KEY },
        }
      )
      return pollingResponse.data
    } catch (error) {
      throw new Error('Error checking transcription status.')
    }
  }

  // Poll every 5 seconds until the transcription is completed
  let transcriptionResult
  try {
    while (true) {
      transcriptionResult = await getTranscription(transcriptId)
      if (transcriptionResult.status === 'completed') break
      if (transcriptionResult.status === 'error') {
        return res.status(500).json({ error: 'Transcription failed.' })
      }
      // Wait 5 seconds
      await new Promise((resolve) => setTimeout(resolve, 5000))
    }
  } catch (error) {
    console.error('Error during polling:', error.message)
    return res
      .status(500)
      .json({ error: 'Error during transcription polling.' })
  } finally {
    // Clean up the uploaded file
    fs.unlinkSync(filePath)
  }

  // Return the transcription text
  res.status(200).json({ transcription: transcriptionResult.text })
})

app.get('/transcriptions', async (req, res) => {
  const userId = req.query.userId

  if (!userId) {
    return res.status(400).json({ error: 'User ID is required' })
  }

  try {
    const { data, error } = await supabase
      .from('transcriptions')
      .select('*')
      .eq('user_id', userId)

    if (error) {
      console.error('Supabase error:', error)
      return res.status(500).json({ error: 'Failed to fetch transcriptions' })
    }

    res.status(200).json(data)
  } catch (error) {
    console.error('API error:', error)
    res.status(500).json({ error: 'Failed to fetch transcriptions' })
  }
})

// app.post('/transcribe', upload.single('audio'), async (req, res) => {
//   console.log('Received file:', req.file)
//   console.log('Received userId:', req.body.userId)

//   if (!req.file) {
//     return res.status(400).json({ error: 'No file uploaded' })
//   }
//   if (!req.body.userId) {
//     return res.status(400).json({ error: 'User ID is required' })
//   }

//   try {
//     const audioBuffer = fs.readFileSync(req.file.path)

//     // Use the Deepgram transcription method
//     const { results } = await deepgram.listen.preRecorded.transcribeFile(
//       { buffer: audioBuffer, mimetype: req.file.mimetype },
//       { punctuate: true, language: 'en-US' }
//     )

//     const transcription = results.results.channels[0].alternatives[0].transcript

//     // Save transcription to Supabase
//     const { data, error } = await supabase
//       .from('transcriptions')
//       .insert([
//         { audio_url: req.file.path, transcription, user_id: req.body.userId },
//       ])

//     if (error) {
//       console.error('Supabase error:', error)
//       return res.status(500).json({ error: 'Failed to save transcription' })
//     }

//     res
//       .status(200)
//       .json({ message: 'Transcription saved successfully', transcription })
//   } catch (error) {
//     console.error('Error during transcription:', error)
//     res.status(500).json({ error: 'Failed to transcribe audio' })
//   }
// })

// **Fetch Transcriptions for a User**

const PORT = process.env.PORT || 5000
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`)
})

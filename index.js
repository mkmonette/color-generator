const path = require('path')
const express = require('express')
const cors = require('cors')
require('dotenv').config()

process.on('uncaughtException', err => {
  console.error('UNCAUGHT EXCEPTION! Shutting down...', err)
  process.exit(1)
})

function initServer() {
  const app = express()
  const port = process.env.PORT || 3000

  app.use(cors())
  app.use(express.json())
  app.use(express.urlencoded({ extended: true }))

  const staticDir = path.join(__dirname, 'client', 'build')
  app.use(express.static(staticDir))

  // Mount API routes here, e.g. app.use('/api', apiRouter)

  app.get('*', (req, res) => {
    res.sendFile(path.join(staticDir, 'index.html'))
  })

  const server = app.listen(port, () => {
    console.log(`Server running on port ${port}`)
  })

  process.on('unhandledRejection', (reason, promise) => {
    console.error('UNHANDLED REJECTION! Shutting down...', reason)
    server.close(() => process.exit(1))
  })

  process.on('SIGTERM', () => {
    console.log('SIGTERM received. Closing server.')
    server.close(() => {
      console.log('Process terminated')
    })
  })
}

initServer()
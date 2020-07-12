const express = require('express')
const server = express()
const cors = require('cors')
const PostsRouter = require('./router/posts-router')

server.use(express.json())
server.use(cors())
server.use('/api/posts', PostsRouter)

server.get('/', (req, res) => {
    console.log('[LOG]: server.get -> (/)')
    res.json({message:"No endpoint available. Please refer to our API documentation."})
})

module.exports = server
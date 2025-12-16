const express = require('express')
const expressApp = express()
const port = 3000

expressApp.use('/assets',express.static('assets'))
expressApp.use('/dist',express.static('dist'))
expressApp.use('/index.htm',express.static('index.htm'))
expressApp.use('/',express.static('index.htm'))
expressApp.use('',express.static('index.htm'))

expressApp.get('/', (req, res) => {
  res.sendFile(__dirname +'/index.htm')
})

expressApp.listen(port, () => {
  console.log(`Example expressApp listening on port ${port}`)
})
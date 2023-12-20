import express from 'express'

const app = express()
app.use(express.json())

// Define the data structure
interface Status {
  isp: string
  status: number
  timestamp: number
}

interface Data {
    statuses : Status[]
}

// Define the type for dataStore
const dataStore: Record<string, Data> = {}

app.post('/data', (req, res) => {
  const { node, isp, status } = req.body
  const timestamp = Date.now()
  
  if (!dataStore[node]) {
    dataStore[node] = { statuses: [] }
  }
  dataStore[node].statuses.push({ isp, status, timestamp })
  
  res.send(`Data received for node ${node}`)
})

app.get('/data', (req, res) => {
  let statusMap: { [key: string]: number } = {}
  let lastUpdateMap: { [key: string]: number } = {}

  // Iterate over each node in dataStore
  for (const node in dataStore) {
    // Iterate over each status in the node
    dataStore[node].statuses.forEach(status => {
      // Create a unique key for each node-isp pair
      const key = `node="${node}",isp="${status.isp}"`
      
      // Check value
      if (statusMap[key] !== status.status) {
        // Update the status and timestamp
        statusMap[key] = status.status
        lastUpdateMap[key] = Math.floor(Date.now() / 1000)
      }
    })
  }

  let formattedResponse = ''
  for (const key in statusMap) {
    formattedResponse += `multiisp_status{${key}} ${statusMap[key]}\n`
    if (lastUpdateMap[key]) {
      formattedResponse += `status_lastupdate{${key}} ${lastUpdateMap[key]}\n`
    }
  }
  
  res.type('text').send(formattedResponse.trim())
})

const PORT = 3002
app.listen(PORT, () => {
  console.log(`Server running at port ${PORT}`)
})
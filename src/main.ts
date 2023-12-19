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

// Set an interval to clear the dataStore every 5 minutes
// const interval = setInterval(() => {
//     console.log("Clearing dataStore")
//     for (const key in dataStore) {
//       delete dataStore[key]
//     }
//   }, 300000) // 300000 milliseconds = 5 minutes

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
  let formattedResponse = ''
  const currentTime = Date.now()
  for (const node in dataStore) {
    dataStore[node].statuses = dataStore[node].statuses.filter(status =>
      currentTime - status.timestamp < 300000    
    )
    
    dataStore[node].statuses.forEach(status => {
      formattedResponse += `multiisp_status{node="${node}",isp="${status.isp}"} ${status.status}\n`
    })
  }
  
  res.type('text').send(formattedResponse.trim())
})

// app.get('/data/:node', (req, res) => {
//   const node = req.params.node
//   const data = dataStore[node]
  
//   if(data){
//     const formattedData = `multiisp_status{node="${node},"isp="${data.isp}"} ${data.status}`
//     res.send(formattedData)
//   } else {
//     res.status(404).send('Data not found')
//   }
// })

// app.get('/data', (req, res) => {
//   res.json(dataStore)
// })

const PORT = 3002
app.listen(PORT, () => {
  console.log(`Server running at port ${PORT}`)
})
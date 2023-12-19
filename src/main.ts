import express from 'express'

const app = express()
app.use(express.json())

// Define the data structure
interface Data {
  isp: string
  status: number
}

// Define the type for dataStore
const dataStore: Record<string, Data> = {}

app.post('/data', (req, res) => {
  const { node, isp, status } = req.body

  dataStore[node] = { isp, status }

  res.send(`Data recieved for node ${node}`)
})

app.get('/data/:node', (req, res) => {
  const node = req.params.node
  const data = dataStore[node]
  
  if(data){
    const formattedData = `multiisp_status{node="${node},"isp="${data.isp}"} ${data.status}`
    res.send(formattedData)
  } else {
    res.status(404).send('Data not found')
  }
})

// app.get('/data', (req, res) => {
//   res.json(dataStore)
// })

app.get('/data', (req, res) => {
  let formattedResponse = ''
  for (const node in dataStore) {
    const data = dataStore[node]
    formattedResponse += `multiisp_status{node="${node}",isp="${data.isp}"} ${data.status}\n`
  }
  res.type('text').send(formattedResponse.trim())
})

const PORT = 3002
app.listen(PORT, () => {
  console.log(`Server running at port ${PORT}`)
})
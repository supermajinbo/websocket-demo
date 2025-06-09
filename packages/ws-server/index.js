// 启动一个http服务，监听本机ip的8080端口
import http from 'http'
import crypto from 'crypto'
// 使用ws库来处理WebSocket连接
import { WebSocketServer } from 'ws'
import { getIp } from 'shared/index.js'

const TIMEOUT = 10000

// MD5 哈希函数
function md5(str) {
  return crypto.createHash('md5').update(str).digest('hex')
}

const server = http.createServer((req, res) => {
  console.log('request', req.url)
  res.end(`Hello ${req.url}`)
})

// 创建WebSocket服务器实例
const wss = new WebSocketServer({ server })

const map = new Map()

// 监听WebSocket连接
wss.on('connection', (ws, req) => {
  // const clientIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress
  // console.log(`新的客户端连接，IP: ${clientIp}`)

  map.set(ws, Date.now())

  // WebSocket连接建立后立即触发 - 这就是 'open' 事件的等价时机
  // console.log('WebSocket connection opened')

  // 发送欢迎消息
  ws.send('欢迎连接到 WebSocket 服务器！')

  // 监听客户端发送的消息
  ws.on('message', (message) => {
    map.set(ws, Date.now())
    let type = ''
    let data = {}
    try {
      const messageJson = JSON.parse(message.toString())
      type = messageJson.type
      data = messageJson
    } catch (error) {
      type = ''
    }
    // console.log('🚀 ~ :44 ~ ws.on ~ data:', type, data)
    switch (type) {
      case 'ACK':
        ws.send(JSON.stringify({ type: 'ACK', uid: md5(data.user) }))
        break
      case 'TEXT':
        if (data.uid) {
          const responseForText = `[${getIp()}] [${new Date().toLocaleString()}] - uid: ${data.uid}`
          ws.send(responseForText)
        } else {
          const responseForText = `[${getIp()}] [${new Date().toLocaleString()}] - uid is required，please init user info first(ACK)`
          ws.send(responseForText)
        }
        break
      default:
        const responseDefault = `[${getIp()}] [${new Date().toLocaleString()}] - invalid message}`
        ws.send(responseDefault)
        break
    }
  })

  // 监听连接关闭
  ws.on('close', () => {
    console.log('WebSocket connection closed')
  })

  // 监听错误
  ws.on('error', (error) => {
    console.log('WebSocket error:', error)
  })
})

/**
 * 定时检查 map 中的值，如果超过10秒，则删除
 */
setInterval(() => {
  console.log('当前连接数', wss.clients.size)
  wss.clients.forEach((ws) => {
    const time = map.get(ws)
    if (time && Date.now() - time > TIMEOUT) {
      ws.close()
      map.delete(ws)
    }
  })
}, TIMEOUT)

server.listen(8080, '127.0.0.1', () => {
  console.log(`Server is running on http://127.0.0.1:8080`)
})

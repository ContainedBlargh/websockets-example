const express = require('express')
const bodyParser = require('body-parser')
const sqlite = require('aa-sqlite')
const WebSocket = require('ws')

/**
 * A sanitizing function that you should not copy.
 * Instead, you should use prepared statements.
 * But, for this example, I'm using the poorly implemented 'aa-sqlite' library
 * which doesn't have *working* prepared statements.
 * @param {*} str a string we want to sanitize.
 * @returns the string, sanitized.
 */
const sanitize = (str) => {
    return str.replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&apos;')
} 

const main = async () => {
    //Setup the http server.
    const app = express()
    //Serve the 'web' folder statically
    app.use(express.static('web'))
    app.use(bodyParser.json())

    const now = () => new Date().getTime()

    const db_file = 'database.db'

    //Setup the database
    await sqlite.open(db_file)

    await sqlite.run(`
    CREATE TABLE IF NOT EXISTS messages (
        id INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
        ts INTEGER NOT NULL,
        author TEXT,
        content TEXT)`)
    
    await sqlite.run(`INSERT OR REPLACE INTO messages VALUES (0, ${now()}, 'server', 'Welcome to WebSockets Texting!')`)

    await sqlite.close()

    //Setup the WebSocket Server
    //Copied directly from: https://github.com/websockets/ws
    const wss = new WebSocket.Server({
        port: 5001
    });

    wss.on('connection', (ws) => {
        wss.clients.add(ws)
        console.log(`Someone just connected!`)
    })

    app.get('/messages', async (req, res) => {
        await sqlite.open(db_file)
        const query = 'SELECT * FROM messages'
        const messages = await sqlite.all(query, [])
        await sqlite.close()
        res.send(messages)
    })

    app.post('/message', async (req, res) => {
        
        const data = req.body
        data.ts = now()
        data.author = sanitize(data.author)
        data.content = sanitize(data.content)

        wss.clients.forEach(async (client) => {
            if(client.readyState == WebSocket.OPEN) {
                await client.send(JSON.stringify(data), (err) => {
                    if (!!err) {
                        console.log(err)
                    }
                })
            }
        })
        await sqlite.open(db_file)
        const query = `INSERT INTO messages(ts, author, content) VALUES (${data.ts}, '${data.author}', '${data.content}')`
        await sqlite.run(query)
        await sqlite.close()
        res.sendStatus(200)
    })

    app.listen(5000, () => console.log("Server is now listening for http requests on port 5000 and Websocket Messages on port 5001"))
}
main()

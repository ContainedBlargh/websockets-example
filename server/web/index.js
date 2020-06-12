/* HTML Elements that we'll be using: */
const chatWindow = document.getElementsByClassName("chat")[0]
const clearButton = document.getElementById("clear")
const submitButton = document.getElementById("submit")
const messageField = document.getElementById("message")
const nameField = document.getElementById("name")

/* Functions */

/**
 * Clears all messages in the chat-window
 */
const clearChatWindow = () => {
    chatWindow.innerHTML = ""
}

/**
 * Formats a unix-timestamp as ISO
 * @param {int} ts A timestamp
 * @returns An ISO timestamp
 */
const formatTimestamp = (ts) => {
    const date = new Date(ts)
    return date.toISOString()
}

/**
 * Adds a new message to the chat-window.
 * @param {*} msg A message data object with fields for a timestamp, an author and the message content.
 */
const addMessage = (msg) => {
    console.log("adding new message...")
    console.log(msg)
    const parent = chatWindow
    const paragraph = document.createElement("p")
    paragraph.innerHTML = `${formatTimestamp(msg.ts)} - ${msg.author}: ${msg.content}`
    parent.appendChild(paragraph)
    parent.appendChild(document.createElement("br"))
}

/**
 * Posts the message in the `nameField` to the server.
 */
const postMessage = () => {
    const author = HtmlSanitizer.SanitizeHtml(nameField.value)
    const msg = HtmlSanitizer.SanitizeHtml(messageField.value)
    const sendRequest = new XMLHttpRequest()
    sendRequest.open("POST", "/message", true)
    sendRequest.setRequestHeader("Content-Type", "application/json")
    sendRequest.onreadystatechange = () => {
        if (sendRequest.readyState == 4 && sendRequest.status == 200) {
            messageField.value = ""
        }
    }
    const message = JSON.stringify({author: author, content: msg})
    sendRequest.send(message)
}

/**
 * Populates the chat-window with messages stored in the server database.
 * This is the first thing that is done when the page is loaded.
 */
const populateChatWindow = () => {
    const messagesRequest = new XMLHttpRequest()
    messagesRequest.open("GET", "/messages", true)
    messagesRequest.responseType = "json"
    messagesRequest.onreadystatechange = () => {
        if (messagesRequest.readyState != 4 || messagesRequest.status != 200) {
            if (messagesRequest.status > 400) {
                console.log("GET to '/messages' failed...")
                return
            }
            return
        } else if (messagesRequest.readyState == 4 && messagesRequest.status == 200) {
            clearChatWindow()
            const messages = messagesRequest.response
            messages.forEach(addMessage)
        }
    }
    messagesRequest.send()
}

//This is where the script-part of the script is taking place.

/*Setup the Websocket connection to the server.*/
const messageSocket = new WebSocket("ws://localhost:5001")
messageSocket.onmessage = (event) => {
    const message = JSON.parse(event.data)
    addMessage(message)
}
messageSocket.onclose = (_) => alert("WebSocket crashed!")

document.addEventListener("DOMContentLoaded", populateChatWindow)
clearButton.addEventListener('click', clearChatWindow)
submitButton.addEventListener('click', postMessage)
messageField.addEventListener('keyup', (event) => {
    if (event.keyCode == 13) {
        event.preventDefault()
        submitButton.click()
    }
})

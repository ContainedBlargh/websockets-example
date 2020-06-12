# Websockets Example

Recently, I was asked to show how WebSockets can allow a web-based client to handle events as they are produced,
instead of querying a database for changes.

In order to illustrate this I present this example.

## Components

The example consists of 3 distinct software components:

* A **server** that exposes an API for serving a texting service, in this case, the service also exposes a website.
  - I wrote this server in NodeJS and used NPM to collect useful dependencies.
  - The interesting code for this is contained within [main script file](./server/main.js).
* A **database** that stores messages received by the server.
  - For the purposes of this example, I used an SQLite database, it's quick and easy to setup, but it is not scalable (don't use this in production, use [PostgreSQL](https://www.postgresql.org/)<sup>even though literally no-one can pronounce that... post-gre-sql?</sup>)
* A **web client** that allows for connecting to the server and posting text messages.
  - This is just a simple chat client, written with JavaScript, HTML & CSS, [out of that, the index.js script is where you want to look](./server/web/index.js).

## What are websockets?

Websockets are sockets over the web.

Okay, maybe that didn't really clarify anything, but it is a very accurate statement.
For the purposes of the programmer, websockets are no more complicated than standard TCP sockets.
It's a communication medium (transport protocol?) that allows us to implement any kind of communication protocol that we can think of.
That means that we can go beyond standard client-server communication and create client-intercommunication and perhaps peer to peer systems.
Counter-intuitively, we still need to have a websocket server running, which sounds a lot like client-server.
However, the most important distinction is, in my opinion, that we can communicate between client and server in both directions.

[More about WebSockets, from the good, good people at Mozilla](https://developer.mozilla.org/en-US/docs/Web/API/WebSockets_API/Writing_WebSocket_client_applications)


[And for completeness, Wikipedia](https://en.wikipedia.org/wiki/WebSocket)

## Why is this example relevant?

Instant messaging applications are a good example of an application where you want the UI to update as new events unfold, particularly, you want messages to be displayed *instantly*.
Thus, the motivation behind the example should be solid, we all know how annoying slow IM clients are.

Sure, one could use the e-mail approach for messaging and update the inbox by querying the database once in a while (or when a user angrily presses refresh).
This is okay, but a lot of resources are going to waste; especially as the database grows.

In my example, I have chosen to create what I would argue is the most rational scenario;
when a client connects, the complete history of messages are sent from the server and used to populate the chat window.
However, as new messages are posted to the server by clients, we opt to broadcast these over WebSockets to all the clients, before adding the message to the database.

## Poorly implemented features, Security

The example is not the best example of an instant messaging system, even the present feature of clearing the chat window only clears the clientside view, but when the client refreshes the page, everything is thrown back on the page. Preventing this would require tracking of the clients' preferences, which is beyond the scope of the example.

Another, **very important drawback** of this example is the *total lack of security*.
When writing WebSocket applications for production, it is important to adhere to the `wss://`-protocol, which, like https, uses encryption.
This would require a different configuration of the backend server.
And, even then, you want to make sure that input is sanitized *properly*, especially on the backend.

But either way, I would not recommend using NodeJS for your scalable production application, NodeJS is good for quick and dirty hack-jobs like this, not proper *programming*.

That's the gist of it, let me know in the Issues, if something is unclear.

## Dependencies

The server uses the following dependencies:
```
    "aa-sqlite": "^1.0.29",
    "body-parser": "^1.19.0",
    "express": "^4.17.1",
    "sqlite3": "^4.2.0",
    "ws": "^7.3.0"
```
And optionally:
```
    "bufferutil": "^4.0.1",
    "utf-8-validate": "^5.0.2"
```

You can look in the [`package.json`](./server/package.json) file for these lists and more.

## Running the example

In order to run the example, [I recommend downloading the latest version of NodeJS](https://nodejs.org/en/download/) and installing it.

First, clone the repository using git.

Perhaps you could use the command-line interface:
```
$> git clone https://github.com/containedblargh/websockets-example.git
```

Then, go to the `websockets-example` folder, it should contain only this file and a directory `server`.

Open the `server` directory in your favourite shell and write the following commands:
```
$> npm update
...
$> node main.js
```

If you have NodeJS properly installed, `npm update` installs the required dependencies and `node main.js` runs the server script.

Assuming that everything went well, the following should be visible in the console:
```
Server is now listening for http requests on port 5000 and Websocket Messages on port 5001
```

There might also be a warning about an experimental feature, but it is irrelevant.


If something went wrong, make sure that the ports 5000 and 5001 are available on your machine.

Then, open a browser and connect to `localhost:5000`, the console should print:
```
Someone just connected!
```

Now, write you name in the top field and post a message in the bottom field.
If everything goes well, you messages will be bouncing back from the server.

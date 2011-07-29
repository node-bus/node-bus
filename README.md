node-bus
========

node-bus is a project where the goal is to provide a really simple facility
for pubsub-style eventing between clients and a central server.

The bus framework includes a client-side javascript tool which handles all of
the comet requests to make the developer's job as easy as possible.
(automatically degrades from WebSockets to long polling)

Setting Things Up
=================

Ensure that you have socket.io:

    npm install socket.io

Download the node-bus repository:

    git clone git@github.com:node-bus/node-bus.git --recursive
    cd node-bus
    git submodule update --init --recursive

Then run the build:

    ant

Running the Test Server
=======================

Run the server:

    cd apps
    node server.js

Then, navigate a browser to http://localhost:8080/

Versions (tags)
===============

* v0.1a - Long-polling support for the client, and functioning server.  Chat example and the maintest test app.

* v0.2a - Adding support for WebSocket graceful degradation to longpolling.

* v0.3a - Major changes:
  * Moved communication logic into a separate project.
  * Added smart publishing (server only publishes to clients that have
    callbacks attached to the event)
  * Created a collaborative drawing example

* v0.4a - Major changes:
  * Increased performance in unsubscribing by using objects for storing
    subscription handlers rather than arrays.
  * Modularized much of the code base so that subscription handling is shared
    between the client/server.
  * Started work on transformers.

* 0.5a - Switched backend engine to Socket.IO.

* 0.6a - Added transformers.

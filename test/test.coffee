should = require 'should'
path = require 'path'
fs = require 'fs'
mud = require 'mud'
mudJson = require '../'

Error.stackTraceLimit = Infinity

filename = path.join __dirname, 'test.json'
console.log filename

connect = (fn)-> (done)->
  mud.connect "json://#{filename}", (err, db)->
    return done err if err
    fn db, done

it 'should install', ->
  mud.protocol.should.not.have.property 'json'
  mudJson.install()
  mud.protocol.should.have.property 'json'
  mud.protocol.json.should.equal mudJson

it 'should connect', connect (db, done)->
  (should db).be.ok()
  (should db).be.a.Function()
  done()

it 'should perform an empty transaction', connect (db, done)->
  db (->), done

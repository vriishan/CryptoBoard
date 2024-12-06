// Switch to the cryptoboard database (create it if it doesn't exist)
var db = db.getSiblingDB('cryptoboard');

// Create collections
print("Creating collections...");
db.createCollection('article');
db.createCollection('coin');
db.createCollection('sentiment')

print("Updating timestamps...");

db.coin.find().forEach(function(doc) {
    db.coin.updateOne({ _id: doc._id }, { $set: { timestamp: new ISODate(doc.timestamp) } });
});

db.article.find().forEach(function(doc) {
    db.article.updateOne({ _id: doc._id }, { $set: { timestamp: new ISODate(doc.timestamp) } });
});

print("MongoDB initialization complete.");
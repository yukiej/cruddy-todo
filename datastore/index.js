const fs = require('fs');
const path = require('path');
const _ = require('underscore');
const counter = require('./counter');

var items = {};

// Public API - Fix these CRUD functions ///////////////////////////////////////

exports.create = (text, callback) => {
  var id;
  counter.getNextUniqueId((err, datastring)=>{
    id = datastring;
    items[id] = text;
    //I think we want to write the file here using fs.writeFile
    
    let filepath = path.join(exports.dataDir, `${datastring}.txt`);
    fs.writeFile(filepath, text, (err) => {
      if (err) {
        throw ('error writing counter');
      } else {
        callback(null, { id, text });
      }
    });
  });
};

exports.readAll = (callback) => {
  var data = [];
  fs.readdir(exports.dataDir, (err, files) => {
    _.each(files, (filename) => {
      let id = filename.slice(0, 5);
      data.push({
        id: id, 
        text: id});
    });
    callback(null, data);
  });
  
};

exports.readOne = (id, callback) => {
  //use readdir to get array of all files
  //iterate over array to see if the file with id is in there
  //if it is, read the file and return the contents with callback
  //if it isn't, return error message
  fs.readdir(exports.dataDir, (err, files) => {
    if (err) {
      console.error('error reading directory');
    } else {
      let notFound = 0;
      _.each(files, (filename) => {
        if (id === filename.slice(0, 5)) {
          fs.readFile(path.join(exports.dataDir, filename), 'utf8', (err, data) => {
            if (err) {
              console.error('error reading file');
            } else {
              callback(null, {id, text: data});
            }
          });
        } else {
          notFound += 1;
        }
      });
      if (notFound === files.length) {
        callback(new Error(`No item with id: ${id}`));
      }
    }
  });
};

exports.update = (id, text, callback) => {
  fs.readdir(exports.dataDir, (err, files) => {
    if (err) {
      console.error('error reading directory');
    } else {
      let notFound = 0;
      _.each(files, (filename) => {
        if (id === filename.slice(0, 5)) {
          fs.writeFile(path.join(exports.dataDir, filename), text, 'utf8', (err, data) => {
            if (err) {
              console.error('error writing file');
            } else {
              callback(null, {id, text: data});
            }
          });
        } else {
          notFound += 1;
        }
      });
      if (notFound === files.length) {
        callback(new Error(`No item with id: ${id}`));
      }
    }
  });
};
  
exports.delete = (id, callback) => {
  var item = items[id];
  delete items[id];
  if (!item) {
    // report an error if item not found
    callback(new Error(`No item with id: ${id}`));
  } else {
    callback();
  }
};

// Config+Initialization code -- DO NOT MODIFY /////////////////////////////////

exports.dataDir = path.join(__dirname, 'data');

exports.initialize = () => {
  if (!fs.existsSync(exports.dataDir)) {
    fs.mkdirSync(exports.dataDir);
  }
};

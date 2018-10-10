const fs = require('fs');
const path = require('path');
const _ = require('underscore');
const counter = require('./counter');
const Promise = require('bluebird');

var readFileAsync = Promise.promisify(fs.readFile);

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
  //Use Promise.all
  //then do thing
  
  var promises = [];
  var idList = [];
  fs.readdir(exports.dataDir, (err, files) => {
    _.each(files, (filename) => {
      idList.push(filename.slice(0, 5));
      let filepath = path.join(exports.dataDir, filename);
      promises.push(readFileAsync(filepath, 'utf8'));
    });
    Promise.all(promises)
      .then((values) => {
        let data = [];
        for (let i = 0; i < idList.length; i++) {
          data.push({id: idList[i], text: values[i]});
        }
        callback(null, data);
      });
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
              callback(null, {id, text: text});
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
  let filename = id + '.txt';
  fs.unlink(path.join(exports.dataDir, filename), (err) => {
    if (err) {
      callback(new Error(`No item with id: ${id}`));
    } else {
      callback();
    }
  });   
};

// Config+Initialization code -- DO NOT MODIFY /////////////////////////////////

exports.dataDir = path.join(__dirname, 'data');

exports.initialize = () => {
  if (!fs.existsSync(exports.dataDir)) {
    fs.mkdirSync(exports.dataDir);
  }
};

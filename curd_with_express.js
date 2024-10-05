//! كي ترى التعليقات بشكل أفضل قم بتحميل الإضافة التي تسمى
//! Better Comments

const express = require("express");
const app = express();
const port = 3000;
const fs = require("fs");
app.use(express.json());

////* Functions *\\\\

// (data.json file) الدالة التي تقرأ من قاعدة البيانات
function readDataFromFile(callback) {
  fs.readFile("data.json", "utf-8", (err, data) => {
    if (err) {
      console.log(err);
    }
    callback(JSON.parse(data));
  });
}

// (data.json file) الدالة التي تكتب في قاعدة البيانات
function writeDataToFile(data, callback) {
  fs.writeFile("data.json", JSON.stringify(data, null, 2), "utf-8", (err) => {
    callback(err);
  });
}

// Function to read from id.json to get the last used id
function readIdFromFile(callback) {
  fs.readFile("id.json", "utf-8", (err, data) => {
    if (err) {
      console.log(err);
    }
    callback(JSON.parse(data));
  });
}

// Function to write to id.json to update the last used id
function writeIdToFile(lastId, callback) {
  fs.writeFile("id.json", JSON.stringify({ lastId }, null, 2), "utf-8", (err) => {
    callback(err);
  });
}

////* Routes *\\\\

////! GET !\\\\
app.get("/api/users", (req, res) => {
  readDataFromFile((data) => {
    res.send({ data: data });
  });
});

////! POST !\\\\
app.post("/api/users", (req, res) => {
  //? destructuring the object
  const { title, description, username } = req.body;

  //? checking if any of the keys are missing
  if (!title || !description || !username) {
    return res.send({
      message: "Please enter a title, description and username",
    });
  }

  readIdFromFile((idData) => {
    let lastId = idData.lastId;

    readDataFromFile((dataReadFromFile) => {
      let data = req.body;

      //? this is to calculate the current date
      let currentDate = new Date()
        .toLocaleString("en-CA", {
          year: "numeric",
          month: "2-digit",
          day: "2-digit",
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
          hour12: false,
        })
        .replace(",", "");

      //? Increment lastId for the new data
      let newId = lastId + 1;

      //? adding the current date and id to the new item
      let newData = { ...data, date: currentDate, id: newId };

      //? pushing the new object to the current data that read from data.json file
      dataReadFromFile.push(newData);

      //? writing the new data to data.json file
      writeDataToFile(dataReadFromFile, () => {
        //? Update the lastId in id.json
        writeIdToFile(newId, () => {
          res.send({ message: "Data saved successfully" });
        });
      });
    });
  });
});

////! PUT !\\\\
app.put("/api/users/:id", (req, res) => {
  const id = req.params.id;

  readDataFromFile((dataReadFromFile) => {
    //? bringing the index of the item in the data.json file
    const index = dataReadFromFile.findIndex((item) => item.id == id);

    //? checking if the item is not found
    if (index == -1) {
      return res.json({
        message: "User not found",
      });
    }

    //? destructuring the object
    const {title, description, username} = req.body;

    //? modifying the data
    dataReadFromFile[index].title = title || dataReadFromFile[index].title  
    dataReadFromFile[index].description = description || dataReadFromFile[index].description  
    dataReadFromFile[index].username = username? username.trim() : dataReadFromFile[index].username
    
    //? writing the new data to data.json file
    writeDataToFile(dataReadFromFile, () => {
      res.send({ message: "Data updated successfully" });
    });
  });
});

////! DELETE !\\\\

app.delete("/api/users/:id", (req, res) => {
  const id = req.params.id;

  readDataFromFile((dataReadFromFile) => {
    //? bringing the index of the item in the data.json file
    const index = dataReadFromFile.findIndex((item) => item.id == id);

    //? checking if the item is not found
    if (index == -1) {
      return res.send({
        message: "item not found!",
      });
    }
    //? creating new data after removing the item we want to delete
    const data = dataReadFromFile.filter((item) => item.id != id);

    //? writing the new data to data.json file
    writeDataToFile(data, () => {
      res.send({ message: "Data deleted successfully" });
    });
  });
});

////* server *\\\\

app.listen(port, () => {
  console.log(`server is running on port ${port}`);
});

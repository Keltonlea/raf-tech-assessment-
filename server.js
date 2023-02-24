const express = require('express');
const mysql = require('mysql2');
const { engine } = require('express-handlebars');

const app = express();
const port = 3000;


//Create a connection to the mysql server

const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'Carmel360',
    database: 'parcel_db'
});

// Set up Handlebars as the template engine
app.engine('handlebars', engine({ extname: '.hbs', defaultLayout: "main"}));
app.set('view engine', 'hbs');

// Render the home page with the parcel data
app.get('/', (req, res) => {
  connection.query('SELECT * FROM mytable', (error, results, fields) => {
    if (error) throw error;
    res.render('home', { parcels: results });
  });
});





app.get('/streetname', function(req, res){
  connection.query('SELECT * FROM mytable ORDER BY address', function(error, results, fields){
      if (error) throw error;
      var data = groupDataByStreetName(results);
      res.send(data);
  });
});
function groupDataByStreetName(data) {
  // Create an object to hold the grouped data
  const groupedData = {};

  // Loop through each row of data
  data.forEach(row => {
    // Extract the street name from the address field
    const streetName = row.address.split(' ')[1];

    // If this is the first row with this street name, create a new array
    if (!groupedData[streetName]) {
      groupedData[streetName] = [];
    }

    // Add this row to the array for the street name
    groupedData[streetName].push(row);
  });

  // Sort the grouped data by street name
  const sortedData = {};
  Object.keys(groupedData).sort().forEach(streetName => {
    sortedData[streetName] = groupedData[streetName];
  });

  return sortedData;
}

app.get('/streetnumber', function(req, res){
  connection.query('SELECT * FROM mytable ORDER BY CAST(SUBSTRING_INDEX(address, " ", 1) AS UNSIGNED)', function(error, results, fields){
      if (error) throw error;
      var data = groupDataByStreetNumber(results);
      res.send(data);
  });
});

function groupDataByStreetNumber(data) {
  const groups = {};
  for (let i = 0; i < data.length; i++) {
    const address = data[i].address;
    if (!address) continue;
    const streetNumber = parseInt(address.split(' ')[0]);
    if (isNaN(streetNumber)) continue;
    if (!groups[streetNumber]) {
      groups[streetNumber] = [];
    }
    groups[streetNumber].push(data[i]);
  }
  const sortedGroups = {};
  Object.keys(groups).sort((a, b) => a - b).forEach(key => {
    sortedGroups[key] = groups[key];
  });
  return sortedGroups;
}
app.get('/firstname', function(req, res){
  connection.query('SELECT * FROM mytable', function(error, results, fields){
      if (error) throw error;
      var data = groupDataByOwner(results);
      res.send(data);
  });
});
function groupDataByOwner(data) {
  const groupedData = {};
  data.forEach(row => {
    const firstName = row.owner.split(' ')[0]; // Extract first name
    if (!groupedData[firstName]) {
      groupedData[firstName] = [];
    }
    groupedData[firstName].push(row);
  });

  // Sort the groups by first name
  const sortedGroups = Object.keys(groupedData).sort();

  // Sort the rows within each group by last name
  for (const group in groupedData) {
    groupedData[group].sort((a, b) => {
      const lastA = a.owner.split(' ')[1];
      const lastB = b.owner.split(' ')[1];
      return lastA.localeCompare(lastB);
    });
  }

  // Build the final sorted data array
  const sortedData = [];
  sortedGroups.forEach(group => {
    sortedData.push(...groupedData[group]);
  });

  return sortedData;
}


// Start the server
app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});

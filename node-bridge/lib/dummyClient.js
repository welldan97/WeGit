// Imports
// =============================================================================

const net = require('net');

// Main
// =============================================================================

const port = process.env.PORT || 1996;

const connection = net.connect({ port }, () => {
  connection.on('data', data => {
    const parsedData = JSON.parse(data.toString());
    console.log(JSON.stringify(parsedData, undefined, 2));
  });

  connection.on('end', () => console.log('disconnected from server'));
});

const express = require('express');
const routes = require('./routes/routes');
const app = express();
const PORT = 3000; 
const bodyParser = require('body-parser');
const cors = require('cors');

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/',routes);

module.exports = app;

// Iniciar el servidor solo si ejecutas este archivo directamente
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Servidor ejecutándose en http://localhost:${PORT}`);
  });
}
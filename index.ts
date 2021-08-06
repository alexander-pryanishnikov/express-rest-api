const express = require('express');
const app = express();
const userRoutes = require('./routes/user.route');
const PORT = process.env.PORT || 3002
const bodyParser = require('body-parser')
import morgan from 'morgan'


app.use(bodyParser.json())

app.use(morgan(':method :url :status :res[content-length] - :response-time ms'))

app.use(userRoutes);


app.listen(PORT, () => {
    console.log(`Server is running on PORT: ${PORT}..`)
});

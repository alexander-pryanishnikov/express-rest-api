const express = require('express');
const app = express();
const user = require('./routes/user.route');
const PORT = process.env.PORT || 3000
const bodyParser = require('body-parser')

const response_time = require('./middleware/response-time.middleware')


app.use(response_time)

app.use(bodyParser.json())

app.use(user);



app.listen(PORT, () => {
	console.log(`Server is running on PORT: ${PORT}..`)
});
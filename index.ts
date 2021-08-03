const express = require('express');
const app = express();
const user = require('./routes/user.route');
const PORT = process.env.PORT || 3001
const bodyParser = require('body-parser')

import response_time from './middleware/response-time.middleware';

console.log(response_time)

app.use(response_time)
app.use(bodyParser.json())
app.use(user);

app.listen(PORT, () => {
	console.log(`Server is running on PORT: ${PORT}..`)
});
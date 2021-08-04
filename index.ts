const express = require('express');
const app = express();
const user = require('./routes/user.route');
const PORT = process.env.PORT || 3002
const bodyParser = require('body-parser')

import response_time from './middleware/response-time.middleware';

console.log(response_time)

app.use(response_time)
app.use(bodyParser.json())

/** TODO: [VT] 04.08.2021, 17:18: Нарушение семантики, куда мы подключаем юзера? */
app.use(user);

app.listen(PORT, () => {
	console.log(`Server is running on PORT: ${PORT}..`)
});

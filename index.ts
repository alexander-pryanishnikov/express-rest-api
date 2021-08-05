const express = require('express');
const app = express();
const userRoutes = require('./routes/user.route');
const PORT = process.env.PORT || 3002
const bodyParser = require('body-parser')
import morgan from 'morgan'


app.use(bodyParser.json())

/** TODO: + [VT] 04.08.2021, 17:18: Нарушение семантики, куда мы подключаем юзера? + */
app.use(userRoutes);

// app.use(morgan(':method :url :status :res[content-length] - :response-time ms'))


app.listen(PORT, () => {
	console.log(`Server is running on PORT: ${PORT}..`)
});

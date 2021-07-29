const express = require("express");
const app = express();
const user = require('./routes/user');
const PORT = process.env.PORT || 3000

app.use(user);

app.listen(PORT, () => {
	console.log(`Server is running on PORT: ${PORT}..`)
});
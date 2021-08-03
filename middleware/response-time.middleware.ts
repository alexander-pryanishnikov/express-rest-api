
/** начало счетчика */
let start = process.hrtime();

export default (req, res, next) => {
	console.log(process.hrtime(start)[1] / 1000000 + " ms");

	/** обнуление */
	start = process.hrtime();

	next();

}


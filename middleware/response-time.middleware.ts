
// /** начало счетчика */
// let start = process.hrtime();
//
// /** TODO: + [VT] 04.08.2021, 17:17: Время считает явно не так, используй morgan */
//
// export default (req, res, next) => {
// 	console.log(process.hrtime(start)[1] / 1000000 + " ms");
//
// 	/** обнуление */
// 	start = process.hrtime();
//
// 	// var start = Date.now();
// 	//
// 	// process.on("exit", function() {
// 	// 	var end = Date.now();
// 	// 	console.log("Time taken: %ds", (end - start)/1000);
// 	// });
//
// 	next();
//
// }


/**
 */

/**
 * Null safe object getter
 * Example: To access obj.a.b.c[0].d in null safe way,
 * use getProp(['a', 'b', 'c', 0, 'd'], obj )
 *
 * @param {string|number} path access path
 * @param {Object} obj Object
 * @return {Object|string|number|null}
 */
function getProp(path, obj) {
	return path.reduce(
		(accumulator, currentValue) => (accumulator && accumulator[currentValue]) ?
			accumulator[currentValue] :
			null,
		obj
	);
}

export {
	getProp
};

/**
 * Catches thrown errors in the fn function and pushes them to the next error handler
 */
const excHandler = (fn) =>
    function asyncUtilWrap(...args) {
        const fnReturn = fn(...args);
        const next = args[args.length - 1];
        return Promise.resolve(fnReturn).catch(next);
    };

const excHandler2 = (fn) =>
    async function asyncUtilWrap(...args) {
        try {
            await fn(...args);
        } catch (error) {
            console.log(error);
            return next(error);
        }
    };

export { excHandler };

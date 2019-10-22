/**
 * Method that allows performing tests against the result or error of an
 * async method.
 *
 * The second parameter is a test function that receives two parameters:
 *
 * - Error instance, if any.
 * - Result, if any.
 *
 * @param method Async method that will be tested.
 * @param test Method that will perform tests.
 */
export async function expectAsync(method: Function, test: Function) {
  try {
    test(null, await method());
  } catch (error) {
    test(error, null);
  }
}

/** Helping function used to get all methods of an object */
const getMethods = (obj) => Object.getOwnPropertyNames(Object.getPrototypeOf(obj)).filter(item => typeof obj[item] === 'function')

/** Replace the original method with a custom function that will call our aspect when the advice dictates */
function replaceMethod(target, methodName, aspect, advice) {
  const originalCode = target[methodName]
  target[methodName] = (...args) => {
    if (["before", "around"].includes(advice)) {
      aspect.apply(methodName, args)
    }
    const returnedValue = originalCode.apply(target, args)
    if (["after", "around"].includes(advice)) {
      aspect.apply(methodName, args)
    }
    if ("afterReturning" == advice) {
      return aspect.apply(methodName, [returnedValue])
    } else {
      return returnedValue
    }
  }
}

const aop = {
  //Main method exported: inject the aspect on our target when and where we need to
  inject: function (target, aspect, advice, pointcut, method = null) {
    if (method != null) {
      replaceMethod(target, method, aspect, advice)
    } else if (pointcut == "methods") {
      const methods = getMethods(target)
      methods.forEach(m => {
        replaceMethod(target, m, aspect, advice)
      })
    }
  },
  getMethods: getMethods,
  replaceMethod: replaceMethod
}
export default aop
var sleep = function (time) {
  return new Promise(function (resolve, reject) {
    setTimeout(function () {
      resolve('ok');
    }, time)
  })
}


var start = async function () {
  let result = await sleep(3000).then(function (arg) {
    console.log('arg:' + arg);
  });

  let result2 = await sleep(3000);
  console.log('result:' + result);
  console.log('result2:' + result2);
}

start();
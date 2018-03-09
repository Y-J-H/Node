var arr = [1,2,3];

var sleep = function (time) {
  return new Promise(function (resolve, reject) {
      setTimeout(function () {
          // 模拟出错了，返回 ‘error’
          resolve();
      }, time);
  })
};

var start = async function () {
  for (var i = 0; i < arr.length; i++) {
    console.log(`当前是第${i}次等待..`);
    await sleep(2000);
  }
}

start()
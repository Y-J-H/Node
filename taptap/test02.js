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
  arr.forEach(function (index, item) {
    console.log(`当前是第${index}次等待..`);
    await sleep(2000);
  })
}

start();
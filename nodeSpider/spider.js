let http = require('http');
let fs = require('fs');
/**
 * cheerio可以让我们在nodejs中用jquery的方式去解析dom,
 * cheerio可以解析任何html和XMLdocument2
 */
let cheerio = require('cheerio');    
let request = require('request');
let i = 0;

// 初始化url
let url = 'http://www.ss.pku.edu.cn/index.php/newscenter/news/3472';

function fetchPage (x) {
  startRequest(x);
}

function startRequest (x) {
  /**
   * http.get(option||url||string, callback),请求资源, 
   * 和http.request()的区别是http.get自动调用req.end()方法
   */ 
  http.get(x, res => {
    let html = '';
    let title = [];
    res.setEncoding('utf-8');
     /**
      * data是存在于nodejs流中的事件, nodejs中http请求，precess.stdout都是流的一个实例
      * 所以他们也就包含了流中的事件和方法,除此之外我们也可以利用模块方式引入流const stream = require('stream')
      * 下面这段代码的意思就是当我们请求x时, 服务器就会返回数据, 这些数据放在响应(response)中
      * 当数据别传递到res中，也就是数据返回时就会触发data事件, chunk是返回的数据
      */
    res.on('data', (chunk) => {
      html += chunk;
    });

    /**
     * end当数据传输结束,也就是流中不在有数据的话就会触发end 事件
     */
    res.on('end', () => {
      // 利用cheerio模块解析html,利用chreerio.load(html)这个方法以后我们就可以使用操作dom的方式来操作返回的数据流
      let $ = cheerio.load(html);
      let time = $('.article-indo a:first-child').text().trim();

      let news_item = {
        title: $('div.article-title a').text().trim(),
        Time: time,
        link: 'http://www.ss.pku.edu.cn' + $('div.article-title a').attr('href'),
        author: $('[titile = 供稿]').text().trim(),
        i: i = i + 1
      };

      console.log(news_item);

      let news_title = $('div.article-title a').text().trim();

      savedContent($, news_title);
      savedImg($, news_title);

      let nextLink = "http://www.ss.pku.edu.cn" + $('li.next a').attr('href');
      str1 = nextLink.split('-');    // 去除url后的中文
      str = encodeURI(str1[0]);

      if(i <= 10) {   // 通过控制i开控制爬取多少篇文章
        fetchPage(str);
      }
    });
  }).on('error', err => {
    console.log(err);
  })
}

function savedContent($, news_title) {
  $('.article-content p').each(function (index, item) {
    let x = $(this).text();

    let y = x.substring(0, 2).trim();
    if (y === '') {
      x = x + '\n';
      fs.appendFile('./data/' + news_title +'.txt', x, 'utf-8', function (err) {
        if (err) {
          console.log(err);
        } 
      });
    }
  })
}


function savedImg($, news_title) {
  $('.article-content img').each(function (index, item) {
    let img_title = $(this).parent().next().text().trim();   //获取图片标题

    if (img_title.length > 35 || img_title === '') {
      img_title = 'Null';
    }
    let img_filename = img_title + '.jpg';
    let img_src = 'http://www.ss.pku.edu.cn' + $(this).attr('src');   // 获取图片的url

    // 采用request模块,向服务器发起请求,获取图片资源
    // request.get(img_src, function (err, res, body) {
    //   if (err) {
    //     console.log(err);
    //   }
    // });

    // // 利用流的方式,将图片写到本地/image目录下,将新闻标题和图片标题作为图片的名称
    // request(img_src).pipe(fs.createWriteStream('./image/' + news_title + '——' + img_filename));

    // 方式二
    /**
     * github 上说request是Simplified HTTP request client(简化的http客户端请求),不是很理解,不过利用rquest请求后面可以跟pipe()
     * 也就是类似于管道，利用createWriteStream可以将请求的数据写到某个地方
     */
    request.get(img_src, (err, res, body) => {
      if(err) throw err
    }).pipe(fs.createWriteStream('./image/' + news_title + '——' + img_filename));
  })
}

fetchPage(url);      // 程序开始运行
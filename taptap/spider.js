let https = require('https');
let fs = require('fs');
let cheerio = require('cheerio');
let request = require('request');
let i = 0;

let url = 'https://www.taptap.com/'

// async和await好像不能再each,foreach这些里面用,可以再for里面使用
function fetchHomePage(url) {
  https.get(url, res => {
    let html = ''
    res.setEncoding('UTF-8');
    res.on('data', (chunk) => {
      html += chunk;
    })

    res.on('end', async() => {
      let $ = cheerio.load(html);

      let game = {
        data: []
      };

      let gameDetail = {
        data: []
      };

      // 匹配id是以app-为开头的div
      let appCollection = $("div[id^='app-']");

      for (let i = 0; i < 10; i++) {
        let index = i;
        let item = appCollection[index];

        let Id = item['attribs']['id'].split('-')[1];
        let temp = {
          Id,
          Icon: $('#app-' + Id + ' a.rec-header-icon>img').attr('src'),
          Gameform: $('#app-' + Id + ' .rec-header-title').text().trim(),
          Title: $('#app-' + Id + ' .feed-rec-title h2').text().trim(),
          ShowPic: $('#app-' + Id + ' .feed-rec-image>img').attr('data-src'),
          Star: $('#app-' + Id + ' .rec-image-text .star').next().text().trim(),
          Review: $('#app-' + Id + ' .rec-image-text .review').next().text().trim(),
          Des: $('#app-' + Id + ' .index').text().trim()
        }

        game.data.push(temp);
        let str = await getGameDetail(temp.Id);
        gameDetail.data.push(str);
      }
      fs.appendFile('./data/taptap.json', JSON.stringify(game), 'utf-8', (err) => {
        if (err) throw err
      })

      fs.appendFile('./data/gameDetail.json', JSON.stringify(gameDetail), 'utf-8', (err) => {
        if (err) throw err
      })
    })
  })
}

function getGameDetail(id) {
  return new Promise(function (resolve, reject) {
    let newUrl = 'https://www.taptap.com/app/' + id;
    let temp;

    https.get(newUrl, res => {
      let html = '';
      res.setEncoding('utf-8');
      res.on('data', (chunk) => {
        html += chunk;
      });

      res.on('end', () => {
        let $ = cheerio.load(html);
        temp = {
          Id: id,
          Icon: $('.main-header-icon .header-icon-body > img').attr('src'),
          Name: $('.main-header-text h1').attr('title'),
          Piblisher: $('.header-text-author > a[itemprop="publisher"] > span[itemprop="name"]').text(),
          Download: parseInt($('.text-download-times').text()),
          Attention: parseInt($('.text-download-times').text()),
          Status: $('.text-hints').text(),
          Review: $('.main-header-tab a[data-taptap-tab="review"] small').text(),
          Forum: $('.main-header-tab a[data-taptap-tab="topic"] small').text(),
          DevelopersSay: $('#developer-speak').html(),
          Screenshot: getScreenshot($),
          Language: getLanguage($),
          Label: getLabel($),
          Intro: $("#description").html(),
          Detail: getDetail($),
          comments: getComments($)
        }

        resolve(temp);
      })
    })
  })
}

function getScreenshot($) {
  let screenshotArr = [];
  $('#imageShots > li > a[data-lightbox="screenshots"] > img').each(function (index, item) {
    screenshotArr.push($(this).attr('src'));
  })

  return screenshotArr
}

function getLanguage($) {
  let languageArr = [];
  $('.main-body-additional > li > span').each(function (index, item) {
    languageArr.push($(this).text());
  })

  return languageArr;
}

function getLabel($) {
  let labelArr = [];
  $('#appTag > li > a').each(function (index, item) {
    labelArr.push($(this).text());
  })

  return labelArr;
}

function getDetail($) {
  let detail = {};
  detail = {
    size: $('.main-body-info > ul.body-info-list  li .info-item-content').eq(0).text(),
    version: $('.main-body-info > ul.body-info-list  li .info-item-content').eq(1).text(),
    updateLastTime: $('.main-body-info > ul.body-info-list  li .info-item-content').eq(2).text(),
  }

  return detail;
}

function getComments($) {
  let commentsArr = [];
  $('#reviewsList > li').each(function (index, item) {
    Id = $(this).attr('id').split('-')[1];
    let data = {
      CommentId: Id,
      UserId: $('#review-' + Id + ' .item-text-header' + '.taptap-user').attr('data-user-id'),
      Avator: $('#review-' + Id + '> a > img').attr('src'),
      Name: $('#review-' + Id + '> a > img').attr('alt'),
      Grade: '70%',
      PalyTime: $('#review-' + Id + ' .text-score-time').text(),
      ReplyTime: $('#revire- ' + Id + ' .item-text-header' + ' > a.text-header-time > span').attr('data-dynamic-time'),
      Content: $('#review-' + Id + ' .item-text-body p').text(),
      Happy: $('#review-' + Id + ' .text-footer-btns > li span[data-taptap-ajax-vote="count"]').eq(0).text(),
      Up: $('#review-' + Id + ' .text-footer-btns > li span[data-taptap-ajax-vote="count"]').eq(1).text(),
      Down: $('#review-' + Id + ' .text-footer-btns > li span[data-taptap-ajax-vote="count"]').eq(2).text(),
      Reply: $('#review-' + Id + ' .text-footer-btns > li span.normal-text').eq(index).text(),
    }

    commentsArr.push(data);
  })

  return commentsArr;
}

fetchHomePage(url);
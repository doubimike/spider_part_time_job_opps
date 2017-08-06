var app = require('express')()
var supperagent = require('superagent')
var cheerio = require('cheerio')
var Project = require('./project_model')
var Subscriber = require('./subscriber_model')
var async = require('async')
var nodemailer = require('nodemailer')


var bodyParser = require('body-parser')
    // parse application/x-www-form-urlencoded 
app.use(bodyParser.urlencoded({ extended: false }))

// parse application/json 
app.use(bodyParser.json())


var CronJob = require('cron').CronJob;
var job = new CronJob('00 39 17 * * 0-6', function() {
        /*
         * Runs every weekday (Monday through Friday)
         * at 11:30:00 AM. It does not run on Saturday
         * or Sunday.
         */
        console.log('-----')
        findNew()
    }, function() {
        /* This function is executed when the job stops */
    },
    true
);


var concurrencyCount = 0;
var from = 0
var end = 9184
var totalLength = end - from + 1
var times = 0
    // sendEmailToAllSubscribers('hehehe')

function sendEmailToAllSubscribers(content) {
    Subscriber.find({}, function(err, all) {
        if (err) {
            return console.log('sendEmailToAllSubscribers err', err)
        }
        console.log('all', all)
        async.mapLimit(all, 5, function(emailObj, callback) {
                sendMail(content || 'null', emailObj.email, callback);
            },
            function(err, result) {
                // console.log('err', err)
                console.log('final:');
                console.log(result);
                // res.send(result)
                // sendMail(JSON.stringify(result))
            });


    })
}


function generateHtml(arrProject) {
    var html = ''
    for (var i = arrProject.length - 1; i >= 0; i--) {
        html += ('<h1>项目名字: ' + arrProject[i].title + '</h1><span>状态: ' + arrProject[i].status + '</span>' + '<h2>id: ' + arrProject[i].rewardNo + '</h2>' + '<h3>类型: ' + arrProject[i].type + '</h3>' + '<h4><span> 金额: ' + arrProject[i].price + '</span><span> 类型: ' + arrProject[i].projectType + '</span><span> 周期: ' + arrProject[i].projectDuration + '</span></h4>' + arrProject[i].detail + '<hr>')
    }
    return html
}

function sendMail(content, sendTo) {
    console.log('content', content.toString())
    content = generateHtml(JSON.parse(content))
    var smtpTransport = nodemailer.createTransport({
        host: 'smtp.qq.com', // 主机
        secure: true, // 使用 SSL
        port: 465, // SMTP 端口
        auth: {
            user: 'doubimike@qq.com', // 账号
            pass: '' // 密码
        }
    });
    var mailOptions = {
        to: sendTo,
        from: 'doubimike@qq.com',
        subject: '码市最新项目详情',
        html: content || 'test'
    };
    smtpTransport.sendMail(mailOptions, function(err) {
        // done(err, 'done');
        if (err) {
            console.log('err', err)
        }
        console.log('done')
    });

}

function findNew() {
    var newUrls = []
    supperagent.get('https://mart.coding.net/projects')
        .set({

            'Cookie': 'mid=ebc845e1-4aca-4f62-a96a-a88684108916; JSESSIONID=1is5lwjc2h0r91d899akkmlfa2; _ga=GA1.2.2089016391.1500124525; _gid=GA1.2.1559004030.1501839393; exp=89cd78c2; withGlobalSupport=true; c=deposit-payment%3Dtrue%2Centerprise-register%3Dtrue%2Centerprise%3Dtrue%2Cguide-publish%3Dtrue%2Chigh-paid%3Dtrue%2Chow-know-mart%3Dtrue%2Cim%3Dtrue%2Cmillion-bonus%3Dtrue%2Cmpay-v3-btn%3Dtrue%2Cmpay-v3%3Dtrue%2Cmpay%3Dtrue%2Cpay-multi%3Dtrue%2Cquote-mobile-pay%3Dtrue%2Cselected-user%3Dtrue%2Csso%3Dfalse%2Cstage-evaluation%3Dfalse%2Cuse-cdn%3Dtrue%2C0d0b5456'
        })
        .end(function(err, sres) {
            // 常规的错误处理
            if (err) {
                console.log('errerr', err)
                return
                // return next(err);
            }
            // sres.text 里面存储着网页的 html 内容，将它传给 cheerio.load 之后
            // 就可以得到一个实现了 jquery 接口的变量，我们习惯性地将它命名为 `$`
            // 剩下就都是 jquery 的内容了
            var $ = cheerio.load(sres.text, {
                decodeEntities: false
            })

            // console.log('sres.text', sres.text)

            $('.uuid').each(function(index, element) {
                var $element = $(element);
                var rewardNo = 'No.' + $element.html().trim().substr(3)

                console.log(rewardNo)
                Project.findOne({ rewardNo: rewardNo }, function(err, result) {
                    if (err) {
                        return console.log(err)
                    }
                    if (result) {
                        // console.log('result', result)
                    } else {
                        newUrls.push('https://mart.coding.net/project/' + rewardNo.substr(3))
                        console.log('newUrls', newUrls)
                    }
                    if (index === $('.uuid').length - 1) {
                        fetchNew(newUrls)
                    }

                })

            });
        });
}


function fetchNew(urls) {
    async.mapLimit(urls, 5, function(url, callback) {
            fetchData(url, callback);
        },
        function(err, result) {
            // console.log('err', err)
            console.log('final:');
            console.log(result);
            // res.send(result)
            // sendMail()
            sendEmailToAllSubscribers(JSON.stringify(result))
        });
}

function fetchData(url, callback) {
    console.log('url', url)
    concurrencyCount++;
    var delay = 'undefined'
    console.log('现在的并发数是', concurrencyCount, '，正在抓取的是', url, '，耗时' + delay + '毫秒');
    supperagent.get(url)
        .set({

            'Cookie': 'mid=ebc845e1-4aca-4f62-a96a-a88684108916; JSESSIONID=1is5lwjc2h0r91d899akkmlfa2; _ga=GA1.2.2089016391.1500124525; _gid=GA1.2.1559004030.1501839393; exp=89cd78c2; withGlobalSupport=true; c=deposit-payment%3Dtrue%2Centerprise-register%3Dtrue%2Centerprise%3Dtrue%2Cguide-publish%3Dtrue%2Chigh-paid%3Dtrue%2Chow-know-mart%3Dtrue%2Cim%3Dtrue%2Cmillion-bonus%3Dtrue%2Cmpay-v3-btn%3Dtrue%2Cmpay-v3%3Dtrue%2Cmpay%3Dtrue%2Cpay-multi%3Dtrue%2Cquote-mobile-pay%3Dtrue%2Cselected-user%3Dtrue%2Csso%3Dfalse%2Cstage-evaluation%3Dfalse%2Cuse-cdn%3Dtrue%2C0d0b5456'
        })
        .end(function(err, sres) {
            // 常规的错误处理
            if (err) {

                console.log('errerr', err)
                times++
                concurrencyCount--;
                callback && callback(err)
                return
                // return next(err);
            }
            // sres.text 里面存储着网页的 html 内容，将它传给 cheerio.load 之后
            // 就可以得到一个实现了 jquery 接口的变量，我们习惯性地将它命名为 `$`
            // 剩下就都是 jquery 的内容了
            var $ = cheerio.load(sres.text, {
                decodeEntities: false
            })
            var project = {}
                // console.log('sres.text', sres.text)
            console.log($('title').text())
                // console.log('sres',sres)
            if ($('title').text().indexOf('404') >= 0) {
                console.log('url', url)
                times++
                concurrencyCount--;
                callback && callback(null, '不存在该网址')
                return
            }
            project.title = $('#mart-reward-detail .reward-title .title').html()
            project.status = $('#mart-reward-detail .reward-title .status').html()
            project.rewardNo = $('#mart-reward-detail .desc-row .reward-no').html()
            project.type = $('#mart-reward-detail .desc-row .type').html()
            $('#mart-reward-detail  .detail-span').each(function(idx, element) {
                var $element = $(element);
                // console.log('idx', idx)

                if (idx == 0) {
                    // console.log('$element',$element)

                    project.price = $element.contents().filter(function(index) {
                        return this.type == 'text'
                    }).text().trim()
                }
                if (idx == 1) {
                    project.projectType = $element.contents().filter(function(index) {
                        return this.type == 'text'
                    }).text().trim()
                }
                if (idx == 2) {
                    project.projectDuration = $element.contents().filter(function(index) {
                        return this.type == 'text'
                    }).text().trim()
                }
            });
            // project.darker = $('#mart-reward-detail .desc-row .darker').html()
            project.detail = ($('.reward-content').html() && $('.reward-content').html().trim()) || 'undefined'

            var newProject = Project(project)

            newProject.save(function(err, result) {
                times++
                concurrencyCount--;
                if (err) {

                    return callback && callback(null, err)
                        // console.log(err)
                }
                // console.log('times', times)
                // console.log('totalLength', totalLength)

                // if (times == totalLength) {
                //     res.send('over')
                // }
                callback && callback(null, result)
            })


        });

}




// var j = schedule.scheduleJob(date, function() {
//     console.log('The world is going to end today.');
//     fetchData('https://mart.coding.net/project/9181')
// });
app.get('/subscribe', function(req, res, next) {
    res.sendFile(__dirname + '/index.html')
})

app.post('/subscribe', function(req, res, next) {
    // console.log('req.body', req)
    var email = req.body.email

    var subscriber = {
        email: email
    }

    var newSubscriber = Subscriber(subscriber)

    newSubscriber.save(function(err, subscriber) {
        if (err) {
            return res.send({
                code: -1
            })
        } else {
            res.send({
                code: 0
            })
        }
    })

})

app.get('/', function(req, res, next) {
    var urls = []

    // 并发连接数的计数器



    while (from <= end) {
        urls.push('https://mart.coding.net/project/' + from)
            // fetchData(from)
        from++
    }

    console.log('urls', urls)

    async.mapLimit(urls, 5, function(url, callback) {
            fetchData(url, callback);
        },
        function(err, result) {
            // console.log('err', err)
            console.log('final:');
            // console.log(result);
            res.send(result)
        });
})




app.listen(9999, function() {
    console.log('app is listening at port 9999');
});

var app = require('express')()
var supperagent = require('superagent')
var cheerio = require('cheerio')


app.get('/',function (req,res,next) {
	supperagent.get('https://mart.coding.net/project/9183')
	.set({
			
			'Cookie':'mid=ebc845e1-4aca-4f62-a96a-a88684108916; JSESSIONID=1is5lwjc2h0r91d899akkmlfa2; _ga=GA1.2.2089016391.1500124525; _gid=GA1.2.1559004030.1501839393; exp=89cd78c2; withGlobalSupport=true; c=deposit-payment%3Dtrue%2Centerprise-register%3Dtrue%2Centerprise%3Dtrue%2Cguide-publish%3Dtrue%2Chigh-paid%3Dtrue%2Chow-know-mart%3Dtrue%2Cim%3Dtrue%2Cmillion-bonus%3Dtrue%2Cmpay-v3-btn%3Dtrue%2Cmpay-v3%3Dtrue%2Cmpay%3Dtrue%2Cpay-multi%3Dtrue%2Cquote-mobile-pay%3Dtrue%2Cselected-user%3Dtrue%2Csso%3Dfalse%2Cstage-evaluation%3Dfalse%2Cuse-cdn%3Dtrue%2C0d0b5456'
		})
	.end(function (err, sres) {
      // 常规的错误处理
      if (err) {
        return next(err);
      }
      // sres.text 里面存储着网页的 html 内容，将它传给 cheerio.load 之后
      // 就可以得到一个实现了 jquery 接口的变量，我们习惯性地将它命名为 `$`
      // 剩下就都是 jquery 的内容了
      var $ = cheerio.load(sres.text,{decodeEntities: false})
      var project = {}
      // console.log('sres.text',sres.text)
      // console.log('sres',sres)
      project.title = $('#mart-reward-detail .reward-title .title').html()
      project.status = $('#mart-reward-detail .reward-title .status').html()
      project.rewardNo = $('#mart-reward-detail .desc-row .reward-no').html()
      project.type = $('#mart-reward-detail .desc-row .type').html()
       $('#mart-reward-detail  .darker').each(function (idx, element) {
        var $element = $(element);
        console.log('idx',idx)
        
        if (idx==0) {
        	// console.log('$element',$element)
        	console.log('$element',$element.initialize)
        	console.log('typeof $element',typeof $element)
        	project.price = 	$element.next().data
        }
        if (idx==1) {
        	project.projectType = 	$element.next().data
        }
        if (idx==0) {
        	project.projectDuration = 	$element.next().data
        }
      });
      // project.darker = $('#mart-reward-detail .desc-row .darker').html()
      project.detail = $('.reward-content').html()


      res.send(project);
    });
})

app.listen(3000, function () {
  console.log('app is listening at port 3000');
});
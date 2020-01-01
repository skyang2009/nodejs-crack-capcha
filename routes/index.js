var express = require('express');
var router = express.Router();
var formidable = require("formidable");
var app = express();
let fs = require('fs');


/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});





// 1、接收上传指令，对图片进行处理；2、记录最近一次X查询结果，通过另一个接口返回查询结果
router.post('/post', function(req, res) {
	var form = new formidable.IncomingForm();
	form.encoding = "utf-8";
	form.uploadDir = __dirname + '/../tmp';
	form.multiples = true;
	form.on('fileBegin', function (name, file){
		console.log(file.name);

        file.path = __dirname + '/../tmp/origin.png';// + file.name;
    });

	form.parse(req, function(err, field, files) {
	    files.field = field;
	    res.json(files);
	    console.log(files);
	})
	

})  

router.post('/post/image', function(req, res) {
	let imgData = req.body.image;
	if(imgData!=null){
		let path = __dirname + '/../tmp/origin.png';
		
	    var dataBuffer = new Buffer(imgData, 'base64');
	    fs.writeFile(path, dataBuffer, async function(err) {
	        if(err){
	          res.send(JSON.stringify(err));
	        }else{
			  let x = await global.hackService.getXposition();
			  console.log('x=', x);
	          res.send(JSON.stringify(x));
	        }
	    });

		// global.x = global.hackService.getX();
	}
})  
	

router.get('/x', function(req, res, next) {
  	res.end(JSON.stringify(global.x));
});


module.exports = router;

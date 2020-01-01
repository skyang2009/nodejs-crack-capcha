let path=require('path');
let fs = require('fs');
let cv = require('opencv4nodejs');
let jimp = require('jimp');



class HackService{
	constructor(){
	}

// mat = cv.imread('s41.png');
// img1 = mat.gaussianBlur(new cv.Size(3,3),0)
// canny = mat.canny(50, 150);
// mat.drawLine(1,2,3,5);
// cv.imshow('canny', canny);
// console.log(cv.RETR_EXTERNAL);
// console.log(cv.CHAIN_APPROX_NONE);
// let contours = canny.findContours(cv.RETR_EXTERNAL,cv.CHAIN_APPROX_NONE);
// console.log(contours);
// mat.drawContours(contours,0, new cv.Vec3(0,255,0),3)  
// line_dection(mat);
// cv.waitKey();

	isDark(bitmap, idx){
	    let red   = bitmap.data[ idx + 0 ];
	    let green = bitmap.data[ idx + 1 ];
	    let blue  = bitmap.data[ idx + 2 ];   
	    let dark = red+green+blue;
	    if(dark!=0) return true;
	    else return false;
	}

 	findTarget(image, x, y){
		if(x<200||y<10 || y>300 || x>850) return false;
		let idx;
	    let red   = image.bitmap.data[ idx + 0 ];
	    let green = image.bitmap.data[ idx + 1 ];
	    let blue  = image.bitmap.data[ idx + 2 ];   
	    let dark = red+green+blue;

	    // x,x+1,x+2,x+3,x+50里面有40个黑点，y,y+1,y+2,y+50里面有40个黑点，这个位置记录下来
	    // 然后再看下方几个脚是否满足，有两个直角能满足的情况下基本就稳了

	    let count = 0;
	    let has_v=false, has_h=false;//该点是否有水平线和垂直线
	    for(let i=1;i<30;i++){
	    	idx = image.getPixelIndex(x-i, y); 
	    	if(this.isDark(image.bitmap, idx)) count++;
	    }
	    if(count>20) has_h = true;
	    
	    count = 0;
	    for(let i=1;i<30;i++){
	    	idx = image.getPixelIndex(x, y+i); 
	    	if(this.isDark(image.bitmap, idx)) count++;
	    }
	    if(count>20) has_v = true;

	    return has_h&&has_v;

	    // if(has_h&&has_v) return true;
	    // else return false;
	}


	showPoint(img, arr){
		for(let k in arr){
			img.drawCircle(new cv.Point(arr[k][0],arr[k][1]), 2, new cv.Vec3(0,255,0),2);
		}

		cv.imshow('cirles',img);
		cv.waitKey();
	}


	// 首先将图片resize，然后canny，然后用Jimp对图片进行扫描，返回第一个X
	// 改成同步的代码直接返回？！
	getX(){
		let me = this;
		jimp.read(__dirname+'/../tmp/origin.png',  async (err, image)=>{
			// image.resize(900, 390);
			// image.write(__dirname+'/../tmp/resize.png', me.scanImage);
			me.scanImage();
		})
	}


	async getXposition(){
		let me = this;
		return await new Promise( (resolve, reject)=>{
			jimp.read(__dirname+'/../tmp/origin.png',  async (err, image)=>{
				resolve(me.scanImage());
			})	
		});
	
	}

	async scanImage(){
		let me = this;
		let arr = [];
		let mat = cv.imread(__dirname+'/../tmp/origin.png');
		let gray = mat.cvtColor(cv.COLOR_BGR2GRAY);
		let gauss = gray.gaussianBlur(new cv.Size(3,3),0);	//高斯模糊是为了去除图像中的噪音
		let edges = gauss.canny(50, 150, 3);
		cv.imwrite(__dirname + '/../tmp/edges.png',edges);

		return await new Promise( (resolve, reject)=>{
			let im = jimp.read(__dirname + '/../tmp/edges.png', async (err, image)=>{
				let startX = 0, startY = 0;
				console.log(image.bitmap.width,image.bitmap.height);
				image.scan(0, 0, image.bitmap.width, image.bitmap.height, function (x, y, idx) {
			    	if(me.findTarget(image, x, y)) {
			    		console.log('找到目标x:', x, y);
			    		arr.push([x,y]);
			    	}
				    // 扫描结束后将这些点在原图上用opencv打印出来
				    if(x==image.bitmap.width-1 && y==image.bitmap.height-1){
				    	if(arr[0]!=null){
				    		global.x = arr[0][0];
				    	}
				    	else{
				    		global.x = 0;
				    	}
				    	console.log('扫描结束:', global.x);
				    	resolve(global.x);
				    }
			      });
			});			
		});
	}

	scanImage2(){
		let me = this;
		let arr = [];
		let mat = cv.imread(__dirname+'/../tmp/origin.png');
		let gray = mat.cvtColor(cv.COLOR_BGR2GRAY);
		let gauss = gray.gaussianBlur(new cv.Size(3,3),0);	//高斯模糊是为了去除图像中的噪音
		let edges = gauss.canny(50, 150, 3);
		cv.imwrite(__dirname + '/../tmp/edges.png',edges);


		let im = jimp.read(__dirname + '/../tmp/edges.png', async (err, image)=>{
			let startX = 0, startY = 0;
			console.log(image.bitmap.width,image.bitmap.height);
			image.scan(0, 0, image.bitmap.width, image.bitmap.height, function (x, y, idx) {
		    	if(me.findTarget(image, x, y)) {
		    		console.log('找到目标x:', x, y);
		    		arr.push([x,y]);
		    	}
			    // 扫描结束后将这些点在原图上用opencv打印出来
			    if(x==image.bitmap.width-1 && y==image.bitmap.height-1){
			    	console.log('扫描结束');
			    	// showPoint(mat, arr);
			    	if(arr[0]!=null){
			    		global.x = arr[0][0];
			    	}
			    	else{
			    		global.x = 0;
			    	}
			    }
		      });
		});
	}
}				

module.exports = HackService;


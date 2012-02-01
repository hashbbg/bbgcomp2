// var ASSET_MANAGER = new AssetManager();
// ASSET_MANAGER.queueDownload('img/photo.png');
// var photo = ASSET_MANAGER.getAsset('img/photo.png');
// ASSET_MANAGER.downloadAll(function(){ init(); });

function AssetManager(){
	this.successCount = 0;
	this.errorCount = 0;
	this.cache = {};
	this.downloadQueue = [];
}

AssetManager.prototype.queueDownload = function(path){
	this.downloadQueue.push(path)
}

AssetManager.prototype.downloadAll = function(downloadCallBack){
	if (this.downloadQueue.length === 0){
		downloadCallBack();
	}
	
	for (var i=0; i < this.downloadQueue.length; i++){
		var path = this.downloadQueue[i];
		var img = new Image();
		var that = this;
		img.addEventListener("load", function(){
			// console.log(this.src + ' is loaded');
			that.successCount += 1;
			if (that.isDone()){
				downloadCallBack();
			}
		}, false);
		img.addEventListener("error", function(){
			that.errorCount += 1;
			if (that.isDone()){
				downloadCallBack();
			}
		}, false);
		img.src = path;
		this.cache[path] = img;
	}
}

AssetManager.prototype.getAsset = function(path){
	return this.cache[path];
}

AssetManager.prototype.isDone = function(){
	return (this.downloadQueue.length == this.successCount + this.errorCount);
}
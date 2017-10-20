const express = require('express');
const MongoClient = require('mongodb').MongoClient;
const bodyParser = require('body-parser');
const request = require('request');
const fs  = require('fs');
const os = require('os');
const path = require('path');
const multer  = require('multer');
const PromiseFtp = require('promise-ftp');
const mailer = require("nodemailer");

const app = express();
app.set('view engine', 'ejs');
const port = 8000;
 app.use(multer({ dest: 'uploads/'}).single('mp3payload'));

app.get('/api/file', function(req, res) {
	res.render('index')
})

app.post('/api/file', (req, res, next) => {

	var upload = multer({
		// storage: storage,
		fileFilter: function(req, file, callback) {
			const ext = path.extname(file.originalname)
			if (ext !== '.mp3') {
				return callback(res.end('Only mp3s are allowed'), null)
			}
			
			callback(null, true)
		}
	}).single('mp3payload');

	const audioLocation = req.body.destination
	const title = req.body.title;
	

	upload(req, res, function(err) {
		console.log(audioLocation, title)
		ftpService(res, req.file.path, audioLocation, title )

	})

	

	
})

app.post('/upload', (req, res) => {

		const saveTo = path.join('songs', path.basename(req.body.filename+ID()+'.mp3'))
		
			request({uri: req.body.url})
				.pipe(fs.createWriteStream(saveTo))
				.on('close', () => {
					res.send('File save complete');
				});

		console.log(req.body);

});



app.listen(port, () => {
  console.log('We are live on ' + port);
});

//helpers 
const ID = () =>  '_' + Math.random().toString(36).substr(2, 4);

const ftpcreds = {
	host: 'fillup',
	user: 'fillup',
	pass: 'fillup'
}
 
const ftpService = (res, filepath, folderLocation, title) => {	
	const ftp = new PromiseFtp();
	ftp.connect(
		{
		host: ftpcreds.host, 
		user: ftpcreds.user, 
		password: ftpcreds.pass
	}).then( (serverMessage) => {
	//   console.log('Server message: '+serverMessage);
	  return ftp.list('/gidiradio/uploader');
	}).then((list) => {
	  console.log('Directory listing:');
	 list.map((item) => console.log(item.name))

	const destinationFile = filepath.replace('uploads/','');
	console.log('destination', destinationFile)
	console.log('filepath', filepath)
	console.log('folderLocation', folderLocation)
;
	const finalDestination =  `gidiradio/${folderLocation}/${title}${destinationFile}.mp3`
	console.log(finalDestination)
	ftp.put(filepath, finalDestination, (err)=> {
		console.log(err)
		err !== 'undefined' ? res.send('done') : console.log(err)
		// err === 'undefined' ?  console.log(err) : res.send('done')	
	})
		return ftp.list();
	})
	
};

const cleanString= (name) => {
	name = name.replace(/\s+/gi, '-');
	return name.replace(/[|&;$%@"<>()+,]/g, "");

}
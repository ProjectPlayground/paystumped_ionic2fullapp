var colors = require('colors');

var fs = require('fs-extra');

console.log('Copying custom app-script config'.underline.red);


// As part of install I copy a couple files that I needed to change
var dependencies = [
  ['app_script_config', 'node_modules/@ionic/app-scripts/config/'],
  ['angular2_google_maps_gap', 'node_modules/angular2-google-maps/core/services/']
];

console.log('Executing application custom copies...', dependencies);
dependencies.forEach(function (value) {
  fs.copy(value[0], value[1], function (err) {
    if (err) return console.error(err)
    console.log("success!")
  });

});

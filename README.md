# Paystumped ionic2 full app example
The Paystumped app was written as an educational tool to help people in Oregon understand their wage rights.
More information can be found at the [home page](https://paystumped.com "here")

You can download it both in IOS and Android.  The code located on this repo is the code deployed to this app with the exception of the following
  * fonts
  * artwork
  * several of the geojson files
  * details about API keys and private information

The source code has been made available because I wrote it all myself for a community project and thought it would be fitting to make it available for the broader community especially since ionic2 just came out.  I would be interested in feedback on things I am doing terribly otherwise feel free to download and use as you see fit.  If there are bugs I would appreciate that as well.  Also if someone speaks great spanish an audit of my translations would be so appreciated.  I am hoping to get this app to a broader audience around 04/01/2017.  


## High-level features
* geolocation services to match phone lat/long against a set of geojson polygons
* geojson is stored on phone (upgradable by user) to allow access to the app capabilities offline
* Google map integrated with a geojson overlay to show wage based information
* Limited in-app messaging with Paystumped
* Note taking with localstorage
* Internationalization support for 3 languages including audio

## tech platform
* ionic 2
* firebase for all back-end both Storage and Database
  1. Storage host images that are used for the ionic-native photo viewer.  It also includes geojson files that may be used to upgrade content
  2. Database is used for messages to phone, messages from phones, and links for the latest geojson content
* ng2-translate internationalization example
* Integration of angularfire2 to use firebase
* Integration of font-awesome
* Integration of angular2-google-maps
* Integration of ionic-native for the following features
  1. geolocation
  2. media audio playback
  3. Viewing photos online (zoomable)
  4. Network information (keeping track of being online or offline)

See package.json to get a better idea of the configuration to get an idea of what I am using.

## Ionic components heavily used
* Alert (https://ionicframework.com/docs/v2/components/#alert)
* Badges (https://ionicframework.com/docs/v2/components/#badges)
* Cards (https://ionicframework.com/docs/v2/components/#cards)
* FABs (https://ionicframework.com/docs/v2/components/#fabs)
* Menus (https://ionicframework.com/docs/v2/components/#menus)
* Toast (https://ionicframework.com/docs/v2/components/#toast)
## firebase structure
root
- latestVersion: String
- msg (messages sent to phones)
  - <msg push id>
    - bEn: String (English body)
    - bEs: String (Spanish body)
    - d: Number (date)
    - tEn: String (English title)
    - tEs: String (Spanish title)
- userMsgs (messages from phones)
  - <revd msg push id>
    - msg: String
    - user: String
- version
  - <version id>
    - forest : String (link to download url for json)
    - fwage : String (link to forest wage url for json)
    - portland : String (link to json of metro)
    - wage : String (link to geojosn for the wage map)

## Detailed Install instructions
TBD

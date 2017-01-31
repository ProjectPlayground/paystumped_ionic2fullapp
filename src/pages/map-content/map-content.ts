import {Component} from '@angular/core';
import {GoogleMapsAPIWrapper} from 'angular2-google-maps/core';
import {OfflineContent} from '../../providers/offline-content';
import {PortlandMetroInfo} from '../../providers/portland-metro-info';
import {TranslateService} from 'ng2-translate';
import {ForestInfo} from '../../providers/forest-info';

declare var google:any;

@Component({
  selector: 'page-map-content',
  template: ''
})
export class MapContentPage {

  constructor(public forestInfo:ForestInfo, public mapApiWrapper:GoogleMapsAPIWrapper, public offlineContent:OfflineContent, public portlandMetroInfo:PortlandMetroInfo, public translate:TranslateService) {

    // to only have one window at a time.
    let mapWindow:any = null;

    this.mapApiWrapper.getNativeMap()
      .then((map)=> {


        offlineContent.init()
          .then(()=> {
            map.data.addGeoJson(offlineContent.getWageMapJson());
            map.data.addGeoJson(offlineContent.getEasterEggJson());
          });


        map.data.setStyle(function (feature) {
          let myZ = 1;
          let color = feature.getProperty('fill');
          let stroke = feature.getProperty('stroke');
          if (feature.getProperty('isColorful')) {
            //color = 'gray';
          }

          if (feature.getProperty('geoType') === 'forest') {
            myZ = 10; // make higher.
          }

          if (feature.getProperty('State') === 'WA') {
            myZ = 12;
          }
          return ({
            fillColor: color,
            fillOpacity: 0.8,
            strokeColor: stroke,
            strokeWeight: 1,
            zIndex: myZ
          });
        });

        map.data.addListener('click', function (event) {
          let lang = translate.currentLang;

          let name = event.feature.getProperty('name');
          let type = event.feature.getProperty('geoType');
          let desc = event.feature.getProperty('description');
          let state = event.feature.getProperty('State');
          let rate = event.feature.getProperty('Rate');
          let countyClass = event.feature.getProperty('countyClass');

          let contentString = '';

          if (name === undefined) {

            contentString = `<div style="font-size: 16px;">Jacques and Sidney, we love you!</div>`;

          } else {


            contentString = `<div style="font-size: 16px;">${name}</div><br>`;


            if (lang === 'en') {
              contentString += '<p>';
              if (desc) {
                contentString += '<b>Description:</b>' + desc + '<br>';
              }
              contentString += '<b>State:</b>' + state + '<br>';
              if (type === 'county') {
                contentString += '<b>Area Type:</b>County<br>';
                contentString += '<b>County Classification:</b>' + countyClass + '<br>';
                contentString += '<b>Current Minimum Wage:</b>' + rate + '<br>';
              } else if (type === 'metro') {
                contentString += '<b>Area Type:</b>Portland Metro Area<br>';
                rate = portlandMetroInfo.getWage();
                contentString += '<b>Current Minimum Wage:</b>' + rate + '<br>';
              } else {
                contentString += '<b>Area Type:</b>Forest<br>';


                let forestWageInfo = forestInfo.getForestWages();

                contentString += '<table>';
                contentString += '<tr><td><b>Job Title</b></td><td>  <b>Current Wage</b></td></tr>';

                for (let entry of forestWageInfo) {
                  if (state === 'OR') {
                    contentString += `<tr><td>${entry.titleEn}</td><td>  ${entry.oregon}</td></tr>`;
                  } else if (state === 'CA') {
                    contentString += `<tr><td>${entry.titleEn}</td><td>  ${entry.california}</td></tr>`;

                  } else if (state === 'WA') {
                    contentString += `<tr><td>${entry.titleEn}</td><td>  ${entry.washington}</td></tr>`;

                  } else {
                    // idaho.
                    contentString += `<tr><td>${entry.titleEn}</td><td>  ${entry.idaho}</td></tr>`;
                  }
                }
                contentString += '</table>';
              }


              contentString += '</p>';

            } else {
              contentString += '<p>';
              contentString += '<b>Estado:</b>' + state + '<br>';
              if (type === 'county') {
                contentString += '<b>Tipo de area:</b>Condado<br>';

                if (countyClass === 'Non-Urban') {
                  contentString += '<b>Categoria de condado:</b>no urbano<br>';
                }
                if (countyClass === 'Standard') {
                  contentString += '<b>Categoria de condado:</b>estándar<br>';
                }

                if (countyClass === 'Portland Urban Growth') {
                  contentString += '<b>Categoria de condado:</b>area urbano de Portland<br>';
                }

                contentString += '<b>Sueldo minimo actual:</b>' + rate + '<br>';
              } else if (type === 'metro') {
                contentString += '<b>Tipo de area:</b>area urbano de Portland<br>';
                rate = portlandMetroInfo.getWage();
                contentString += '<b>Sueldo minimo actual:</b>' + rate + '<br>';
              } else {
                contentString += '<b>Tipo de area:</b>Bosque<br>';

                let forestWageInfo = forestInfo.getForestWages();

                contentString += '<table>';
                contentString += '<tr><td><b>Título profesional</b></td><td>  <b>Salario actual</b></td></tr>';

                for (let entry of forestWageInfo) {
                  if (state === 'OR') {
                    contentString += `<tr><td>${entry.titleEs}</td><td>  ${entry.oregon}</td></tr>`;
                  } else if (state === 'CA') {
                    contentString += `<tr><td>${entry.titleEs}</td><td>  ${entry.california}</td></tr>`;

                  } else if (state === 'WA') {
                    contentString += `<tr><td>${entry.titleEs}</td><td>  ${entry.washington}</td></tr>`;

                  } else {
                    // idaho.
                    contentString += `<tr><td>${entry.titleEs}</td><td>  ${entry.idaho}</td></tr>`;
                  }
                }
                contentString += '</table>';
              }
              contentString += '</p>';
            }
          }

          if (!mapWindow) {
            mapWindow = new google.maps.InfoWindow({
              content: contentString,
              position: event.latLng
            });
          } else {

            mapWindow.setOptions({
              position: event.latLng,
              content: contentString
            });

          }

          mapWindow.open(map);

          event.feature.setProperty('isColorful', true);
        });
      });

  }

}

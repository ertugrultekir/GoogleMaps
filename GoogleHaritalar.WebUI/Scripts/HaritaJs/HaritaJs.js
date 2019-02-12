// Haritayı Oluşturmaya BAŞLADI
var map;
var marker;
var markers = [];
var directionsService;
var directionsRenderer;
var waypts = [];
var ilkMarkerler = [];
var ilkFarkiTut;
var diziIndeksi;
var kaliciDizi = [];
var karsilastirmaDizisi = [];
var araDizi = [];
var yardimciDizi = [];
var waypointTut = [];
var sadeceWayPoint = [];
var wayptsKoordinat = [];



function initialize() {
    try {
        map = new google.maps.Map(document.getElementById('map'), {
            zoom: 6,
            mapTypeId: google.maps.MapTypeId.ROADMAP,
            center: { lat: 38.85, lng: 36.65 }
        });

        directionsService = new google.maps.DirectionsService();
        directionsRenderer = new google.maps.DirectionsRenderer({ suppressMarkers: true });
        directionsRenderer.setMap(map);
        directionsRenderer.setPanel(document.getElementById('directions'));

        // This event listener will call addMarker() when the map is clicked.
        map.addListener('click', function (event) {
            addMarker(event.latLng);
        });
    } catch (e) {
        alert('Bilinmeyen bir hata oluştu');
    }
}
// Haritayı Oluşturma TAMAMLANDI.

// Adds a marker to the map and push to the array.
function addMarker(location) {
    try {
        marker = new google.maps.Marker({
            position: location,
            map: map,
            draggable: true
        });
        markers.push(marker);
    } catch (e) {
        alert('Bilinmeyen bir hata oluştu');
    }
}
// Marker ekleme ve eklenen marker'ı diziye basma işlemi BİTTİ.

// Haritaya bırakılan son markeri silme işlemi BAŞLADI.
function deleteLastMarkers() {
    try {
        if (markers.length != 0) {
            markers[markers.length - 1].setMap(null);
            markers.splice(markers.length - 1, 1);
            wayptsKoordinat.splice(wayptsKoordinat.length - 1, 1);

            directionsRenderer.setMap(null);
            //if (markers.length >= 2) {
            //    YolTarifi(markers);
            //}
        }
        else {
            alert('Silenecek işaret bulunamadı');
            return;
        }
    } catch (e) {
        alert("Bilinmeyen bir hata oluştu");
    }
}
// Haritaya bırakılan son markeri silme işlmei BİTTİ.

// Kısa mesafeyi hesaplama işlemi BAŞLADI.
function SonHesaplama() {
    if (markers.length > 2) {
        for (var i = waypts.length + 1; i < markers.length - 1; i++) {
            waypts.push(markers[i]);
            waypointTut.push(markers[i]);
        }

        for (var i = 0; i < waypts.length; i++) {
            ilkFarkiTut = google.maps.geometry.spherical.computeDistanceBetween(markers[0].position, waypts[i].position);
            kaliciDizi[i] = new Array(ilkFarkiTut, i, waypts[i]);
        }
        kaliciDizi = kaliciDizi.sort();
        kaliciDizi.splice(1, kaliciDizi.length - 1);
        yardimciDizi[0] = kaliciDizi[0][1];
        waypts.splice(yardimciDizi[0], 1);

        for (var i = 0; i < waypointTut.length; i++) {
            for (var x = 0; x < waypts.length; x++) {
                araDizi[i] = kaliciDizi[i][2];
                ilkFarkiTut = google.maps.geometry.spherical.computeDistanceBetween(araDizi[i].position, waypts[x].position);
                karsilastirmaDizisi[x] = new Array(ilkFarkiTut, x, waypts[x]);
            }
            if (waypts.length != 0) {
                karsilastirmaDizisi = karsilastirmaDizisi.sort();
                kaliciDizi[i + 1] = karsilastirmaDizisi[0];
                yardimciDizi[0] = karsilastirmaDizisi[0][1];
                waypts.splice(yardimciDizi[0], 1);
                karsilastirmaDizisi = [];
            }
        }
        sadeceWayPoint = [];
        for (var i = 0; i < kaliciDizi.length; i++) {
            sadeceWayPoint[i] = kaliciDizi[i][2];
        }
        wayptsKoordinat = [];
        for (var i = 0; i < sadeceWayPoint.length; i++) {
            wayptsKoordinat.push({
                location: sadeceWayPoint[i].position,
            });
        }

        var markerSonTut = [];
        markerSonTut[0] = markers[markers.length - 1];
        markers.splice(1, markers.length - 1);
        for (var i = 0; i < sadeceWayPoint.length; i++) {
            markers.push(sadeceWayPoint[i]);
        }
        markers.push(markerSonTut[0]);
        
        araDizi = [];
        kaliciDizi = [];
        waypts = [];
        waypointTut = [];
        yardimciDizi = [];
        return wayptsKoordinat;
    }
    else {
    }
}
// Kısa mesafeyi hesaplama işlemi BİTTİ.

// Rota oluşturma işlemi BAŞLADI.
function YolTarifi(x) {
    if (x.length != 0) {
        var request = {
            origin: x[0].position,
            destination: x[x.length - 1].position,
            travelMode: document.getElementById('slcGidisTipi').value,
            unitSystem: google.maps.DirectionsUnitSystem.METRIC,
            waypoints: SonHesaplama(),
            //optimizeWaypoints: true, //Yolları olabildiğince kısa gidilecek şekilde gösteririr.
        };
        directionsService.route(request, function (response, status) {
            if (status == google.maps.DirectionsStatus.OK) {
                directionsRenderer.setDirections(response);
                directionsRenderer.setMap(map);


                if (markers[0] != null) {
                    var araNoktalar = [];
                    for (var i = 1; i < markers.length - 1; i++) {
                        araNoktalar[i - 1] = markers[i].position.toString();
                    }
                    var noktalariGonder = {
                        Nereden: markers[0].position.toString(),
                        Nereye: markers[markers.length - 1].position.toString(),
                        Nerelere: araNoktalar,
                    }
                    $.ajax({
                        url: '/Home/VeriKayitEt',
                        type: 'POST',
                        dataType: 'json',
                        data: noktalariGonder,
                        success: function (data) {
                        }
                    });
                }

            } else {
                alert('Yol Tarifi Oluşturulamadı');
            }
        });
    }
    else {
        alert('Herhangi bir nokta işaretlemesi yapmadınız!');
    }
}
// Rota oluşturma BİTTİ.





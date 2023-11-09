let dtg, carPos, map;

window.onload = () => {
    hideAlert();
    dtg = new DTG();

    document.getElementById('backBtn').onclick = () => {
        let t = document.createElement('a');
        t.href = '../login/index.html';
        t.click();
    };

    var container = document.getElementById('map'); //지도를 담을 영역의 DOM 레퍼런스
    var options = {
        //지도를 생성할 때 필요한 기본 옵션
        center: null, //지도의 중심좌표.
        level: 3, //지도의 레벨(확대, 축소 정도)
    };

    navigator.geolocation.getCurrentPosition((pos) => {
        console.log(pos.coords);
        options.center = new kakao.maps.LatLng(
            pos.coords.latitude,
            pos.coords.longitude,
        );
        map = new kakao.maps.Map(container, options); //지도 생성 및 객체 리턴

        carPos = new kakao.maps.Marker({
            map: map,
            position: options.center,
        });
    });

    document.getElementById('bind-dtg').onclick = () => {
        let id = document.getElementById('dtg-id').value;

        dtg.bind(id, displayDTGData);
    };
};

function displayDTGData(data) {
    if ('message' in data) {
        console.log(data);
        showAlert('DTG Error', 'Check Console');
    }

    let latlng = convLatLng(data.latlng);
    let speed = convSpeed(data.speed, data.factor_speed);
    let runtime = toTime(data.runtime);
    let distance = toDistance(data.distance, data.latlng.factor_latlng);
    let overspeed = toDistance(data.overspeed, data.latlng.factor_latlng);
    let idle = toTime(data.idle_time);
    let suddenbrake = data.sudden_brake;
    let suddenaccel = data.sudden_accel;

    document.getElementById('runtime-min').innerText = runtime.min;
    document.getElementById('runtime-sec').innerText = runtime.sec;

    document.getElementById('stat-distance').innerText = distance;
    document.getElementById('stat-overspeed').innerText = overspeed;
    document.getElementById('stat-idle').innerText = idle.min;
    document.getElementById('stat-suddenaccel').innerText = suddenaccel;
    document.getElementById('stat-suddenbrake').innerText = suddenbrake;

    document.getElementById('vehicle-speed').innerText = speed;

    document.getElementById('vehicle-rpm').innerText = convRpm(speed);

    let kakaoLL = new kakao.maps.LatLng(latlng.lat, latlng.lng);

    carPos.setPosition(kakaoLL);
    map.setCenter(kakaoLL);
}

function convLatLng(latlng) {
    return {
        lat: latlng.lat / latlng.factor_latlng,
        lng: latlng.lng / latlng.factor_latlng,
    };
}

function convSpeed(speed, factor) {
    return ((speed * 3.6) / factor).toFixed(1);
}

function convDeg(deg, factor) {
    return (deg / factor).toFixed(1);
}

function convRpm(speed) {
    let kmh = speed / 3.6;
    return Math.floor((kmh * 60) / 3);
}

function toTime(ms) {
    let sec = Math.floor(ms / 1000);
    let min = Math.floor(sec / 60);
    sec %= 60;
    return { min: min, sec: sec };
}

//kilometers
function toDistance(dd, factor) {
    return ((dd * 100) / factor).toFixed(1);
}

function showAlert(title = '', content = '') {
    document.getElementById('alert-container').style.display = 'flex';
    document.getElementById('alert-title').innerText = title;
    document.getElementById('alert-content').innerText = content;
}

function hideAlert() {
    document.getElementById('alert-container').style.display = 'none';
}

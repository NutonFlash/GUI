let dtg, map, _kakaoLL;

let userMarker = null;

let lockView = true;

function degToRad(deg) {
    return (deg * Math.PI) / 180;
}
function rotate(x, y, theta) {
    return {
        x: x * Math.cos(degToRad(theta)) - y * Math.sin(degToRad(theta)),
        y: x * Math.sin(degToRad(theta)) + y * Math.cos(degToRad(theta)),
    };
}

function createUserMarker(map, lat, lng, orientation = 0) {
    if (userMarker != null) {
        userMarker.circle.setMap(null);
        userMarker.pointer.setMap(null);
    } else {
        userMarker = { circle: null, pointer: null };
    }

    let rad = 1.5;
    userMarker.circle = new kakao.maps.Circle({
        center: new kakao.maps.LatLng(lat, lng), // 원의 중심좌표 입니다
        radius: rad, // 미터 단위의 원의 반지름입니다
        strokeWeight: 5, // 선의 두께입니다
        strokeColor: '#7777FF', // 선의 색깔입니다
        strokeOpacity: 1, // 선의 불투명도 입니다 1에서 0 사이의 값이며 0에 가까울수록 투명합니다
        strokeStyle: 'solid', // 선의 스타일 입니다
        fillColor: '#7777FF', // 채우기 색깔입니다
        fillOpacity: 1, // 채우기 불투명도 입니다
    });

    let d = rotate(0, -0.000015, orientation);

    userMarker.pointer = new kakao.maps.Circle({
        center: new kakao.maps.LatLng(lat - d.y, lng + d.x), // 원의 중심좌표 입니다
        radius: 0.8, // 미터 단위의 원의 반지름입니다
        strokeWeight: 5, // 선의 두께입니다
        strokeColor: '#7777FF', // 선의 색깔입니다
        strokeOpacity: 1, // 선의 불투명도 입니다 1에서 0 사이의 값이며 0에 가까울수록 투명합니다
        strokeStyle: 'solid', // 선의 스타일 입니다
        fillColor: '#7777FF', // 채우기 색깔입니다
        fillOpacity: 1, // 채우기 불투명도 입니다
    });

    userMarker.circle.setMap(map);
    userMarker.pointer.setMap(map);
}

window.onload = () => {
    hideAlert();
    dtg = new DTG();

    document.getElementById('backBtn').onclick = () => {
        let t = document.createElement('a');
        t.href = '../login/index.html';
        t.click();
    };

    document.getElementById('location-lock').onclick = () => {
        lockView = true;

        map.setCenter(_kakaoLL);
    };

    var container = document.getElementById('map'); //지도를 담을 영역의 DOM 레퍼런스
    var options = {
        //지도를 생성할 때 필요한 기본 옵션
        center: null, //지도의 중심좌표.
        level: 3, //지도의 레벨(확대, 축소 정도)
    };

    let lat = 36.3401454;
    let lng = 127.4468659;
    options.center = new kakao.maps.LatLng(lat, lng);

    _kakaoLL = options.center;

    map = new kakao.maps.Map(container, options); //지도 생성 및 객체 리턴

    createUserMarker(map, lat, lng);

    document.getElementById('bind-dtg').onclick = () => {
        let id = document.getElementById('dtg-id').value;

        dtg.bind(id, displayDTGData);
    };

    kakao.maps.event.addListener(map, 'dragstart', function () {
        lockView = false;

        map.setCenter();
    });
};

function displayDTGData(data) {
    if ('message' in data) {
        console.log(data);
        showAlert('DTG Error', data.message);
    }

    let latlng = convLatLng(data.latlng);
    let speed = convSpeed(data.speed, data.factor_speed);
    let accel = convSpeed(data.acceleration, data.factor_speed);
    let runtime = toTime(data.runtime);
    let distance = toDistance(data.distance, data.latlng.factor_latlng);
    let overspeed = toDistance(data.overspeed, data.latlng.factor_latlng);
    let idle = toTime(data.idle_time);
    let suddenbrake = data.sudden_brake;
    let suddenaccel = data.sudden_accel;
    let orientation = data.orientation / data.factor_deg;

    pos = latlng;

    document.getElementById('runtime-min').innerText = runtime.min;
    document.getElementById('runtime-sec').innerText = runtime.sec;

    document.getElementById('stat-distance').innerText = distance;
    document.getElementById('stat-overspeed').innerText = overspeed;
    document.getElementById('stat-idle').innerText = idle.min;
    document.getElementById('stat-suddenaccel').innerText = suddenaccel;
    document.getElementById('stat-suddenbrake').innerText = suddenbrake;

    document.getElementById('vehicle-speed').innerText = speed;

    document.getElementById('vehicle-rpm').innerText =
        (data.engine_running ? 1000 : 0) + convRpm(speed) + convRpm(accel);

    let kakaoLL = new kakao.maps.LatLng(latlng.lat, latlng.lng);

    createUserMarker(map, latlng.lat, latlng.lng, orientation);

    _kakaoLL = kakaoLL;

    if (lockView) map.setCenter(kakaoLL);
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

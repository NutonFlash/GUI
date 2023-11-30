let dtg, map, _kakaoLL, LL, prevLL;

let userMarker = null;

let lockView = true;

let oldPaths = [];
let oldDirectionPaths = [];

let autopilot = true;
let destReached = false;
const DD_PATHS_THRESHOLD = 0.00008;

window.onload = async () => {
    hideAlert();
    dtg = new DTG();

    //binds to the first available dtg
    dtg.bind('any', displayDTGData);

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

    LL = { lat: lat, lng: lng };
    prevLL = { ...LL };
    _kakaoLL = options.center;

    map = new kakao.maps.Map(container, options); //지도 생성 및 객체 리턴

    createUserMarker(map, lat, lng);

    document.getElementById('bind-dtg').onclick = () => {
        let id = document.getElementById('dtg-id').value;

        dtg.bind(id, displayDTGData);
    };

    kakao.maps.event.addListener(map, 'dragstart', function () {
        lockView = false;
    });

    drawDirectionPaths('맘스터치 우송대점');

    setInterval(() => {
        if (
            destReached ||
            (prevLL &&
                Math.abs(prevLL.lat - LL.lat) < DD_PATHS_THRESHOLD &&
                Math.abs(prevLL.lng - LL.lng) < DD_PATHS_THRESHOLD)
        )
            return;
        prevLL = { ...LL };

        drawDirectionPaths('맘스터치 우송대점');
    }, 5000);

    const data = {
        bag_5L: 1,
        bag_10L: 2,
        bag_20L: 3,
        bag_30L: 4,
        bag_50L: 5,
        bag_75L: 6,
        bag_etc: 7,
        others: 8,
        weight: 20,
        volume: 9,
    };

    localStorage.setItem('garbageStats', data);

    updateGarbageStats(data);
    setInterval(async () => {
        // const data = await fetchGarbageData();
        // if (data.length > 0) {
        //     localStorage.setItem('garbageStats', data[0]);
        // }
        if (data && convSpeed(dtg.data.speed, dtg.data.factor_speed) <= 0) {
            data.bag_5L++;
            data.bag_10L++;
            data.bag_20L++;
            data.bag_30L++;
            data.bag_50L++;
            data.bag_75L++;
            data.bag_etc++;
            data.others++;
            data.weight += 5;

            updateGarbageStats(data);
        }
    }, 5000);
};

async function drawDirectionPaths(to, from = LL) {
    for (let op of oldDirectionPaths) op.setMap(null);

    oldDirectionPaths = [];
    oldPaths = [];
    oldPathPt = 0;

    let waypoints = await getDirectionFromLatLng(
        await getLatLngFromKeyword(to),
    );

    let path = new kakao.maps.Polyline({
        map: map,
        strokeWeight: 5,
        strokeColor: '#3535FF',
        strokeOpacity: 0.9,
        strokeStyle: 'solid',
    });

    let paths = [];

    for (let wp of waypoints) {
        let count = 0;

        let _LL = { lat: -1, lng: -1 };
        for (let vert of wp.vertexes) {
            if (count === 0) {
                _LL.lng = vert;
                count = 1;
            } else {
                _LL.lat = vert;
                count = 0;

                let kkll = new kakao.maps.LatLng(_LL.lat, _LL.lng);
                paths.push(kkll);

                if (oldPaths.length <= 5)
                    oldPaths.push({ lat: kkll.Ma, lng: kkll.La });
            }
        }
    }

    path.setPath(paths);
    oldDirectionPaths.push(path);
}

async function getDirectionFromLatLng(to, from = LL) {
    let endpoint = `https://apis-navi.kakaomobility.com/v1/directions?origin=${from.lng},${from.lat}&destination=${to.lng},${to.lat}`;
    let res = await fetch(endpoint, {
        method: 'GET',
        headers: {
            Authorization: 'KakaoAK 032038e1b0b7aae5472e7395fdb9d40b',
        },
    });

    res = await res.json();
    res = res?.routes[0]?.sections[0].roads;
    if (!res) {
        showAlert(
            `Direction to ${to.lat}, ${to.lng} from ${from.lat},${from.lng} not found`,
        );
    }

    return res;
}

async function getLatLngFromKeyword(keyword) {
    let endpoint = `https://dapi.kakao.com/v2/local/search/keyword.json?query=${keyword}`;
    let res = await fetch(endpoint, {
        method: 'GET',
        headers: {
            Authorization: 'KakaoAK 032038e1b0b7aae5472e7395fdb9d40b',
        },
    });

    res = await res.json();

    let docs = res.documents;
    if (docs.length <= 0) {
        showAlert(`Location ${keyword} not found`);
        return null;
    }

    return { lat: docs[0].y, lng: docs[0].x };
}

function degToRad(deg) {
    return (deg * Math.PI) / 180;
}

function radToDeg(rad) {
    return (rad * 180) / Math.PI;
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
        strokeColor: '#5555FF', // 선의 색깔입니다
        strokeOpacity: 1, // 선의 불투명도 입니다 1에서 0 사이의 값이며 0에 가까울수록 투명합니다
        strokeStyle: 'solid', // 선의 스타일 입니다
        // strokeDasharray: '5',
        fillColor: '#5555FF', // 채우기 색깔입니다
        fillOpacity: 1, // 채우기 불투명도 입니다
    });

    userMarker.pointer.setMap(map);
    userMarker.circle.setMap(map);
}

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
    let rpm =
        (data.engine_running ? 1000 : 0) + convRpm(speed) + convRpm(accel);

    pos = latlng;

    document.getElementById('runtime-min').innerText = runtime.min;
    document.getElementById('runtime-sec').innerText = runtime.sec;

    document.getElementById('stat-distance').innerText = distance;
    document.getElementById('stat-overspeed').innerText = overspeed;
    document.getElementById('stat-idle').innerText = idle.min;
    document.getElementById('stat-suddenaccel').innerText = suddenaccel;
    document.getElementById('stat-suddenbrake').innerText = suddenbrake;

    document.getElementById('vehicle-speed').innerText = speed;

    document.getElementById('vehicle-rpm').innerText = rpm;

    let kakaoLL = new kakao.maps.LatLng(latlng.lat, latlng.lng);
    LL.lat = latlng.lat;
    LL.lng = latlng.lng;

    createUserMarker(map, latlng.lat, latlng.lng, orientation);

    _kakaoLL = kakaoLL;

    if (lockView) map.setCenter(kakaoLL);

    //calculate direction

    if (autopilot) {
        let dTot = 0;
        for (let i = oldPathPt; i < oldPaths.length; i++) {
            let op = oldPaths[i];
            if (_temp) _temp.setMap(null);
            let dLng = op.lng - LL.lng;
            let dLat = op.lat - LL.lat;
            dTot = Math.abs(dLng) + Math.abs(dLat);
            if (dTot > DD_PATHS_THRESHOLD / 3) {
                _temp = new kakao.maps.Circle({
                    center: new kakao.maps.LatLng(op.lat, op.lng), // 원의 중심좌표 입니다
                    radius: 5, // 미터 단위의 원의 반지름입니다
                    strokeWeight: 5, // 선의 두께입니다
                    strokeColor: '#ff0000', // 선의 색깔입니다
                    strokeOpacity: 1, // 선의 불투명도 입니다 1에서 0 사이의 값이며 0에 가까울수록 투명합니다
                    strokeStyle: 'solid', // 선의 스타일 입니다
                    fillColor: '#ff0000', // 채우기 색깔입니다
                    fillOpacity: 1, // 채우기 불투명도 입니다
                    map: map,
                });
                let deg = radToDeg(Math.atan(Math.abs(dLat) / Math.abs(dLng)));

                if (dLng >= 0) {
                    if (dLat >= 0) {
                        deg = 90 - deg;
                    } else {
                        deg += 90;
                    }
                } else {
                    if (dLat >= 0) {
                        deg += 270;
                    } else {
                        deg = 270 - deg;
                    }
                }

                let turnDeg = deg - orientation;
                if (
                    revCount <= 5 &&
                    Math.abs(turnDeg) <= 190 &&
                    Math.abs(turnDeg) >= 170
                ) {
                    revCount++;
                    continue;
                } else {
                    revCount = 0;
                }
                dtg.turn(turnDeg);
                break;
            } else {
                oldPathPt++;
                continue;
            }
        }
        if (oldPaths.length < 3 && dTot < DD_PATHS_THRESHOLD * 5) {
            if (oldPathPt !== 0) {
                destReached = true;
                autopilot = false;
            }
            dtg.setBrake('low');
        } else if (speed > dtg.NORMAL_SPEED) dtg.setAccel('none');
        else dtg.setAccel('low');
    }
}

let _temp;
let oldPathPt = 0;
let revCount = 0;

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

async function fetchGarbageData() {
    let data = null;
    await new Promise((res, rej) => {
        const request = new XMLHttpRequest();
        const serverUrl = 'http://localhost:5000';
        request.open('GET', serverUrl + '/collection');
        request.onreadystatechange = () => {
            if (request.readyState === XMLHttpRequest.DONE) {
                const status = request.status;
                if (status === 0 || (status >= 200 && status < 400)) {
                    data = JSON.parse(request.responseText);
                    res();
                } else {
                    rej();
                }
            }
        };
        request.setRequestHeader(
            'Authorization',
            'Bearer ' + JSON.parse(localStorage.getItem('user')).token,
        );
        request.send();
    });
    return data;
}

function updateGarbageStats(data) {
    const totalCountNode = document.getElementById('garbage-totalcount');
    let totalCount =
        data.bag_5L +
        data.bag_10L +
        data.bag_20L +
        data.bag_30L +
        data.bag_50L +
        data.bag_75L +
        data.bag_etc +
        data.others;
    totalCountNode.innerText = totalCount;

    const totalWeightNode = document.getElementById('garbage-totalweight');
    totalWeightNode.innerText = data.weight;

    const _5LCountNode = document.getElementById('garbage-5L');
    _5LCountNode.innerText = data.bag_5L;

    const _10LCountNode = document.getElementById('garbage-10L');
    _10LCountNode.innerText = data.bag_10L;

    const _20LCountNode = document.getElementById('garbage-20L');
    _20LCountNode.innerText = data.bag_20L;

    const _30LCountNode = document.getElementById('garbage-30L');
    _30LCountNode.innerText = data.bag_30L;

    const _50LCountNode = document.getElementById('garbage-50L');
    _50LCountNode.innerText = data.bag_50L;

    const _75LCountNode = document.getElementById('garbage-75L');
    _75LCountNode.innerText = data.bag_75L;

    const etcCountNode = document.getElementById('garbage-etc');
    etcCountNode.innerText = data.bag_etc;

    const errCountNode = document.getElementById('garbage-error');
    errCountNode.innerText = data.others;
}

const firstTrunkData = {
    "bag_5L": 155,
    "bag_10L": 60,
    "bag_20L": 35,
    "bag_30L": 45,
    "bag_50L": 35,
    "bag_75L": 25,
    "bag_etc": 15,
    "others": 20,
    "weight": 50,
    "volume": 34
}

const initData = {
    "bag_5L": 0,
    "bag_10L": 0,
    "bag_20L": 0,
    "bag_30L": 0,
    "bag_50L": 0,
    "bag_75L": 0,
    "bag_etc": 0,
    "others": 0,
    "weight": 0,
    "volume": 0,
    "avg": 0
}

window.onload = async () => {

    let data = localStorage.getItem('garbageStats');
    if (!data) {
        data = initData;
        localStorage.setItem('garbageStats', JSON.stringify(data));
    } else {
        data = JSON.parse(data);
    }

    document.getElementById('chevron-container').addEventListener('click', (evt) => {
        toggleSidebar(evt);
        const canvasArr = Array.from(document.querySelectorAll('.canvas'));
        for (let i = 0; i < canvasArr.length; i++) {
            const canvas = canvasArr[i];
            let sections = null;
            i == 0 ? sections = calcSections(firstTrunkData) : sections = calcSections(data);
            drawTrunk(canvas, sections);
        }
    });

    hideAlert();
    dtg = new DTG();

    //binds to the first available dtg
    dtg.bind('any', displayDTGData);
    
    document.getElementById('bind-dtg').onclick = () => {
        let id = document.getElementById('dtg-id').value;
        dtg.bind(id, displayDTGData);
    };

    setInterval(async () => {
        // const data = await fetchGarbageData();
        // if (data.length > 0) {
        //     localStorage.setItem('garbageStats', data[0]);
        // }
        if (data) {
            const oldData = { ...data };
            data.bag_5L++;
            data.bag_10L++;
            data.bag_20L++;
            data.bag_30L;
            data.bag_50L++;
            data.bag_75L;
            data.bag_etc++;
            data.others++;
            data.weight += 5;
            data.avg = calcGarbageAvg(data, oldData);

            //save data
            localStorage.setItem('garbageStats', JSON.stringify(data));

            //update stats and picture
            updateGarbageStats(data);
            const block = document.getElementById('trunk-2');
            const canvas = block.querySelector('.canvas');
            const sections = calcSections(data);
            drawTrunk(canvas, sections);
            updateTrunkStats(sections, block);
        }
    }, 5000);

    initTrunkInfo([firstTrunkData, data]);
    updateGarbageStats(data);
};

function toggleSidebar(evt) {
    if (evt.target === document.getElementById('sidebar-toggle')) {
        if (!document.getElementById('sidebar-toggle').checked) {
            openSidebar();
        } else {
            closeSidebar();
        }
    }
}

function closeSidebar() {
    document.getElementById('main').style = 'transform: translateX(0px); width: 100%; margin-left: 5rem;'
    document.getElementById('sidebar').style = 'transform: translateX(-420px);'
    document.getElementById('sidebar-chevron').style = 'transform: translateX(405px);'
    document.querySelector('#chevron-container img').style = 'rotate: 180deg;'
    document.getElementById('trunk-1').querySelector('.trunk-drawing').style = 'width: 40%; margin: 0 3rem;';
    document.getElementById('trunk-2').querySelector('.trunk-drawing').style = 'width: 40%; margin: 0 3rem;';
}

function openSidebar() {
    document.getElementById('main').style = '';
    document.getElementById('sidebar').style = '';
    document.getElementById('sidebar-chevron').style = '';
    document.querySelector('#chevron-container img').style = '';
    document.getElementById('trunk-1').querySelector('.trunk-drawing').style = '';
    document.getElementById('trunk-2').querySelector('.trunk-drawing').style = '';
}

function displayDTGData(data) {
    if ('message' in data) {
        console.log(data);
        showAlert('DTG Error', data.message);
    }

    let latlng = convLatLng(data.latlng);
    let runtime = toTime(data.runtime);
    let distance = toDistance(data.distance, data.latlng.factor_latlng);
    let overspeed = toDistance(data.overspeed, data.latlng.factor_latlng);
    let idle = toTime(data.idle_time);
    let suddenbrake = data.sudden_brake;
    let suddenaccel = data.sudden_accel;

    pos = latlng;

    document.getElementById('runtime-min').innerText = runtime.min;
    document.getElementById('runtime-sec').innerText = runtime.sec;

    document.getElementById('stat-distance').innerText = distance;
    document.getElementById('stat-overspeed').innerText = overspeed;
    document.getElementById('stat-idle').innerText = idle.min;
    document.getElementById('stat-suddenaccel').innerText = suddenaccel;
    document.getElementById('stat-suddenbrake').innerText = suddenbrake;
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

async function fetchGarbageData() {
    let data = null;
    await new Promise((res, rej) => {
        const request = new XMLHttpRequest();
        const serverUrl = 'http://localhost:5000';
        request.open('GET', serverUrl + '/collection')
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
        request.setRequestHeader('Authorization', 'Bearer ' + JSON.parse(localStorage.getItem('user')).token)
        request.send();
    });
    return data;
}

function updateGarbageStats(data) {
    const totalCountNode = document.getElementById('garbage-totalcount');
    let totalCount = data.bag_5L + data.bag_10L + data.bag_20L + data.bag_30L + data.bag_50L + data.bag_75L + data.bag_etc + data.others;
    totalCountNode.innerText = totalCount;

    const garbageAvgNode = document.getElementById('garbage-avg');
    garbageAvgNode.innerText = data.avg;

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

function drawTrunk(canvas, sections) {
    // resize canvas
    const width = canvas.parentNode.clientWidth;
    const height = canvas.parentNode.clientHeight;
    canvas.width = width;
    canvas.height = height;

    const ctx = canvas.getContext('2d');

    ctx.clearRect(0, 0, width, height);

    //draw trunk
    const trunkColor = "rgb(25, 192, 6)";
    ctx.fillStyle = trunkColor;
    ctx.strokeStyle = trunkColor;
    
    const borderWidth = 3;

    //left edge
    ctx.fillRect(0, 0, borderWidth, height);
    //upper edge
    const upperEdgeWidth = Math.round(0.7 * width); // aspectRate = 2, width = 300px
    ctx.fillRect(3, 3, upperEdgeWidth, borderWidth);
    //down edges
    const downEdgeWidth = Math.round(0.7 * width);
    ctx.fillRect(3, height - borderWidth - 3, width, borderWidth);
    ctx.fillRect(3, height - 3 * borderWidth - 3, downEdgeWidth, 3 * borderWidth);

    //rigth edges
    ctx.save();
    const rightShift = Math.round(width * 0.075);
    let x0 = width - rightShift;
    let y0 = height - borderWidth;
    ctx.translate(x0, y0);
    ctx.rotate((Math.PI / 180) * - 90); 
    ctx.translate(-x0, -y0);
    ctx.fillRect(x0, y0, Math.round(0.3*height), borderWidth);
    
    ctx.restore();
    ctx.save();
    
    x0 = upperEdgeWidth + borderWidth;
    y0 = 3;
    ctx.translate(x0, y0);
    ctx.rotate(Math.atan(0.7*height / (width - upperEdgeWidth - rightShift + borderWidth))); 
    ctx.translate(-x0, -y0);
    ctx.fillRect(x0, y0, Math.round(((0.7*height-borderWidth)**2 + (width-upperEdgeWidth-rightShift-borderWidth)**2) ** 0.5), borderWidth);
    
    ctx.restore();
    ctx.save();

    x0 = width - rightShift + borderWidth;
    y0 = Math.round(0.85*height) - borderWidth;
    ctx.translate(x0, y0);
    ctx.rotate((Math.PI / 180) * 45); 
    ctx.translate(-x0, -y0);
    ctx.fillRect(x0, y0, Math.round((2*(0.15*height-borderWidth)**2) ** 0.5), borderWidth);
    
    ctx.restore();
    ctx.save();
    
    //right symbol
    x0 = width*0.7 + Math.round(((0.3*width - rightShift) / 2) - (40 / 2));
    y0 = height * 0.55;
    ctx.fillRect(x0, y0, 35, borderWidth);
    ctx.fillRect(x0 + 35, y0, borderWidth, 50);
    ctx.fillRect(x0, y0 + 50, 35 + borderWidth, borderWidth);
    ctx.fillRect(x0, y0, borderWidth, 50);

    ctx.beginPath();
    x0 = x0 + Math.round((35 + borderWidth) / 2);
    y0 = y0 + Math.round(50 / 2);
    ctx.arc(x0, y0, 9, 0, 2 * Math.PI);
    ctx.stroke();

    //draw sections
    const sectionWidth = Math.round(0.7 * width / sections.length);
    const sectionHeight = height - 6 * borderWidth;
    for (let i = 0; i < sections.length; i++) {
        ctx.beginPath();
        ctx.fillStyle = sections[i].color;
        if (i == 0) {
            ctx.moveTo(3, 6);
            ctx.lineTo(3, 6 + sectionHeight);
            ctx.lineTo(3 + sectionWidth, 6 + sectionHeight);
            ctx.fill();
        } else if (i == (sections.length - 1)) {
            ctx.moveTo(3 + (i - 1) * sectionWidth, 7);
            ctx.lineTo(3 + i * sectionWidth, 5 + sectionHeight);
            ctx.lineTo(3 + (i + 1) * sectionWidth, 5 + sectionHeight);
            ctx.lineTo(3 + i * sectionWidth, 7);
            ctx.lineTo(3 + (i - 1) * sectionWidth, 7);
            ctx.strokeStyle = '#000000'
            ctx.setLineDash([4, 2]);
            ctx.stroke();
        } else {
            ctx.moveTo(3 + (i - 1) * sectionWidth, 6);
            ctx.lineTo(3 + i * sectionWidth, 6 + sectionHeight);
            ctx.lineTo(3 + (i + 1) * sectionWidth, 6 + sectionHeight);
            ctx.lineTo(3 + i * sectionWidth, 6);
            ctx.fill();
        }
    }
    //add text
    ctx.font = 'NotoSansKR 16px';
    for (let i = 0; i < sections.length; i++) {
        if (i == (sections.length - 1)) {
            ctx.fillStyle = 'black';    
        } else {
            ctx.fillStyle = 'white';
        }
        ctx.font = "14px bold serif";
        ctx.fillText(sections[i].fraction + '%', 7 + sectionWidth * i * .95, Math.round(sectionHeight * 0.6));
        ctx.font = "12px serif";
        ctx.fillText(sections[i].labelEng, 9 + sectionWidth * i * .95, Math.round(sectionHeight * 0.75));
    }
}

function calcSections(data) {
    const maxVolume = 11;
    const sections = [
        {
            labelEng: 'Oth',
            labelKor: '봉투',
            color: '#FFAE09',
            volume: Math.round(35 * data.others * 0.001 * 100) / 100,
        }, {
            labelEng: 'Etc',
            labelKor: '봉투',
            color: '#FF6F00',
            volume: Math.round(35 * data.bag_etc * 0.001 * 100) / 100,
        }, {
            labelEng: '75L',
            labelKor: '봉투',
            color: '#66CC00',
            volume: Math.round(75 * data.bag_75L * 0.001 * 100) / 100,
        }, {
            labelEng: '50L',
            labelKor: '봉투',
            color: '#99ff33',
            volume: Math.round(50 * data.bag_50L * 0.001 * 100) / 100,
        }, {
            labelEng: '30L',
            labelKor: '봉투',
            color: '#6600cc',
            volume: Math.round(30 * data.bag_30L * 0.001 * 100) / 100,
        }, {
            labelEng: '20L',
            labelKor: '봉투',
            color: '#000099',
            volume: Math.round(20 * data.bag_20L * 0.001 * 100) / 100,
        }, {
            labelEng: '10L',
            labelKor: '봉투',
            color: '#0080ff',
            volume: Math.round(10 * data.bag_10L * 0.001 * 100) / 100,
        }, {
            labelEng: '5L',
            labelKor: '봉투',
            color: '#00BCFF',
            volume: Math.round(5 * data.bag_5L * 0.001 * 100) / 100,
            
        },
    ];

    const initialValue = 0;
    sections.push(
        {
            labelEng: 'Mty',
            labelKor: '공간',
            color: '#ffffff',
            volume: Math.round((maxVolume - sections.reduce((totalVolume, section) => totalVolume + section.volume, initialValue,)) * 100) / 100,
        }
    )

    sections.forEach(section => section.fraction = Math.round(section.volume / maxVolume * 100));

    return sections
}

function updateTrunkStats(sections, parent) {
    const trunkStatsArr = Array.from(parent.querySelectorAll('.trunk-stat'));
    for (let i = 0; i < sections.length; i++) {
        const parentNode = trunkStatsArr[i];
        const colorLabel = parentNode.querySelector('.color-label');
        if (i == sections.length - 1) {
            colorLabel.style = `border: 1px solid black;`;
        } else {
            colorLabel.style = `background-color: ${sections[i].color};`;
        }
        const sizeLabel = parentNode.querySelector('.size-label');
        sizeLabel.innerHTML = `<p> ${sections[i].labelEng} ${sections[i].labelKor} </p>`;
        const volumeLabel = parentNode.querySelector('.volume-label');
        volumeLabel.innerHTML = `<p> ${sections[i].volume} m<sup>3</sup> </p>`;
        const fractionLabel = parentNode.querySelector('.fraction-label');
        fractionLabel.innerHTML = `<p> <b>${sections[i].fraction}%</b> </p>`;
    }
}

function createTrunkStats() {
    Array.from(document.querySelectorAll('.trunk-block')).forEach(trunkBlock => {
        const parent = trunkBlock.querySelector('.trunk-stats-block');
        for (let i = 0; i < 9; i++) {
            const trunkStat = document.createElement('div');
            trunkStat.classList.add('trunk-stat');

            const colorLabelWrapper = document.createElement('div');
            const colorLabel = document.createElement('div');
            colorLabel.classList.add('color-label');
            colorLabelWrapper.appendChild(colorLabel);

            const sizeLabel = document.createElement('div');
            sizeLabel.classList.add('size-label');

            const volumeLabel = document.createElement('div');
            volumeLabel.classList.add('volume-label');

            const fractionLabel = document.createElement('div');
            fractionLabel.classList.add('fraction-label');
            
            trunkStat.appendChild(colorLabelWrapper);
            trunkStat.appendChild(sizeLabel);
            trunkStat.appendChild(volumeLabel);
            trunkStat.appendChild(fractionLabel);

            if (i == 8) {
                trunkStat.classList.add('big-font');
            }

            parent.appendChild(trunkStat);

            if (i == 7) {
                const separator = document.createElement('div');
                separator.classList.add('stats-separator');
                parent.appendChild(separator);
            }
        }   
    });
}

function initTrunkInfo(dataArr) {
    createTrunkStats();

    let blocks = Array.from(document.querySelectorAll('.trunk-block'));
    let canvases = Array.from(document.querySelectorAll('.canvas'));

    for (let i = 0; i < 2; i++) {
        let data = dataArr[i];
        const sections = calcSections(data);
        updateTrunkStats(sections, blocks[i]);
        drawTrunk(canvases[i], sections);
    }
}

function calcGarbageAvg(newData, oldData) {
    let newTotalCount = 0;
    let oldTotalCount = 0;
    for (let prop in newData) {
        if (prop !== 'weight' && prop !== 'volume' && prop !== 'avg') {
            newTotalCount += newData[prop];
            oldTotalCount += oldData[prop];
        }
    }
    return newTotalCount - oldTotalCount;
}
let user = {};

window.onload = () => {
    hideAlert();
    enableLoginInput();

    user = JSON.parse(
        localStorage.getItem('user') || '{ "authorized": false }',
    );

    if (user.authorized) displayWorkers();
};

function enableLoginInput() {
    const input = document.createElement('input');
    input.type = 'text';
    input.id = 'car-id';

    let container = document.getElementById('car-details');
    container.innerHTML = '';
    container.appendChild(input);
}

function displayWorkers() {
    let user = JSON.parse(localStorage.getItem('user'));
    let details = `<p><span class="bold-text">배차</span>2023-0718-001<span class="bold-text">${user.area}</span></p>
    <p>${user.driver}</p>
    <p>${user.crew1}</p>
    <p>${user.crew2}</p>`;

    document.getElementById('car-details').innerHTML = details;
}

function handleEdit() {
    user.authorized = false;

    localStorage.removeItem('user');

    enableLoginInput();
}

async function handleConfirm() {
    if (!user.authorized) {
        if (await authorizeDriver()) {
            displayWorkers();
        } else showAlert('Invalid Credentials');
    } else {
        let t = document.createElement('a');
        t.href = '../main/index.html';
        t.click();
    }
}

async function authorizeDriver() {
    let isAthorized = false;
    const dispatch_no = document.getElementById('car-id').value;
    await new Promise((resolve, reject) => {
        const request = new XMLHttpRequest();
        const serverUrl = 'http://localhost:5000';
        request.open('POST', serverUrl + '/login')
        request.onreadystatechange = () => {
            if (request.readyState === XMLHttpRequest.DONE) {
                const status = request.status;
                if (status === 0 || (status >= 200 && status < 400)) {
                    isAthorized = true;
                    const response = JSON.parse(request.responseText);
                    console.log(response);
                    response.authorized = true;
                    user = response;
                    localStorage.setItem('user', JSON.stringify(response));
                    resolve();
                } else {
                    if (status == 404) {
                        showAlert('Dispatch No Not Found', 'Check your dispatch number');
                    }
                    reject();
                }
            }
        };
        request.setRequestHeader('Content-Type', 'application/json')
        request.send(JSON.stringify({dispatch_no}));
    });
    return isAthorized;
}

function handleClick() {
    showAlert('기타운행 버튼이 클릭되었습니다!!');
}

function showAlert(title = '', content = '') {
    document.getElementById('alert-container').style.display = 'flex';
    document.getElementById('alert-title').innerText = title;
    document.getElementById('alert-content').innerText = content;
}

function hideAlert() {
    document.getElementById('alert-container').style.display = 'none';
}

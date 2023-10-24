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
    let details = `<p><span class="bold-text">배차</span>2023-0718-001<span class="bold-text"> 첨단1,2구역</span></p>
    <p>운전원 유재석</p>
    <p>탑승원 강호동</p>
    <p>탑승원 신동엽</p>`;

    document.getElementById('car-details').innerHTML = details;
}

function handleEdit() {
    user.authorized = false;

    localStorage.removeItem('user');

    enableLoginInput();
}

function handleConfirm() {
    if (!user.authorized) {
        if (authorizeDriver()) {
            displayWorkers();
        } else showAlert('Invalid Credentials');
    } else {
        let t = document.createElement('a');
        t.href = './pages/main/index.html';
        t.click();
    }
}

function authorizeDriver() {
    const users = {
        admin: true,
        test1: true,
    };

    let carIdInput = document.getElementById('car-id');
    let carId = carIdInput.value;

    carIdInput.value = '';

    let userExists = users[carId] || false;
    if (userExists) {
        user.authorized = true;
        user.id = carId;

        localStorage.setItem('user', JSON.stringify(user));
    }

    return userExists;
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

window.onload = () => {
    document.getElementById('backBtn').onclick = () => {
        let t = document.createElement('a');
        t.href = '../../index.html';
        t.click();
    };

    var container = document.getElementById('map'); //지도를 담을 영역의 DOM 레퍼런스
    var options = {
        //지도를 생성할 때 필요한 기본 옵션
        center: null, //지도의 중심좌표.
        level: 3, //지도의 레벨(확대, 축소 정도)
    };

    var map;

    navigator.geolocation.getCurrentPosition((pos) => {
        console.log(pos.coords);
        options.center = new kakao.maps.LatLng(
            pos.coords.latitude,
            pos.coords.longitude,
        );
        map = new kakao.maps.Map(container, options); //지도 생성 및 객체 리턴

        var marker = new kakao.maps.Marker({
            map: map,
            position: options.center,
        });
    });
};

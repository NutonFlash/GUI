export function createSidebar(parentNode, pathToAssets) {
    parentNode.innerHTML = `
    <div id="sidebar-chevron">
            <label id="chevron-container" for="sidebar-toggle">
                <img src="${pathToAssets}chevron-left-black.svg"><input type="checkbox" id="sidebar-toggle"
                    class="visually-hidden">
            </label>
        </div>
        <div id="sidebar-container">
            <button id="backBtn"
                style="position:absolute; z-index: 1;right: 0;background-color: transparent; height: 2rem; border: none; cursor: pointer;">BACK</button>
            <div class="top-bar">실시간 현황</div>
            <div class="car-info">
                <div id="car-detail">배차 2023-0718-001 첨단1, 2 구역</div>
                <button id="dropdown-misc"><img src="${pathToAssets}chevron-left-black.svg" width="20px"
                        style="rotate: 270deg;"></button>
            </div>
            <div class="eco-rating-container">
                <img class="eco-img" src="${pathToAssets}eco.svg">
                <div id="eco-rating">97</div>
                <span class="eco-jeom">점</span>
            </div>

            <div class="drive-stats">
                <div class="drive-stat" style="border-top-left-radius: 7px;">
                    <span class="stats-label">연속운전</span>
                    <div id="stat-runtime">
                        <span id="runtime-min" class="stat-main">74</span>
                        <label class="lbl-med">분</label>
                        <span id="runtime-sec" class="stat-sub">35</span>
                        <label class="lbl-small">초</label>
                    </div>
                </div>
                <div class="drive-stat">
                    <span class="stats-label">이동거리</span>
                    <div><span id="stat-distance" class="stat-main">34.2</span><label class="lbl-med">km</label></div>

                </div>
                <div class="drive-stat" style="border-top-right-radius: 7px;">
                    <span class="stats-label">과속</span>
                    <div><span id="stat-overspeed" class="stat-main">2.8</span><label class="lbl-med">km</label></div>
                </div>
                <div class="drive-stat" style="border-bottom-left-radius: 7px;">
                    <span class="stats-label">공회전</span>
                    <div>
                        <span id="stat-idle" class="stat-main">28</span>
                        <label class="lbl-med">분</label>
                    </div>
                </div>
                <div class="drive-stat">
                    <span class="stats-label">급가속</span>
                    <div>
                        <span id="stat-suddenaccel" class="stat-main">2</span>
                        <label class="lbl-med">회</label>
                    </div>

                </div>
                <div class="drive-stat" style="border-bottom-right-radius: 7px;">
                    <span class="stats-label">급제동</span>
                    <div>
                        <span id="stat-suddenbrake" class="stat-main">1</span>
                        <label class="lbl-med">회</label>
                    </div>
                </div>
            </div>

            <div class="garbage-stats">
                <div class="garbage-overview">
                    <div class="garbage-totalcount">
                        <img src="${pathToAssets}trashcan.svg" style="width: 20%;">
                        <span id="garbage-totalcount">511</span><label>ea</label>
                    </div>
                    <div class="garbage-avg">
                        <label>5초</label>
                        <span id="garbage-avg">26</span>
                    </div>
                    <div class="garbage-totalweight">
                        <div id="garbage-totalweight">1,365</div><label>kg</label>
                    </div>
                </div>
                <div class="garbage-details">
                    <div class="garbage-stat">
                        <img src="${pathToAssets}5L.svg">
                        <span id="garbage-5L">34</span>
                    </div>
                    <div class="garbage-stat">
                        <img src="${pathToAssets}10L.svg">
                        <span id="garbage-10L">64</span>
                    </div>
                    <div class="garbage-stat">
                        <img src="${pathToAssets}20L.svg">
                        <span id="garbage-20L">112</span>
                    </div>
                    <div class="garbage-stat">
                        <img src="${pathToAssets}30L.svg">
                        <span id="garbage-30L">186</span>
                    </div>
                    <div class="garbage-stat">
                        <img src="${pathToAssets}50L.svg">
                        <span id="garbage-50L">24</span>
                    </div>
                    <div class="garbage-stat">
                        <img src="${pathToAssets}75L.svg">
                        <span id="garbage-75L">42</span>
                    </div>
                    <div class="garbage-stat">
                        <img src="${pathToAssets}etcL.svg">
                        <span id="garbage-etc">34</span>
                    </div>
                    <div class="garbage-stat">
                        <img src="${pathToAssets}errL.svg">
                        <span id="garbage-error">15</span>
                    </div>
                </div>
            </div>
        </div>
    `
}
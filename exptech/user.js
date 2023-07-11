const urlSearchParams = new URLSearchParams(window.location.search);
const params = Object.fromEntries(urlSearchParams.entries());
if (!params.token) window.location.href = './login.html';

Chart.defaults.borderColor = '#36A2EB';
Chart.defaults.color = 'white';

const menu_index = document.getElementById("menu-index");
const menu_service = document.getElementById("menu-service");
const menu_key = document.getElementById("menu-key");
const menu_status = document.getElementById("menu-status");
const menu_device = document.getElementById("menu-device");
const menu_code = document.getElementById("menu-code");
const menu_info = document.getElementById("menu-info");
const box_index = document.getElementById("box-index");
const box_service = document.getElementById("box-service");
const box_key = document.getElementById("box-key");
const box_status = document.getElementById("box-status");
const box_device = document.getElementById("box-device");
const box_code = document.getElementById("box-code");
const box_info = document.getElementById("box-info");

const table_service = document.getElementById("table-service");
const table_device = document.getElementById("table-device");
const table_status = document.getElementById("table-status");
const table_key = document.getElementById("table-key");
const table_api = document.getElementById("table-api");

const create = document.getElementById("create");
const note = document.getElementById("note");
const announcement = document.getElementById('announcement')
const ctx = document.getElementById('myChart');

const a_type = [
    { text: "錯誤", color: "red" },
    { text: "已解決", color: "green" },
    { text: "影響: 小", color: "dimgrey" },
    { text: "影響: 中", color: "darkorange" },
    { text: "影響: 大", color: "purple" },
    { text: "公告", color: "darkblue" },
    { text: "維修", color: "darkkhaki" },
    { text: "測試", color: "darkcyan" },
    { text: "變更", color: "deeppink" },
    { text: "完成", color: "green" },
]

let service_list = [];
let service_info = [];
let user_info = {};
let CTX;

document.getElementById("add-coin").onclick = () => {
    document.getElementById("info-page").style.display = "none";
    document.getElementById("pay-page").style.display = "";
}

function Pay(type) {
    document.getElementById("pay-page").style.display = "none";
    fetch(`https://exptech.com.tw/api/v1/et/pay?type=${type}&token=${params.token}`)
        .then(async res => {
            const data = await res.json();
            document.getElementById("TradeInfo").value = data.TradeInfo;
            document.getElementById("TradeSha").value = data.TradeSha;
            document.getElementById("Pay").style.display = "";
        })
        .catch(err => {
            console.error(err);
            const res = err.request.response;
            alert(res);
        });
}

const time_string = (time) => {
    const now = new Date(time);
    let Now = now.getFullYear().toString();
    Now += "/";
    if ((now.getMonth() + 1) < 10) Now += "0" + (now.getMonth() + 1).toString();
    else Now += (now.getMonth() + 1).toString();
    Now += "/";
    if (now.getDate() < 10) Now += "0" + now.getDate().toString();
    else Now += now.getDate().toString();
    Now += " ";
    if (now.getHours() < 10) Now += "0" + now.getHours().toString();
    else Now += now.getHours().toString();
    Now += ":";
    if (now.getMinutes() < 10) Now += "0" + now.getMinutes().toString();
    else Now += now.getMinutes().toString();
    Now += ":";
    if (now.getSeconds() < 10) Now += "0" + now.getSeconds().toString();
    else Now += now.getSeconds().toString();
    return Now;
}

fetch(`https://exptech.com.tw/api/v1/et/service-info`)
    .then(async res => {
        const data = await res.json();
        service_list = data.list;
        service_info = data.info;
        load();
    })
    .catch(err => {
        console.error(err);
        const res = err.request.response;
        alert(res);
    });

function load() {
    for (const item of document.getElementsByClassName("load"))
        item.style.display = "none";
    fetch(`https://exptech.com.tw/api/v1/et/info?token=${params.token}`)
        .then(async res => {
            user_info = await res.json();
            document.getElementById("client").textContent = `${Object.keys(user_info.client_list).length}/${user_info.client}`;
            document.getElementById("coin").textContent = user_info.coin;
            document.getElementById("use").textContent = user_info.use;
            document.getElementById("day").textContent = (!user_info.coin) ? "已用完" : (!user_info.use) ? "未使用" : `${Math.floor(user_info.coin / user_info.use)} 天`;
            reload_service();
            reload_device();
            reload_status();
            reload_key();
            service_info_load();
            setTimeout(() => {
                for (const item of document.getElementsByClassName("load"))
                    item.style.display = "";
            }, 3000);
        })
        .catch(err => {
            console.error(err);
            const res = err.request.response;
            alert(res);
        });
    fetch(`https://exptech.com.tw/api/v1/et/announcement`)
        .then(async res => {
            const data = await res.json();
            const frag = new DocumentFragment();
            for (let i = 0; i < data.length; i++) {
                const box = document.createElement("div");
                box.className = "a-item";

                const title = document.createElement("div");
                title.className = "a-title";
                title.innerHTML = data[i].title;

                const tag = document.createElement("div");
                tag.className = "a-tag";

                for (let I = 0; I < data[i].type.length; I++) {
                    const t = document.createElement("a");
                    t.className = "tag";
                    t.textContent = a_type[data[i].type[I]].text;
                    t.style.backgroundColor = a_type[data[i].type[I]].color;
                    tag.appendChild(t)
                }

                const subtitle = document.createElement("div");
                subtitle.className = "a-subtitle";
                subtitle.innerHTML = data[i].subtitle;

                const body = document.createElement("div");
                body.className = "a-body";
                body.innerHTML = data[i].body;

                box.appendChild(title);
                box.appendChild(tag);
                box.appendChild(subtitle);
                box.appendChild(body);
                frag.appendChild(box);
            }

            announcement.replaceChildren(frag);
        })
        .catch(err => {
            console.error(err);
            const res = err.request.response;
            alert(res);
        });
}

function service_info_load() {
    let amount = {}

    const Chart_data = {
        labels: [],
        datasets: []
    };

    for (let i = 0; i < user_info.dump.length; i++) {
        Chart_data.labels.push(`${user_info.dump[i].hour.replace(" ", "日 ")}時`)
        for (let I = 0; I < Object.keys(user_info.dump[i]).length; I++) {
            const type = Object.keys(user_info.dump[i].data)[I];
            if (!amount[type]) amount[type] = 0;
            amount[type] += user_info.dump[i].data[type];
        }
    }

    for (let i = 0; i < user_info.dump.length; i++) {
        for (let I = 0; I < Object.keys(amount).length; I++) {
            const type = Object.keys(amount)[I];
            let c = user_info.dump[i].data[type] ?? 0;
            let find = false;
            for (let _i = 0; _i < Chart_data.datasets.length; _i++) {
                if (Chart_data.datasets[_i].label == type) {
                    find = true;
                    Chart_data.datasets[_i].data.push(c)
                    break;
                }
            }
            if (!find) Chart_data.datasets.push({
                label: type,
                data: [c],
                backgroundColor: service_info[type]?.color ?? ColorCode(),
            })
        }
    }

    const frag = new DocumentFragment();
    for (let i = 0; i < Object.keys(amount).length; i++) {
        const type = Object.keys(amount)[i];
        const box = document.createElement("tr");

        const path = document.createElement("td");
        path.textContent = type;
        path.setAttribute("data-text", path.textContent);

        const fun = document.createElement("td");
        fun.textContent = (type.startsWith("ws")) ? "WebSocket" : (type.startsWith("get")) ? "GET" : "POST";
        fun.setAttribute("data-text", fun.textContent);

        const service = document.createElement("td");
        service.textContent = service_info[type]?.service ?? "";
        service.setAttribute("data-text", service.textContent);

        const count = document.createElement("td");
        count.textContent = amount[type];
        count.setAttribute("data-text", count.textContent);

        box.appendChild(path);
        box.appendChild(fun);
        box.appendChild(service);
        box.appendChild(count);
        frag.appendChild(box);
    }

    table_api.replaceChildren(frag);

    if (!CTX)
        CTX = new Chart(ctx, {
            type: 'bar',
            data: Chart_data,
            options: {
                plugins: {
                    title: {
                        display: true,
                        text: 'ExpTech Service 流量圖'
                    },
                },
                responsive: true,
                scales: {
                    x: {
                        stacked: true,
                    },
                    y: {
                        stacked: true
                    }
                }
            }
        });
    else {
        CTX.data = Chart_data;
        CTX.update();
    }
}

function ColorCode() {
    var makingColorCode = '0123456789ABCDEF';
    var finalCode = '#';
    for (var counter = 0; counter < 6; counter++)
        finalCode = finalCode + makingColorCode[Math.floor(Math.random() * 16)];
    return finalCode;
}

function switch_service(type, status) {
    fetch(`https://exptech.com.tw/api/v1/et/${(!status) ? "subscribe" : "unsubscribe"}?token=${params.token}&type=${type}`)
        .then(res => load())
        .catch(err => {
            console.error(err);
            const res = err.request.response;
            alert(res);
        });
}

function copy(key) {
    navigator.clipboard.writeText(key)
        .then(() => alert("金鑰已複製到剪貼板"))
        .catch(err => console.error(err));
}

function del(key) {
    fetch(`https://exptech.com.tw/api/v1/et/key-remove?token=${params.token}&key=${key}`)
        .then(res => load())
        .catch(err => {
            console.error(err);
            const res = err.request.response;
            alert(res);
        });
}

function reload_key() {
    const frag = new DocumentFragment();
    for (let i = 0; i < Object.keys(user_info.key).length; i++) {
        const k = Object.keys(user_info.key)[i];
        const box = document.createElement("tr");

        const key = document.createElement("td");
        key.textContent = k.substring(0, 10);
        key.setAttribute("data-text", key.textContent);

        const time = document.createElement("td");
        time.textContent = time_string(user_info.key[k].time);
        time.setAttribute("data-text", time.textContent);

        const note = document.createElement("td");
        note.textContent = user_info.key[k].note;
        note.setAttribute("data-text", note.textContent);

        const action = document.createElement("td");
        action.innerHTML = `<a style="color: lightskyblue;text-decoration:underline;cursor: pointer;" onclick="copy('${k}')">複製金鑰</a>`;
        action.setAttribute("data-text", action.textContent);

        const del = document.createElement("td");
        del.innerHTML = `<a style="color: red;text-decoration:underline;cursor: pointer;" onclick="del('${k}')">刪除金鑰</a>`;
        del.setAttribute("data-text", del.textContent);

        box.appendChild(key);
        box.appendChild(time);
        box.appendChild(note);
        box.appendChild(action);
        box.appendChild(del);
        frag.appendChild(box);
    }

    table_key.replaceChildren(frag);
}

function reload_status() {
    const frag = new DocumentFragment();
    for (let i = 0; i < Object.keys(user_info.key_list).length; i++) {
        const k = Object.keys(user_info.key_list)[i];
        const box = document.createElement("tr");

        const key = document.createElement("td");
        key.textContent = k.substring(0, 10);
        key.setAttribute("data-text", key.textContent);

        const ip = document.createElement("td");
        ip.textContent = user_info.key_list[k].ip;
        ip.setAttribute("data-text", ip.textContent);

        const first = document.createElement("td");
        first.textContent = time_string(user_info.key_list[k].start);
        first.setAttribute("data-text", first.textContent);

        const last = document.createElement("td");
        last.textContent = time_string(user_info.key_list[k].time);
        last.setAttribute("data-text", last.textContent);

        box.appendChild(key);
        box.appendChild(ip);
        box.appendChild(first);
        box.appendChild(last);
        frag.appendChild(box);
    }

    table_status.replaceChildren(frag);
}

function reload_device() {
    const frag = new DocumentFragment();
    for (let i = 0; i < Object.keys(user_info.client_list).length; i++) {
        const id = Object.keys(user_info.client_list)[i];
        const box = document.createElement("tr");

        const uuid = document.createElement("td");
        uuid.textContent = id.substring(0, 10);
        uuid.setAttribute("data-text", uuid.textContent);

        const ip = document.createElement("td");
        ip.textContent = user_info.client_list[id].ip;
        ip.setAttribute("data-text", ip.textContent);

        const first = document.createElement("td");
        first.textContent = time_string(user_info.client_list[id].time);
        first.setAttribute("data-text", first.textContent);

        box.appendChild(uuid);
        box.appendChild(ip);
        box.appendChild(first);
        frag.appendChild(box);
    }

    table_device.replaceChildren(frag);
}

function reload_service() {
    const frag = new DocumentFragment();
    for (let i = 0; i < service_list.length; i++) {
        const item = service_list[i];
        const box = document.createElement("tr");

        const name = document.createElement("td");
        name.textContent = item.name;
        name.setAttribute("data-text", name.textContent);

        const api = document.createElement("td");
        api.textContent = item.api;
        api.setAttribute("data-text", api.textContent);

        const coin = document.createElement("td");
        coin.textContent = `${item.coin} 硬幣/天`;
        coin.setAttribute("data-text", coin.textContent);

        const service = document.createElement("td");
        const ser = user_info.service?.includes(item.api);
        service.textContent = (ser || typeof item.type == "boolean") ? "服務中" : "未提供";
        service.style.backgroundColor = (ser || typeof item.type == "boolean") ? "green" : "red";
        service.setAttribute("data-text", service.textContent);

        const status = document.createElement("td");
        let sub = user_info.subscribe?.includes(item.api);
        if (!sub) user_info.service?.includes(item.api)
        if (item.type && typeof item.type == "string") status.textContent = (sub) ? "已訂閱" : "未訂閱";
        if (item.type && typeof item.type == "string") status.style.backgroundColor = (sub) ? "green" : "red";
        status.setAttribute("data-text", status.textContent);

        const type = document.createElement("td");
        if (item.type && typeof item.type == "string") type.innerHTML = `<a style="color: ${(sub) ? "white" : "lightskyblue"};text-decoration:underline;cursor: pointer;" onclick="switch_service('${item.type}',${sub})">${(sub) ? "取消" : "訂閱"}</a>`;
        type.setAttribute("data-text", type.textContent);

        box.appendChild(name);
        box.appendChild(api);
        box.appendChild(coin);
        box.appendChild(service);
        box.appendChild(status);
        box.appendChild(type);
        frag.appendChild(box);
    }

    table_service.replaceChildren(frag);
}

create.onclick = () => {
    fetch("https://exptech.com.tw/api/v1/et/key-add", {
        method: "POST",
        headers: { "Content-Type": "application/json", },
        body: JSON.stringify({
            token: params.token,
            note: note.value,
        })
    })
        .then(async res => {
            load();
            note.value = "";
        })
        .catch(err => {
            console.error(err);
            const res = err.request.response;
            alert(res);
        });
}

menu_index.onclick = () => {
    for (const item of document.getElementsByClassName("menu-item"))
        item.style.color = "darkgrey";
    menu_index.style.color = "white";
    for (const item of document.getElementsByClassName("box-item"))
        item.style.display = "none";
    box_index.style.display = "block";
    document.getElementById("info-page").style.display = "";
    document.getElementById("pay-page").style.display = "none";
    document.getElementById("Pay").style.display = "none";
}
menu_service.onclick = () => {
    for (const item of document.getElementsByClassName("menu-item"))
        item.style.color = "darkgrey";
    menu_service.style.color = "white";
    for (const item of document.getElementsByClassName("box-item"))
        item.style.display = "none";
    box_service.style.display = "block";
}
menu_key.onclick = () => {
    for (const item of document.getElementsByClassName("menu-item"))
        item.style.color = "darkgrey";
    menu_key.style.color = "white";
    for (const item of document.getElementsByClassName("box-item"))
        item.style.display = "none";
    box_key.style.display = "block";
}
menu_status.onclick = () => {
    for (const item of document.getElementsByClassName("menu-item"))
        item.style.color = "darkgrey";
    menu_status.style.color = "white";
    for (const item of document.getElementsByClassName("box-item"))
        item.style.display = "none";
    box_status.style.display = "block";
}
menu_device.onclick = () => {
    for (const item of document.getElementsByClassName("menu-item"))
        item.style.color = "darkgrey";
    menu_device.style.color = "white";
    for (const item of document.getElementsByClassName("box-item"))
        item.style.display = "none";
    box_device.style.display = "block";
}
menu_code.onclick = () => {
    for (const item of document.getElementsByClassName("menu-item"))
        item.style.color = "darkgrey";
    menu_code.style.color = "white";
    for (const item of document.getElementsByClassName("box-item"))
        item.style.display = "none";
    box_code.style.display = "block";
}
menu_info.onclick = () => {
    for (const item of document.getElementsByClassName("menu-item"))
        item.style.color = "darkgrey";
    menu_info.style.color = "white";
    for (const item of document.getElementsByClassName("box-item"))
        item.style.display = "none";
    box_info.style.display = "block";
}

setInterval(() => load(), 60_000);
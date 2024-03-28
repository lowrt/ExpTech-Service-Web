import { ElementBuilder } from "./domhelper";

const base_url = "https://api.exptech.com.tw";

const urlSearchParams = new URLSearchParams(window.location.search);
const params = Object.fromEntries(urlSearchParams.entries());
if (!params.token) window.location.replace("./login.html");

Chart.defaults.borderColor = "#36A2EB";
Chart.defaults.color = "white";

for (const button of document.querySelectorAll("button.nav-item"))
  button.addEventListener("click", () => {
    if (document.getElementById(button.getAttribute("data-view")).classList.contains("active")) return;

    for (const nav of document.querySelectorAll("button.nav-item")) {
      nav.classList.remove("active");
      document.getElementById(nav.getAttribute("data-view")).classList.remove("active");
    }

    button.classList.add("active");
    setTimeout(() => document.getElementById(button.getAttribute("data-view")).classList.add("active"), 100);
  });


const table_service = document.getElementById("table-service");
const table_device = document.getElementById("table-device");
const table_status = document.getElementById("table-status");
const table_key = document.getElementById("table-key");
const table_api = document.getElementById("table-api");

const create = document.getElementById("create");
const note = document.getElementById("note");
const announcement = document.getElementById("announcement");
const ctx = document.getElementById("myChart");

const alert_box = document.getElementById("alert-box");
const index = document.getElementById("index");

let client_limit = false;

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
];

let service_list = [];
let service_info = [];
let user = {};
let CTX;

const pay_1 = document.getElementById("pay-1");
const pay_2 = document.getElementById("pay-2");
const pay_3 = document.getElementById("pay-3");
pay_1.addEventListener("click", () => Pay("1"));
pay_2.addEventListener("click", () => Pay("2"));
pay_3.addEventListener("click", () => Pay("3"));
function Pay(type) {
  pay_1.style.display = "none";
  pay_2.style.display = "none";
  pay_3.style.display = "none";
  fetch(`${base_url}/api/v1/et/pay?type=${type}&token=${params.token}`)
    .then(async res => {
      document.getElementById("pay-button").textContent = `NTD ${(type == 1) ? "100" : (type == 2) ? "500" : "1000"} 前往付款`;
      const data = await res.json();
      document.getElementById("TradeInfo").value = data.TradeInfo;
      document.getElementById("TradeSha").value = data.TradeSha;
      document.getElementById("Pay").style.display = "";
    })
    .catch(err => {
      pay_1.style.display = "";
      pay_2.style.display = "";
      pay_3.style.display = "";
      console.error(err);
      const res = err.request.response;
      alert(res);
    });
}

const toTimeString = (timestamp) => {
  const date = new Date(timestamp);
  return [
    [
      `${date.getFullYear()}`,
      `${date.getMonth() + 1}`.padStart(2, "0"),
      `${date.getDate()}`.padStart(2, "0"),
    ].join("/"),
    " ",
    [
      `${date.getHours()}`.padStart(2, "0"),
      `${date.getMinutes()}`.padStart(2, "0"),
      `${date.getSeconds()}`.padStart(2, "0"),
    ].join(":"),
  ].join("");
};

fetch(`${base_url}/api/v1/et/service-info`)
  .then(async res => {
    const data = await res.json();
    service_list = data.list;
    service_info = data.info;
    refresh();
  })
  .catch(err => {
    console.error(err);
    const res = err.request.response;
    alert(res);
  });

const client_text = document.getElementById("client");
const day_text = document.getElementById("day");

function refresh() {
  for (const item of document.getElementsByClassName("load")) {
    item.style.backgroundColor = "grey";
    item.textContent = "資料更新中...";
    item.style.pointerEvents = "none";
  }
  fetch(`${base_url}/api/v1/et/info?token=${params.token}`)
    .then(res => {
      if (res.ok) {
        res
          .json()
          .then(data => {
            user = data;
            if (Object.keys(user.client_list).length > user.client) {
              if (!client_limit) {
                client_limit = true;
                alert_box.style.display = "";
                index.style.display = "none";
                document.getElementById("alert-box-text").innerHTML = "已超出此帳戶限制之 <b>客戶端連接數</b><br>可能導致此帳戶底下的設備 <b>無法正常運作</b>";
              }
              client_text.style.color = "purple";
            } else {
              client_limit = false;
              client_text.style.color = "white";
            }
            client_text.textContent = `${Object.keys(user.client_list).length}/${user.client}`;
            document.getElementById("coin").textContent = user.coin;
            document.getElementById("use").textContent = user.use;
            const day_count = Math.floor(user.coin / user.use);
            day_text.textContent = (!user.coin) ? "已用完" : (!user.use) ? "未使用" : `${day_count} 天`;
            day_text.style.color = (!user.coin) ? "purple" : (!user.use) ? "lightgray" : (day_count < 7) ? "purple" : "white";
            reload_service();
            reload_device();
            reload_status();
            reload_key();
            service_info_load();
            setTimeout(() => {
              for (const item of document.getElementsByClassName("load")) {
                item.style.backgroundColor = "dodgerblue";
                item.textContent = "資料更新";
                item.style.pointerEvents = "";
                item.onclick = () => {
                  refresh();
                };
              }
            }, 5000);
          });
      } else
      if (res.status == 400) {
        console.log("Invalid or expired access token, redirecting to login page.");
        window.location.replace("./login.html");
      }
    });

  fetch(`${base_url}/api/v3/et/announcement`)
    .then(async res => {
      const data = await res.json();
      const frag = new DocumentFragment();
      for (let i = 0; i < data.length; i++) {
        const box = new ElementBuilder()
          .setClass([ "announcement" ])
          // subtitle
          .addChildren(new ElementBuilder()
            .setClass([ "announcement-subtitle" ])
            .setContent(data[i].subtitle)
            .addChildren(new ElementBuilder()
              .setClass([ "announcement-tag-container" ])
              // tags
              .addChildren(data[i].type.map(tag => new ElementBuilder()
                .setClass([ "tag" ])
                .setContent(a_type[tag].text)
                .setStyle("backgroundColor", a_type[tag].color)))))
          // title
          .addChildren(new ElementBuilder()
            .setClass([ "announcement-title" ])
            .setContent(data[i].title))
          // body
          .addChildren(new ElementBuilder()
            .setClass([ "announcement-content" ])
            .setContent(data[i].body))
          .toElement();

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
  const amount = {};

  const Chart_data = {
    labels   : [],
    datasets : [],
  };

  for (let i = 0; i < user.dump.length; i++) {
    Chart_data.labels.push(`${user.dump[i].hour.replace(" ", "日 ")}時`);
    for (const type in user.dump[i].data) {
      if (!amount[type]) amount[type] = 0;
      amount[type] += user.dump[i].data[type];
    }
  }

  for (let i = 0; i < user.dump.length; i++)
    for (const type in amount) {
      const c = user.dump[i].data[type] ?? 0;
      let find = false;
      for (let _i = 0; _i < Chart_data.datasets.length; _i++)
        if (Chart_data.datasets[_i].label == type) {
          find = true;
          Chart_data.datasets[_i].data.push(c);
          break;
        }

      if (!find) Chart_data.datasets.push({
        label           : type,
        data            : [c],
        backgroundColor : service_info[type]?.color ?? ColorCode(),
      });
    }


  const frag = new DocumentFragment();
  for (const type in amount) {
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

  if (!CTX) {
    CTX = new Chart(ctx, {
      type    : "bar",
      data    : Chart_data,
      options : {
        plugins: {
          title: {
            display : true,
            text    : "ExpTech Service 流量圖 (點擊下方圖例可調整查看的服務類型)",
          },
        },
        responsive : true,
        scales     : {
          x: {
            stacked: true,
          },
          y: {
            stacked: true,
          },
        },
      },
    });
  } else {
    CTX.data = Chart_data;
    CTX.update();
  }
}

function ColorCode() {
  const makingColorCode = "0123456789ABCDEF";
  let finalCode = "#";
  for (let counter = 0; counter < 6; counter++)
    finalCode = finalCode + makingColorCode[Math.floor(Math.random() * 16)];
  return finalCode;
}

const toggleService = (type, status) => {
  fetch(`${base_url}/api/v1/et/${(!status) ? "subscribe" : "unsubscribe"}?token=${params.token}&type=${type}`)
    .then(res => {
      if (res.ok)
        refresh();
      else
        throw new Error(`The server returned a status code of ${res.status}`);
    })
    .catch(err => {
      console.error(err);
      alert(`無法${(!status) ? "訂閱" : "取消訂閱"}、請稍後再試。\n原因：${err}`);
    });
};

const copy = (key) => {
  navigator.clipboard.writeText(key)
    .then(() => alert("已將金鑰複製至剪貼板"))
    .catch(err => console.error(err));
};

const deleteKey = (key) => {
  fetch(`${base_url}/api/v1/et/key-remove?token=${params.token}&key=${key}`)
    .then(res => {
      if (res.ok)
        refresh();
      else
        throw new Error(`The server returned a status code of ${res.status}`);
    })
    .catch(err => {
      console.error(err);
      alert(`無法${(!status) ? "訂閱" : "取消訂閱"}、請稍後再試。\n原因：${err}`);
    });
};

function reload_key() {
  const frag = new DocumentFragment();
  for (const k in user.key) {
    const data = {
      key  : k.substring(0, 10),
      time : toTimeString(user.key[k].time),
      note : user.key[k].note,
    };

    const box = new ElementBuilder("tr")
      // key
      .addChildren(new ElementBuilder("td")
        .setContent(data.key)
        .setAttribute("data-text", data.key))
      // time
      .addChildren(new ElementBuilder("td")
        .setContent(data.time)
        .setAttribute("data-text", data.time))
      // time
      .addChildren(new ElementBuilder("td")
        .setContent(data.note)
        .setAttribute("data-text", data.note))
      // copy to clipboard
      .addChildren(new ElementBuilder("td")
        .setClass([ "primary", "action" ])
        .setContent("複製金鑰")
        .setAttribute("data-text", "複製金鑰")
        .on("click", copy, k))
      // delete key
      .addChildren(new ElementBuilder("td")
        .setClass([ "danger", "action" ])
        .setContent("刪除金鑰")
        .setAttribute("data-text", "刪除金鑰")
        .on("click", deleteKey, k))
      .toElement();

    frag.appendChild(box);
  }

  table_key.replaceChildren(frag);
}

function reload_status() {
  const frag = new DocumentFragment();
  for (const k in user.key_list) {
    const box = document.createElement("tr");

    const key = document.createElement("td");
    key.textContent = k.substring(0, 10);
    key.setAttribute("data-text", key.textContent);

    const ip = document.createElement("td");
    ip.textContent = user.key_list[k].ip;
    ip.setAttribute("data-text", ip.textContent);

    const first = document.createElement("td");
    first.textContent = toTimeString(user.key_list[k].start);
    first.setAttribute("data-text", first.textContent);

    const last = document.createElement("td");
    last.textContent = toTimeString(user.key_list[k].time);
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
  for (const id in user.client_list) {
    const box = document.createElement("tr");

    const uuid = document.createElement("td");
    uuid.textContent = id.substring(0, 10);
    uuid.setAttribute("data-text", uuid.textContent);

    const ip = document.createElement("td");
    ip.textContent = user.client_list[id].ip;
    ip.setAttribute("data-text", ip.textContent);

    const first = document.createElement("td");
    first.textContent = toTimeString(user.client_list[id].time);
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

    const isServicing = user.service?.includes(item.api) || typeof item.type == "boolean";
    const isSubscribed = user.subscribe?.includes(item.api);

    const box = new ElementBuilder("tr")
      // 說明
      .addChildren(new ElementBuilder("td")
        .setContent(item.name)
        .setAttribute("data-text", item.name))
      // API
      .addChildren(new ElementBuilder("td")
        .setContent(item.api)
        .setAttribute("data-text", item.api))
      // 費用
      .addChildren(new ElementBuilder("td")
        .setContent(`${item.coin} 硬幣/天`)
        .setAttribute("data-text", `${item.coin} 硬幣/天`))
      // 服務
      .addChildren(new ElementBuilder("td")
        .setContent((isServicing) ? "服務中" : "未提供")
        .setStyle("color", (isServicing) ? "#bfb" : "#fbb")
        .setStyle("backgroundColor", (isServicing) ? "#0d04" : "#d004")
        .setAttribute("data-text", (isServicing) ? "服務中" : "未提供"));

    // 狀態
    if (item.type && typeof item.type == "string")
      box.addChildren(new ElementBuilder("td")
        .setContent((isSubscribed) ? "已訂閱" : "未訂閱")
        .setStyle("color", (isSubscribed) ? "#bfb" : "#fbb")
        .setStyle("backgroundColor", (isSubscribed) ? "#0d04" : "#d004")
        .setAttribute("data-text", (isSubscribed) ? "已訂閱" : "未訂閱"));
    else
      box.addChildren(new ElementBuilder("td"));

    // 操作
    if (item.type && typeof item.type == "string")
      box.addChildren(new ElementBuilder("td")
        .setClass([ "action", ...((isSubscribed) ? ["danger"] : ["primary"]) ])
        .setContent((isSubscribed) ? "取消" : "訂閱")
        .setAttribute("data-text", (isSubscribed) ? "取消" : "訂閱")
        .on("click", toggleService, item.type, isSubscribed));
    else
      box.addChildren(new ElementBuilder("td"));

    frag.appendChild(box.toElement());
  }

  table_service.replaceChildren(frag);
}

create.onclick = () => {
  fetch(`${base_url}/api/v1/et/key-add`, {
    method  : "POST",
    headers : { "Content-Type": "application/json" },
    body    : JSON.stringify({
      token : params.token,
      note  : note.value,
    }),
  })
    .then(res => {
      refresh();
      note.value = "";
    })
    .catch(err => {
      console.error(err);
      const res = err.request.response;
      alert(res);
    });
};

document.getElementById("logout").addEventListener("click", function() {
  document.body.style.pointerEvents = "none";
  this.disabled = true;
  this.classList.add("loading");
  fetch(`${base_url}/api/v1/et/logout?token=${params.token}`)
    .then(res => {
      if (res.ok)
        window.location.replace("./login.html");
      else
        throw res.status;
    })
    .catch(err => {
      console.error(err);
      document.body.style.pointerEvents = "";
      this.disabled = false;
      this.classList.remove("loading");
    });
});

function link(url) {
  window.open(`https://${url}`, "_blank");
}

setInterval(() => refresh(), 60_000);

document.getElementById("alert-box-button").onclick = () => {
  index.style.display = "";
  alert_box.style.display = "none";
};
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
let user_info = {};
let CTX;

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
};

fetch("https://exptech.com.tw/api/v1/et/service-info")
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

const client_text = document.getElementById("client");
const day_text = document.getElementById("day");

function load() {
	for (const item of document.getElementsByClassName("load")) {
		item.style.backgroundColor = "grey";
		item.textContent = "資料更新中...";
		item.style.pointerEvents = "none";
	}
	fetch(`https://exptech.com.tw/api/v1/et/info?token=${params.token}`)
		.then(async res => {
			user_info = await res.json();
			if (Object.keys(user_info.client_list).length > user_info.client) {
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
			client_text.textContent = `${Object.keys(user_info.client_list).length}/${user_info.client}`;
			document.getElementById("coin").textContent = user_info.coin;
			document.getElementById("use").textContent = user_info.use;
			const day_count = Math.floor(user_info.coin / user_info.use);
			day_text.textContent = (!user_info.coin) ? "已用完" : (!user_info.use) ? "未使用" : `${day_count} 天`;
			day_text.style.color = (!user_info.coin) ? "purple" : (!user_info.use) ? "lightgray" : (day_count < 7) ? "purple" : "white";
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
						load();
					};
				}
			}, 5000);
		});
	// .catch(err => window.location.replace("./login.html"));
	fetch("https://exptech.com.tw/api/v1/et/announcement")
		.then(async res => {
			const data = await res.json();
			const frag = new DocumentFragment();
			for (let i = 0; i < data.length; i++) {
				const box = document.createElement("div");
				box.className = "announcement";

				const title = document.createElement("div");
				title.className = "announcement-title";
				title.textContent = data[i].title;

				const tag = document.createElement("div");
				tag.className = "announcement-tag-container";

				for (let I = 0; I < data[i].type.length; I++) {
					const t = document.createElement("a");
					t.className = "tag";
					t.textContent = a_type[data[i].type[I]].text;
					t.style.backgroundColor = a_type[data[i].type[I]].color;
					tag.appendChild(t);
				}

				const subtitle = document.createElement("div");
				subtitle.className = "announcement-subtitle";
				subtitle.textContent = data[i].subtitle;

				const body = document.createElement("div");
				body.className = "announcement-content";
				body.textContent = data[i].body;

				subtitle.appendChild(tag);
				box.appendChild(subtitle);
				box.appendChild(title);
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
	const amount = {};

	const Chart_data = {
		labels   : [],
		datasets : [],
	};

	for (let i = 0; i < user_info.dump.length; i++) {
		Chart_data.labels.push(`${user_info.dump[i].hour.replace(" ", "日 ")}時`);
		for (let I = 0; I < Object.keys(user_info.dump[i].data).length; I++) {
			const type = Object.keys(user_info.dump[i].data)[I];
			if (!amount[type]) amount[type] = 0;
			amount[type] += user_info.dump[i].data[type];
		}
	}

	for (let i = 0; i < user_info.dump.length; i++)
		for (let I = 0; I < Object.keys(amount).length; I++) {
			const type = Object.keys(amount)[I];
			const c = user_info.dump[i].data[type] ?? 0;
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
		const sub = user_info.subscribe?.includes(item.api);
		if (!sub) user_info.service?.includes(item.api);
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
		method  : "POST",
		headers : { "Content-Type": "application/json" },
		body    : JSON.stringify({
			token : params.token,
			note  : note.value,
		}),
	})
		.then(res => {
			load();
			note.value = "";
		})
		.catch(err => {
			console.error(err);
			const res = err.request.response;
			alert(res);
		});
};

document.getElementById("out").onclick = () => {
	fetch(`https://exptech.com.tw/api/v1/et/logout?token=${params.token}`)
		.then(res => window.location.replace("./login.html"))
		.catch(err => {
			console.error(err);
			const res = err.request.response;
			alert(res);
		});
};

function link(url) {
	window.open(`https://${url}`, "_blank");
}

setInterval(() => load(), 60_000);

document.getElementById("alert-box-button").onclick = () => {
	index.style.display = "";
	alert_box.style.display = "none";
};
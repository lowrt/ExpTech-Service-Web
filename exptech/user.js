const urlSearchParams = new URLSearchParams(window.location.search);
const params = Object.fromEntries(urlSearchParams.entries());
if (!params.token) window.location.replace("./login.html");

Chart.defaults.borderColor = "#36A2EB";
Chart.defaults.color = "white";

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
const table_equipment = document.getElementById("table-equipment");

const create = document.getElementById("create");
const note = document.getElementById("note");
const announcement = document.getElementById("announcement");
const ctx = document.getElementById("myChart");

const alert_box = document.getElementById("alert-box");
const index = document.getElementById("index");
const eid = document.getElementById("eid");
const device_setting_box = document.getElementById("device-setting");
const device_config = document.getElementById("device-config");

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
let config;

document.getElementById("add-coin").onclick = () => {
	document.getElementById("info-page").style.display = "none";
	document.getElementById("pay-page").style.display = "";
};

document.getElementById("add-device").onclick = () => {
	fetch(`https://exptech.com.tw/api/v1/check?eid=${eid.value}&token=${params.token}`)
		.then(async res => {
			const ans = await res.text()
			eid.value = "";
			if (ans == "OK") alert("請在60秒內按下裝置上的確認按鈕\n直到燈號熄滅");
			else alert("未發現此裝置\n請檢查欲連接之裝置是否已連上網路");
		})
		.catch(err => {
			eid.value = "";
			console.error(err);
			const res = err.request.response;
			alert(res)
		});
};

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
			equipment_info_load();
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
		})
		.catch(err => window.location.replace("./login.html"));
	fetch("https://exptech.com.tw/api/v1/et/announcement")
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
					tag.appendChild(t);
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

function equipment_info_load() {
	const frag = new DocumentFragment();
	for (let i = 0; i < Object.keys(user_info.device_list).length; i++) {
		const id = Object.keys(user_info.device_list)[i];
		const box = document.createElement("tr");

		const eid = document.createElement("td");
		eid.textContent = id;
		eid.setAttribute("data-text", eid.textContent);

		const model = document.createElement("td");
		model.textContent = user_info.device_list[id].model;
		model.setAttribute("data-text", model.textContent);

		const IP = document.createElement("td");
		IP.textContent = user_info.device_list[id].IP;
		IP.setAttribute("data-text", IP.textContent);

		const ip = document.createElement("td");
		ip.textContent = user_info.device_list[id].ip;
		ip.setAttribute("data-text", ip.textContent);

		const ver = document.createElement("td");
		ver.textContent = user_info.device_list[id].ver;
		ver.setAttribute("data-text", ver.textContent);

		const ssid = document.createElement("td");
		ssid.textContent = user_info.device_list[id].ssid;
		ssid.setAttribute("data-text", ssid.textContent);

		const rssi = document.createElement("td");
		rssi.textContent = user_info.device_list[id].rssi;
		rssi.setAttribute("data-text", rssi.textContent);

		const mac = document.createElement("td");
		mac.textContent = user_info.device_list[id].mac;
		mac.setAttribute("data-text", mac.textContent);

		const time = document.createElement("td");
		time.textContent = time_string(user_info.device_list[id].time);
		time.setAttribute("data-text", time.textContent);

		const test = document.createElement("td");
		if (user_info.device_list[id].online) test.innerHTML = `<a style="color: lightskyblue;text-decoration:underline;cursor: pointer;" onclick="test('${id}')">測試</a>`;
		else test.innerHTML = "離線";
		test.setAttribute("data-text", test.textContent);

		const set = document.createElement("td");
		if (user_info.device_list[id].online) set.innerHTML = `<a style="color: lightskyblue;text-decoration:underline;cursor: pointer;" onclick="device_setting('${id}')">配置</a>`;
		else set.innerHTML = "離線";
		set.setAttribute("data-text", set.textContent);

		box.appendChild(eid);
		box.appendChild(model);
		box.appendChild(IP);
		box.appendChild(ip);
		box.appendChild(ver);
		box.appendChild(ssid);
		box.appendChild(rssi);
		box.appendChild(mac);
		box.appendChild(time);
		box.appendChild(test);
		box.appendChild(set);
		frag.appendChild(box);
	}

	table_equipment.replaceChildren(frag);
}

function device_setting(id) {
	document.getElementById("config").textContent = `${id} Config`;
	config = {
		id: id,
		ssid: "exptech",
		pass: "1234567890",
		lat: "22.967286",
		lon: "120.2940045",
		site: "1",
	};
	config.ssid = user_info.device_list[id].ssid;
	if (user_info.device_list[id].pass) config.pass = user_info.device_list[id].pass;
	if (user_info.device_list[id].config) {
		if (user_info.device_list[id].config.lat) config.lat = user_info.device_list[id].config.lat;
		if (user_info.device_list[id].config.lon) config.lon = user_info.device_list[id].config.lon;
		if (user_info.device_list[id].config.site) config.site = user_info.device_list[id].config.site;
	}
	document.getElementById("ssid").value = config.ssid;
	document.getElementById("pass").value = config.pass;
	document.getElementById("lat").value = config.lat;
	document.getElementById("lon").value = config.lon;
	document.getElementById("site").value = config.site;
	device_setting_box.style.display = "";
}

document.getElementById("device-config").onclick = () => {
	config.ssid = document.getElementById("ssid").value;
	config.pass = document.getElementById("pass").value;
	config.lat = document.getElementById("lat").value;
	config.lon = document.getElementById("lon").value;
	config.site = document.getElementById("site").value;
	fetch("https://exptech.com.tw/api/v1/et", {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify({ function: "send", type: "config", uuid: config.id, token: params.token, data: config }),
	})
		.then(async res => {
			const ans = await res.text();
			if (ans == "Success Sended!") {
				device_setting_box.style.display = "none";
				load();
				alert("已發送 [配置] 訊息");
			} else if (ans == "Client Close!") alert("裝置已斷開連接");
			else alert("未發現裝置");
		})
		.catch(err => {
			console.error(err);
			const res = err.request.response;
			alert(res);
		});

}

document.getElementById("device-cancel").onclick = () => {
	device_setting_box.style.display = "none";
}

function test(id) {
	fetch("https://exptech.com.tw/api/v1/et", {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify({ function: "send", type: "test", uuid: id, token: params.token, }),
	})
		.then(async res => {
			const ans = await res.text();
			if (ans == "Success Sended!") alert("已發送 [測試] 訊息");
			else if (ans == "Client Close!") alert("裝置已斷開連接");
			else alert("未發現裝置");
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
		labels: [],
		datasets: [],
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
				label: type,
				data: [c],
				backgroundColor: service_info[type]?.color ?? ColorCode(),
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
			type: "bar",
			data: Chart_data,
			options: {
				plugins: {
					title: {
						display: true,
						text: "ExpTech Service 流量圖 (點擊下方圖例可調整查看的服務類型)",
					},
				},
				responsive: true,
				scales: {
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
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify({
			token: params.token,
			note: note.value,
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
};
menu_service.onclick = () => {
	for (const item of document.getElementsByClassName("menu-item"))
		item.style.color = "darkgrey";
	menu_service.style.color = "white";
	for (const item of document.getElementsByClassName("box-item"))
		item.style.display = "none";
	box_service.style.display = "block";
};
menu_key.onclick = () => {
	for (const item of document.getElementsByClassName("menu-item"))
		item.style.color = "darkgrey";
	menu_key.style.color = "white";
	for (const item of document.getElementsByClassName("box-item"))
		item.style.display = "none";
	box_key.style.display = "block";
};
menu_status.onclick = () => {
	for (const item of document.getElementsByClassName("menu-item"))
		item.style.color = "darkgrey";
	menu_status.style.color = "white";
	for (const item of document.getElementsByClassName("box-item"))
		item.style.display = "none";
	box_status.style.display = "block";
};
menu_device.onclick = () => {
	for (const item of document.getElementsByClassName("menu-item"))
		item.style.color = "darkgrey";
	menu_device.style.color = "white";
	for (const item of document.getElementsByClassName("box-item"))
		item.style.display = "none";
	box_device.style.display = "block";
};
menu_code.onclick = () => {
	for (const item of document.getElementsByClassName("menu-item"))
		item.style.color = "darkgrey";
	menu_code.style.color = "white";
	for (const item of document.getElementsByClassName("box-item"))
		item.style.display = "none";
	box_code.style.display = "block";
};
menu_info.onclick = () => {
	for (const item of document.getElementsByClassName("menu-item"))
		item.style.color = "darkgrey";
	menu_info.style.color = "white";
	for (const item of document.getElementsByClassName("box-item"))
		item.style.display = "none";
	box_info.style.display = "block";
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
}
/**
 * @type {HTMLInputElement}
 */
const email = document.getElementById("email");
const password = document.getElementById("password");
const submit = document.getElementById("submit");

document.getElementById("register").addEventListener("click", (e) => {
	window.location.href = "./register.html";
});

submit.addEventListener("submit", (e) => {
	email.setCustomValidity("");
	password.setCustomValidity("");

	const values = {
		email : email.value,
		pass  : password.value,
	};

	email.disabled = true;
	password.disabled = true;
	submit.disabled = true;

	fetch("https://exptech.com.tw/api/v1/et/login", {
		method  : "POST",
		headers : {
			"Content-Type": "application/json",
		},
		body: JSON.stringify({
			email : values.email,
			pass  : values.pass,
		}),
	})
		.then(async res => {
			if (res.ok) {window.location.href = `./user.html?token=${await res.text()}`;} else {
				switch (await res.text()) {
					case "Invaild email!": {
						email.setCustomValidity("電子郵件地址無效。");
						break;
					}

					case "Invaild pass!": {
						password.setCustomValidity("密碼無效。");
						break;
					}

					case "Pass error!": {
						password.setCustomValidity("密碼錯誤。");
						break;
					}

					case "This account was not found!": {
						email.setCustomValidity("找不到此帳戶，可能尚未註冊。");
						setTimeout(() => window.location.href = "./register.html", 5_000);
						break;
					}

					default: {
						console.error(res);
						break;
					}
				}

				email.disabled = false;
				password.disabled = false;
				submit.disabled = false;
				email.reportValidity();
				password.reportValidity();
			}
		})
		.catch(err => {
			console.error(err);
			email.disabled = false;
			password.disabled = false;
			submit.disabled = false;
			const res = err.request.response;
			alert(res);
		});
});
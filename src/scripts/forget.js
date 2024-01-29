const submit = document.getElementById("submit");
const email = document.getElementById("email");
const container = document.getElementById("container");
const success_view = document.getElementById("success-view");
const form_view = document.getElementById("form-view");
const forgetForm = document.getElementById("forget");

document.getElementById("login").onclick = (e) => {
  window.location.href = "./login.html";
};

forgetForm.addEventListener("submit", (e) => {
  e.preventDefault();
  email.setCustomValidity("");
  email.reportValidity();

  const values = { email: email.value };

  submit.disabled = true;

  fetch("https://exptech.com.tw/api/v1/et/forget", {
    method  : "POST",
    headers : { "Content-Type": "application/json" },
    body    : JSON.stringify({ email: values.email }),
  })
    .then(async (res) => {
      if (res.ok) {
        container.style.height = form_view.offsetHeight + 76;
        form_view.style.position = "absolute";
        success_view.style.position = "absolute";
        success_view.style.display = "block";
        form_view.style.opacity = 0;
        container.style.height = success_view.offsetHeight + 76;
        setTimeout(() => {
          success_view.style.position = "";
          success_view.style.opacity = 1;
          form_view.style.display = "none";
          form_view.style.position = "";
        }, 100);

        setTimeout(() => (window.location.href = "./login.html"), 5_000);
      } else {
        switch (await res.text()) {
          case "Invaild email!": {
            email.setCustomValidity("電子郵件地址無效。");
            email.reportValidity();
            break;
          }

          case "This account was not found!": {
            email.setCustomValidity("找不到此帳戶，可能尚未註冊。");
            email.reportValidity();
            break;
          }

          default: {
            console.error(res);
            break;
          }
        }
        submit.disabled = false;
      }
    })
    .catch((err) => {
      console.error(err);
      submit.disabled = false;
      const res = err.request.response;
      alert(res);
    });
});
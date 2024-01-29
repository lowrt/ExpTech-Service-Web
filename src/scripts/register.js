const password_strength = document.getElementById("password-strength");
const password = document.getElementById("password");
const email = document.getElementById("email");
const repeat_password = document.getElementById("repeat-password");
const success_view = document.getElementById("success-view");
const form_view = document.getElementById("form-view");
const container = document.getElementById("container");
const submit = document.getElementById("submit");
const registerForm = document.getElementById("register");

const base_url = "https://api.exptech.com.tw";

document.getElementById("login").addEventListener("click", (e) => {
  window.location.href = "./login.html";
});

password.addEventListener("input", function(e) {
  this.value = password.value;
  password_strength.style.display = "block";

  if (this.value.match(/(?=.*[^A-Za-z0-9@_.-])/))
    return (password_strength.className = "error invalid");

  if (this.value.match(
    /(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[^A-Za-z0-9])(?=.{10,})/,
  ))
    password_strength.className = "very-strong";
  else if (this.value.match(/(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.{8,})/))
    password_strength.className = "strong";
  else if (this.value.match(/((?=.*[a-zA-Z0-9])(?=.{6,}))/))
    password_strength.className = "medium";
  else if (this.value.length > 0)
    password_strength.className = "weak";
  else
    password_strength.className = "error empty";
});

submit.addEventListener("click", (e) => {
  e.preventDefault();

  repeat_password.setCustomValidity("");
  email.setCustomValidity("");
  password.setCustomValidity("");

  const values = {
    email : email.value,
    pass  : password.value,
  };

  if (repeat_password.value != values.pass) {
    repeat_password.setCustomValidity("與密碼不相符");
    repeat_password.reportValidity();
    return;
  }

  registerForm.disabled = true;

  fetch(`${base_url}/api/v1/et/register`, {
    method  : "POST",
    headers : { "Content-Type": "application/json" },
    body    : JSON.stringify({
      email : values.email,
      pass  : values.pass,
    }),
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

          case "Invaild pass!": {
            password.setCustomValidity("密碼無效。");
            password.reportValidity();
            break;
          }

          case "Pass format error!": {
            password.setCustomValidity("密碼格式錯誤。");
            password.reportValidity();
            break;
          }

          case "This email already in use!": {
            email.setCustomValidity("電子郵件地址已被使用。");
            email.reportValidity();
            break;
          }

          default: {
            console.error(res);
            break;
          }
        }
        registerForm.disabled = false;
      }
    })
    .catch((err) => {
      console.error(err);
      registerForm.disabled = false;
      const res = err.request.response;
      alert(res);
    });
});
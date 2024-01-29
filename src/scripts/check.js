const success_view = document.getElementById("success-view");
const invaild_view = document.getElementById("fail-view");

const urlSearchParams = new URLSearchParams(window.location.search);
const params = Object.fromEntries(urlSearchParams.entries());

fetch(`https://api.exptech.com.tw/api/v1/et/register?code=${params.code}`, {
  method  : "GET",
  headers : { "Content-Type": "application/json" },
})
  .then(async (res) => {
    switch (await res.text()) {
      case "OK": {
        success_view.style.position = "absolute";
        success_view.style.display = "block";
        setTimeout(() => {
          success_view.style.position = "";
          success_view.style.opacity = 1;
        }, 100);

        setTimeout(() => (window.location.href = "./login.html"), 5_000);
        break;
      }

      case "Invaild code!": {
        invaild_view.style.position = "absolute";
        invaild_view.style.display = "block";
        setTimeout(() => {
          invaild_view.style.position = "";
          invaild_view.style.opacity = 1;
        }, 100);

        setTimeout(() => (window.location.href = "./login.html"), 5_000);
        break;
      }

      default: {
        console.error(res);
        break;
      }
    }
  })
  .catch((err) => {
    console.error(err);
    const res = err.request.response;
    alert(res);
  });
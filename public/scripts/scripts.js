document.addEventListener("DOMContentLoaded", () => {
  document.querySelector("#removePropertyBtn").addEventListener("click", e => {
    const id = e.target.dataset.id;
    fetch(`/houses/${id}`, {
      method: "DELETE"
    })
      .then(res => res.json())
      .then(data => {
        console.log(data);
        // replace simulates HTTP redirect - https://stackoverflow.com/questions/4744751/how-do-i-redirect-with-javascript
        if (data.status) window.location.replace(data.url);
      })
      .catch(err => console.log(err));
  });
  // document.querySelector("#updatePropertyBtn").addEventListener("click", e => {

  // });

  // document.querySelector("#updatePropertyBtn").addEventListener("click", e => {
  //   const id = e.target.dataset.id;
  //   fetch(`/houses/${id}`, {
  //     method: "PUT"
  //   })
  //     .then(res => res.json())
  //     .then(data => {
  //       console.log(data);
  //       // replace simulates HTTP redirect - https://stackoverflow.com/questions/4744751/how-do-i-redirect-with-javascript
  //       if (data.status) window.location.replace(data.url);
  //     })
  //     .catch(err => console.log(err));
  // });
});

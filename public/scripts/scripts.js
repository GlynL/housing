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

  const galleryThumbnails = document.querySelectorAll(".gallery__thumbnail");

  galleryThumbnails.forEach(image =>
    image.addEventListener("click", e => {
      $("#modal").modal();
      const carouselIndicators = document.querySelectorAll(
        ".carousel-indicator"
      );
      const carouselItems = document.querySelectorAll(".carousel-item");
      carouselItems.forEach(item => item.classList.remove("active"));
      carouselIndicators.forEach(indicator =>
        indicator.classList.remove("active")
      );
      const carousel = document.querySelector(".carousel");

      const activeSelection = carousel.querySelectorAll(
        `[data-id='${e.target.dataset.id}']`
      );
      activeSelection.forEach(selection => selection.classList.add("active"));
    })
  );

  const galleryDeleteBtns = document.querySelectorAll(".gallery__delete");

  galleryDeleteBtns.forEach(btn => {
    btn.addEventListener("click", deleteGalleryImage);
  });

  function deleteGalleryImage(e) {
    const galleryId = { galleryId: e.target.dataset.id };
    const houseId = e.target.dataset.house;
    const item = e.target.parentNode;

    // * delete from cloudinary & DB
    fetch(`/houses/${houseId}/gallery`, {
      method: "DELETE",
      body: JSON.stringify(galleryId),
      headers: {
        "Content-Type": "application/json"
      }
    })
      .then(res => res.json())
      .then(data => {
        // remove from dom
        item.remove();
      })
      .catch(err => console.log(err));
  }
});

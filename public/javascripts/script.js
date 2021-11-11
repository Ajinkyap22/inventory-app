let loaded = false;
const images = [...document.querySelectorAll("img")];

// create a function to check if every image is complete
function imgLoaded() {
  return images.every((img) => img.complete);
}

// create antoher function that sets loaded to result of first one
function handleLoaded() {
  loaded = imgLoaded();

  // if loaded is true remove hidden class from container & add hidden class to container
  if (loaded) {
    document.querySelector(".spinner-border")?.classList.add("hidden");
    document.querySelector(".container-fluid").classList.remove("hidden");
  }
}

// add onload event listener on every img & call the function on it
images.forEach((img) => {
  img.addEventListener("load", handleLoaded);
});

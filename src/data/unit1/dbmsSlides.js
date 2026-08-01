const slideFiles = import.meta.glob(
  "../../assets/dbms/*.{PNG,png}",
  {
    eager: true,
    query: "?url",
    import: "default"
  }
);

const dbmsSlides = Object.values(slideFiles);

export default dbmsSlides;